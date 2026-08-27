# LHPT 3D & UX Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp các cảnh kiến trúc 3D (trừ bản đồ năng lực), sửa routing/scroll/runtime warnings và cập nhật nội dung DPPA đã xác minh trước khi tạo PR.

**Architecture:** Tách logic dễ kiểm thử (instant section navigation, metadata 404, nội dung tiếng Anh và easing) khỏi React/Three.js, kiểm thử bằng Node test runner có sẵn rồi tích hợp vào UI. Các cảnh 3D giữ kiến trúc `useThreeStage`, chỉ bổ sung mesh bán trong suốt theo từng layer và tái sử dụng lifecycle/disposal hiện hữu; capability map không được thay đổi.

**Tech Stack:** React 18, React Router 6, Framer Motion 11, TypeScript 5.7, Three.js 0.185, Vite 6, Node test runner, Playwright cho kiểm thử browser cục bộ.

**Spec:** `docs/superpowers/specs/2026-08-27-3d-ux-preview-design.md`

## Global Constraints

- Giữ nguyên toàn bộ mô hình “Bản đồ năng lực”, gồm `PracticeMapScene` và biến thể preview `practice`.
- Không thêm hậu kỳ nặng, texture ngoài, model GLTF hay dependency runtime mới.
- Không tự ý sửa số liệu marketing, giá, hồ sơ luật sư, hotline, email hoặc địa chỉ.
- Reduced motion phải render trạng thái hoàn chỉnh nhưng không chạy sequence/lightning tự thân.
- Chỉ push và tạo PR sau khi typecheck, test, production build và browser audit pass.

---

### Task 1: Test harness và điều hướng section tức thời

**Files:**
- Modify: `package.json`
- Create: `src/lib/instantScroll.ts`
- Modify: `src/App.tsx:58-84`
- Create: `tests/instantScroll.test.ts`

**Interfaces:**
- Produces: `runWithInstantScroll(root, schedule, action): void`.
- Consumes: `HTMLElement.style.scrollBehavior`, `requestAnimationFrame`, callback gọi `scrollTo` hoặc `scrollIntoView`.

- [ ] **Step 1: Thêm test script và viết test fail**

```json
"test": "node --experimental-strip-types --test tests/instantScroll.test.ts tests/notFoundMeta.test.ts tests/homeEnglish.test.ts tests/sceneMotion.test.ts"
```

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { runWithInstantScroll } from "../src/lib/instantScroll.ts";

test("forces auto scrolling for one frame and restores the inline value", () => {
  const root = { style: { scrollBehavior: "smooth" } };
  const queued: Array<() => void> = [];
  let behaviorDuringAction = "";

  runWithInstantScroll(root, (callback) => queued.push(callback), () => {
    behaviorDuringAction = root.style.scrollBehavior;
  });

  assert.equal(behaviorDuringAction, "auto");
  assert.equal(root.style.scrollBehavior, "auto");
  queued[0]();
  assert.equal(root.style.scrollBehavior, "smooth");
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- --test-name-pattern="forces auto"`

Expected: FAIL vì `src/lib/instantScroll.ts` chưa tồn tại.

- [ ] **Step 3: Viết implementation tối thiểu**

```ts
type ScrollRoot = { style: { scrollBehavior: string } };
type Schedule = (callback: () => void) => unknown;

export function runWithInstantScroll(
  root: ScrollRoot,
  schedule: Schedule,
  action: () => void
) {
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  action();
  schedule(() => {
    root.style.scrollBehavior = previous;
  });
}
```

Trong `ScrollManager`, bọc cả `window.scrollTo` và `target.scrollIntoView` bằng helper, dùng `document.documentElement` và `requestAnimationFrame`.

- [ ] **Step 4: Chạy test và typecheck**

Run: `npm test -- --test-name-pattern="forces auto" && npm run typecheck`

Expected: PASS, không có TypeScript error.

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/instantScroll.ts src/App.tsx tests/instantScroll.test.ts
git commit -m "fix: make cross-route section jumps instant"
```

### Task 2: Trang 404 và metadata noindex

**Files:**
- Create: `src/content/notFound.ts`
- Create: `src/pages/NotFoundPage.tsx`
- Modify: `src/lib/pageMeta.ts`
- Modify: `src/App.tsx:145-168`
- Create: `tests/notFoundMeta.test.ts`

**Interfaces:**
- Produces: `NOT_FOUND_META: { title; description; path; robots }`.
- Extends: `usePageMeta({ title, description, path, robots? })`.

- [ ] **Step 1: Viết test fail cho metadata**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { NOT_FOUND_META } from "../src/content/notFound.ts";

test("404 metadata is unique and excluded from indexing", () => {
  assert.match(NOT_FOUND_META.title, /Không tìm thấy/);
  assert.equal(NOT_FOUND_META.robots, "noindex,follow");
  assert.equal(NOT_FOUND_META.path, "/404");
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- --test-name-pattern="404 metadata"`

Expected: FAIL vì module `src/content/notFound.ts` chưa tồn tại.

- [ ] **Step 3: Tạo nội dung và page 404**

```ts
export const NOT_FOUND_META = {
  title: "Không tìm thấy nội dung | LHPT Law Firm",
  description: "Địa chỉ bạn truy cập không tồn tại. Trở về LHPT Law Firm hoặc xem các lĩnh vực hành nghề.",
  path: "/404",
  robots: "noindex,follow",
} as const;
```

`NotFoundPage` gọi `usePageMeta(NOT_FOUND_META)`, hiển thị mã `404`, giải thích ngắn và hai `Link`: `/` và `/#dich-vu`. Wildcard route render page này thay cho homepage.

Trong `usePageMeta`, khi có `robots` thì cập nhật `meta[name="robots"]` và khôi phục giá trị cũ khi unmount.

- [ ] **Step 4: Bật React Router future flags và chạy test/typecheck**

```tsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

Run: `npm test -- --test-name-pattern="404 metadata" && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/notFound.ts src/pages/NotFoundPage.tsx src/lib/pageMeta.ts src/App.tsx tests/notFoundMeta.test.ts
git commit -m "fix: replace soft homepage fallback with 404 page"
```

### Task 3: Nội dung DPPA tiếng Anh đã xác minh

**Files:**
- Create: `src/content/homeEnglish.ts`
- Modify: `src/components/Home1.tsx:35-57`
- Create: `tests/homeEnglish.test.ts`

**Interfaces:**
- Produces: `WORDS_EN: readonly string[]`, `TICKER_EN: readonly string[]`.
- Consumes: `Home1.tsx` chọn ticker theo locale hiện hữu.

- [ ] **Step 1: Viết test fail cho văn bản DPPA**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { TICKER_EN } from "../src/content/homeEnglish.ts";

test("English DPPA ticker uses the current decrees", () => {
  const text = TICKER_EN.join(" | ");
  assert.doesNotMatch(text, /DECREE 80\/2024/);
  assert.match(text, /DECREE 57\/2025/);
  assert.match(text, /DECREE 243\/2026/);
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- --test-name-pattern="English DPPA"`

Expected: FAIL vì module chưa tồn tại.

- [ ] **Step 3: Di chuyển hằng tiếng Anh và cập nhật DPPA**

Tạo module mới chứa nguyên `WORDS_EN`, giữ nguyên các ticker đã xác minh và thay mục cũ bằng:

```ts
"DECREES 57/2025 & 243/2026 · DIRECT POWER PURCHASE (DPPA)",
```

`Home1.tsx` import hai hằng từ module này; không sửa `TICKER` tiếng Việt hoặc số liệu marketing.

- [ ] **Step 4: Chạy test/typecheck**

Run: `npm test -- --test-name-pattern="English DPPA" && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/homeEnglish.ts src/components/Home1.tsx tests/homeEnglish.test.ts
git commit -m "fix: update English DPPA ticker"
```

### Task 4: Motion helper và cảnh báo opening stage

**Files:**
- Create: `src/lib/sceneMotion.ts`
- Create: `tests/sceneMotion.test.ts`
- Modify: `src/components/Home1.tsx:119-137`
- Modify: `src/components/OpeningBackdrop.tsx`
- Modify: `src/components/three/FoundationScene.tsx`
- Modify: `src/components/three/OpeningScene.tsx`

**Interfaces:**
- Produces: `clamp01(value): number`, `smoothstep(edge0, edge1, value): number`.
- Changes: `OpeningBackdrop` receives `opacity: MotionValue<number>` from `OpeningStage`; it no longer owns `useScroll` for an ancestor ref.

- [ ] **Step 1: Viết test fail cho easing biên**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { clamp01, smoothstep } from "../src/lib/sceneMotion.ts";

test("scene easing clamps progress and keeps stable endpoints", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(smoothstep(0.2, 0.8, 0.2), 0);
  assert.equal(smoothstep(0.2, 0.8, 0.8), 1);
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- --test-name-pattern="scene easing"`

Expected: FAIL vì module chưa tồn tại.

- [ ] **Step 3: Tạo helper và chuyển ownership của scroll measurement**

```ts
export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}
```

Trong `OpeningStage`, gọi `useScroll({ target: stageRef, offset: ["start start", "end end"] })` cạnh chính ref, tạo opacity bằng `useTransform`, rồi truyền cả `stageRef` và `opacity` xuống `OpeningBackdrop`. Component backdrop bỏ `useScroll`/`useTransform`; giữ logic dim/unmount hiện hữu.

Foundation/Opening scene import helper thay cho bản sao cục bộ. Không đổi `ExplorePreviewScene` để tránh thay đổi chung lên biến thể `practice`.

- [ ] **Step 4: Chạy test/typecheck**

Run: `npm test -- --test-name-pattern="scene easing" && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sceneMotion.ts tests/sceneMotion.test.ts src/components/Home1.tsx src/components/OpeningBackdrop.tsx src/components/three/FoundationScene.tsx src/components/three/OpeningScene.tsx
git commit -m "fix: stabilize opening scroll measurement"
```

### Task 5: Nâng cấp `FoundationScene` thành premium blueprint

**Files:**
- Modify: `src/components/three/FoundationScene.tsx`

**Interfaces:**
- Extends internal `Part` with `peak: number` so line and mesh share progress but keep distinct maximum opacity.
- Produces internal `addFillBox(size, position, color, peak, start, rise): Part`.

- [ ] **Step 1: Viết test fail cho progress/opacity của layer**

Bổ sung vào `tests/sceneMotion.test.ts`:

```ts
import { layerOpacity } from "../src/lib/sceneMotion.ts";

test("layer opacity respects both timing and material peak", () => {
  assert.equal(layerOpacity(0, 0.2, 0.5, 0.08), 0);
  assert.equal(layerOpacity(0.4, 0.2, 0.5, 0.08), 0.04);
  assert.equal(layerOpacity(0.8, 0.2, 0.5, 0.08), 0.08);
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npm test -- --test-name-pattern="layer opacity"`

Expected: FAIL vì `layerOpacity` chưa được export.

- [ ] **Step 3: Implement helper và fill meshes**

```ts
export function layerOpacity(progress: number, start: number, end: number, peak: number) {
  return smoothstep(start, end, progress) * peak;
}
```

Trong `FoundationScene`:

- đổi `Part.object` thành `THREE.Object3D`, thêm `peak` và tính `material.opacity = layerOpacity(...)`;
- line parts dùng `peak = 1`;
- `addFillBox` dựng `BoxGeometry` + `MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })` trong holder group;
- thêm fill cho đài móng/pile caps (peak 0.07), bốn cột góc (0.055), từng sàn (0.045), mái/lõi kỹ thuật (0.065) và mast core (0.08);
- fill dùng đúng `start` và `rise` của line tương ứng để không lệch layer;
- thêm scan band dạng box mỏng ở nền, opacity chỉ tăng trong phần đầu stage 1;
- giảm lightning flare nền, giữ pulse dẫn xuống nhưng tắt hoàn toàn ở reduced motion;
- tăng fill desktop nhẹ qua camera reframe, không đổi cấu trúc story trên mobile.

- [ ] **Step 4: Chạy test/typecheck/build**

Run: `npm test && npm run typecheck && npm run build`

Expected: tất cả PASS; chunk Three.js gzip không tăng quá 5% so với baseline 129.30 kB.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sceneMotion.ts tests/sceneMotion.test.ts src/components/three/FoundationScene.tsx
git commit -m "feat: add volumetric blueprint layers to foundation scene"
```

### Task 6: Tăng chiều sâu opening scene

**Files:**
- Modify: `src/components/three/OpeningScene.tsx`

**Interfaces:**
- Adds internal fill groups/materials tied to existing `aboveLayer` and `belowLayer` reveal values.
- Does not change the public `OpeningScene({ stageRef })` interface.

- [ ] **Step 1: Thêm assertion regression cho easing reveal**

Bổ sung vào `tests/sceneMotion.test.ts`:

```ts
test("opening reveal stays hidden before its threshold", () => {
  assert.equal(smoothstep(0.16, 0.62, 0.1), 0);
  assert.ok(smoothstep(0.16, 0.62, 0.4) > 0);
});
```

- [ ] **Step 2: Chạy test để xác nhận assertion pass với helper chung**

Run: `npm test -- --test-name-pattern="opening reveal"`

Expected: PASS; đây là characterization test khóa timing trước khi sửa geometry.

- [ ] **Step 3: Thêm fill geometry nhẹ**

- tạo helper nội bộ cho translucent box fills;
- thêm fill cho diềm mái, chân/đầu cột, ba bậc thềm, đài cọc và raft;
- nhóm fill phía trên nhân opacity theo `1 - descent * 0.76`;
- nhóm fill phía dưới nhân opacity theo `reveal`;
- thêm wash xanh xám rất mờ phía sau móng, `depthWrite: false` và không che chữ;
- giới hạn pointer parallax bằng `matchMedia("(pointer: coarse)")` hoặc channel tương đương; reduced motion giữ sway bằng 0 như hiện tại.

- [ ] **Step 4: Chạy full test/typecheck/build**

Run: `npm test && npm run typecheck && npm run build`

Expected: PASS và không có resource leak khi route qua lại.

- [ ] **Step 5: Commit**

```bash
git add tests/sceneMotion.test.ts src/components/three/OpeningScene.tsx
git commit -m "feat: add restrained depth to opening architecture"
```

### Task 7: Đồng bộ preview `foundation`, giữ nguyên `practice`

**Files:**
- Modify: `src/components/three/ExplorePreviewScene.tsx` only inside `createFoundationPreview`

**Interfaces:**
- Extends local `Piece` usage with mesh pieces for foundation preview.
- Must leave `createPracticePreview`, `PRACTICE_NODES`, `PRACTICE_LINKS` behavior byte-for-byte/functionally unchanged.

- [ ] **Step 1: Ghi hash phạm vi được bảo vệ**

Run:

```powershell
git show HEAD:src/components/three/ExplorePreviewScene.tsx | Select-String -Pattern "function createPracticePreview" -Context 0,1000
git hash-object src/components/three/PracticeMapScene.tsx
```

Expected: lưu hash để đối chiếu sau Task 7; diff không được chạm `PracticeMapScene.tsx`.

- [ ] **Step 2: Thêm fill geometry cho preview foundation**

Trong phần trước marker `cảnh 2: chòm sao các lĩnh vực`:

- thêm box fill cho đài móng, bốn cột góc, hai slab và mái/lõi;
- mỗi mesh là một `Piece` có `at`/`rise` trùng line group liên quan;
- peak opacity 0.04–0.08, `depthWrite: false`;
- hover chỉ nhân opacity tối đa 1.35 như logic cũ; không tăng tốc rotation;
- reduced motion xuất hiện ở trạng thái hoàn chỉnh ngay frame đầu.

- [ ] **Step 3: Xác nhận vùng practice không đổi**

Run:

```powershell
git diff -- src/components/three/PracticeMapScene.tsx
git diff --unified=0 -- src/components/three/ExplorePreviewScene.tsx
```

Expected: lệnh đầu không có output; lệnh hai chỉ có thay đổi trước `function createPracticePreview`.

- [ ] **Step 4: Chạy full test/typecheck/build**

Run: `npm test && npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/three/ExplorePreviewScene.tsx
git commit -m "feat: align foundation preview with blueprint style"
```

### Task 8: Browser audit, ảnh preview và PR

**Files:**
- Create outside repo: screenshots under Codex visualization directory
- Modify only if audit finds a reproducible regression: files owned by Tasks 1–7

**Interfaces:**
- Consumes production-equivalent Vite preview at `http://127.0.0.1:3000`.
- Produces GitHub branch `codex/3d-ux-preview` and PR targeting `main`.

- [ ] **Step 1: Chạy server loopback an toàn**

Run: `node_modules/.bin/vite --host 127.0.0.1 --port 3000`

Expected: server chỉ listen `127.0.0.1:3000`.

- [ ] **Step 2: Chạy Playwright audit**

Kiểm tra route `/`, `/nen-mong-phap-ly`, `/ban-do-nang-luc`, `/khong-ton-tai` ở 1440×900 và 390×844; thu console warning/page error, overflow, title/robots, canvas count, dialog account, reduced motion và luồng `/#lien-he`.

Expected:

- không page error;
- không còn warning target/container Framer hoặc future flags Router;
- 404 có title riêng, `noindex,follow` và link thoát;
- cross-route anchor không có hành trình smooth dài;
- capability map vẫn render;
- không horizontal overflow.

- [ ] **Step 3: Chụp các mốc 3D**

Chụp homepage opening desktop/mobile, Foundation stage 1–5 desktop và ít nhất stage 1/5 mobile. So sánh với baseline trong visualization directory.

Expected: stage 1–3 đọc rõ thể tích hơn; chữ/CTA vẫn là ưu tiên; không clipping.

- [ ] **Step 4: Verification cuối**

Run:

```bash
npm test
npm run typecheck
npm run build
git diff --check main...HEAD
git diff main...HEAD -- src/components/three/PracticeMapScene.tsx
git status --short
```

Expected: tất cả pass; capability map diff trống; worktree sạch.

- [ ] **Step 5: Push và tạo PR**

```bash
git push -u origin codex/3d-ux-preview
gh pr create --base main --head codex/3d-ux-preview --title "Nâng cấp trải nghiệm 3D và sửa lỗi UX" --body-file <generated-pr-body>
```

PR body phải nêu summary, phạm vi 3D bị loại trừ, test evidence, legal verification date và ảnh preview.
