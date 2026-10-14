import React, { useState, useEffect, useRef } from "react";
import { WISH_CONFIG } from "./config";
import { initConfetti, burst, rain, triggerFireworks } from "./utils/confetti";
import { playBirthdayTune } from "./utils/audio";

export default function App() {
  // Query param overrides (e.g. ?name=Thamil&from=Thujeeban&age=25)
  const [wish, setWish] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      ...WISH_CONFIG,
      name: params.get("name") || WISH_CONFIG.name,
      from: params.get("from") || WISH_CONFIG.from,
      age: params.get("age") ? parseInt(params.get("age"), 10) : WISH_CONFIG.age
    };
  });

  const [stage, setStage] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Canvas ref for confetti
  const confettiCanvasRef = useRef(null);

  // Stage 1: Gift
  const [giftShaking, setGiftShaking] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  // Stage 2: Hero
  const [typedText, setTypedText] = useState("");
  const [displayedAge, setDisplayedAge] = useState(0);

  // Stage 3: Cake
  const CANDLE_COUNT = 5;
  const [extinguishedCandles, setExtinguishedCandles] = useState([]);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micStatusText, setMicStatusText] = useState("🎤 Blow into the mic");

  // Stage 4: Balloons
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [balloonToast, setBalloonToast] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Stage 5: Memories & Lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Stage 6: Love Letter
  const [letterTyped, setLetterTyped] = useState("");

  // Stage 7: Scratch Card
  const scratchCanvasRef = useRef(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  // Init confetti & stars
  useEffect(() => {
    if (confettiCanvasRef.current) {
      initConfetti(confettiCanvasRef.current);
    }
    document.title = `Happy Birthday ${wish.name || "Friend"}! 🎉`;
  }, [wish.name]);

  // Handle stage transitions
  const goToStage = (idx) => {
    setStage(idx);
    if (idx === 1) {
      // Hero stage
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
      }, 28);
    } else if (idx === 7) {
      // Finale
      triggerFireworks();
      rain(160);
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
    setTimeout(() => goToStage(1), 1900);
  };

  // Candle Extinguish
  const blowCandle = (idx) => {
    if (extinguishedCandles.includes(idx)) return;
    const next = [...extinguishedCandles, idx];
    setExtinguishedCandles(next);
    if (navigator.vibrate) navigator.vibrate(30);

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
          // Extinguish next candle
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

  // Balloon Pop
  const popBalloon = (idx, e, wishText) => {
    if (poppedBalloons.includes(idx)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, 6);

    const next = [...poppedBalloons, idx];
    setPoppedBalloons(next);
    setBalloonToast(wishText);
    setShowToast(true);

    if (next.length === wish.wishes.length) {
      rain(80);
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

  // Lightbox keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + wish.memories.length) % wish.memories.length);
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % wish.memories.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, wish.memories.length]);

  const balloonColors = ["#ff5fa2", "#ffd166", "#6ee7c8", "#6aa8ff", "#c084fc", "#ff8a5c"];
  const memoryRotations = [-4, 3.5, -2.5, 4, -3, 2];
  const memoryEmojis = ["💖", "✨", "🌟", "🎉", "📸", "🌈"];

  return (
    <>
      <canvas id="confetti" ref={confettiCanvasRef}></canvas>
      <div className="bg-stars">
        {[...Array(60)].map((_, i) => (
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

        {/* 2. HERO */}
        <section className={`stage ${stage === 1 ? "active" : ""}`} id="s-hero">
          {wish.avatar && (
            <div className="avatar-wrap">
              <div className="avatar-ring">
                <img
                  src={wish.avatar}
                  alt={wish.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%233a1457'/><text x='50%' y='58%' font-size='45' text-anchor='middle' dominant-baseline='middle'>👑</text></svg>";
                  }}
                />
              </div>
              <div className="avatar-sparkles">✨</div>
            </div>
          )}
          <p className="muted">Today is all about</p>
          <h1 className="script">{wish.name}</h1>
          <h2 className="typed">{typedText}</h2>
          {wish.age && (
            <div className="age">
              <span>{displayedAge}</span>
              <small>years of awesome</small>
            </div>
          )}
          <button className="btn next" onClick={() => goToStage(2)}>
            Let's celebrate →
          </button>
        </section>

        {/* 3. CAKE */}
        <section className={`stage ${stage === 2 ? "active" : ""}`} id="s-cake">
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
            <button className="btn next" onClick={() => goToStage(3)}>
              Pop some balloons →
            </button>
          )}
        </section>

        {/* 4. BALLOONS */}
        <section className={`stage ${stage === 3 ? "active" : ""}`} id="s-balloons">
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
          <div className={`toast ${showToast ? "show" : ""}`}>{balloonToast}</div>
          {poppedBalloons.length === wish.wishes.length && (
            <button className="btn next" onClick={() => goToStage(4)}>
              See the memories →
            </button>
          )}
        </section>

        {/* 5. POLAROID MEMORIES */}
        <section className={`stage ${stage === 4 ? "active" : ""}`} id="s-memories">
          <h2>Captured Moments 📸</h2>
          <p className="muted">Tap any polaroid to view & read the memory</p>
          <div className="polaroid-wall">
            {wish.memories.map((m, i) => (
              <div
                key={i}
                className="polaroid"
                style={{ "--rot": `${memoryRotations[i % memoryRotations.length]}deg` }}
                onClick={() => {
                  setLightboxIndex(i);
                  burst(window.innerWidth / 2, window.innerHeight / 2, 35, 6);
                }}
              >
                <div className="polaroid-img-box">
                  {m.img ? (
                    <img
                      src={m.img}
                      alt={m.title}
                      onError={(e) => {
                        e.currentTarget.parentElement.innerHTML = `<div class='polaroid-placeholder'><span>${memoryEmojis[i % memoryEmojis.length]}</span></div>`;
                      }}
                    />
                  ) : (
                    <div className="polaroid-placeholder">
                      <span>{memoryEmojis[i % memoryEmojis.length]}</span>
                    </div>
                  )}
                </div>
                <div className="polaroid-caption">
                  <div className="polaroid-title">{m.title || "Special Memory"}</div>
                  <div className="polaroid-date">{m.date || "Tap to view"}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn next" onClick={() => goToStage(5)}>
            A letter for you →
          </button>
        </section>

        {/* 6. LETTER */}
        <section className={`stage ${stage === 5 ? "active" : ""}`} id="s-letter">
          <div className="paper">
            <h3 className="script">Dear {wish.name},</h3>
            <p>{letterTyped}</p>
            <p className="sign script">— {wish.from}</p>
          </div>
          <button className="btn next" onClick={() => goToStage(6)}>
            One last surprise →
          </button>
        </section>

        {/* 7. SCRATCH */}
        <section className={`stage ${stage === 6 ? "active" : ""}`} id="s-scratch">
          <h2>Scratch to reveal 🎟️</h2>
          <div className="scratch">
            <div className="prize">{wish.surprise}</div>
            <canvas id="scratchCanvas" ref={scratchCanvasRef}></canvas>
          </div>
          <p className="hint">Use your finger or mouse</p>
          {scratchRevealed && (
            <button className="btn next" onClick={() => goToStage(7)}>
              Finish ✨
            </button>
          )}
        </section>

        {/* 8. FINALE */}
        <section className={`stage ${stage === 7 ? "active" : ""}`} id="s-finale">
          <h1 className="script big">Happy Birthday, {wish.name}!</h1>
          <p className="muted">With love, {wish.from} 💛</p>
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

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && wish.memories[lightboxIndex] && (
        <div className="lightbox open" role="dialog" aria-modal="true">
          <div className="lightbox-backdrop" onClick={() => setLightboxIndex(null)}></div>
          <div className="lightbox-card">
            <button
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="lightbox-photo-wrap">
              <img
                src={wish.memories[lightboxIndex].img || ""}
                alt={wish.memories[lightboxIndex].title}
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'><rect width='300' height='200' fill='%232a1457'/><text x='50%' y='50%' font-size='42' fill='white' text-anchor='middle' dominant-baseline='middle'>📸✨</text></svg>";
                }}
              />
            </div>
            <div className="lightbox-content">
              <span className="lightbox-tag script">
                {wish.memories[lightboxIndex].date || `Memory #${lightboxIndex + 1}`}
              </span>
              <h3>{wish.memories[lightboxIndex].title}</h3>
              <p>{wish.memories[lightboxIndex].text}</p>
              <div className="lightbox-nav">
                <button
                  className="lightbox-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(
                      (lightboxIndex - 1 + wish.memories.length) % wish.memories.length
                    );
                  }}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <span className="lightbox-counter">
                  {lightboxIndex + 1} / {wish.memories.length}
                </span>
                <button
                  className="lightbox-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((lightboxIndex + 1) % wish.memories.length);
                  }}
                  aria-label="Next photo"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
