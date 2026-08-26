/**
 * Mẫu hero background 3D bằng three.js — mạng lưới điểm-đường chuyển động chậm,
 * dùng đúng bảng màu thương hiệu LHPT (ink/brass/fog trong src/index.css).
 *
 * Cách dùng:
 *   1. Copy file này vào src/components/, đổi tên (vd: HeroScene.tsx).
 *   2. Đặt <HeroScene /> làm lớp nền tuyệt đối phía sau nội dung hero, vd trong
 *      Home1.tsx:
 *        <div className="relative">
 *          <HeroScene />
 *          <div className="relative z-10"> ...nội dung hero hiện tại... </div>
 *        </div>
 *   3. Tuỳ biến POINT_COUNT, màu sắc, tốc độ rotation theo ý muốn — nhưng giữ
 *      nguyên phần init/cleanup/reduced-motion/visibility, đó là phần dễ làm sai.
 *
 * npm install three
 * npm install -D @types/three
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Bảng màu thương hiệu (khớp src/index.css) — three.js cần số hex dạng 0x...
const COLOR_INK = 0x050b13;
const COLOR_BRASS = 0xc9a44c;
const COLOR_FOG = 0x9db0c4;

const POINT_COUNT = 260;
const CONNECT_DISTANCE = 1.6; // nối đường giữa 2 điểm nếu gần nhau hơn khoảng này
const ROTATION_SPEED = 0.015; // rad/giây — chậm, gần như không nhận ra

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // --- Khởi tạo scene ---------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // nền trong suốt, để lộ màu nền CSS phía sau
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COLOR_INK, 0); // alpha 0: chỉ trong suốt, không tô nền
    container.appendChild(renderer.domElement);

    // --- Sinh mạng lưới điểm-đường -----------------------------------------
    const positions = new Float32Array(POINT_COUNT * 3);
    for (let i = 0; i < POINT_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const pointsMaterial = new THREE.PointsMaterial({
      color: COLOR_BRASS,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);

    // Nối đường giữa các điểm gần nhau — tạo cảm giác "mạng lưới tri thức"
    const linePositions: number[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const ax = positions[i * 3 + 0];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = i + 1; j < POINT_COUNT; j++) {
        const bx = positions[j * 3 + 0];
        const by = positions[j * 3 + 1];
        const bz = positions[j * 3 + 2];
        const dist = Math.hypot(ax - bx, ay - by, az - bz);
        if (dist < CONNECT_DISTANCE) {
          linePositions.push(ax, ay, az, bx, by, bz);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(linePositions), 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: COLOR_FOG,
      transparent: true,
      opacity: 0.18,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const group = new THREE.Group();
    group.add(points, lines);
    scene.add(group);

    // --- Trạng thái "có nên chạy animation không" ----------------------------
    // Khai báo trước, vì cả resize lẫn hai observer bên dưới đều cần đọc/ghi.
    let isVisible = true;
    let isDocumentHidden = document.visibilityState === "hidden";

    // --- Render loop: chỉ thực sự lặp khi cần, dừng hẳn requestAnimationFrame
    // (không chỉ bỏ qua lệnh render) khi tab ẩn, container ngoài viewport, hoặc
    // reduced-motion — nếu không, vòng lặp vẫn "chạy không tải" tốn CPU/pin.
    let rafId = 0;
    let isLoopRunning = false;
    let lastTime = performance.now();

    const renderFrame = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      group.rotation.y += ROTATION_SPEED * delta;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (isLoopRunning) return;
      isLoopRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(renderFrame);
    };

    const stopLoop = () => {
      if (!isLoopRunning) return;
      isLoopRunning = false;
      cancelAnimationFrame(rafId);
    };

    // Đồng bộ trạng thái loop theo isVisible/isDocumentHidden/prefersReducedMotion.
    // Gọi lại mỗi khi một trong ba yếu tố đó thay đổi, hoặc sau resize.
    const syncLoopState = () => {
      const shouldAnimate = isVisible && !isDocumentHidden && !prefersReducedMotion;
      if (shouldAnimate) {
        startLoop();
        return;
      }
      stopLoop();
      // Vẫn vẽ đúng một khung hình khi đang hiển thị (vd reduced-motion, hoặc
      // vừa resize trong lúc loop đang dừng) — không lặp lại, chỉ vẽ 1 lần.
      if (isVisible && !isDocumentHidden) renderer.render(scene, camera);
    };

    // --- Resize theo container, không theo window ---------------------------
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      // Nếu loop đang dừng (reduced-motion/ẩn), vẽ lại 1 khung ở kích thước mới;
      // nếu loop đang chạy, khung kế tiếp của renderFrame tự lấy kích thước mới.
      if (!isLoopRunning) syncLoopState();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- Dừng render khi ẩn/ngoài viewport, tiết kiệm CPU/GPU ----------------
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        syncLoopState();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isDocumentHidden = document.visibilityState === "hidden";
      syncLoopState();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    syncLoopState();

    // --- Cleanup: bắt buộc, tránh leak GPU context khi unmount/HMR ----------
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
