import React, { useState, useEffect, useRef } from "react";
import { WISH_CONFIG } from "./config";
import { initConfetti, burst, rain, triggerFireworks } from "./utils/confetti";
import { playBirthdayTune } from "./utils/audio";

export default function App() {
  const [wish] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      ...WISH_CONFIG,
      name: params.get("name") || WISH_CONFIG.name,
      from: params.get("from") || WISH_CONFIG.from,
      age: params.get("age") ? parseInt(params.get("age"), 10) : WISH_CONFIG.age
    };
  });

  const [stage, setStage] = useState(0);
  const [visitedStages, setVisitedStages] = useState([0, 1]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const confettiCanvasRef = useRef(null);

  const shouldRenderStage = (s) => visitedStages.includes(s) || Math.abs(stage - s) <= 1;

  // Stage 0: Gift
  const [giftShaking, setGiftShaking] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  // Stage 1: Core Memories & Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeMediaList, setActiveMediaList] = useState(wish.memories);

  // Stage 2: Hero
  const [typedText, setTypedText] = useState("");
  const [displayedAge, setDisplayedAge] = useState(0);

  // Stage 3: Cake & Candles
  const CANDLE_COUNT = 5;
  const [extinguishedCandles, setExtinguishedCandles] = useState([]);
  const [activeCakePhoto, setActiveCakePhoto] = useState(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micStatusText, setMicStatusText] = useState("🎤 Blow into the mic");

  // Stage 4: Balloons
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [balloonToast, setBalloonToast] = useState({ text: "", img: "" });
  const [showToast, setShowToast] = useState(false);

  // Stage 5: Love Letter
  const [letterTyped, setLetterTyped] = useState("");

  // Stage 6: Scratch Card
  const scratchCanvasRef = useRef(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  // Init confetti
  useEffect(() => {
    if (confettiCanvasRef.current) {
      initConfetti(confettiCanvasRef.current);
    }
    document.title = `Happy Birthday ${wish.name || "Friend"}! 🎉`;
  }, [wish.name]);

  // Stage Transitions
  const goToStage = (idx) => {
    setStage(idx);
    setVisitedStages((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    if (idx === 1) {
      // Memory wall
      burst(window.innerWidth / 2, window.innerHeight * 0.35, 80, 8);
      rain(60);
    } else if (idx === 2) {
      // Hero typing
      setTypedText("");
      setDisplayedAge(0);
      let i = 0;
      const targetTxt = "Happy Birthday!";
      const timer = setInterval(() => {
        setTypedText(targetTxt.slice(0, ++i));
        if (i >= targetTxt.length) clearInterval(timer);
      }, 90);

      if (wish.age) {
        let curAge = 0;
        const ageTimer = setInterval(() => {
          curAge++;
          setDisplayedAge(curAge);
          if (curAge >= wish.age) clearInterval(ageTimer);
        }, Math.max(30, 1200 / wish.age));
      }
      setTimeout(() => rain(100), 300);
    } else if (idx === 5) {
      // Letter typing
      setLetterTyped("");
      let cur = 0;
      const timer = setInterval(() => {
        cur += 2;
        setLetterTyped(wish.letter.slice(0, cur));
        if (cur >= wish.letter.length) clearInterval(timer);
      }, 26);
    } else if (idx === 7) {
      // Finale
      triggerFireworks();
      rain(180);
    }
  };

  // Gift Open Action
  const handleGiftClick = () => {
    if (giftOpen) return;
    setGiftShaking(true);
    setTimeout(() => {
      setGiftShaking(false);
      setGiftOpen(true);
      burst(window.innerWidth / 2, window.innerHeight / 2, 160, 11);
    }, 550);
    setTimeout(() => goToStage(1), 1600);
  };

  // Candle Extinguish -> Reveals celebration photo!
  const blowCandle = (idx) => {
    if (extinguishedCandles.includes(idx)) return;
    const next = [...extinguishedCandles, idx];
    setExtinguishedCandles(next);
    if (navigator.vibrate) navigator.vibrate(30);

    // Show candle milestone photo
    if (wish.cakePhotos && wish.cakePhotos[idx]) {
      setActiveCakePhoto(wish.cakePhotos[idx]);
    }

    if (next.length === CANDLE_COUNT) {
      burst(window.innerWidth / 2, window.innerHeight * 0.4, 200, 12);
      rain(120);
      if (!isPlayingMusic) playBirthdayTune(setIsPlayingMusic);
    }
  };

  // Microphone Listener
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaStreamSource(stream);
      const an = ac.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      setIsListeningMic(true);
      setMicStatusText("🎤 Listening… blow!");

      const check = () => {
        if (extinguishedCandles.length >= CANDLE_COUNT) {
          stream.getTracks().forEach((t) => t.stop());
          ac.close();
          return;
        }
        an.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        if (peak > 60) {
          for (let i = 0; i < CANDLE_COUNT; i++) {
            if (!extinguishedCandles.includes(i)) {
              blowCandle(i);
              break;
            }
          }
        }
        setTimeout(check, 220);
      };
      check();
    } catch {
      setMicStatusText("Mic unavailable — tap the flames 🔥");
    }
  };

  // Balloon Pop -> Reveals Large Cutout / GIF & Wish Modal
  const [activeBalloonWish, setActiveBalloonWish] = useState(null);

  const popBalloon = (idx, e, wishObj) => {
    if (poppedBalloons.includes(idx)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60, 8);

    const next = [...poppedBalloons, idx];
    setPoppedBalloons(next);
    setActiveBalloonWish(wishObj);

    if (next.length === wish.wishes.length) {
      rain(120);
    }
  };

  // Scratch Canvas Init
  useEffect(() => {
    if (stage === 6 && scratchCanvasRef.current) {
      const c = scratchCanvasRef.current;
      const box = c.parentElement.getBoundingClientRect();
      const ctx = c.getContext("2d");
      c.width = box.width;
      c.height = box.height;

      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, "#9aa0b4");
      g.addColorStop(0.5, "#d7dbea");
      g.addColorStop(1, "#8b91a8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = "rgba(40,30,60,.55)";
      ctx.font = "600 18px Poppins,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ SCRATCH HERE ✨", c.width / 2, c.height / 2 + 6);

      let isDown = false;
      let completed = false;

      const scratch = (e) => {
        if (!isDown || completed) return;
        const r = c.getBoundingClientRect();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(e.clientX - r.left, e.clientY - r.top, 24, 0, Math.PI * 2);
        ctx.fill();
      };

      const measure = () => {
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let clear = 0;
        for (let i = 3; i < d.length; i += 64) {
          if (d[i] === 0) clear++;
        }
        if (clear / (d.length / 64) > 0.45 && !completed) {
          completed = true;
          setScratchRevealed(true);
          c.style.transition = "opacity .6s";
          c.style.opacity = "0";
          burst(window.innerWidth / 2, window.innerHeight / 2, 180, 11);
        }
      };

      c.onpointerdown = (e) => {
        isDown = true;
        c.setPointerCapture(e.pointerId);
        scratch(e);
      };
      c.onpointermove = scratch;
      c.onpointerup = () => {
        isDown = false;
        measure();
      };
    }
  }, [stage]);

  // Open Lightbox with specified media list
  const openMediaModal = (list, index) => {
    setActiveMediaList(list);
    setLightboxIndex(index);
    burst(window.innerWidth / 2, window.innerHeight / 2, 35, 6);
  };

  // Lightbox keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + activeMediaList.length) % activeMediaList.length);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % activeMediaList.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, activeMediaList.length]);

  const balloonColors = ["#ff5fa2", "#ffd166", "#6ee7c8", "#6aa8ff", "#c084fc", "#ff8a5c"];
  const memoryRotations = [-4, 3.5, -2.5, 4, -3, 2];

  return (
    <>
      <canvas id="confetti" ref={confettiCanvasRef}></canvas>
      <div className="bg-stars">
        {[...Array(24)].map((_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i % 5) * 0.6}s`
            }}
          />
        ))}
      </div>

      <header className="topbar">
        <div className="dots">
          {[...Array(8)].map((_, k) => (
            <b
              key={k}
              className={k === stage ? "on" : k < stage ? "done" : ""}
              onClick={() => goToStage(k)}
              title={`Go to step ${k + 1}`}
            />
          ))}
        </div>
        <button
          className={`icon-btn ${isPlayingMusic ? "playing" : ""}`}
          onClick={() => playBirthdayTune(setIsPlayingMusic)}
          aria-label="Play birthday tune"
        >
          🎵
        </button>
      </header>

      <main>
        {/* 1. GIFT */}
        <section className={`stage ${stage === 0 ? "active" : ""}`} id="s-gift">
          <p className="muted">{wish.intro}</p>
          <button
            className={`gift ${giftShaking ? "shake" : ""} ${giftOpen ? "open" : ""}`}
            onClick={handleGiftClick}
            aria-label="Open the gift"
          >
            <span className="gift-lid"></span>
            <span className="gift-box"></span>
            <span className="gift-ribbon"></span>
            <span className="gift-glow"></span>
          </button>
          <p className="hint">Tap the gift 🎁</p>
        </section>

        {/* 2. OUR STORY IN MEMORIES (15 Photos & Videos) */}
        <section className={`stage ${stage === 1 ? "active" : ""}`} id="s-memories">
          <h2>Our Captured Memories 📸✨</h2>
          <p className="muted">Photos & videos from our journey. Tap any memory to view!</p>
          <div className="polaroid-wall">
            {wish.memories.map((m, i) => (
              <div
                key={i}
                className="polaroid"
                style={{ "--rot": `${memoryRotations[i % memoryRotations.length]}deg` }}
                onClick={() => openMediaModal(wish.memories, i)}
              >
                <div className="polaroid-img-box">
                  {m.type === "video" ? (
                    <>
                      {stage === 1 ? (
                        <video
                          src={m.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="none"
                        />
                      ) : (
                        <div className="polaroid-placeholder"><span>🎬</span></div>
                      )}
                      <span className="video-badge" title="Video clip">▶</span>
                    </>
                  ) : (
                    <img src={m.src} alt={m.title} loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="polaroid-caption">
                  <div className="polaroid-title">{m.title}</div>
                  <div className="polaroid-date">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn next" onClick={() => goToStage(2)}>
            Today is all about you →
          </button>
        </section>

        {/* 3. HERO (Avatar + Title) */}
        <section className={`stage ${stage === 2 ? "active" : ""}`} id="s-hero">
          <div className="avatar-wrap">
            <div className="avatar-ring">
              <img src={wish.avatar} alt={wish.name} loading="lazy" decoding="async" />
            </div>
            <div className="avatar-sparkles">✨</div>
          </div>
          <p className="muted">Today is all about</p>
          <h1 className="script">{wish.name}</h1>
          <h2 className="typed">{typedText}</h2>
          {wish.age && (
            <div className="age">
              <span>{displayedAge}</span>
              <small>years of awesome</small>
            </div>
          )}
          <button className="btn next" onClick={() => goToStage(3)}>
            Make a birthday wish →
          </button>
        </section>

        {/* 4. CAKE & CANDLE CANDID UNLOCKS */}
        <section className={`stage ${stage === 3 ? "active" : ""}`} id="s-cake">
          <h2>Make a wish 🌠</h2>
          <p className="muted">Close your eyes, then blow the candles — or tap each flame</p>

          <div className="cake">
            <div className="candles">
              {[...Array(CANDLE_COUNT)].map((_, i) => (
                <div
                  key={i}
                  className={`candle ${extinguishedCandles.includes(i) ? "out" : ""}`}
                  onClick={() => blowCandle(i)}
                >
                  <div className="flame"></div>
                </div>
              ))}
            </div>
            <div className="tier t3"></div>
            <div className="tier t2"></div>
            <div className="tier t1"></div>
            <div className="plate"></div>
          </div>

          {/* Candle revealed photo popup */}
          {activeCakePhoto && (
            <div
              className="cake-photo-popup"
              onClick={() => openMediaModal(wish.cakePhotos.map(p => ({ type: "image", src: p.src, title: p.caption, text: "A special birthday memory unlocked!" })), extinguishedCandles.length - 1)}
              style={{ cursor: "pointer" }}
            >
              <img src={activeCakePhoto.src} alt="Unlocked memory" />
              <span>{activeCakePhoto.caption} (Tap to enlarge)</span>
            </div>
          )}

          <div className="row">
            <button className="btn ghost" onClick={startMic}>
              {micStatusText}
            </button>
          </div>
          <p className="hint">
            {extinguishedCandles.length === CANDLE_COUNT
              ? "Wish made! 🌟"
              : `${extinguishedCandles.length} / ${CANDLE_COUNT} candles out`}
          </p>
          {extinguishedCandles.length === CANDLE_COUNT && (
            <button className="btn next" onClick={() => goToStage(4)}>
              Pop some balloons →
            </button>
          )}
        </section>

        {/* 5. BALLOONS WITH PHOTO WISHES */}
        <section className={`stage ${stage === 4 ? "active" : ""}`} id="s-balloons">
          <h2>Pop for a wish 🎈</h2>
          <p className="muted">
            {poppedBalloons.length} / {wish.wishes.length} popped
          </p>
          <div className="sky">
            {wish.wishes.map((w, i) => {
              const isPopped = poppedBalloons.includes(i);
              return !isPopped ? (
                <div
                  key={i}
                  className="balloon"
                  style={{
                    background: balloonColors[i % balloonColors.length],
                    color: balloonColors[i % balloonColors.length],
                    left: `${6 + i * (88 / Math.max(wish.wishes.length, 1))}%`,
                    "--d": `${2 + (i % 3) * 0.8}s`,
                    animationDelay: `${-(i % 3)}s`
                  }}
                  onClick={(e) => popBalloon(i, e, w)}
                />
              ) : null;
            })}
          </div>

          {/* Large Interactive Balloon Reveal Dialog (Supports Cutouts & GIFs) */}
          {activeBalloonWish && (
            <div className="balloon-reveal-overlay" onClick={() => setActiveBalloonWish(null)}>
              <div className="balloon-reveal-card" onClick={(e) => e.stopPropagation()}>
                {activeBalloonWish.img && (
                  <div
                    className="balloon-cutout-wrap"
                    onClick={() => openMediaModal(wish.wishes.map(w => ({ type: "image", src: w.img, title: "Birthday Wish 💫", text: w.text })), 0)}
                  >
                    <img
                      src={activeBalloonWish.img}
                      alt="Special Moment"
                      className="balloon-cutout-img"
                    />
                  </div>
                )}
                <div className="balloon-reveal-text">
                  {activeBalloonWish.text}
                </div>
                <button
                  className="balloon-reveal-btn"
                  onClick={() => setActiveBalloonWish(null)}
                >
                  Pop another balloon 🎈
                </button>
              </div>
            </div>
          )}

          {poppedBalloons.length === wish.wishes.length && (
            <button className="btn next" onClick={() => goToStage(5)}>
              Read your letter →
            </button>
          )}
        </section>

        {/* 6. LOVE LETTER WITH SCRAPBOOK POLAROIDS */}
        <section className={`stage ${stage === 5 ? "active" : ""}`} id="s-letter">
          <div className="letter-stage-wrap">
            <div className="paper">
              <h3 className="script">Dear {wish.name},</h3>
              <p>{letterTyped}</p>
              <p className="sign script">— {wish.from}</p>
            </div>

            {/* Scrapbook photo strip */}
            <div className="scrapbook-strip">
              {wish.letterPhotos.map((p, idx) => (
                <div
                  key={idx}
                  className="scrapbook-polaroid"
                  style={{ "--rot": `${(idx - 1) * 5}deg` }}
                  onClick={() => openMediaModal(wish.letterPhotos.map(src => ({ type: "image", src, title: "Treasured Moment", text: "A memory kept close to heart." })), idx)}
                >
                  <img src={p} alt="Scrapbook moment" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>

          <button className="btn next" onClick={() => goToStage(6)}>
            One last surprise →
          </button>
        </section>

        {/* 7. SCRATCH SURPRISE WITH VIDEO / PHOTO UNDERNEATH */}
        <section className={`stage ${stage === 6 ? "active" : ""}`} id="s-scratch">
          <h2>Scratch to reveal 🎟️</h2>
          <div className="scratch">
            <div className="prize-media">
              {wish.surpriseMedia.type === "video" ? (
                stage >= 6 ? (
                  <video
                    src={wish.surpriseMedia.src}
                    poster={wish.surpriseMedia.poster}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                  />
                ) : (
                  <div style={{ background: "#2a0f3f", width: "100%", height: "100%" }} />
                )
              ) : (
                <img src={wish.surpriseMedia.src} alt="Surprise" loading="lazy" />
              )}
              <div className="prize-badge">{wish.surpriseMedia.title} — {wish.surpriseMedia.text}</div>
            </div>
            <canvas id="scratchCanvas" ref={scratchCanvasRef}></canvas>
          </div>
          <p className="hint">Use your finger or mouse to scratch</p>
          {scratchRevealed && (
            <button className="btn next" onClick={() => goToStage(7)}>
              Finish ✨
            </button>
          )}
        </section>

        {/* 8. FINALE WITH FLOATING MEMORY STREAM */}
        <section className={`stage ${stage === 7 ? "active" : ""}`} id="s-finale">
          <h1 className="script big">Happy Birthday, {wish.name}!</h1>
          <p className="muted">With love, {wish.from} 💛</p>

          {/* Floating memory bubbles drifting with celebration */}
          <div className="finale-stream">
            {wish.finaleStream.map((p, idx) => (
              <div
                key={idx}
                className="stream-bubble"
                style={{ animationDelay: `${idx * 0.4}s` }}
                onClick={() => openMediaModal(wish.finaleStream.map(src => ({ type: "image", src, title: "Forever Moments ✨", text: "Memories that stay forever bright." })), idx)}
                title="Tap to view memory"
              >
                <img src={p} alt="Finale stream" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>

          <div className="row">
            <button className="btn" onClick={triggerFireworks}>
              🎆 More fireworks
            </button>
            <button className="btn ghost" onClick={() => goToStage(0)}>
              ↺ Replay
            </button>
          </div>
        </section>
      </main>

      {/* REUSABLE FULL-SCREEN CINEMATIC LIGHTBOX MODAL */}
      {lightboxIndex !== null && activeMediaList[lightboxIndex] && (
        <div className="lightbox open" role="dialog" aria-modal="true">
          <div className="lightbox-backdrop" onClick={() => setLightboxIndex(null)}></div>

          {/* Floating Left/Right Arrows for large screens */}
          <button
            className="lightbox-arrow-floating prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex - 1 + activeMediaList.length) % activeMediaList.length);
            }}
            aria-label="Previous memory"
          >
            ‹
          </button>
          <button
            className="lightbox-arrow-floating next"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % activeMediaList.length);
            }}
            aria-label="Next memory"
          >
            ›
          </button>

          <div className="lightbox-card">
            {/* Header with Title Tag & Close */}
            <div className="lightbox-header">
              <span className="lightbox-tag">
                {activeMediaList[lightboxIndex].date || `Memory #${lightboxIndex + 1}`}
              </span>
              <div className="lightbox-actions">
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {activeMediaList.length}
                </span>
                <button
                  className="lightbox-close"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Full-Screen Media View */}
            <div className="lightbox-photo-wrap" onClick={(e) => e.stopPropagation()}>
              {activeMediaList[lightboxIndex].type === "video" ? (
                <video
                  src={activeMediaList[lightboxIndex].src}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "100%", maxHeight: "78vh", objectFit: "contain" }}
                />
              ) : (
                <img
                  src={activeMediaList[lightboxIndex].src || activeMediaList[lightboxIndex]}
                  alt={activeMediaList[lightboxIndex].title || "Memory"}
                  style={{ width: "100%", height: "100%", maxHeight: "78vh", objectFit: "contain" }}
                />
              )}
            </div>

            {/* Captions Overlay / Bar */}
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <h3>{activeMediaList[lightboxIndex].title || "Captured Moment"}</h3>
              {activeMediaList[lightboxIndex].text && <p>{activeMediaList[lightboxIndex].text}</p>}

              {/* Mobile next/prev controls */}
              <div className="lightbox-mobile-nav">
                <button
                  onClick={() =>
                    setLightboxIndex((lightboxIndex - 1 + activeMediaList.length) % activeMediaList.length)
                  }
                >
                  ‹ Prev
                </button>
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {activeMediaList.length}
                </span>
                <button
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % activeMediaList.length)
                  }
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
