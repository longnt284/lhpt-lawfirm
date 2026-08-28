/*
 * Bloom giữ nguyên độ trong suốt, cho canvas nằm chồng lên nền trang.
 *
 * Vì sao không dùng `UnrealBloomPass` có sẵn trong `three/examples`: nó được
 * viết cho cảnh có nền đục và ghép kết quả trên giả định nền đen. Mọi canvas
 * của trang này đều trong suốt — lớp nền chuỗi khối nằm dưới các khối nội dung
 * nền mực loãng, còn cảnh mở đầu nằm trên lớp aurora của `Ambient` — nên một
 * pass giả định nền đen sẽ bôi một mảng đen mờ kín màn hình và nuốt sạch những
 * lớp bên dưới.
 *
 * KHÔNG GIAN MÀU VÀ ALPHA — phần quyết định, và là chỗ đã sai hai lần.
 *
 * Vẽ thẳng ra canvas và vẽ qua render target *không* cho cùng một kết quả với
 * vật liệu bán trong suốt, vì thứ tự hai phép toán bị đảo:
 *
 *   - Ra canvas: vật liệu mã hoá sang sRGB ngay trong fragment shader, rồi GPU
 *     mới trộn. Trộn diễn ra trên giá trị *đã* mã hoá.
 *   - Vào render target: three để cảnh ở tuyến tính, GPU trộn ở tuyến tính, và
 *     việc mã hoá dồn về pass cuối. Trộn diễn ra *trước* khi mã hoá.
 *
 * Vì hàm sRGB lõm, hai thứ tự đó lệch nhau rất xa ở vùng tối. Đo bằng một mặt
 * phẳng xám 128 ở độ mờ 0,3: ra canvas cho 38, qua render target cho 72 — sáng
 * gần gấp đôi. Cả năm cảnh của trang đều dựng bằng đường mảnh độ mờ thấp, nên
 * sai lệch này không phải chi tiết học thuật: nó làm cả cảnh mở đầu bạc trắng.
 *
 * Cách dựng lại đúng thứ tự của canvas, ngay trong pass ghép:
 *     canvas = sRGB(C) · a          (mã hoá trước, nhân alpha sau)
 *     RT     = C · a                (đã trộn ở tuyến tính, giá trị premultiplied)
 * nên chia lại cho alpha để lấy về C, mã hoá, rồi nhân lại alpha. Kết quả trùng
 * khít giá trị canvas — đã kiểm bằng phép đo readPixels ở nhiều mức alpha.
 *
 * Quầng sáng cộng vào *sau* bước đó, và chỉ cộng vào ba kênh màu. Alpha giữ
 * nguyên của cảnh gốc: trình duyệt ghép canvas xuống trang theo
 *     kết quả = canvas.rgb + trang.rgb · (1 − canvas.a)
 * nên alpha ở đây là *độ che*, không phải độ sáng. Cộng alpha của quầng — bản
 * đầu đã làm vậy — biến vùng loang thành tấm màn mờ đục phủ lên lớp aurora và
 * lưới nền CSS nằm sau canvas, và đo được là một phần tư màn hình *tối đi* sau
 * khi bật một hiệu ứng lẽ ra chỉ làm sáng thêm. Giữ nguyên `base.a` thì độ che
 * không đổi một chút nào, còn phần cộng thêm thành ánh sáng thuần tuý.
 *
 * Chi phí: cảnh được vẽ vào một render target thay vì thẳng ra màn hình, cộng
 * bốn pass toàn màn hình ở nửa độ phân giải. Trên một cảnh chỉ vài lệnh vẽ thì
 * phần này mới là phần tốn — nên nó tắt mặc định trên di động và là nấc đầu
 * tiên bị bỏ khi bộ theo dõi nhịp khung hình thấy máy không theo kịp.
 */
import * as THREE from "three";

export type BloomOptions = {
  /** Độ sáng tối thiểu để một điểm ảnh bắt đầu toả sáng. 0→1. */
  threshold?: number;
  /** Cường độ quầng sáng cộng thêm. */
  strength?: number;
  /** Bán kính loang, tính theo bội số của một texel ở nửa độ phân giải. */
  radius?: number;
  /**
   * Số mẫu khử răng cưa của render target chứa cảnh.
   *
   * Phải khớp với việc renderer có bật `antialias` hay không. Bỏ qua tham số
   * này là một hồi quy im lặng và đã xảy ra thật trong lúc dựng: khi vẽ thẳng
   * ra canvas, cảnh được khử răng cưa bởi chính khung vẽ; khi vẽ vào render
   * target thì không còn ai làm việc đó. Cả năm cảnh của trang đều dựng bằng
   * đường mảnh một điểm ảnh, nên mất khử răng cưa là mất luôn phần lớn độ dày
   * biểu kiến của nét — đo được là gần một phần tư số điểm ảnh tối đi, và nhìn
   * bằng mắt thì khung công trình mỏng hẳn.
   */
  samples?: number;
};

export type BloomPipeline = {
  /** Vẽ cảnh kèm bloom ra màn hình. Thay cho `renderer.render(scene, camera)`. */
  render: (scene: THREE.Scene, camera: THREE.Camera) => void;
  setSize: (width: number, height: number, pixelRatio: number) => void;
  dispose: () => void;
};

/*
 * Đoạn GLSL dùng chung cho pass tách vùng sáng và pass ghép: đưa một điểm ảnh
 * của render target về đúng giá trị mà canvas sẽ hiển thị. Xem phần "KHÔNG GIAN
 * MÀU VÀ ALPHA" ở đầu file để biết vì sao phải chia rồi nhân lại alpha.
 *
 * `LUMA` là trọng số cảm nhận sáng của mắt người, để một màu vàng đồng và một
 * màu xanh ngọc cùng độ sáng vật lý toả quầng như nhau.
 */
const SCREEN_VALUE = /* glsl */ `
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec3 linearToSRGB(vec3 c) {
  return mix(
    c * 12.92,
    1.055 * pow(max(c, vec3(0.0)), vec3(0.41666)) - 0.055,
    step(vec3(0.0031308), c)
  );
}

// Tra ve mau da nhan alpha, dung bang gia tri canvas se hien thi.
vec3 screenValue(vec4 premultipliedLinear) {
  float a = premultipliedLinear.a;
  if (a < 0.0001) return vec3(0.0);
  return linearToSRGB(premultipliedLinear.rgb / a) * a;
}
`;

/*
 * Dùng `ShaderMaterial` chứ không phải `RawShaderMaterial` cho ba pass dưới
 * đây. RawShaderMaterial đưa mã nguồn thẳng xuống trình biên dịch, nghĩa là
 * shader phải tự khai báo `attribute vec3 position`, `attribute vec2 uv` và —
 * dễ quên nhất — dòng `precision` cho fragment shader, thứ GLSL không có giá
 * trị mặc định. Thiếu nó thì shader không biên dịch được và cảnh im lặng biến
 * mất. ShaderMaterial chèn sẵn cả ba, nên phần mã ở đây chỉ còn đúng phần việc
 * của nó.
 */
const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* Tách ra những điểm ảnh đủ sáng để toả quầng, và chỉ giữ lại phần đó. */
const BRIGHT_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;
${SCREEN_VALUE}
void main() {
  vec4 src = texture2D(tDiffuse, vUv);
  vec3 screen = screenValue(src);

  /*
   * Đo độ sáng trên màu *chưa* nhân alpha: một đường vàng mảnh vẽ ở độ mờ 0,25
   * mà đo trên giá trị đã nhân alpha thì chỉ còn một phần tư độ sáng thật và
   * rơi xuống dưới ngưỡng. Không chia thì mọi chi tiết mờ đều bị loại khỏi
   * quầng sáng, và bloom chỉ bám vào vài nét đậm nhất — đúng thứ làm cảnh trông
   * rẻ tiền.
   */
  float luma = src.a > 0.0001 ? dot(screen / src.a, LUMA) : 0.0;

  // smoothstep thay cho ngưỡng cứng: cắt cứng tạo một đường viền lởm chởm chạy
  // dọc chỗ độ sáng vừa chạm ngưỡng, và nó nhấp nháy khi vật thể chuyển động.
  float factor = smoothstep(uThreshold, uThreshold + uKnee, luma);

  // Giữ dạng đã nhân alpha để pass làm mờ cộng trọng số cho ra kết quả đúng.
  gl_FragColor = vec4(screen * factor, src.a * factor);
}
`;

/*
 * Làm mờ Gauss tách trục. Chín điểm lấy mẫu, dùng hai lần (ngang rồi dọc) nên
 * tương đương một nhân 9×9 với chi phí của 18 lần đọc texture thay vì 81.
 */
const BLUR_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uDirection;
varying vec2 vUv;
void main() {
  // Trọng số Gauss chuẩn hoá (sigma ≈ 2).
  float w[5];
  w[0] = 0.2270270270;
  w[1] = 0.1945945946;
  w[2] = 0.1216216216;
  w[3] = 0.0540540541;
  w[4] = 0.0162162162;

  vec4 sum = texture2D(tDiffuse, vUv) * w[0];
  for (int i = 1; i < 5; i++) {
    vec2 offset = uDirection * float(i);
    sum += texture2D(tDiffuse, vUv + offset) * w[i];
    sum += texture2D(tDiffuse, vUv - offset) * w[i];
  }
  gl_FragColor = sum;
}
`;

/*
 * Ghép: cộng RGB, **giữ nguyên alpha của cảnh gốc**.
 *
 * Dòng alpha ở đây là chỗ quan trọng nhất của cả file, và bản đầu đã làm sai
 * theo đúng cái cách nghe hợp lý nhất — cộng cả alpha, `base.a + glow.a`, cho
 * "đúng phép cộng trong không gian premultiplied".
 *
 * Nó sai vì canvas này không đứng một mình: nó nằm *chồng lên* lớp aurora và
 * lưới nền CSS của trang. Trình duyệt ghép canvas xuống trang theo công thức
 *     kết quả = canvas.rgb + trang.rgb * (1 − canvas.a)
 * nên alpha của canvas chính là *độ che*. Quầng sáng loang rộng hơn thân vật
 * thể rất nhiều; cộng alpha vào đó biến cả vùng loang thành một tấm màn mờ đục
 * phủ lên những lớp bên dưới. Đo được là một phần tư số điểm ảnh của màn hình
 * *tối đi* sau khi bật một hiệu ứng lẽ ra chỉ làm sáng thêm.
 *
 * Giữ `base.a` thì độ che không đổi một chút nào so với lúc chưa có bloom, còn
 * phần `glow.rgb` cộng thêm đi qua công thức trên thành ánh sáng cộng thuần tuý
 * lên nền trang. Quầng sáng vàng đồng *làm sáng* lớp aurora phía sau thay vì
 * bôi xám lên nó — vừa đúng vật lý hơn, vừa đúng ý đồ hình ảnh hơn.
 *
 * RGB cố tình không chặn trần: để nó vượt 1 ở lõi quầng thì chỗ sáng nhất mới
 * có cảm giác cháy sáng thật, còn chặn lại sẽ làm quầng bẹt thành mảng màu đều.
 */
const COMPOSITE_FRAG = /* glsl */ `
uniform sampler2D tBase;
uniform sampler2D tBloom;
uniform float uStrength;
varying vec2 vUv;
${SCREEN_VALUE}
void main() {
  vec4 base = texture2D(tBase, vUv);
  vec3 glow = texture2D(tBloom, vUv).rgb * uStrength;
  /*
   * RGB cố tình không chặn trần: để nó vượt 1 ở lõi quầng thì chỗ sáng nhất mới
   * có cảm giác cháy sáng thật, còn chặn lại sẽ làm quầng bẹt thành mảng màu
   * đều. Alpha giữ nguyên — xem đầu file.
   */
  gl_FragColor = vec4(screenValue(base) + glow, base.a);
}
`;

export function createBloom(
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number,
  pixelRatio: number,
  { threshold = 0.55, strength = 0.85, radius = 1.6, samples = 4 }: BloomOptions = {}
): BloomPipeline {
  /*
   * HalfFloat cho render target của cảnh: bước tách vùng sáng chia lại cho
   * alpha, và trên định dạng 8 bit phép chia đó khuếch đại luôn sai số làm tròn
   * thành những đốm lốm đốm dọc các đường mảnh mờ.
   */
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthBuffer: true,
    stencilBuffer: false,
    samples,
  });
  /*
   * KHÔNG GIAN MÀU — chỗ này sai một lần đã làm cả cảnh tối sầm, nên ghi lại
   * đầy đủ.
   *
   * `WebGLRenderer` chỉ mã hoá sang sRGB ở bước ghi ra đích, và nó lấy không
   * gian màu của *đích đang ghi*: `outputColorSpace` khi vẽ thẳng ra canvas,
   * còn `renderTarget.texture.colorSpace` khi vẽ vào render target. Đặt đích
   * này là NoColorSpace thì cảnh nằm lại ở giá trị tuyến tính.
   *
   * Ba pass hậu kỳ bên dưới dùng `ShaderMaterial`, mà three *không* chèn bước
   * mã hoá sRGB cho shader tự viết — chỉ vật liệu dựng sẵn mới có. Nên giá trị
   * tuyến tính đó đi thẳng ra màn hình mà không ai chuyển đổi, và toàn bộ cảnh
   * hiện ra tối hơn hẳn bản không bloom.
   *
   * Đặt sRGB ở đây thì chính vật liệu của cảnh lo việc mã hoá, đúng như khi nó
   * vẽ thẳng ra canvas. Hệ quả kép đáng giá: phần nền đi qua pass ghép mà không
   * đổi một bit nào, nên bật bloom không thể làm hình gốc khác đi — quầng sáng
   * chỉ có thể cộng thêm.
   */
  sceneTarget.texture.colorSpace = THREE.LinearSRGBColorSpace;

  const makeBlurTarget = () => {
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    /*
     * Ngược lại với đích của cảnh: hai đích này chỉ chứa giá trị *đã* mã hoá
     * sang sRGB, và các pass ghi vào chúng đều là shader tự viết nên không có
     * bước chuyển đổi nào. Khai sRGB ở đây sẽ thành chuyển đổi lần thứ hai trên
     * cùng một dữ liệu, và quầng sáng bị đẩy trắng xoá.
     */
    target.texture.colorSpace = THREE.NoColorSpace;
    return target;
  };
  const brightTarget = makeBlurTarget();
  const blurTarget = makeBlurTarget();

  const brightMaterial = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: BRIGHT_FRAG,
    uniforms: {
      tDiffuse: { value: sceneTarget.texture },
      uThreshold: { value: threshold },
      uKnee: { value: 0.25 },
    },
    depthTest: false,
    depthWrite: false,
  });

  const blurMaterial = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: BLUR_FRAG,
    uniforms: {
      tDiffuse: { value: null },
      uDirection: { value: new THREE.Vector2() },
    },
    depthTest: false,
    depthWrite: false,
  });

  const compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: COMPOSITE_FRAG,
    uniforms: {
      tBase: { value: sceneTarget.texture },
      tBloom: { value: blurTarget.texture },
      uStrength: { value: strength },
    },
    depthTest: false,
    depthWrite: false,
    /*
     * NoBlending: pass này *thay thế* nội dung khung hình cuối chứ không trộn
     * vào nó. Trộn thêm lần nữa sẽ nhân đôi phần nền vốn đã nằm trong `tBase`.
     */
    blending: THREE.NoBlending,
  });

  /*
   * Một tam giác phủ kín khung hình, không phải hai tam giác của một hình chữ
   * nhật: bỏ được cạnh chéo ở giữa, nơi GPU phải chạy shader hai lần cho các
   * điểm ảnh nằm sát đường nối.
   */
  const quadGeometry = new THREE.BufferGeometry();
  quadGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  quadGeometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2)
  );

  const quad = new THREE.Mesh<THREE.BufferGeometry, THREE.Material>(quadGeometry, brightMaterial);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE.Camera();

  let blurWidth = 1;
  let blurHeight = 1;

  const setSize = (nextWidth: number, nextHeight: number, nextPixelRatio: number) => {
    const w = Math.max(1, Math.round(nextWidth * nextPixelRatio));
    const h = Math.max(1, Math.round(nextHeight * nextPixelRatio));
    sceneTarget.setSize(w, h);
    // Nửa độ phân giải cho phần quầng sáng: nó vốn là một vệt mờ, không ai nhìn
    // ra được chi tiết trong đó, mà chi phí thì giảm bốn lần.
    blurWidth = Math.max(1, Math.round(w / 2));
    blurHeight = Math.max(1, Math.round(h / 2));
    brightTarget.setSize(blurWidth, blurHeight);
    blurTarget.setSize(blurWidth, blurHeight);
  };
  setSize(width, height, pixelRatio);

  const drawQuad = (material: THREE.Material, target: THREE.WebGLRenderTarget | null) => {
    quad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(quadScene, quadCamera);
  };

  const render = (scene: THREE.Scene, camera: THREE.Camera) => {
    const previousAutoClear = renderer.autoClear;
    renderer.autoClear = true;

    // 1. Cảnh vào render target riêng.
    renderer.setRenderTarget(sceneTarget);
    renderer.clear();
    renderer.render(scene, camera);

    // 2. Tách vùng sáng, hạ xuống nửa độ phân giải.
    drawQuad(brightMaterial, brightTarget);

    // 3. Làm mờ ngang rồi dọc.
    blurMaterial.uniforms.tDiffuse.value = brightTarget.texture;
    blurMaterial.uniforms.uDirection.value.set(radius / blurWidth, 0);
    drawQuad(blurMaterial, blurTarget);

    blurMaterial.uniforms.tDiffuse.value = blurTarget.texture;
    blurMaterial.uniforms.uDirection.value.set(0, radius / blurHeight);
    drawQuad(blurMaterial, brightTarget);

    // 4. Ghép ra màn hình. Bước 3 kết thúc ở brightTarget, nên đó mới là nguồn.
    compositeMaterial.uniforms.tBloom.value = brightTarget.texture;
    drawQuad(compositeMaterial, null);

    renderer.autoClear = previousAutoClear;
  };

  const dispose = () => {
    sceneTarget.dispose();
    brightTarget.dispose();
    blurTarget.dispose();
    brightMaterial.dispose();
    blurMaterial.dispose();
    compositeMaterial.dispose();
    quadGeometry.dispose();
    renderer.setRenderTarget(null);
  };

  return { render, setSize, dispose };
}
