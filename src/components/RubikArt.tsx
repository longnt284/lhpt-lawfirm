/*
 * Bản vẽ tĩnh của khối rubik hồ sơ.
 *
 * Cùng một hình với cảnh 3D, chỉ ở một góc nhìn cố định và bằng SVG. Nó xuất
 * hiện ở hai chỗ và cả hai đều là chỗ *thay thế* cho cảnh 3D chứ không phải chỗ
 * giữ chỗ tạm: nền tĩnh của thẻ trên trang chủ trước khi three.js kịp tải (và
 * mãi mãi, với máy yếu hoặc người bật "giảm chuyển động"), và bản dự phòng của
 * trang chi tiết trên máy không dựng nổi ngữ cảnh WebGL.
 *
 * Vì vậy nó phải tự đứng được một mình, và phải khớp góc nhìn với cảnh thật —
 * nếu không, lúc canvas chồng lên thì hình nhảy một nhịp ngay trước mắt người
 * đang cuộn tới.
 *
 * Toạ độ sinh bằng phép chiếu trục lượng (isometric) chứ không vẽ tay: một khối
 * 3×3×3 có ba mặt lộ ra với hai mươi bảy ô, ngồi gõ tay từng đoạn thẳng thì vừa
 * lâu vừa sai lệch, mà sửa tỉ lệ một cái là phải gõ lại từ đầu.
 */

/* Phép chiếu: +x xuống phải, +z xuống trái, +y lên. */
const ISO_X = Math.cos(Math.PI / 6);
const ISO_Y = Math.sin(Math.PI / 6);
/*
 * Tỉ lệ chọn theo khung nhỏ nhất mà bản vẽ này phải sống được: ô xem trước
 * 16:10 trong thẻ ở trang chủ. Ở đó cả khối *lẫn* các mảnh còn lơ lửng phải nằm
 * lọt trong khung — mảnh bị cắt cụt ở mép thẻ thì đọc ra là lỗi tràn, không đọc
 * ra là đang bay.
 */
const S = 12;
const CX = 100;
const CY = 66;

const at = (x: number, y: number, z: number, scale = S, cx = CX, cy = CY): [number, number] => [
  cx + (x - z) * ISO_X * scale,
  cy + ((x + z) * ISO_Y - y) * scale,
];

const seg = (a: [number, number], b: [number, number]) =>
  `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;

const H = 1.5;
const CUTS = [-1.5, -0.5, 0.5, 1.5];

/*
 * Ba mặt lộ ra, mỗi mặt một lưới 3×3. Các đường ở mép mặt (u = ±1,5) trùng với
 * đường bao và đường giao giữa hai mặt, nên chúng được vẽ ở nhóm đậm bên dưới
 * chứ không nằm trong nhóm này.
 */
const GRID = CUTS.filter((u) => Math.abs(u) < 1)
  .flatMap((u) => [
    // mặt trên
    seg(at(-H, H, u), at(H, H, u)),
    seg(at(u, H, -H), at(u, H, H)),
    // mặt phải
    seg(at(H, -H, u), at(H, H, u)),
    seg(at(H, u, -H), at(H, u, H)),
    // mặt trái
    seg(at(-H, u, H), at(H, u, H)),
    seg(at(u, -H, H), at(u, H, H)),
  ])
  .join("");

/* Đường bao sáu cạnh, cộng ba đường giao gặp nhau ở đỉnh gần nhất. */
const OUTLINE = [
  seg(at(-H, H, -H), at(H, H, -H)),
  seg(at(H, H, -H), at(H, -H, -H)),
  seg(at(H, -H, -H), at(H, -H, H)),
  seg(at(H, -H, H), at(-H, -H, H)),
  seg(at(-H, -H, H), at(-H, H, H)),
  seg(at(-H, H, H), at(-H, H, -H)),
].join("");

const SEAMS = [
  seg(at(H, H, H), at(-H, H, H)),
  seg(at(H, H, H), at(H, H, -H)),
  seg(at(H, H, H), at(H, -H, H)),
].join("");

/*
 * Mảnh khoá ở giữa mặt trên được vẽ riêng bằng màu ngọc: trong cảnh 3D nó là
 * mảnh cuối cùng vào chỗ, và cả hai trang đều dựa vào chi tiết đó để nói về giai
 * đoạn cuối của một hồ sơ.
 */
const KEYSTONE = [
  seg(at(-0.5, H, -0.5), at(0.5, H, -0.5)),
  seg(at(0.5, H, -0.5), at(0.5, H, 0.5)),
  seg(at(0.5, H, 0.5), at(-0.5, H, 0.5)),
  seg(at(-0.5, H, 0.5), at(-0.5, H, -0.5)),
].join("");

/** Một mảnh còn lơ lửng ngoài khối: khối lập phương nhỏ vẽ theo cùng phép chiếu. */
function shard(x: number, y: number, z: number, size: number) {
  const [cx, cy] = at(x, y, z);
  const s = size * S;
  const p = (dx: number, dy: number, dz: number) => at(dx, dy, dz, s, cx, cy);
  return [
    // đường bao sáu cạnh
    seg(p(-1, 1, -1), p(1, 1, -1)),
    seg(p(1, 1, -1), p(1, -1, -1)),
    seg(p(1, -1, -1), p(1, -1, 1)),
    seg(p(1, -1, 1), p(-1, -1, 1)),
    seg(p(-1, -1, 1), p(-1, 1, 1)),
    seg(p(-1, 1, 1), p(-1, 1, -1)),
    // ba đường giao
    seg(p(1, 1, 1), p(-1, 1, 1)),
    seg(p(1, 1, 1), p(1, 1, -1)),
    seg(p(1, 1, 1), p(1, -1, 1)),
  ].join("");
}

/*
 * Bốn mảnh đang trên đường về, kèm một vệt mờ chỉ hướng bay. Không có chúng thì
 * bản tĩnh chỉ là một khối rubik đứng yên, và người xem không có manh mối nào
 * rằng thứ sắp chạy là màn các mảnh ghép lại.
 */
const SHARDS: Array<{ from: [number, number, number]; size: number; accent: boolean }> = [
  { from: [3.4, 2.1, -1.2], size: 0.42, accent: false },
  { from: [-2.4, 2.9, 1.1], size: 0.3, accent: true },
  { from: [-3.2, -1.1, -2.0], size: 0.36, accent: false },
  { from: [2.2, -2.4, 2.6], size: 0.26, accent: false },
];

const SHARD_PATHS = SHARDS.map((s) => ({ ...s, d: shard(...s.from, s.size) }));

const TRAILS = SHARDS.map(({ from }) => {
  const [x, y, z] = from;
  const length = Math.hypot(x, y, z);
  const k = Math.max(0, (length - 1.6) / length);
  return seg(at(x, y, z), at(x * k * 0.55, y * k * 0.55, z * k * 0.55));
}).join("");

/**
 * Khối rubik vẽ trong hệ toạ độ `0 0 200 132`. Đặt trong một `<svg>` có đúng
 * viewBox đó, hoặc bọc thêm `<g transform>` nếu khung khác.
 */
export function RubikArt({ opacity = 1 }: { opacity?: number }) {
  return (
    <g
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      {/* vệt bay của các mảnh còn lơ lửng */}
      <path className="text-fog-500" stroke="currentColor" opacity="0.2" d={TRAILS} />
      {/* lưới 3×3 trên ba mặt lộ ra */}
      <path className="text-fog-400" stroke="currentColor" opacity="0.34" d={GRID} />
      {/* đường giao giữa ba mặt */}
      <path className="text-brass-500" stroke="currentColor" opacity="0.5" d={SEAMS} />
      {/* đường bao */}
      <path className="text-brass-400" stroke="currentColor" opacity="0.82" d={OUTLINE} />
      {/* mảnh khoá */}
      <path className="text-jade-400" stroke="currentColor" opacity="0.75" d={KEYSTONE} />
      {SHARD_PATHS.map(({ d, accent }, index) => (
        <path
          key={index}
          className={accent ? "text-jade-400" : "text-brass-500"}
          stroke="currentColor"
          opacity={accent ? 0.5 : 0.42}
          d={d}
        />
      ))}
    </g>
  );
}
