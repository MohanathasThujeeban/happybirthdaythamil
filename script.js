(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const W = Object.assign({}, window.WISH);
  const qs = new URLSearchParams(location.search);
  if (qs.get("name")) W.name = qs.get("name");
  if (qs.get("from")) W.from = qs.get("from");
  if (qs.get("age")) W.age = parseInt(qs.get("age"), 10) || null;
  document.title = `Happy Birthday ${W.name || 'Friend'}! 🎉`;

  /* ---------- background stars ---------- */
  const stars = $("#stars");
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    stars.appendChild(s);
  }

  /* ---------- confetti engine ---------- */
  const cv = $("#confetti"), cx = cv.getContext("2d");
  let parts = [], raf = null;
  const fit = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
  fit(); addEventListener("resize", fit);
  const COLORS = ["#ffd166", "#ff5fa2", "#6ee7c8", "#6aa8ff", "#c084fc", "#fff"];
  function burst(x = innerWidth / 2, y = innerHeight / 2, n = 120, power = 9) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * power + 2;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4, g: .22, r: Math.random() * 6 + 3,
        c: COLORS[(Math.random() * COLORS.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 140 + Math.random() * 60 });
    }
    if (!raf) loop();
  }
  function rain(n = 140) {
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 300, vx: (Math.random() - .5) * 2, vy: Math.random() * 3 + 2, g: .02,
        r: Math.random() * 6 + 3, c: COLORS[(Math.random() * COLORS.length) | 0], rot: 0, vr: (Math.random() - .5) * .2, life: 300 });
    }
    if (!raf) loop();
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    const d = devicePixelRatio;
    parts = parts.filter(p => p.life-- > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      cx.save(); cx.translate(p.x * d, p.y * d); cx.rotate(p.rot);
      cx.globalAlpha = Math.min(1, p.life / 40);
      cx.fillStyle = p.c; cx.fillRect(-p.r * d / 2, -p.r * d / 4, p.r * d, p.r * d / 2); cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(loop) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  }
  function fireworks() {
    for (let i = 0; i < 6; i++) setTimeout(() => burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.15 + Math.random() * .4), 90, 8), i * 300);
  }

  /* ---------- music (synthesised, no files needed) ---------- */
  let actx, playing = false, stopFlag = false;
  const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784 };
  const TUNE = [["G4",.75],["G4",.25],["A4",1],["G4",1],["C5",1],["B4",2],
                ["G4",.75],["G4",.25],["A4",1],["G4",1],["D5",1],["C5",2],
                ["G4",.75],["G4",.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",1],
                ["F5",.75],["F5",.25],["E5",1],["C5",1],["D5",1],["C5",2]];
  function tone(f, t, dur) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .05);
  }
  function playTune() {
    if (playing) { stopFlag = true; return; }
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    actx.resume();
    playing = true; stopFlag = false; $("#music").classList.add("playing");
    let t = actx.currentTime + .05; const beat = .42;
    TUNE.forEach(([n, b]) => { tone(N[n], t, b * beat * .95); t += b * beat; });
    setTimeout(() => { playing = false; $("#music").classList.remove("playing"); }, (t - actx.currentTime) * 1000);
  }
  $("#music").addEventListener("click", playTune);

  /* ---------- stage manager ---------- */
  const stages = $$(".stage");
  const dots = $("#dots");
  stages.forEach(() => dots.appendChild(document.createElement("b")));
  let cur = -1;
  const hooks = {};
  function go(i) {
    cur = i;
    stages.forEach((s, k) => s.classList.toggle("active", k === i));
    $$("b", dots).forEach((d, k) => { d.className = k === i ? "on" : k < i ? "done" : ""; });
    hooks[stages[i].id] && hooks[stages[i].id]();
  }
  $$(".next").forEach(b => b.addEventListener("click", () => go(Math.min(cur + 1, stages.length - 1))));

  /* ---------- 1. gift ---------- */
  $("#introText").textContent = W.intro;
  const gift = $("#gift");
  gift.addEventListener("click", () => {
    if (gift.dataset.done) return; gift.dataset.done = 1;
    gift.classList.add("shake");
    setTimeout(() => { gift.classList.remove("shake"); gift.classList.add("open"); burst(innerWidth / 2, innerHeight / 2, 160, 11); }, 550);
    setTimeout(() => go(1), 1900);
  });

  /* ---------- 2. hero ---------- */
  hooks["s-hero"] = () => {
    $("#heroName").textContent = W.name;
    const avatarWrap = $("#avatarWrap");
    const avatarImg = $("#heroAvatar");
    if (W.avatar) {
      avatarImg.src = W.avatar;
      avatarImg.onerror = () => {
        // Fallback default avatar icon if user hasn't put the image yet
        avatarImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%233a1457'/><text x='50%' y='58%' font-size='45' text-anchor='middle' dominant-baseline='middle'>👑</text></svg>";
      };
      avatarWrap.classList.remove("hidden");
    } else {
      avatarWrap.classList.add("hidden");
    }
    const el = $("#heroTyped"), txt = "Happy Birthday!"; el.textContent = "";
    let i = 0; const iv = setInterval(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(iv); }, 90);
    const ageWrap = $("#ageWrap");
    if (!W.age) { ageWrap.classList.add("hidden"); return; }
    let a = 0; const target = W.age; const t = setInterval(() => { $("#age").textContent = ++a; if (a >= target) clearInterval(t); }, Math.max(30, 1200 / target));
    setTimeout(() => rain(100), 300);
  };

  /* ---------- 3. cake ---------- */
  const CANDLES = 5; let out = 0;
  const cWrap = $("#candles");
  for (let i = 0; i < CANDLES; i++) {
    const c = document.createElement("div"); c.className = "candle"; c.innerHTML = '<div class="flame"></div>';
    c.addEventListener("click", () => blow(c)); cWrap.appendChild(c);
  }
  const updateHint = () => $("#cakeHint").textContent = `${out} / ${CANDLES} candles out`;
  updateHint();
  function blow(c) {
    if (c.classList.contains("out")) return;
    c.classList.add("out"); out++; updateHint();
    if (navigator.vibrate) navigator.vibrate(30);
    if (out === CANDLES) {
      $("#cakeHint").textContent = "Wish made! 🌟";
      burst(innerWidth / 2, innerHeight * .4, 200, 12); rain(120); if (!playing) playTune();
      $("#s-cake .next").classList.remove("hidden");
    }
  }
  $("#blowMic").addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)(), src = ac.createMediaStreamSource(stream), an = ac.createAnalyser();
      an.fftSize = 512; src.connect(an); const buf = new Uint8Array(an.fftSize);
      $("#blowMic").textContent = "🎤 Listening… blow!";
      const check = () => {
        if (out >= CANDLES) { stream.getTracks().forEach(t => t.stop()); ac.close(); return; }
        an.getByteTimeDomainData(buf);
        let peak = 0; for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        if (peak > 60) { const alive = $$(".candle:not(.out)"); if (alive.length) blow(alive[0]); }
        setTimeout(check, 220);
      };
      check();
    } catch (e) { $("#blowMic").textContent = "Mic unavailable — tap the flames 🔥"; }
  });

  /* ---------- 4. balloons ---------- */
  const sky = $("#sky"), toast = $("#toast");
  let popped = 0, toastT;
  const BC = ["#ff5fa2", "#ffd166", "#6ee7c8", "#6aa8ff", "#c084fc", "#ff8a5c"];
  const total = W.wishes.length;
  $("#popCount").textContent = `0 / ${total} popped`;
  W.wishes.forEach((w, i) => {
    const b = document.createElement("div"); b.className = "balloon";
    b.style.background = BC[i % BC.length]; b.style.color = BC[i % BC.length];
    b.style.left = (6 + (i * (88 / Math.max(total, 1)))) + "%";
    b.style.setProperty("--d", (2 + Math.random() * 2) + "s"); b.style.animationDelay = (-Math.random() * 2) + "s";
    b.addEventListener("click", () => {
      if (b.classList.contains("pop")) return;
      const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40, 6);
      b.classList.add("pop"); setTimeout(() => b.remove(), 200);
      toast.textContent = w; toast.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("show"), 4500);
      popped++; $("#popCount").textContent = `${popped} / ${total} popped`;
      if (popped === total) { $("#s-balloons .next").classList.remove("hidden"); rain(80); }
    });
    sky.appendChild(b);
  });

  /* ---------- 5. polaroid memory wall & lightbox ---------- */
  const cards = $("#cards");
  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbTitle = $("#lightboxTitle");
  const lbText = $("#lightboxText");
  const lbTag = $("#lightboxTag");
  const lbCounter = $("#lbCounter");
  let activeMemoryIndex = 0;

  function openLightbox(idx) {
    if (!W.memories || !W.memories.length) return;
    activeMemoryIndex = (idx + W.memories.length) % W.memories.length;
    const m = W.memories[activeMemoryIndex];
    lbTitle.textContent = m.title || "Memory";
    lbText.textContent = m.text || "";
    lbTag.textContent = m.date || `Memory #${activeMemoryIndex + 1}`;
    lbCounter.textContent = `${activeMemoryIndex + 1} / ${W.memories.length}`;

    if (m.img) {
      lbImg.src = m.img;
      lbImg.style.display = "block";
      lbImg.onerror = () => {
        lbImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'><rect width='300' height='200' fill='%232a1457'/><text x='50%' y='50%' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle'>📸✨</text></svg>";
      };
    } else {
      lbImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'><rect width='300' height='200' fill='%233a1457'/><text x='50%' y='50%' font-size='45' fill='white' text-anchor='middle' dominant-baseline='middle'>💖</text></svg>";
    }

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    burst(innerWidth / 2, innerHeight / 2, 35, 6);
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#lightboxBackdrop").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(activeMemoryIndex - 1); });
  $("#lbNext").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(activeMemoryIndex + 1); });
  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(activeMemoryIndex - 1);
    if (e.key === "ArrowRight") openLightbox(activeMemoryIndex + 1);
  });

  const rotations = [-4, 3.5, -2.5, 4, -3, 2];
  const emojis = ["💖", "✨", "🌟", "🎉", "📸", "🌈"];

  W.memories.forEach((m, i) => {
    const p = document.createElement("div");
    p.className = "polaroid";
    p.style.setProperty("--rot", `${rotations[i % rotations.length]}deg`);

    const imageHtml = m.img
      ? `<img src="${m.img}" alt="${m.title || ''}" onerror="this.parentElement.innerHTML='<div class=\\'polaroid-placeholder\\'><span>${emojis[i % emojis.length]}</span></div>'">`
      : `<div class="polaroid-placeholder"><span>${emojis[i % emojis.length]}</span></div>`;

    p.innerHTML = `
      <div class="polaroid-img-box">${imageHtml}</div>
      <div class="polaroid-caption">
        <div class="polaroid-title">${m.title || 'Special Memory'}</div>
        <div class="polaroid-date">${m.date || 'Tap to view'}</div>
      </div>
    `;

    p.addEventListener("click", () => openLightbox(i));
    cards.appendChild(p);
  });

  /* ---------- 6. letter ---------- */
  hooks["s-letter"] = () => {
    $("#letterTo").textContent = `Dear ${W.name},`;
    $("#letterFrom").textContent = `— ${W.from}`;
    const el = $("#letterText"); el.textContent = ""; let i = 0;
    const iv = setInterval(() => { el.textContent = W.letter.slice(0, i += 2); if (i >= W.letter.length) clearInterval(iv); }, 28);
  };

  /* ---------- 7. scratch card ---------- */
  hooks["s-scratch"] = () => {
    $("#prize").textContent = W.surprise;
    const c = $("#scratchCanvas"), box = c.parentElement.getBoundingClientRect(), ctx = c.getContext("2d");
    c.width = box.width; c.height = box.height;
    const g = ctx.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, "#9aa0b4"); g.addColorStop(.5, "#d7dbea"); g.addColorStop(1, "#8b91a8");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgba(40,30,60,.55)"; ctx.font = "600 18px Poppins,sans-serif"; ctx.textAlign = "center"; ctx.fillText("✨ SCRATCH HERE ✨", c.width / 2, c.height / 2 + 6);
    let down = false, done = false;
    const scratch = e => {
      if (!down || done) return; const r = c.getBoundingClientRect();
      ctx.globalCompositeOperation = "destination-out"; ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, 7); ctx.fill();
    };
    const measure = () => {
      const d = ctx.getImageData(0, 0, c.width, c.height).data; let clear = 0;
      for (let i = 3; i < d.length; i += 64) if (d[i] === 0) clear++;
      if (clear / (d.length / 64) > .45 && !done) { done = true; c.style.transition = "opacity .6s"; c.style.opacity = 0; burst(innerWidth / 2, innerHeight / 2, 180, 11); $("#s-scratch .next").classList.remove("hidden"); }
    };
    c.onpointerdown = e => { down = true; c.setPointerCapture(e.pointerId); scratch(e); };
    c.onpointermove = scratch;
    c.onpointerup = () => { down = false; measure(); };
  };

  /* ---------- 8. finale ---------- */
  hooks["s-finale"] = () => {
    $("#finaleTitle").textContent = `Happy Birthday, ${W.name || 'Friend'}!`;
    $("#finaleSub").textContent = `With love, ${W.from} 💛`;
    fireworks(); rain(160);
  };
  $("#fireworks").addEventListener("click", fireworks);
  $("#replay").addEventListener("click", () => location.reload());

  go(0);
})();
