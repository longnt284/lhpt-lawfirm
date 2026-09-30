/* LHPT Law Firm — video giới thiệu "Nền móng" (16:9, 1920×1080, 60 fps, 60 giây).
 *
 * Mọi khung hình là hàm thuần của thời gian t (giây), nên render được theo thứ tự
 * bất kỳ và song song. Thời gian chủ yếu tính bằng nhịp (96 BPM) để hình và nhạc
 * tổng hợp trong audio.py khóa nhịp với nhau qua khối SYNC.
 *
 * Kịch bản kể lại màn mở đầu của trang chủ (src/components/three/OpeningScene.tsx)
 * thành một mạch liền: hiên cột khung dây đứng trên mặt đất, máy quay hạ xuống
 * dưới nền, bốn cọc được đóng, rồi đi qua năm tầng đất — mỗi tầng là một lĩnh vực
 * hành nghề, mang theo các văn bản làm nền cho nó. Cuối cùng máy quay lùi ra và
 * mặt đứng hiên cột thu về đúng logo của hãng: logo vốn là một hàng bốn cột đỡ
 * mái dốc.
 *
 * Hình học là đường, không phải mặt đặc, và được chiếu phối cảnh bằng tay trên
 * Canvas 2D: không cần WebGL, không phụ thuộc GPU của máy render.
 *
 * Nội dung trên màn hình lấy từ src/firm.ts (lĩnh vực, đội ngũ, cam kết tiếp nhận,
 * liên hệ). Số hiệu văn bản lấy từ src/content/lexLineage.snapshot.json và
 * src/content/legalDocs.ts. Đổi dữ liệu ở đó thì sửa AREAS, TEAM, PLEDGES ở đây
 * rồi render lại. */

const W = 1920, H = 1080;
const BPM = 96, B = 60 / BPM;
const TOTAL_BEATS = 96;
const DURATION = TOTAL_BEATS * B;
const FPS = 60;

/* Bảng màu thương hiệu, đúng giá trị trong src/index.css. */
const C = {
  ink950: '#050b13', ink900: '#0a1420', ink850: '#0d1826', ink800: '#101e30', ink700: '#17293f',
  fog500: '#8095ab', fog400: '#9db0c4', fog300: '#c2cfdd', snow: '#eef4fa',
  brass300: '#ecd7a0', brass400: '#dfc27d', brass500: '#c9a44c', brass600: '#a9852f',
  jade400: '#46dcb5', jade500: '#22c49c',
};
const RGB = {
  fog: [157, 176, 196], brass: [201, 164, 76], brassSoft: [223, 194, 125], snow: [238, 244, 250], jade: [34, 196, 156],
};
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Sự kiện khóa nhịp dùng chung với audio.py; audio.py đọc JSON nằm giữa hai dấu mốc.
// impacts: [nhịp, cường độ]; cols: bốn thân cột mọc lên; piles: bốn cọc được đóng;
// areas: nhịp mở của năm lĩnh vực; laws: độ lệch (nhịp) của ba dòng văn bản trong
// mỗi lĩnh vực; team: bốn nhãn luật sư; pledges: ba dòng cam kết; logo: [bắt đầu
// thu về logo, logo khóa].
/*SYNC*/
const SYNC = {
  "impacts": [[12, 1], [84, 0.85]],
  "cols": [2, 2.25, 2.5, 2.75],
  "piles": [14, 14.75, 15.5, 16.25],
  "areas": [24, 32, 40, 48, 56],
  "laws": [2.5, 2.875, 3.25],
  "team": [66.5, 67.25, 68, 68.75],
  "pledges": [73, 74.5, 76],
  "logo": [81.5, 84]
};
/*END*/

/* ================= NỘI DUNG ================= */

/* Năm lĩnh vực, đúng thứ tự và câu chữ của SERVICES trong src/firm.ts. Văn bản nền
 * tảng chỉ nêu số hiệu và tên — không nêu tình trạng hiệu lực, vì video là một tệp
 * cố định còn tình trạng thì đổi theo thời gian. */
const AREAS = [
  {
    icon: 'crane', title: ['Xây dựng', 'Bất động sản'], short: 'XÂY DỰNG · BĐS',
    tagline: 'Pháp lý toàn vòng đời dự án, từ đất đến sổ.',
    laws: [['135/2025/QH15', 'Luật Xây dựng'], ['31/2024/QH15', 'Luật Đất đai'], ['29/2023/QH15', 'Luật Kinh doanh bất động sản']],
  },
  {
    icon: 'scale', title: ['Tố tụng', 'Giải quyết tranh chấp'], short: 'TỐ TỤNG',
    tagline: 'Chiến lược kiện và đàm phán dựa trên hồ sơ, không cảm tính.',
    laws: [['92/2015/QH13', 'Bộ luật Tố tụng dân sự'], ['54/2010/QH12', 'Luật Trọng tài thương mại'], ['91/2015/QH13', 'Bộ luật Dân sự']],
  },
  {
    icon: 'solar', title: ['Điện mặt trời', 'Năng lượng'], short: 'NĂNG LƯỢNG',
    tagline: 'Đồng hành từ giấy phép điện lực đến hợp đồng mua bán điện dài hạn.',
    laws: [['61/2024/QH15', 'Luật Điện lực'], ['57/2025/NĐ-CP', 'Cơ chế mua bán điện trực tiếp'], ['58/2025/NĐ-CP', 'Phát triển điện năng lượng tái tạo']],
  },
  {
    icon: 'deal', title: ['Doanh nghiệp', 'Tuân thủ'], short: 'DOANH NGHIỆP',
    tagline: 'Hậu phương pháp lý cho vận hành doanh nghiệp mỗi ngày.',
    laws: [['59/2020/QH14', 'Luật Doanh nghiệp'], ['143/2025/QH15', 'Luật Đầu tư'], ['108/2025/QH15', 'Luật Quản lý thuế']],
  },
  {
    icon: 'shield', title: ['Bảo mật dữ liệu', 'Công nghệ'], short: 'DỮ LIỆU',
    tagline: 'Tuân thủ dữ liệu cá nhân trước khi bị phạt, không phải sau.',
    laws: [['91/2025/QH15', 'Luật Bảo vệ dữ liệu cá nhân'], ['356/2025/NĐ-CP', 'Hướng dẫn Luật Bảo vệ dữ liệu cá nhân']],
  },
];
const NA = AREAS.length;

/* Đội ngũ, đúng LAWYERS trong src/firm.ts. Bốn luật sư đứng trên bốn cọc. */
const TEAM = [
  { name: 'LS. Trung Phạm', role: 'Luật sư Điều hành', years: '18 năm hành nghề', focus: 'Xây dựng · BĐS · Tố tụng · Điện mặt trời' },
  { name: 'LS. Long Nguyễn', role: 'Luật sư Thành viên', years: '15 năm hành nghề', focus: 'Xây dựng · BĐS · Tố tụng · Điện mặt trời' },
  { name: 'LS. Huy Đặng', role: 'Luật sư Thành viên', years: '14 năm hành nghề', focus: 'Bảo mật dữ liệu · Tố tụng · Doanh nghiệp' },
  { name: 'LS. Phú Hoàng', role: 'Luật sư Thành viên', years: '12 năm hành nghề', focus: 'Bảo mật dữ liệu · Tố tụng · Doanh nghiệp' },
];

/* Quy trình tiếp nhận, đúng câu chữ ở POLICIES_SERVICE trong src/firm.ts. Video hứa
 * quy trình, không hứa kết quả vụ việc. */
const PLEDGES = [
  ['24 giờ làm việc', 'đánh giá sơ bộ vụ việc'],
  ['3 ngày làm việc', 'đề xuất phương án và báo phí'],
  ['Không phát sinh', 'phí ngoài báo giá đã xác nhận bằng văn bản'],
];

/* Biểu tượng lĩnh vực, chép nguyên đường vẽ từ src/components/Icons.tsx (hệ 24 đơn vị). */
const ICONS = {
  crane: ['M5 21h14', 'M9 21V4', 'M9 4h10', 'M9 4 6 8h3', 'M17 4v6', 'M15.4 10a1.6 1.6 0 0 0 3.2 0', 'M5 21v-4h3v4', 'M13 21v-3h3v3'],
  scale: ['M12 4v14', 'M8 21h8', 'M4 7h16', 'M4 7 2.3 11.3', 'M4 7l1.7 4.3', 'M2.3 11.3a1.8 1.8 0 0 0 3.4 0',
    'M20 7l-1.7 4.3', 'M20 7l1.7 4.3', 'M18.3 11.3a1.8 1.8 0 0 0 3.4 0', 'M9.5 18h5'],
  solar: ['M14.6 6a2.6 2.6 0 1 1-5.2 0a2.6 2.6 0 1 1 5.2 0', 'M12 1.4v1.1', 'M12 9.5v1.1', 'M16.6 6h1.1', 'M6.3 6h1.1',
    'M15.3 2.7l-.8.8', 'M8.7 2.7l.8.8', 'M4 13h16v7.5H4z', 'M4 16.7h16', 'M9.3 13v7.5', 'M14.7 13v7.5'],
  deal: ['M3.5 7.5h17v12h-17z', 'M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7', 'M3.5 12.5h17', 'M10.5 11v3h3v-3z'],
  shield: ['M12 3l7 2.7v5.5c0 4.5-2.9 7.9-7 9.8-4.1-1.9-7-5.3-7-9.8V5.7z', 'M9 11.6l2.1 2.1 4-4.2'],
};

/* ================= TOÁN ================= */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (x, a, b) => clamp((x - a) / (b - a));
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
/** Hiện ra trong [a, a + d], giữ, rồi tắt trong [z, z + d]. */
const win = (b, a, z, d = .6) => prog(b, a, a + d) * (1 - prog(b, z, z + d));

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

/* ================= CHỮ ================= */
function font(o) { return `${o.it ? 'italic ' : ''}${o.w || 500} ${o.s || 40}px ${o.f || 'BVP'}`; }
function T(s, x, y, o = {}) {
  const c = o.ctx || ctx, al = o.al ?? 1;
  if (al <= 0) return;
  c.save();
  c.font = font(o);
  c.textAlign = o.a || 'left';
  c.textBaseline = 'alphabetic';
  c.letterSpacing = (o.ls || 0) + 'px';
  c.globalAlpha *= al;
  c.fillStyle = o.c || C.snow;
  c.fillText(s, x, y);
  c.restore();
}
function measure(s, o) {
  ctx.save(); ctx.font = font(o); ctx.letterSpacing = (o.ls || 0) + 'px';
  const m = ctx.measureText(s).width; ctx.restore(); return m;
}
function fit(s, o, maxW) { const m = measure(s, o); return m > maxW ? { ...o, s: o.s * maxW / m, ls: (o.ls || 0) * maxW / m } : o; }
function wrap(text, o, maxW) {
  const out = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && measure(next, o) > maxW) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}
/** Chữ trồi lên vào chỗ: p trong [0, 1]. */
function riseT(s, x, y, o, p, dy = 24) {
  if (p <= 0) return;
  T(s, x, y + (1 - E.outCubic(p)) * dy, { ...o, al: (o.al ?? 1) * clamp(p * 1.6) });
}
/** Nhãn nhỏ viết hoa, giãn chữ: kiểu chữ ghi chú trên bản vẽ. */
const LABEL = { f: 'BVP', w: 600, s: 16, ls: 5 };

/* ================= THẾ GIỚI 3D ================= */
/* Cao độ lấy từ OpeningScene.tsx; riêng trục cột dàn đều bốn cột như logo. */
const DEPTH = 0.95, SHAFT_BOTTOM = -2.55, SHAFT_TOP = 2.5, CAP_TOP = 2.82, ARCH_TOP = 3.32, RIDGE = 4.85, COL_HALF = 0.3;
const STEP_TOP = SHAFT_BOTTOM - 0.3, STEP_COUNT = 3, STEP_RISE = 0.36;
const GROUND_Y = STEP_TOP - STEP_COUNT * STEP_RISE - 0.06;
const COLS = [-3.3, -1.1, 1.1, 3.3];
const SPAN = COLS[3] + 1.15;
const EAVE_Z = DEPTH + 0.2;
const CAP_BOT = GROUND_Y - 0.56;
const PILE_HALF = 0.2, PILE_Z = 0.62;
const TIES = [GROUND_Y - 1.7, GROUND_Y - 3.1];
const STRATA_TOP = GROUND_Y - 4.2;
const LT = 3.2;
const PILE_BOTTOM = STRATA_TOP - NA * LT - 0.9;
const REACH = SPAN + 9;
const STRATA_Z = DEPTH + 2.6;
const BACK = 0.34; // mặt sau mờ hơn mặt trước: chênh lệch này cho khối một bề dày
const layerTop = k => STRATA_TOP - k * LT;
const layerMid = k => layerTop(k) - LT / 2;
/* Thứ tự đóng cọc: hai cọc biên trước, hai cọc giữa sau. */
const PILE_ORDER = [0, 3, 1, 2];

/* Mỗi đường: hai đầu, màu, độ đậm, nhóm, mốc vẽ ra (nhịp) và kiểu vẽ ra:
 * 'ab' mọc từ a sang b, 'mid' mọc từ giữa ra hai đầu. */
const LINES = [];
function seg(a, b, col, al, g, t0 = -1, dur = 1, o = {}) {
  LINES.push({ a, b, col, al, g, t0, t1: t0 + dur, w: o.w || 1.6, mode: o.mode || 'ab' });
}
function rect(x0, x1, y0, y1, z, col, al, g, t0, dur, o = {}) {
  seg([x0, y0, z], [x1, y0, z], col, al, g, t0, dur, { ...o, mode: 'mid' });
  seg([x0, y0, z], [x0, y1, z], col, al, g, t0, dur, o);
  seg([x1, y0, z], [x1, y1, z], col, al, g, t0, dur, o);
  seg([x0, y1, z], [x1, y1, z], col, al, g, t0 + dur * .4, dur * .6, { ...o, mode: 'mid' });
}
/** Khối hộp: mặt trước, mặt sau mờ hơn, bốn cạnh nối hai mặt. */
function box(x0, x1, y0, y1, d, col, al, g, t0, dur, o = {}) {
  rect(x0, x1, y0, y1, d, col, al, g, t0, dur, o);
  rect(x0, x1, y0, y1, -d, col, al * BACK, g, t0 + dur * .3, dur, o);
  for (const x of [x0, x1]) for (const y of [y0, y1]) seg([x, y, d], [x, y, -d], col, al * .5, g, t0 + dur * .5, dur * .6);
}

function buildWorld() {
  const F = RGB.fog, Br = RGB.brass, Bs = RGB.brassSoft;
  /* ---- trên mặt đất ---- */
  for (let i = 0; i < STEP_COUNT; i++) {
    const y1 = STEP_TOP - i * STEP_RISE, y0 = y1 - STEP_RISE;
    const w = SPAN + .36 + i * .46, d = DEPTH + .3 + i * .26;
    rect(-w, w, y0, y1, d, F, .42 - i * .07, 'above', 1 + i * .18, .9);
    seg([-w, y1, d], [-w, y1, -d], F, .2, 'above', 1.6 + i * .18, .6);
    seg([w, y1, d], [w, y1, -d], F, .2, 'above', 1.6 + i * .18, .6);
  }
  COLS.forEach((x, i) => {
    box(x - .46, x + .46, SHAFT_BOTTOM - .3, SHAFT_BOTTOM, DEPTH + .12, Br, .5, 'above', 1.5 + i * .12, .6);
    const t0 = SYNC.cols[i];
    for (const dx of [-COL_HALF, COL_HALF]) {
      seg([x + dx, SHAFT_BOTTOM, DEPTH], [x + dx, SHAFT_TOP, DEPTH], F, .62, 'above', t0, 1.3);
      seg([x + dx, SHAFT_BOTTOM, -DEPTH], [x + dx, SHAFT_TOP, -DEPTH], F, .62 * BACK, 'above', t0 + .3, 1.3);
    }
    seg([x, SHAFT_BOTTOM + .24, DEPTH], [x, SHAFT_TOP - .24, DEPTH], F, .26, 'above', t0 + .2, 1.3);
    box(x - .46, x + .46, SHAFT_TOP, CAP_TOP, DEPTH + .12, Br, .55, 'above', 3.3 + i * .12, .6);
  });
  box(-SPAN, SPAN, CAP_TOP, ARCH_TOP, DEPTH + .2, Bs, .6, 'above', 3.8, 1);
  seg([-SPAN, CAP_TOP + .18, DEPTH + .2], [SPAN, CAP_TOP + .18, DEPTH + .2], F, .3, 'above', 4.1, .9, { mode: 'mid' });
  /* mái dốc: lặp lại nét vàng trong logo */
  const apex = [0, RIDGE, EAVE_Z], apexB = [0, RIDGE, -EAVE_Z];
  seg([-SPAN, ARCH_TOP, EAVE_Z], apex, Br, .95, 'above', 4.4, 1.1, { w: 2.2 });
  seg([SPAN, ARCH_TOP, EAVE_Z], apex, Br, .95, 'above', 4.4, 1.1, { w: 2.2 });
  seg([-SPAN, ARCH_TOP, -EAVE_Z], apexB, Br, .95 * BACK, 'above', 4.8, 1.1);
  seg([SPAN, ARCH_TOP, -EAVE_Z], apexB, Br, .95 * BACK, 'above', 4.8, 1.1);
  seg(apex, apexB, Br, .45, 'above', 5.4, .6);
  seg([-SPAN, ARCH_TOP, EAVE_Z], [-SPAN, ARCH_TOP, -EAVE_Z], Br, .4, 'above', 5.2, .6);
  seg([SPAN, ARCH_TOP, EAVE_Z], [SPAN, ARCH_TOP, -EAVE_Z], Br, .4, 'above', 5.2, .6);
  seg([-SPAN + .5, ARCH_TOP + .26, EAVE_Z], [0, RIDGE - .52, EAVE_Z], F, .3, 'above', 5, 1);
  seg([SPAN - .5, ARCH_TOP + .26, EAVE_Z], [0, RIDGE - .52, EAVE_Z], F, .3, 'above', 5, 1);

  /* ---- vạch nền: ranh giới giữa phần nổi và phần chìm ---- */
  const gr = REACH + 3;
  seg([-gr, GROUND_Y, DEPTH + 1.4], [gr, GROUND_Y, DEPTH + 1.4], Br, .95, 'ground', .3, 1.9, { mode: 'mid', w: 2 });
  seg([-gr, GROUND_Y, -(DEPTH + 1.4)], [gr, GROUND_Y, -(DEPTH + 1.4)], Br, .4, 'ground', .8, 1.9, { mode: 'mid' });

  /* ---- dưới mặt đất ---- */
  COLS.forEach((x, i) => box(x - .46, x + .46, CAP_BOT, GROUND_Y - .06, PILE_Z + .2, Br, .7, 'under', 12.6 + i * .15, .7));
  TIES.forEach((y, lv) => {
    for (const z of [PILE_Z, -PILE_Z]) seg([COLS[0], y, z], [COLS[3], y, z], F, (.55 - lv * .08) * (z > 0 ? 1 : BACK), 'under', 16.8 + lv * .4, 1, { mode: 'mid' });
    COLS.forEach(x => seg([x - .34, y, PILE_Z], [x + .34, y, PILE_Z], Br, .5, 'under', 17.3 + lv * .4, .4, { mode: 'mid' }));
  });
  for (let i = 0; i < COLS.length - 1; i++) {
    const a = COLS[i], c = COLS[i + 1];
    [[CAP_BOT, TIES[0]], [TIES[0], TIES[1]]].forEach(([top, bot], lv) => {
      seg([a, top, PILE_Z], [c, bot, PILE_Z], F, .28 - lv * .05, 'under', 17.4 + lv * .3 + i * .1, .8);
      seg([c, top, PILE_Z], [a, bot, PILE_Z], F, .28 - lv * .05, 'under', 17.4 + lv * .3 + i * .1, .8);
    });
  }
  /* ranh giới các tầng đất */
  for (let k = 0; k <= NA; k++) {
    const y = layerTop(k);
    seg([-REACH, y, STRATA_Z], [REACH, y, STRATA_Z], F, .34, 'strata', 18 + k * .16, 1.3, { mode: 'mid' });
    seg([-REACH, y, -STRATA_Z], [REACH, y, -STRATA_Z], F, .14, 'strata', 18.4 + k * .16, 1.3, { mode: 'mid' });
    for (const x of [-REACH, REACH]) seg([x, y, STRATA_Z], [x, y, -STRATA_Z], F, .1, 'strata', 19 + k * .16, .8);
  }
  /* dấu ngọc ở đáy — cùng vai trò với ô vuông ngọc ở góc logo */
  const jb = layerTop(NA);
  box(COLS[3] + 1.5, COLS[3] + 1.95, jb - .45, jb, PILE_Z + .1, RGB.jade, .8, 'strata', 19.5, .6);
}

/* ---------- máy quay ---------- */
/* Khóa hình: [nhịp, x, y, khoảng cách]. Giữa hai khóa nội suy inOutCubic; khoảng cách
 * nội suy theo log để cú lùi xa cuối video có tốc độ cảm nhận đều. */
const CAM_KEYS = (() => {
  const k = [
    [0, 0, .55, 13.2],
    [10.2, 0, .45, 12.2],
    [13.8, 0, -6.9, 12.6],
    [16.3, 0, -7.2, 12.6],
    [18, -3.2, -7.8, 14.5],
    [22.8, -3.2, -8.3, 14.5],
  ];
  SYNC.areas.forEach((a, i) => {
    k.push([a, -3.2, layerMid(i), 15]);
    k.push([a + 6.8, -3.2, layerMid(i) - .28, 15]);
  });
  k.push([65.6, 0, -6.2, 6.4]);
  k.push([79, 0, -6.4, 6.6]);
  k.push([SYNC.logo[0] + 1, 0, (RIDGE + GROUND_Y) / 2, 84]);
  k.push([TOTAL_BEATS, 0, (RIDGE + GROUND_Y) / 2, 90]);
  return k;
})();
const FOCAL = (H / 2) / Math.tan(25 * Math.PI / 180);
const NEAR = .35;

function camAt(b, t) {
  let i = 0;
  while (i < CAM_KEYS.length - 2 && b >= CAM_KEYS[i + 1][0]) i++;
  const [b0, x0, y0, d0] = CAM_KEYS[i], [b1, x1, y1, d1] = CAM_KEYS[i + 1];
  const p = E.inOutCubic(prog(b, b0, b1));
  const x = lerp(x0, x1, p), y = lerp(y0, y1, p), d = Math.exp(lerp(Math.log(d0), Math.log(d1), p));
  /* Đưa máy qua lại rất chậm quanh điểm nhìn: vật ở mặt phẳng điểm nhìn đứng yên,
   * mặt trước và mặt sau trượt lệch nhau. Không quay tròn, không lái máy. Tắt dần
   * trước khi thu về logo để logo đứng yên tuyệt đối. */
  const sw = 1 - prog(b, 79, SYNC.logo[0]);
  const ox = sw * (.6 * Math.sin(t * .41) + .18 * Math.sin(t * 1.07 + 1));
  const oy = sw * .2 * Math.sin(t * .33 + 2);
  const P = [x + ox, y + oy, d];
  const f = norm([x - P[0], y - P[1], -P[2]]);
  const r = norm([-f[2], 0, f[0]]);
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cy = lerp(H / 2, 380, E.inOutCubic(prog(b, 79, SYNC.logo[0] + 1)));
  return { P, f, r, u, cx: W / 2, cy, x, y, d };
}
function norm(v) { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
function toCam(cam, p) {
  const v = [p[0] - cam.P[0], p[1] - cam.P[1], p[2] - cam.P[2]];
  return [v[0] * cam.r[0] + v[1] * cam.r[1] + v[2] * cam.r[2],
    v[0] * cam.u[0] + v[1] * cam.u[1] + v[2] * cam.u[2],
    v[0] * cam.f[0] + v[1] * cam.f[1] + v[2] * cam.f[2]];
}
function scr(cam, c) { return [cam.cx + FOCAL * c[0] / c[2], cam.cy - FOCAL * c[1] / c[2], c[2]]; }
function project(cam, p) { const c = toCam(cam, p); return c[2] < NEAR ? null : scr(cam, c); }
/** Chiếu một đoạn thẳng, cắt theo mặt phẳng gần. */
function projectSeg(cam, a, b) {
  let ca = toCam(cam, a), cb = toCam(cam, b);
  if (ca[2] < NEAR && cb[2] < NEAR) return null;
  if (ca[2] < NEAR || cb[2] < NEAR) {
    const k = (NEAR - ca[2]) / (cb[2] - ca[2]);
    const m = [lerp(ca[0], cb[0], k), lerp(ca[1], cb[1], k), NEAR];
    if (ca[2] < NEAR) ca = m; else cb = m;
  }
  return [scr(cam, ca), scr(cam, cb)];
}

/* ================= TÀI NGUYÊN DỰNG SẴN ================= */
const [bgC, bgX] = mk(W, H);
const [vigC, vigX] = mk(W, H);
const [grainC, grainX] = mk(256, 256);
const [geoC, geoX] = mk(W, H);
const HATCH = [];
const DUST = [];
const ICON_LEN = {};
const svgNS = 'http://www.w3.org/2000/svg';

function buildAssets() {
  {
    const g = bgX.createRadialGradient(W * .56, H * .38, 0, W * .56, H * .38, W * .8);
    g.addColorStop(0, '#0f1c2c'); g.addColorStop(.5, C.ink900); g.addColorStop(1, '#03070d');
    bgX.fillStyle = g; bgX.fillRect(0, 0, W, H);
  }
  {
    const g = vigX.createRadialGradient(W / 2, H / 2, H * .36, W / 2, H / 2, W * .64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
    vigX.fillStyle = g; vigX.fillRect(0, 0, W, H);
  }
  {
    const id = grainX.createImageData(256, 256), R = rng(29);
    for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    grainX.putImageData(id, 0, 0);
  }
  /* Năm ký hiệu tầng đất theo lối bản vẽ địa chất: gạch chéo, chấm cát, gạch sét,
   * lưới đá, sỏi. Mỗi mẫu dựng hai bản, xám cho tầng nghỉ và đồng cho tầng đang nói. */
  for (let k = 0; k < NA; k++) {
    const pair = [];
    for (const col of [RGB.fog, RGB.brassSoft]) {
      const [c, x] = mk(48, 48); const R = rng(40 + k);
      x.strokeStyle = x.fillStyle = rgba(col, 1); x.lineWidth = 1.2; x.lineCap = 'round';
      if (k === 0) { x.beginPath(); for (let i = -48; i < 96; i += 12) { x.moveTo(i, 48); x.lineTo(i + 48, 0); } x.stroke(); }
      if (k === 1) for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(R() * 48, R() * 48, .9 + R() * .6, 0, Math.PI * 2); x.fill(); }
      if (k === 2) { x.beginPath(); for (let r = 0; r < 4; r++) for (let j = 0; j < 3; j++) { const ox = (r % 2) * 8 + j * 16; x.moveTo(ox, r * 12 + 6); x.lineTo(ox + 9, r * 12 + 6); } x.stroke(); }
      if (k === 3) { x.beginPath(); for (let i = -48; i < 96; i += 16) { x.moveTo(i, 48); x.lineTo(i + 48, 0); x.moveTo(i, 0); x.lineTo(i + 48, 48); } x.stroke(); }
      if (k === 4) for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(R() * 48, R() * 48, 2 + R() * 3, 1.5 + R() * 2, R() * 3, 0, Math.PI * 2); x.stroke(); }
      pair.push(c);
    }
    HATCH.push(pair);
  }
  const R = rng(7);
  for (let i = 0; i < 340; i++) DUST.push([(R() - .5) * 30, 9 - R() * 42, (R() - .5) * 14, R(), R() * Math.PI * 2]);
  const host = document.createElementNS(svgNS, 'svg');
  host.setAttribute('style', 'position:absolute;left:-9999px;width:10px;height:10px');
  document.body.appendChild(host);
  for (const [k, ds] of Object.entries(ICONS)) {
    ICON_LEN[k] = ds.map(d => { const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', d); host.appendChild(p); const L = p.getTotalLength(); p.remove(); return L; });
  }
  host.remove();
}

/* ================= VẼ THẾ GIỚI ================= */
/** Độ đậm từng nhóm theo nhịp. */
function groups(b) {
  const out = 1 - prog(b, 80, 82.4);
  return {
    above: 1 - .55 * prog(b, 5.2, 6.4) * (1 - prog(b, 9, 10.5)),
    ground: 1,
    under: prog(b, 11.4, 12.4) * out,
    strata: prog(b, 17.5, 19.5) * (1 - .75 * win(b, 63.4, 79.4, 1.6)) * out,
  };
}
/** Tầng k đang được nói tới tới đâu, trong [0, 1]. */
const act = (k, b) => win(b, SYNC.areas[k] - .6, SYNC.areas[k] + 6.8, .9);

function drawLines(X, cam, b, G) {
  X.lineCap = 'round';
  for (const L of LINES) {
    let ga = G[L.g];
    if (ga <= 0) continue;
    const p = L.t0 < 0 ? 1 : E.outCubic(prog(b, L.t0, L.t1));
    if (p <= 0) continue;
    let a = L.a, c = L.b;
    if (p < 1) {
      if (L.mode === 'mid') {
        const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
        a = [lerp(m[0], a[0], p), lerp(m[1], a[1], p), lerp(m[2], a[2], p)];
        c = [lerp(m[0], c[0], p), lerp(m[1], c[1], p), lerp(m[2], c[2], p)];
      } else c = [lerp(a[0], c[0], p), lerp(a[1], c[1], p), lerp(a[2], c[2], p)];
    }
    const s = projectSeg(cam, a, c);
    if (!s) continue;
    let al = L.al * ga;
    /* ranh giới của tầng đang nói tới chuyển sang màu đồng */
    let col = L.col;
    if (L.g === 'strata' && L.col === RGB.fog) {
      for (let k = 0; k < NA; k++) {
        const e = act(k, b);
        if (e > 0 && (Math.abs(L.a[1] - layerTop(k)) < 1e-6 || Math.abs(L.a[1] - layerTop(k + 1)) < 1e-6) && L.a[1] === L.b[1]) {
          col = mixRGB(col, RGB.brass, e); al = lerp(al, Math.min(1, al * 2.6), e);
        }
      }
    }
    X.strokeStyle = rgba(col, clamp(al));
    X.lineWidth = L.w;
    X.beginPath(); X.moveTo(s[0][0], s[0][1]); X.lineTo(s[1][0], s[1][1]); X.stroke();
  }
}
const mixRGB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Bốn cọc: thân mọc xuống rất nhanh ở nhịp đóng, như bị búa đóng xuống. Đoạn cọc
 * nằm trong tầng đang nói tới sáng màu đồng. */
function drawPiles(X, cam, b, G) {
  if (G.under <= 0) return;
  X.lineCap = 'round';
  PILE_ORDER.forEach((ci, n) => {
    const pb = SYNC.piles[n];
    const q = E.outExpo(prog(b, pb, pb + .42));
    if (q <= 0) return;
    const x = COLS[ci];
    const bot = lerp(CAP_BOT, PILE_BOTTOM, q);
    const lineW = (a, c, col, al, w) => {
      const s = projectSeg(cam, a, c); if (!s) return;
      X.strokeStyle = rgba(col, clamp(al * G.under)); X.lineWidth = w;
      X.beginPath(); X.moveTo(s[0][0], s[0][1]); X.lineTo(s[1][0], s[1][1]); X.stroke();
    };
    for (const dx of [-PILE_HALF, PILE_HALF]) {
      lineW([x + dx, CAP_BOT, PILE_Z], [x + dx, bot, PILE_Z], RGB.fog, .62, 1.6);
      lineW([x + dx, CAP_BOT, -PILE_Z], [x + dx, bot, -PILE_Z], RGB.fog, .62 * BACK, 1.4);
    }
    lineW([x, CAP_BOT, PILE_Z], [x, bot, PILE_Z], RGB.fog, .24, 1.2);
    /* đoạn trong tầng đang nói tới */
    for (let k = 0; k < NA; k++) {
      const e = act(k, b); if (e <= 0) continue;
      const y0 = Math.min(layerTop(k), CAP_BOT), y1 = Math.max(layerTop(k + 1), bot);
      if (y1 >= y0) continue;
      for (const dx of [-PILE_HALF, PILE_HALF]) lineW([x + dx, y0, PILE_Z], [x + dx, y1, PILE_Z], RGB.brassSoft, .95 * e, 2.4);
      lineW([x - .34, layerTop(k), PILE_Z], [x + .34, layerTop(k), PILE_Z], RGB.brass, .9 * e, 2.4);
    }
    /* luật sư của cọc này đang được giới thiệu, hoặc giằng đang sáng ở cảnh cam kết */
    const tb = SYNC.team[n];
    const e = win(b, tb - .2, 71, .5);
    if (e > 0) for (const dx of [-PILE_HALF, PILE_HALF]) lineW([x + dx, CAP_BOT, PILE_Z], [x + dx, TIES[1] - 1.2, PILE_Z], RGB.brassSoft, .9 * e, 2.4);
    /* vòng sáng ở đài cọc lúc cọc vừa được đóng */
    const fl = prog(b, pb, pb + 1.1);
    if (fl > 0 && fl < 1) {
      const s = project(cam, [x, CAP_BOT, PILE_Z]); if (!s) return;
      const rr = FOCAL / s[2] * (.5 + 1.6 * E.outCubic(fl));
      X.strokeStyle = rgba(RGB.brassSoft, .7 * (1 - fl) * G.under); X.lineWidth = 2;
      X.beginPath(); X.ellipse(s[0], s[1], rr, rr * .28, 0, 0, Math.PI * 2); X.stroke();
    }
  });
  /* các giằng sáng lần lượt theo ba dòng cam kết */
  SYNC.pledges.forEach((pb, r) => {
    const e = win(b, pb, 79.2, .7);
    if (e <= 0) return;
    const y = r < 2 ? TIES[r] : GROUND_Y - .06;
    const s = projectSeg(cam, [COLS[0] - (r < 2 ? 0 : .46), y, PILE_Z + (r < 2 ? 0 : .2)], [COLS[3] + (r < 2 ? 0 : .46), y, PILE_Z + (r < 2 ? 0 : .2)]);
    if (!s) return;
    X.strokeStyle = rgba(RGB.brassSoft, .95 * e * G.under); X.lineWidth = 3;
    const p = E.outCubic(prog(b, pb, pb + .8));
    const mx = (s[0][0] + s[1][0]) / 2, my = (s[0][1] + s[1][1]) / 2;
    X.beginPath(); X.moveTo(lerp(mx, s[0][0], p), lerp(my, s[0][1], p)); X.lineTo(lerp(mx, s[1][0], p), lerp(my, s[1][1], p)); X.stroke();
  });
}

/** Ký hiệu tầng đất trên mặt cắt phía trước. */
function drawStrata(cam, b, G) {
  if (G.strata <= 0) return;
  for (let k = 0; k < NA; k++) {
    const e = act(k, b);
    const q = [[-REACH, layerTop(k), STRATA_Z], [REACH, layerTop(k), STRATA_Z], [REACH, layerTop(k + 1), STRATA_Z], [-REACH, layerTop(k + 1), STRATA_Z]].map(p => project(cam, p));
    if (q.some(p => !p)) continue;
    if (Math.max(...q.map(p => p[1])) < 0 || Math.min(...q.map(p => p[1])) > H) continue;
    const sc = FOCAL / q[0][2] / 70;
    ctx.save();
    ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
    for (const [img, al] of [[HATCH[k][0], .085 * (1 - e)], [HATCH[k][1], .2 * e]]) {
      if (al <= 0) continue;
      const pat = ctx.createPattern(img, 'repeat');
      pat.setTransform(new DOMMatrix([sc, 0, 0, sc, q[0][0], q[0][1]]));
      ctx.globalAlpha = al * G.strata; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
    }
    /* một lớp đồng rất mỏng phủ cả tầng đang nói tới */
    if (e > 0) {
      const g = ctx.createLinearGradient(0, q[0][1], 0, q[3][1]);
      g.addColorStop(0, rgba(RGB.brass, .1 * e)); g.addColorStop(.5, rgba(RGB.brass, .03 * e)); g.addColorStop(1, rgba(RGB.brass, .1 * e));
      ctx.globalAlpha = G.strata; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    /* số tầng và tên ngắn, đặt bên phải hàng cọc như ghi chú trên bản vẽ */
    const n = project(cam, [COLS[3] + 1.35, layerTop(k) - .4, PILE_Z]);
    if (!n) continue;
    const s = FOCAL / n[2];
    const al = G.strata * (.28 + .72 * e);
    ctx.save(); ctx.globalAlpha = al;
    ctx.font = `italic 600 ${s * 1.25}px Lora`; ctx.textBaseline = 'top';
    ctx.strokeStyle = e > .5 ? C.brass400 : C.fog400; ctx.lineWidth = 1.4;
    ctx.strokeText(String(k + 1).padStart(2, '0'), n[0], n[1]);
    ctx.restore();
    T(AREAS[k].short, n[0] + 2, n[1] + s * 1.62, { ...LABEL, s: Math.max(10, s * .2), ls: s * .06, c: e > .5 ? C.brass300 : C.fog500, al: al });
  }
}

/** Bụi vàng lơ lửng trong không gian 3D: thị sai của nó nói cho mắt biết máy đang đi. */
function drawDust(X, cam, t, amt) {
  for (const [x, y, z, s, ph] of DUST) {
    const p = project(cam, [x + Math.sin(t * .23 + ph) * .3, y + Math.sin(t * .17 + ph * 2) * .25 + t * .05 * (s - .5), z]);
    if (!p || p[0] < -10 || p[0] > W + 10 || p[1] < -10 || p[1] > H + 10) continue;
    const r = clamp(FOCAL / p[2] * .018 * (.5 + s), .6, 3.2);
    const tw = .55 + .45 * Math.sin(t * (1 + s * 2) + ph * 5);
    X.fillStyle = rgba(RGB.brassSoft, .5 * tw * amt * clamp(14 / p[2], .15, 1));
    X.beginPath(); X.arc(p[0], p[1], r, 0, Math.PI * 2); X.fill();
  }
}

/* ---------- thu về logo ---------- */
/* Logo trong src/components/Icons.tsx, hệ 24 đơn vị: khung vuông, mái dốc vàng, diềm,
 * bốn cột, bệ, ô vuông ngọc. Mỗi nét của logo ứng với một nét trên mặt đứng hiên cột;
 * lúc thu về, hai đầu nét trượt trong không gian màn hình từ chỗ chiếu của nét 3D tới
 * chỗ của nét logo, nên người xem thấy chính công trình gập lại thành dấu hiệu. */
const LOGO_S = 10, LOGO_CX = W / 2, LOGO_CY = 380;
const lg = (x, y) => [LOGO_CX + (x - 12) * LOGO_S, LOGO_CY + (y - 12) * LOGO_S];
const MORPH = [
  { a: [-SPAN, ARCH_TOP, EAVE_Z], b: [0, RIDGE, EAVE_Z], la: [5.5, 9], lb: [12, 4.6], col: RGB.brass, w: 1.5, al: 1 },
  { a: [0, RIDGE, EAVE_Z], b: [SPAN, ARCH_TOP, EAVE_Z], la: [12, 4.6], lb: [18.5, 9], col: RGB.brass, w: 1.5, al: 1 },
  { a: [-SPAN, CAP_TOP, DEPTH + .2], b: [SPAN, CAP_TOP, DEPTH + .2], la: [6, 11.2], lb: [18, 11.2], col: RGB.snow, w: 1, al: .5 },
  ...COLS.map((x, i) => ({ a: [x, SHAFT_TOP, DEPTH], b: [x, SHAFT_BOTTOM, DEPTH], la: [[7.4, 10.5, 13.5, 16.6][i], 11.2], lb: [[7.4, 10.5, 13.5, 16.6][i], 17.5], col: RGB.snow, w: 1.5, al: 1 })),
  { a: [-(SPAN + .36), STEP_TOP, DEPTH + .3], b: [SPAN + .36, STEP_TOP, DEPTH + .3], la: [5.5, 17.5], lb: [18.5, 17.5], col: RGB.snow, w: 1.4, al: 1 },
];
function drawMorph(X, cam, b) {
  const [m0, m1] = SYNC.logo;
  const show = prog(b, m0 - .6, m0);
  if (show <= 0) return;
  const p = E.inOutCubic(prog(b, m0, m1 - .3));
  X.lineCap = 'square';
  for (const M of MORPH) {
    const s = projectSeg(cam, M.a, M.b); if (!s) continue;
    const A = lg(...M.la), Bp = lg(...M.lb);
    const col = mixRGB(M.a[1] === RIDGE || M.b[1] === RIDGE ? RGB.brass : RGB.fog, M.col, p);
    X.strokeStyle = rgba(col, show * lerp(.9, M.al, p));
    X.lineWidth = lerp(2, M.w * LOGO_S, p);
    X.beginPath(); X.moveTo(lerp(s[0][0], A[0], p), lerp(s[0][1], A[1], p)); X.lineTo(lerp(s[1][0], Bp[0], p), lerp(s[1][1], Bp[1], p)); X.stroke();
  }
  /* khung vuông vẽ ra theo chu vi, bắt đầu từ góc trái trên */
  const fp = E.inOutCubic(prog(b, m1 - 1.1, m1));
  if (fp > 0) {
    const [x0, y0] = lg(2, 2), side = 20 * LOGO_S;
    X.strokeStyle = rgba(RGB.snow, 1); X.lineWidth = 1.4 * LOGO_S; X.lineCap = 'square';
    X.save(); X.setLineDash([side * 4 * fp, side * 4]); X.strokeRect(x0, y0, side, side); X.restore();
  }
  /* ô vuông ngọc bật ra đúng nhịp khóa */
  const jp = prog(b, m1, m1 + .5);
  if (jp > 0) {
    const s = E.outBack(jp), [jx, jy] = lg(16.8 + .85, 18.6 + .85), hs = .85 * LOGO_S * s;
    X.fillStyle = C.jade500; X.fillRect(jx - hs, jy - hs, hs * 2, hs * 2);
  }
}

/* ================= CẢNH (CHỮ) ================= */
function iconDraw(name, x, y, size, p, al = 1) {
  if (p <= 0 || al <= 0) return;
  const s = size / 24;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.globalAlpha *= al; ctx.strokeStyle = C.brass400; ctx.lineWidth = 1.6; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
  ICONS[name].forEach((d, i) => {
    const L = ICON_LEN[name][i], q = clamp(p * 1.35 - i * .05);
    if (q <= 0) return;
    ctx.setLineDash([L * q, L + 1]); ctx.stroke(new Path2D(d));
  });
  ctx.restore();
}
/** Nền tối mềm phía sau khối chữ, để chữ đọc được trên nét vẽ. */
function backdropLeft(al) {
  if (al <= 0) return;
  const g = ctx.createLinearGradient(0, 0, 1050, 0);
  g.addColorStop(0, `rgba(4,9,16,${.9 * al})`); g.addColorStop(.62, `rgba(4,9,16,${.66 * al})`); g.addColorStop(1, 'rgba(4,9,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1050, H);
}
function backdropCenter(cy, rx, ry, al) {
  if (al <= 0) return;
  ctx.save(); ctx.translate(W / 2, cy); ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(4,9,16,${.82 * al})`); g.addColorStop(.6, `rgba(4,9,16,${.55 * al})`); g.addColorStop(1, 'rgba(4,9,16,0)');
  ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
}

/* S1 — mặt đất: hiên cột được vẽ ra, rồi câu tiêu đề của trang chủ. */
function S1(b) {
  const out = 1 - prog(b, 9.2, 10.4);
  if (out <= 0) return;
  backdropCenter(520, 760, 230, prog(b, 5, 6.2) * out);
  ctx.save(); ctx.globalAlpha *= out; ctx.translate(0, -34 * prog(b, 9.2, 10.4));
  riseT('HÃNG LUẬT DOANH NGHIỆP · TP. HỒ CHÍ MINH', W / 2, 398, { ...LABEL, c: C.brass400, a: 'center' }, prog(b, 5.1, 5.9), 12);
  riseT('Nền pháp lý vững,', W / 2, 510, { f: 'Lora', w: 600, s: 96, c: C.snow, a: 'center' }, prog(b, 5.5, 6.4));
  riseT('cho mọi công trình.', W / 2, 626, { f: 'Lora', w: 600, s: 96, it: true, c: C.brass300, a: 'center' }, prog(b, 6.3, 7.2));
  ctx.restore();
}

/* S2 — phần chìm: câu thứ hai của trang chủ, bên trái hàng cọc. */
function S2(b) {
  const a = win(b, 18, 22.6, .8);
  if (a <= 0) return;
  backdropLeft(a);
  ctx.save(); ctx.globalAlpha *= 1 - prog(b, 22.6, 23.4); ctx.translate(0, -30 * prog(b, 22.6, 23.4));
  const x = 130;
  riseT('PHẦN CHÌM DƯỚI ĐẤT', x, 402, { ...LABEL, c: C.brass400 }, prog(b, 18, 18.8), 12);
  ctx.fillStyle = C.brass500; ctx.fillRect(x, 428, 56 * E.outCubic(prog(b, 18.2, 19)), 2);
  const st = { f: 'Lora', w: 600, s: 74, c: C.snow };
  riseT('Thứ giữ công trình', x, 530, st, prog(b, 18.4, 19.2));
  riseT('đứng vững nằm ở', x, 620, st, prog(b, 19, 19.8));
  riseT('phần không ai nhìn thấy.', x, 710, fit('phần không ai nhìn thấy.', { ...st, it: true, c: C.brass300 }, 760), prog(b, 19.6, 20.4));
  ctx.restore();
}

/* S3 — năm tầng đất, mỗi tầng một lĩnh vực. */
function S3(b) {
  const bd = win(b, SYNC.areas[0] - .8, SYNC.areas[NA - 1] + 7.4, .8);
  backdropLeft(bd);
  SYNC.areas.forEach((a0, k) => {
    const rb = b - a0;
    if (rb < -.2 || rb > 7.6) return;
    const A = AREAS[k];
    const out = 1 - prog(rb, 6.6, 7.3);
    ctx.save(); ctx.globalAlpha *= out; ctx.translate(0, -26 * prog(rb, 6.6, 7.3));
    const x = 130;
    riseT(`${String(k + 1).padStart(2, '0')} / 05   ·   LĨNH VỰC`, x, 214, { ...LABEL, c: C.brass400 }, prog(rb, 0, .6), 10);
    iconDraw(A.icon, x - 6, 246, 104, E.outCubic(prog(rb, .1, 1.3)));
    const st = { f: 'Lora', w: 600, s: 78, c: C.snow };
    riseT(A.title[0], x, 470, fit(A.title[0], st, 760), prog(rb, .35, 1.1));
    riseT(A.title[1], x, 556, fit(A.title[1], { ...st, it: true, c: C.brass300 }, 760), prog(rb, .7, 1.45));
    const tg = { f: 'BVP', w: 400, s: 28, c: C.fog300 };
    wrap(A.tagline, tg, 740).forEach((ln, i) => riseT(ln, x, 628 + i * 42, tg, prog(rb, 1.2 + i * .15, 1.9 + i * .15), 14));
    const ry = 628 + 42 * wrap(A.tagline, tg, 740).length + 34;
    ctx.fillStyle = `rgba(157,176,196,${.3 * prog(rb, 1.9, 2.4)})`; ctx.fillRect(x, ry, 740 * E.outCubic(prog(rb, 1.9, 2.6)), 1);
    riseT('VĂN BẢN NỀN TẢNG', x, ry + 40, { ...LABEL, s: 14, ls: 4, c: C.fog500 }, prog(rb, 2.1, 2.6), 8);
    const noSt = { f: 'BVP', w: 600, s: 24, ls: .5, c: C.brass300 };
    const col = Math.max(...A.laws.map(([no]) => measure(no, noSt))) + 30;
    A.laws.forEach(([no, name], i) => {
      const p = prog(rb, SYNC.laws[i], SYNC.laws[i] + .5), y = ry + 88 + i * 44;
      riseT(no, x, y, noSt, p, 12);
      riseT(name, x + col, y, { f: 'BVP', w: 400, s: 24, c: C.fog300 }, p, 12);
    });
    ctx.restore();
  });
}

/* S4 — đội ngũ trên bốn cọc, rồi ba mốc cam kết trên ba thanh giằng. */
function S4(b, cam) {
  const h1 = win(b, 65.4, 71.2, .8);
  if (h1 > 0) {
    backdropCenter(352, 720, 150, h1);
    ctx.save(); ctx.globalAlpha *= 1 - prog(b, 71.2, 71.9); ctx.translate(0, -22 * prog(b, 71.2, 71.9));
    riseT('ĐỘI NGŨ', W / 2, 300, { ...LABEL, c: C.brass400, a: 'center' }, prog(b, 65.4, 66.1), 10);
    riseT('Bốn luật sư. Một đầu mối.', W / 2, 392, { f: 'Lora', w: 600, s: 72, c: C.snow, a: 'center' }, prog(b, 65.7, 66.6));
    ctx.restore();
    const lb = ctx.createLinearGradient(0, 700, 0, 960);
    lb.addColorStop(0, 'rgba(4,9,16,0)'); lb.addColorStop(.3, `rgba(4,9,16,${.78 * h1})`); lb.addColorStop(1, `rgba(4,9,16,${.78 * h1})`);
    ctx.fillStyle = lb; ctx.fillRect(0, 700, W, 300);
    PILE_ORDER.forEach((ci, n) => {
      const L = TEAM[ci], tb = SYNC.team[n];
      const p = prog(b, tb, tb + .7), o = 1 - prog(b, 71.2, 71.9);
      if (p <= 0 || o <= 0) return;
      const s = project(cam, [COLS[ci], TIES[1] - 1.2, PILE_Z]);
      const x = s ? s[0] : W / 2;
      ctx.save(); ctx.globalAlpha *= o;
      ctx.fillStyle = C.brass500; ctx.fillRect(x - 1, 736, 2, 26 * E.outCubic(p));
      riseT(L.name, x, 812, { f: 'Lora', w: 600, s: 36, c: C.snow, a: 'center' }, p, 14);
      riseT(L.role.toUpperCase(), x, 848, { ...LABEL, s: 14, ls: 3.5, c: C.brass400, a: 'center' }, prog(b, tb + .15, tb + .8), 10);
      riseT(L.years, x, 890, { f: 'BVP', w: 500, s: 22, c: C.fog300, a: 'center' }, prog(b, tb + .3, tb + .95), 10);
      riseT(L.focus, x, 924, fit(L.focus, { f: 'BVP', w: 400, s: 17, c: C.fog500, a: 'center' }, 400), prog(b, tb + .4, tb + 1.05), 10);
      ctx.restore();
    });
  }
  const h2 = win(b, 71.8, 78.8, .8);
  if (h2 > 0) {
    backdropCenter(560, 900, 330, h2);
    ctx.save(); ctx.globalAlpha *= 1 - prog(b, 78.8, 79.5);
    riseT('QUY TRÌNH TIẾP NHẬN', W / 2, 384, { ...LABEL, c: C.brass400, a: 'center' }, prog(b, 71.8, 72.5), 10);
    riseT('Cam kết bằng quy trình.', W / 2, 468, { f: 'Lora', w: 600, s: 66, c: C.snow, a: 'center' }, prog(b, 72, 72.8));
    PLEDGES.forEach(([k, v], i) => {
      const pb = SYNC.pledges[i], p = prog(b, pb, pb + .6), y = 580 + i * 76;
      riseT(k, 900, y, { f: 'Lora', w: 600, s: 40, c: C.brass300, a: 'right' }, p, 14);
      ctx.fillStyle = `rgba(201,164,76,${.7 * p})`; ctx.fillRect(926, y - 13, 18 * E.outCubic(p), 2);
      riseT(v, 962, y, { f: 'BVP', w: 400, s: 30, c: C.snow }, prog(b, pb + .12, pb + .72), 14);
    });
    ctx.restore();
  }
}

/* S5 — dấu hiệu, tên hãng, liên hệ. */
function S5(b) {
  const m1 = SYNC.logo[1];
  const a = 1 - prog(b, TOTAL_BEATS - 1.6, TOTAL_BEATS - .4);
  if (b < m1 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  riseT('LHPT', W / 2, 640, { f: 'Lora', w: 600, s: 108, ls: 6, c: C.snow, a: 'center' }, prog(b, m1 + .3, m1 + 1.1), 22);
  riseT('LAW FIRM  ·  TP. HỒ CHÍ MINH', W / 2, 692, { ...LABEL, s: 18, ls: 8, c: C.fog400, a: 'center' }, prog(b, m1 + .7, m1 + 1.4), 12);
  ctx.fillStyle = C.brass500; const rw = 170 * E.outCubic(prog(b, m1 + 1, m1 + 1.8)); ctx.fillRect(W / 2 - rw / 2, 726, rw, 2);
  riseT('Nền pháp lý vững, cho mọi công trình.', W / 2, 796, { f: 'Lora', w: 500, s: 40, it: true, c: C.brass300, a: 'center' }, prog(b, m1 + 1.4, m1 + 2.2), 14);
  riseT('lhpt.law     ·     contact@lhpt.law     ·     (+84) 941563789', W / 2, 872, { f: 'BVP', w: 500, s: 25, ls: 1, c: C.fog300, a: 'center' }, prog(b, m1 + 2.2, m1 + 3), 12);
  riseT('Nguyễn Thị Minh Khai, phường Sài Gòn, TP. Hồ Chí Minh', W / 2, 912, { f: 'BVP', w: 400, s: 20, c: C.fog500, a: 'center' }, prog(b, m1 + 2.5, m1 + 3.3), 10);
  T('Nội dung giới thiệu dịch vụ, không phải ý kiến pháp lý cho vụ việc cụ thể. Số hiệu văn bản đối chiếu tháng 9/2026.', W / 2, 1012,
    { f: 'BVP', w: 400, s: 18, c: C.fog500, a: 'center', al: prog(b, m1 + 3, m1 + 4) * .85 });
  ctx.restore();
}

/* ================= LỚP PHỦ ================= */
const SECTIONS = [[0, 'MẶT ĐẤT'], [12, 'PHẦN CHÌM'], [24, 'LĨNH VỰC'], [64, 'ĐỘI NGŨ']];
function hud(b, cam) {
  const a = .75 * prog(b, .6, 1.8) * (1 - prog(b, 79.4, 80.6));
  if (a <= 0) return;
  let label = SECTIONS[0][1];
  for (const [s, l] of SECTIONS) if (b >= s) label = l;
  if (b >= 24 && b < 64) label += `  ·  ${String(Math.min(NA, Math.floor((b - 24) / 8) + 1)).padStart(2, '0')} / 05`;
  ctx.save(); ctx.globalAlpha = a;
  T('LHPT LAW FIRM', 100, 82, { ...LABEL, s: 15, c: C.fog400 });
  T(label, W - 100, 82, { ...LABEL, s: 15, c: C.fog400, a: 'right' });
  /* dấu canh bản vẽ ở bốn góc */
  ctx.strokeStyle = C.brass500; ctx.globalAlpha = a * .55; ctx.lineWidth = 1.4;
  for (const [x, y] of [[56, 56], [W - 56, 56], [56, H - 56], [W - 56, H - 56]]) {
    ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
  }
  /* thước cao độ bên trái: đi theo điểm nhìn của máy quay, mốc ±0.00 là vạch nền */
  const e = cam.y - GROUND_Y, PX = 34, x = 64, y0 = 240, y1 = 840, mid = H / 2;
  for (let v = Math.floor(e - 10); v <= Math.ceil(e + 10); v++) {
    const y = mid - (v - e) * PX;
    if (y < y0 || y > y1) continue;
    const f = 1 - Math.abs(y - mid) / ((y1 - y0) / 2);
    ctx.globalAlpha = a * f * (v % 5 === 0 ? .8 : .4);
    ctx.fillStyle = v === 0 ? C.brass400 : C.fog400;
    ctx.fillRect(x, y, v % 5 === 0 ? 16 : 8, 1.5);
    if (v % 5 === 0) T((v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(2), x + 22, y + 5, { f: 'BVP', w: 500, s: 12, c: C.fog500, al: 1 });
  }
  ctx.globalAlpha = a;
  ctx.fillStyle = C.brass400;
  ctx.beginPath(); ctx.moveTo(x - 10, mid - 6); ctx.lineTo(x - 2, mid); ctx.lineTo(x - 10, mid + 6); ctx.fill();
  ctx.restore();
}
function shakeAt(b) {
  let s = 0;
  for (const [ib, amp] of SYNC.impacts) { const d = b - ib; if (d >= 0 && d < 1) s = Math.max(s, amp * Math.exp(-d * 7)); }
  for (const pb of SYNC.piles) { const d = b - pb; if (d >= 0 && d < 1) s = Math.max(s, .38 * Math.exp(-d * 9)); }
  return s;
}
function post(b, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  /* lóe sáng lúc máy quay đi qua mặt đất và lúc logo khóa: một quầng tròn quanh
   * tâm chú ý, không phủ cả khung, để nền vẫn giữ màu mực */
  SYNC.impacts.forEach(([ib, amp], i) => {
    const d = b - ib;
    if (d < 0 || d > 1.2) return;
    const [x, y, r] = i === 0 ? [W / 2, H / 2, W * .7] : [LOGO_CX, LOGO_CY, 520];
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(RGB.brass, .2 * amp * Math.exp(-d * 4))); g.addColorStop(1, rgba(RGB.brass, 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  });
  ctx.drawImage(vigC, 0, 0);
  ctx.save(); ctx.globalAlpha = .04;
  const k = Math.floor(t * 30), ox = Math.floor(hash(k * 91) * 256), oy = Math.floor(hash(k * 37) * 256);
  ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(grainC, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
  const blk = Math.max(1 - prog(b, 0, .8), prog(b, TOTAL_BEATS - 1.2, TOTAL_BEATS - .2));
  if (blk > 0) { ctx.fillStyle = '#000'; ctx.globalAlpha = blk; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

/** Quầng sáng: bản mờ của lớp nét cộng dồn lên chính nó, rồi bản nét sắc. */
function glow(amt) {
  ctx.save(); ctx.filter = 'blur(9px)'; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = amt; ctx.drawImage(geoC, 0, 0); ctx.restore();
  ctx.drawImage(geoC, 0, 0);
}

function renderFrame(t) {
  const b = t / B;
  const cam = camAt(b, t);
  const G = groups(b);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(bgC, 0, 0);
  /* lưới bản vẽ phía sau, trôi chậm theo cao độ máy quay */
  ctx.save(); ctx.strokeStyle = 'rgba(157,176,196,.035)'; ctx.lineWidth = 1;
  const gy = ((cam.y * 22) % 96 + 96) % 96, gx = ((cam.x * 22) % 96 + 96) % 96;
  ctx.beginPath();
  for (let y = gy - 96; y < H + 96; y += 96) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  for (let x = -gx; x < W + 96; x += 96) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  ctx.stroke(); ctx.restore();

  const sh = shakeAt(b) * 8;
  ctx.save();
  ctx.translate((hash(t * 113) - .5) * 2 * sh, (hash(t * 57 + 1) - .5) * 2 * sh);
  drawStrata(cam, b, G);
  geoX.setTransform(1, 0, 0, 1, 0, 0);
  geoX.clearRect(0, 0, W, H);
  drawDust(geoX, cam, t, 1 - prog(b, 80, 83));
  drawLines(geoX, cam, b, { ...G, above: G.above * (1 - prog(b, SYNC.logo[0] - .4, SYNC.logo[0] + .6)), ground: G.ground * (1 - prog(b, SYNC.logo[0] - .4, SYNC.logo[0] + .8)) });
  drawPiles(geoX, cam, b, G);
  glow(.55);
  S1(b); S2(b); S3(b); S4(b, cam);
  /* Dấu hiệu dựng trên lớp riêng, quầng sáng nhẹ hơn hẳn phần nét: logo của một
   * hãng luật không nên phát sáng như biển hiệu. Từ lúc khóa, cả khối chốt tiến
   * lại rất chậm để khung hình cuối không đứng im. */
  const z = 1 + .03 * E.inOutSine(prog(b, SYNC.logo[1], TOTAL_BEATS));
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  geoX.clearRect(0, 0, W, H);
  drawMorph(geoX, cam, b);
  glow(.22);
  S5(b);
  ctx.restore();
  hud(b, cam);
  post(b, t);
}

async function init() {
  const faces = [
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Regular.ttf)', { weight: '400' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Medium.ttf)', { weight: '500' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-SemiBold.ttf)', { weight: '600' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-ExtraBold.ttf)', { weight: '800' }),
    new FontFace('Lora', 'url(fonts/Lora.ttf)', { weight: '400 700' }),
    new FontFace('Lora', 'url(fonts/Lora-Italic.ttf)', { weight: '400 700', style: 'italic' }),
  ];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  buildWorld();
  buildAssets();
}

window.DURATION = DURATION;
window.FPS = FPS;
window.renderFrame = renderFrame;
window.ready = init().then(() => {
  if (new URLSearchParams(location.search).has('preview')) {
    document.body.classList.add('preview');
    const t0 = performance.now();
    const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); };
    loop();
  }
  return true;
});
