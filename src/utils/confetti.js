// Confetti & Fireworks Canvas Engine
const COLORS = ["#ffd166", "#ff5fa2", "#6ee7c8", "#6aa8ff", "#c084fc", "#fff"];
let parts = [];
let raf = null;
let cv = null;
let cx = null;

function loop() {
  if (!cx || !cv) return;
  cx.clearRect(0, 0, cv.width, cv.height);
  const d = window.devicePixelRatio || 1;
  parts = parts.filter(p => p.life-- > 0 && p.y < window.innerHeight + 40);

  for (const p of parts) {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    cx.save();
    cx.translate(p.x * d, p.y * d);
    cx.rotate(p.rot);
    cx.globalAlpha = Math.min(1, p.life / 40);
    cx.fillStyle = p.c;
    cx.fillRect((-p.r * d) / 2, (-p.r * d) / 4, p.r * d, (p.r * d) / 2);
    cx.restore();
  }

  if (parts.length) {
    raf = requestAnimationFrame(loop);
  } else {
    cx.clearRect(0, 0, cv.width, cv.height);
    raf = null;
  }
}

export function initConfetti(canvasElement) {
  cv = canvasElement;
  if (!cv) return;
  cx = cv.getContext("2d");
  const fit = () => {
    if (!cv) return;
    cv.width = window.innerWidth * (window.devicePixelRatio || 1);
    cv.height = window.innerHeight * (window.devicePixelRatio || 1);
  };
  fit();
  window.addEventListener("resize", fit);
  return () => window.removeEventListener("resize", fit);
}

export function burst(x = window.innerWidth / 2, y = window.innerHeight / 2, n = 120, power = 9) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = Math.random() * power + 2;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 4,
      g: 0.22,
      r: Math.random() * 6 + 3,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
      life: 140 + Math.random() * 60
    });
  }
  if (!raf) loop();
}

export function rain(n = 140) {
  for (let i = 0; i < n; i++) {
    parts.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 300,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 2,
      g: 0.02,
      r: Math.random() * 6 + 3,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      rot: 0,
      vr: (Math.random() - 0.5) * 0.2,
      life: 300
    });
  }
  if (!raf) loop();
}

export function triggerFireworks() {
  for (let i = 0; i < 6; i++) {
    setTimeout(
      () =>
        burst(
          window.innerWidth * (0.15 + Math.random() * 0.7),
          window.innerHeight * (0.15 + Math.random() * 0.4),
          90,
          8
        ),
      i * 300
    );
  }
}
