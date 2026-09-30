"""Tổng hợp nhạc nền, khóa nhịp với scene.js (96 BPM, 96 nhịp, Đô thứ).

Mọi mốc sự kiện đọc từ khối SYNC trong scene.js, nên hình và tiếng dùng chung
một nguồn. Không dùng mẫu âm thanh nào: mọi âm đều tổng hợp từ sóng sin và nhiễu,
nên không có vấn đề bản quyền. Đầu ra: out/audio.wav (48 kHz, stereo, 16-bit).
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

DIR = Path(__file__).parent
SR = 48000
BPM = 96
B = 60 / BPM
TOTAL_BEATS = 96
DUR = TOTAL_BEATS * B + 1.0
N = int(DUR * SR)
rng = np.random.default_rng(17)

src = (DIR / "scene.js").read_text()
block = src.split("/*SYNC*/")[1].split("/*END*/")[0]
SYNC = json.loads(block.split("=", 1)[1].strip().rstrip(";"))
AREAS = SYNC["areas"]
S3_END = AREAS[-1] + 8
LOGO0, LOCK = SYNC["logo"]

dry = np.zeros((N, 2))
send = np.zeros((N, 2))  # bus hồi âm


def sec(beat):
    return beat * B


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(buf, sig, t, gain=1.0, pan=0.0):
    """Cộng một tín hiệu mono hoặc stereo vào thời điểm t (giây), pan công suất đều."""
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], axis=1) * np.sqrt(2)
    j0 = max(0, -i)
    i0 = max(i, 0)
    n = min(len(sig) - j0, N - i0)
    buf[i0:i0 + n] += sig[j0:j0 + n] * gain


def both(sig, t, g_dry, g_wet, pan=0.0):
    place(dry, sig, t, g_dry, pan)
    place(send, sig, t, g_wet, pan)


def filt(x, kind, f, order=2):
    wn = [v / (SR / 2) for v in f] if isinstance(f, (list, tuple)) else f / (SR / 2)
    return sosfilt(butter(order, wn, btype=kind, output="sos"), x, axis=0)


def noise(d):
    return rng.standard_normal(int(d * SR))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- nhạc cụ ----------------
def pluck(f, d=1.6, bright=1.0):
    """Âm gần tiếng piano: bồi âm càng cao tắt càng nhanh."""
    t = tt(d)
    s = np.zeros_like(t)
    for k, a in enumerate((1.0, 0.45, 0.22, 0.12, 0.06), start=1):
        s += a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 1.6 / bright))
    return s * np.minimum(1, t / 0.004) * 0.5


def bell(f, d=3.5):
    t = tt(d)
    s = np.zeros_like(t)
    for ratio, a, dec in ((1, 1, 1.1), (2.0, 0.5, 1.8), (2.76, 0.35, 2.4), (5.4, 0.18, 4), (8.93, 0.08, 6)):
        s += a * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * dec)
    return s * np.minimum(1, t / 0.002) * 0.35


def kick(amp=1.0):
    t = tt(0.5)
    f = 45 + 75 * np.exp(-t * 26)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.0)
    click = filt(noise(0.5), "highpass", 2500) * np.exp(-t * 320) * 0.15
    return np.tanh((body + click) * 1.4) * amp


def rim():
    t = tt(0.12)
    n = filt(noise(0.12), "bandpass", [1500, 5000]) * np.exp(-t * 55)
    return n * 0.5 + np.sin(2 * np.pi * 400 * t) * np.exp(-t * 60) * 0.4


def hat(open_=False):
    d = 0.16 if open_ else 0.045
    t = tt(d)
    return filt(noise(d), "highpass", 8000) * np.exp(-t * (16 if open_ else 95))


def boom(amp):
    t = tt(2.6)
    f = 28 + 60 * np.exp(-t * 7)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.0)
    body = filt(noise(2.6), "bandpass", [120, 700]) * np.exp(-t * 14) * 0.7
    air = filt(noise(2.6), "lowpass", 4000) * np.exp(-t * 3.5) * 0.2
    return (np.tanh(s * 1.6) + body + air) * amp


def pile_hit():
    """Búa đóng cọc: cú nện trầm, tiếng kim loại ngân ngắn, và bụi đất."""
    t = tt(1.4)
    f = 48 + 70 * np.exp(-t * 30)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    ring = np.zeros_like(t)
    for ratio, a, dec in ((1, 1, 5), (2.41, 0.6, 7), (3.93, 0.4, 9), (5.8, 0.25, 12)):
        ring += a * np.sin(2 * np.pi * 186 * ratio * t) * np.exp(-t * dec)
    crack = filt(noise(1.4), "bandpass", [600, 3500]) * np.exp(-t * 60)
    dirt = filt(noise(1.4), "lowpass", 900) * np.exp(-t * 9) * 0.35
    return np.tanh(thump * 1.5) * 0.9 + ring * 0.12 + crack * 0.45 + dirt


def scratch(d):
    """Nét bút trên giấy can: nhiễu dải hẹp, rung nhẹ theo nét tay."""
    t = tt(d)
    n = filt(noise(d), "bandpass", [2500, 7000])
    wob = 0.6 + 0.4 * np.sin(2 * np.pi * 9 * t + rng.random() * 6)
    env = np.minimum(1, t / 0.03) * np.minimum(1, (t[-1] - t) / 0.08 + 1e-3)
    return n * wob * env * 0.25


def sweep_noise(d, f0, f1, reverse=False, q=0.35):
    """Nhiễu lọc dải có tần số trung tâm quét từ f0 tới f1."""
    n = noise(d)
    out = np.zeros_like(n)
    hop = 1024
    for i in range(0, len(n), hop):
        fc = f0 * (f1 / f0) ** (i / len(n))
        lo, hi = max(40, fc * (1 - q)), min(SR / 2 - 100, fc * (1 + q))
        out[i:i + hop] = filt(n[max(0, i - 2048):i + hop], "bandpass", [lo, hi])[-len(n[i:i + hop]):]
    out *= np.linspace(0, 1, len(n)) ** 2
    return out[::-1] if reverse else out


def saw(f, t, detune=0.0):
    ph = f * (1 + detune) * t
    return 2 * (ph - np.floor(ph + 0.5))


# ---------------- hòa âm ----------------
MIN, MAJ = [0, 3, 7], [0, 4, 7]
# Phần chìm: Lab, Fa thứ, Sol. Năm tầng: vòng Đô thứ, Lab, Mib, Sib mỗi bốn nhịp.
# Đội ngũ: Lab, Mib, Fa thứ, Sol. Lùi xa: Lab. Khóa logo: Đô trưởng.
CYCLE = [(48, MIN), (44, MAJ), (51, MAJ), (46, MAJ)]
TEAM = [(44, MAJ), (51, MAJ), (41, MIN), (43, MAJ)]


def chord_at(beat):
    if beat < 12:
        return (48, MIN)
    if beat < 24:
        return [(44, MAJ), (41, MIN), (43, MAJ)][min(2, int((beat - 12) // 4))]
    if beat < S3_END:
        return CYCLE[int((beat - 24) // 4) % 4]
    if beat < 80:
        return TEAM[int((beat - S3_END) // 4) % 4]
    if beat < LOCK:
        return (44, MAJ)
    return (48, MAJ)


pad = np.zeros(N)


def pad_chord(b0, beats, root, iv, amp, extra=()):
    t = tt(sec(beats) + 0.6)
    s = np.zeros_like(t)
    for k in list(iv) + list(extra):
        f = mtof(root + k)
        for dt in (-0.005, 0, 0.006):
            s += saw(f, t, dt)
    env = np.minimum(1, t / 0.5) * np.minimum(1, (t[-1] - t) / 0.6 + 0.001)
    i = int(sec(b0) * SR)
    n = min(len(s), N - i)
    pad[i:i + n] += (s * env * amp)[:n]


tk = np.arange(N) / SR

# ---------------- mặt đất (0-12) ----------------
t = tt(sec(12))
drone = np.sin(2 * np.pi * mtof(24) * t) * 0.6 + np.sin(2 * np.pi * mtof(36) * t) * 0.3
drone *= np.minimum(1, t / 2.5) * np.minimum(1, (t[-1] - t) / 1.0)
place(dry, drone * 0.2, 0)
pad_chord(0, 12, 48, MIN, 0.5)
# vạch nền được kẻ ra: một tiếng lướt mảnh
both(sweep_noise(sec(1.9), 1200, 6000, q=0.25), sec(0.3), 0.07, 0.06)
# nét bút khi bậc thềm, diềm, mái được vẽ
for b, d in ((1.0, 0.9), (1.5, 0.6), (3.3, 0.6), (3.8, 1.0), (4.4, 1.1)):
    place(dry, scratch(sec(d)), sec(b), 0.5, pan=rng.uniform(-0.4, 0.4))
# bốn thân cột mọc lên, mỗi cột một nốt
for b, m, p in zip(SYNC["cols"], (67, 72, 75, 79), (-0.45, -0.15, 0.15, 0.45)):
    both(pluck(mtof(m), 2.2), sec(b), 0.2, 0.2, pan=p)
# mái khép lại, rồi tiêu đề hiện: chuông
both(bell(mtof(79), 3.5), sec(5.4), 0.2, 0.3, pan=0.1)
for m, g, p in ((72, 0.3, -0.2), (75, 0.22, 0.2), (79, 0.16, 0)):
    both(bell(mtof(m), 4.5), sec(6.3), g, 0.35, pan=p)

# ---------------- đi xuống lòng đất (10-12) ----------------
both(sweep_noise(sec(2.4), 5000, 180), sec(9.8), 0.14, 0.12)
t = tt(sec(2.2))
place(dry, np.sin(2 * np.pi * np.cumsum(mtof(36) * 2 ** (-t / sec(2.2))) / SR) * (t / sec(2.2)) ** 2 * 0.12, sec(9.8))

# ---------------- phần chìm (12-24) ----------------
pad_chord(12, 4, 44, MAJ, 0.55)
pad_chord(16, 4, 41, MIN, 0.65)
pad_chord(20, 4, 43, MAJ, 0.75, extra=[10])
P = pile_hit()
for k, b in enumerate(SYNC["piles"]):
    both(P, sec(b), 0.62, 0.22, pan=[-0.45, 0.45, -0.15, 0.15][k])
K = kick()
for b in np.arange(17, 24, 1.0):
    place(dry, K, sec(b), 0.26 + 0.1 * (b - 17) / 7)
H1, H2 = hat(), hat(True)
for b in np.arange(20.5, 24, 1.0):
    place(dry, H1, sec(b), 0.07, pan=0.3)
both(sweep_noise(sec(2), 250, 7000), sec(22), 0.14, 0.1)

# ---------------- năm tầng (24-64) ----------------
kick_beats = list(np.arange(24, S3_END, 1.0)) + list(np.arange(S3_END, 80, 2.0))
for b in kick_beats:
    place(dry, K, sec(b), 0.52 if b < S3_END else 0.38)
RIM = rim()
for b in np.arange(25, S3_END, 2.0):
    place(dry, RIM, sec(b), 0.14, pan=0.1)
    place(send, RIM, sec(b), 0.07)
for b in np.arange(24, 80, 0.5):
    if b % 1 == 0.5:
        place(dry, H2 if int(b) % 4 == 3 else H1, sec(b), 0.09, pan=0.3)
for b in np.arange(32, S3_END - 2, 0.25):
    if b % 0.5:
        place(dry, H1, sec(b), 0.04, pan=-0.3)

duck = np.ones(N)
for b in kick_beats:
    i0 = int(sec(b) * SR)
    i1 = min(N, i0 + int(0.35 * SR))
    d = tk[i0:i1] - sec(b)
    duck[i0:i1] = np.minimum(duck[i0:i1], 1 - 0.45 * np.exp(-d / 0.1))

bass = np.zeros(N)
for b in np.arange(24, 80, 0.5):
    root, _ = chord_at(b)
    f = mtof(root - 24)
    t = tt(B * 0.5)
    env = np.exp(-t * 5) * np.minimum(1, t / 0.005)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)) * env
    i = int(sec(b) * SR)
    bass[i:i + len(s)] += s[: N - i]
bass = filt(bass, "lowpass", 600) * duck
place(dry, np.tanh(bass * 1.3) * 0.3, 0)

for b0 in range(24, 80, 4):
    root, iv = chord_at(b0)
    pad_chord(b0, 4, root, iv, 0.8)

# mỗi tầng mở bằng một tiếng chuông, và mỗi dòng văn bản nền tảng một nốt gảy
for k, a in enumerate(AREAS):
    root, iv = chord_at(a)
    both(bell(mtof(root + 24 + iv[k % 3]), 3.0), sec(a), 0.22, 0.25, pan=np.interp(k, [0, 4], [-0.5, 0.5]))
    for j, off in enumerate(SYNC["laws"]):
        r2, iv2 = chord_at(a + off)
        both(pluck(mtof(r2 + 24 + iv2[j]), 0.9, bright=1.1), sec(a + off), 0.1, 0.08, pan=0.35)
    # đi xuống tầng kế tiếp
    both(sweep_noise(sec(1.2), 3000, 300, q=0.4), sec(a + 6.8), 0.12, 0.08)

# rải hợp âm nửa nhịp từ tầng thứ hai
for k, b in enumerate(np.arange(AREAS[1], S3_END, 0.5)):
    root, iv = chord_at(b)
    pat = [0, 1, 2, 1, 2, 0, 2, 1]
    m = root + 12 + iv[pat[k % 8]] + (12 if k % 8 in (2, 4) else 0)
    both(pluck(mtof(m), 0.7, bright=0.8), sec(b), 0.065, 0.05, pan=-0.35 if k % 2 else 0.35)

# ---------------- đội ngũ và cam kết (64-80) ----------------
for k, b in enumerate(SYNC["team"]):
    both(pluck(mtof([67, 70, 74, 79][k]), 2.2, bright=1.2), sec(b), 0.2, 0.2, pan=[-0.5, -0.17, 0.17, 0.5][k])
for k, b in enumerate(SYNC["pledges"]):
    root, iv = chord_at(b)
    both(bell(mtof(root + 24 + iv[k]), 3.2), sec(b), 0.2, 0.28, pan=(k - 1) * 0.3)

# ---------------- lùi xa, thu về logo (80-96) ----------------
pad_chord(80, LOCK - 80, 44, MAJ, 0.9, extra=[14])
both(sweep_noise(sec(LOCK - 79.5), 200, 9000), sec(79.5), 0.18, 0.14)
for k, b in enumerate(np.arange(LOGO0, LOCK, 0.25)):
    m = 68 + [0, 4, 7, 12][k % 4] + 12 * (k // 8)
    both(pluck(mtof(m), 0.6, bright=1.3), sec(b), 0.03 + 0.03 * k / 10, 0.05, pan=np.sin(k * 0.9) * 0.5)

pad_chord(LOCK, TOTAL_BEATS - LOCK, 48, MAJ, 1.1, extra=[14, 19])
for b, amp in SYNC["impacts"]:
    both(boom(amp), sec(b), 0.55, 0.3 * amp)
for m, g, p in ((72, 0.45, -0.25), (76, 0.32, 0.25), (79, 0.26, 0.0), (84, 0.16, 0.1)):
    both(bell(mtof(m), 6), sec(LOCK), g, 0.4, pan=p)
for k, b in enumerate(np.arange(LOCK + 2, LOCK + 10, 0.5)):
    m = 72 + [0, 4, 7, 11, 14, 11, 7, 4][k % 8]
    both(pluck(mtof(m), 0.9, bright=1.2), sec(b), 0.045 * (1 - (b - LOCK - 2) / 8), 0.05, pan=np.sin(k * 0.7) * 0.5)
t = tt(sec(TOTAL_BEATS - LOCK))
low = np.sin(2 * np.pi * mtof(24) * t) * np.minimum(1, t / 0.4) * np.exp(-t * 0.12)
place(dry, low * 0.16, sec(LOCK))

pad = filt(pad, "lowpass", 1400) * 0.05
pad *= np.where((tk > sec(24)) & (tk < sec(80)), duck, 1.0)
place(dry, np.stack([pad, np.roll(pad, 360)], axis=1), 0)
place(send, np.stack([pad, pad], axis=1), 0, 0.5)

# ---------------- hồi âm và master ----------------
ir_t = tt(3.4)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))], axis=1) * np.exp(-ir_t * 1.8)[:, None]
ir = filt(ir, "lowpass", 5500)
ir /= np.sqrt((ir ** 2).sum(axis=0))
wet = np.stack([fftconvolve(send[:, c], ir[:, c])[:N] for c in range(2)], axis=1)
wet = filt(wet, "highpass", 220)

mix = dry + wet * 0.6
mix = filt(mix, "highpass", 26)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
fade0, fade1 = int(sec(TOTAL_BEATS - 3.5) * SR), int(sec(TOTAL_BEATS - 0.2) * SR)
mix[fade0:fade1] *= np.linspace(1, 0, fade1 - fade0)[:, None] ** 1.5
mix[fade1:] = 0
mix[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
mix *= 10 ** (-1 / 20) / (np.max(np.abs(mix)) + 1e-9)

out = DIR / "out" / "audio.wav"
out.parent.mkdir(exist_ok=True)
pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{DUR:.2f}s", "events:", {k: len(v) for k, v in SYNC.items()})
