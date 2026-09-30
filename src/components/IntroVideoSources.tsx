import { INTRO_VIDEO } from "../content/introVideo";

/*
 * Nguồn của video giới thiệu, dùng chung cho trang chủ và trang /video.
 *
 * MP4 (H.264/AAC) đứng trước: mọi trình duyệt phổ biến giải mã được, kể cả
 * Safari trên iPhone đời cũ — loại có thể báo "phát được" WebM nhưng giải mã VP9
 * hỏng và để lại một khung đen. WebM (VP9/Opus) đứng sau cho các bản Chromium
 * dựng không kèm H.264.
 */
export function IntroVideoSources() {
  return (
    <>
      <source src={INTRO_VIDEO.mp4} type="video/mp4" />
      <source src={INTRO_VIDEO.webm} type="video/webm" />
    </>
  );
}
