import React, { useState, useEffect, useRef } from "react";
import { WISH_CONFIG } from "./config";
import { initConfetti, burst, rain, triggerFireworks } from "./utils/confetti";
import { toggleBackgroundMusic, startBackgroundMusic, duckMusic } from "./utils/audio";

export default function App() {
  const [wish] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      ...WISH_CONFIG,
      name: params.get("name") || WISH_CONFIG.name,
      from: params.get("from") || WISH_CONFIG.from,
      age: params.get("age") ? parseInt(params.get("age"), 10) : WISH_CONFIG.age,
      readyTitle: params.get("readyTitle") || WISH_CONFIG.readyTitle,
      readyName: params.get("readyName") || WISH_CONFIG.readyName,
      readyBtn: params.get("readyBtn") || WISH_CONFIG.readyBtn
    };
  });

  const [stage, setStage] = useState(0);
  const [visitedStages, setVisitedStages] = useState([0, 1]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const confettiCanvasRef = useRef(null);

  const shouldRenderStage = (s) => visitedStages.includes(s) || Math.abs(stage - s) <= 1;

  // Stage 0: Ready Click Action
  const handleReadyClick = () => {
    burst(window.innerWidth / 2, window.innerHeight / 2, 130, 10);
    if (!isPlayingMusic) {
      startBackgroundMusic(wish.music, setIsPlayingMusic);
    }
    goToStage(1);
  };

  // Stage 1: Gift
  const [giftShaking, setGiftShaking] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);

  // Stage 2: Realistic Flower Bouquet
  const [bouquetUnwrapped, setBouquetUnwrapped] = useState(false);
  const [ribbonUntying, setRibbonUntying] = useState(false);

  const handleUnwrapBouquet = () => {
    if (bouquetUnwrapped || ribbonUntying) return;
    setRibbonUntying(true);
    burst(window.innerWidth / 2, window.innerHeight * 0.45, 140, 10);
    rain(70);
    setTimeout(() => {
      setRibbonUntying(false);
      setBouquetUnwrapped(true);
      burst(window.innerWidth / 2, window.innerHeight * 0.4, 180, 12);
    }, 750);
  };

  // Stage 3: Core Memories & Lightbox (Preserved completely!)
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeMediaList, setActiveMediaList] = useState(wish.memories);

  // Stage 4: Hero
  const [typedText, setTypedText] = useState("");
  const [displayedAge, setDisplayedAge] = useState(0);

  // Stage 5: Cake & Candles
  const CANDLE_COUNT = 5;
  const [extinguishedCandles, setExtinguishedCandles] = useState([]);
  const extinguishedCandlesRef = useRef([]);
  extinguishedCandlesRef.current = extinguishedCandles;
  const micStreamRef = useRef(null);
  const [activeCakePhoto, setActiveCakePhoto] = useState(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micStatusText, setMicStatusText] = useState("🎤 Blow into the mic");

  // Stage 6: Balloons
  const [poppedBalloons, setPoppedBalloons] = useState([]);
  const [balloonToast, setBalloonToast] = useState({ text: "", img: "" });
  const [showToast, setShowToast] = useState(false);

  // Stage 7: Love Letter
  const [letterTyped, setLetterTyped] = useState("");

  // Stage 8: Scratch Card
  const scratchCanvasRef = useRef(null);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  // Stage 9: Finale background memory playback state
  const [finaleSlide, setFinaleSlide] = useState(0);

  useEffect(() => {
    if (stage !== 9) return;
    const count = wish.finaleCutouts?.length || wish.finaleStream?.length || 5;
    const interval = setInterval(() => {
      setFinaleSlide((prev) => (prev + 1) % count);
    }, 4500);
    return () => clearInterval(interval);
  }, [stage, wish.finaleCutouts, wish.finaleStream]);

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
    if (idx === 2) {
      // Bouquet stage arrival
      burst(window.innerWidth / 2, window.innerHeight * 0.45, 100, 9);
      rain(50);
    } else if (idx === 3) {
      // Memory wall
      burst(window.innerWidth / 2, window.innerHeight * 0.35, 80, 8);
      rain(60);
    } else if (idx === 4) {
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
    } else if (idx === 7) {
      // Letter typing
      setLetterTyped("");
      let cur = 0;
      const timer = setInterval(() => {
        cur += 2;
        setLetterTyped(wish.letter.slice(0, cur));
        if (cur >= wish.letter.length) clearInterval(timer);
      }, 26);
    } else if (idx === 9) {
      // Finale
      triggerFireworks();
      rain(180);
    }
  };

  // Gift Open Action
  const handleGiftClick = () => {
    if (giftOpen) return;
    setGiftShaking(true);
    // Start continuous background music for the whole website journey
    if (!isPlayingMusic) {
      startBackgroundMusic(wish.music, setIsPlayingMusic);
    }
    setTimeout(() => {
      setGiftShaking(false);
      setGiftOpen(true);
      burst(window.innerWidth / 2, window.innerHeight / 2, 160, 11);
    }, 550);
    setTimeout(() => goToStage(2), 1600);
  };

  // Automatic volume ducking when other sounds or videos are playing
  useEffect(() => {
    const isLightboxVideo = lightboxIndex !== null && activeMediaList[lightboxIndex]?.type === "video";
    const isScratchVideo = stage === 8 && scratchRevealed && wish.surpriseMedia?.type === "video";
    const isMicActive = isListeningMic;

    if (isLightboxVideo || isScratchVideo || isMicActive) {
      duckMusic(true);
    } else {
      duckMusic(false);
    }
  }, [lightboxIndex, activeMediaList, stage, scratchRevealed, isListeningMic, wish.surpriseMedia]);

  // Stop mic on stage navigation
  useEffect(() => {
    if (stage !== 5 && micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setIsListeningMic(false);
    }
  }, [stage]);

  // Candle Extinguish -> Reveals celebration photo!
  const blowCandle = (idx) => {
    setExtinguishedCandles((prev) => {
      if (prev.includes(idx)) return prev;
      const next = [...prev, idx];
      extinguishedCandlesRef.current = next;

      if (navigator.vibrate) navigator.vibrate(30);

      // Show candle milestone photo
      if (wish.cakePhotos && wish.cakePhotos[idx]) {
        setActiveCakePhoto(wish.cakePhotos[idx]);
      }

      if (next.length === CANDLE_COUNT) {
        burst(window.innerWidth / 2, window.innerHeight * 0.4, 200, 12);
        rain(120);
        if (!isPlayingMusic) startBackgroundMusic(wish.music, setIsPlayingMusic);
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
          setIsListeningMic(false);
          setMicStatusText("✨ All candles blown!");
        }
      }
      return next;
    });
  };

  // Microphone Listener
  const startMic = async () => {
    if (isListeningMic) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaStreamSource(stream);
      const an = ac.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      setIsListeningMic(true);
      setMicStatusText("🎤 Listening… blow!");

      let isBlowingSequence = false;

      const check = () => {
        if (!micStreamRef.current || extinguishedCandlesRef.current.length >= CANDLE_COUNT) {
          stream.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
          try { ac.close(); } catch {}
          setIsListeningMic(false);
          setMicStatusText("✨ All candles blown!");
          return;
        }

        an.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) {
          peak = Math.max(peak, Math.abs(v - 128));
        }

        // Blow detection threshold
        if (peak > 38 && !isBlowingSequence) {
          const current = extinguishedCandlesRef.current;
          const unlit = [];
          for (let i = 0; i < CANDLE_COUNT; i++) {
            if (!current.includes(i)) unlit.push(i);
          }

          if (unlit.length > 0) {
            if (peak > 65) {
              // Strong "boo" blow: extinguish all remaining candles in rapid cascading succession
              isBlowingSequence = true;
              unlit.forEach((candleIdx, offset) => {
                setTimeout(() => {
                  blowCandle(candleIdx);
                  if (offset === unlit.length - 1) {
                    isBlowingSequence = false;
                  }
                }, offset * 130);
              });
            } else {
              // Gentle puff: extinguish next candle
              blowCandle(unlit[0]);
            }
          }
        }

        setTimeout(check, 150);
      };
      check();
    } catch {
      setMicStatusText("Mic unavailable — tap the flames 🔥");
    }
  };

  // Balloon Pop -> Reveals Large Cutout / GIF & Wish Modal
  const [activeBalloonWish, setActiveBalloonWish] = useState(null);
  const [showKissGif, setShowKissGif] = useState(false);
  const [kissGifFading, setKissGifFading] = useState(false);
  const kissTimeoutRef = useRef(null);
  const kissFadeTimeoutRef = useRef(null);

  // Whenever a balloon is popped and photo shows up: GIF appears, plays, and disappears
  useEffect(() => {
    if (!activeBalloonWish) {
      setShowKissGif(false);
      setKissGifFading(false);
      if (kissTimeoutRef.current) clearTimeout(kissTimeoutRef.current);
      if (kissFadeTimeoutRef.current) clearTimeout(kissFadeTimeoutRef.current);
      return;
    }

    // Reset initial state so each photo reveal triggers fresh
    setShowKissGif(false);
    setKissGifFading(false);
    if (kissTimeoutRef.current) clearTimeout(kissTimeoutRef.current);
    if (kissFadeTimeoutRef.current) clearTimeout(kissFadeTimeoutRef.current);

    // After the photo shows up (~400ms delay), the kiss GIF appears
    const appearTimer = setTimeout(() => {
      setShowKissGif(true);
      setKissGifFading(false);

      // Plays the kiss animation for ~2.8s, then smoothly begins fading out
      kissFadeTimeoutRef.current = setTimeout(() => {
        setKissGifFading(true);

        // After 450ms fade-out transition, completely disappears
        kissTimeoutRef.current = setTimeout(() => {
          setShowKissGif(false);
          setKissGifFading(false);
        }, 450);
      }, 2800);
    }, 400);

    return () => {
      clearTimeout(appearTimer);
      if (kissFadeTimeoutRef.current) clearTimeout(kissFadeTimeoutRef.current);
      if (kissTimeoutRef.current) clearTimeout(kissTimeoutRef.current);
    };
  }, [activeBalloonWish]);

  const triggerKiss = () => {
    setShowKissGif(true);
    setKissGifFading(false);
    if (kissFadeTimeoutRef.current) clearTimeout(kissFadeTimeoutRef.current);
    if (kissTimeoutRef.current) clearTimeout(kissTimeoutRef.current);

    kissFadeTimeoutRef.current = setTimeout(() => {
      setKissGifFading(true);
      kissTimeoutRef.current = setTimeout(() => {
        setShowKissGif(false);
        setKissGifFading(false);
      }, 450);
    }, 2800);
  };

  const popBalloon = (idx, e, wishObj) => {
    if (poppedBalloons.includes(idx)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60, 8);

    const next = [...poppedBalloons, idx];
    setPoppedBalloons(next);
    setActiveBalloonWish({ ...wishObj, index: idx });

    if (next.length === wish.wishes.length) {
      rain(120);
    }
  };

  // Scratch Canvas Init
  useEffect(() => {
    if (stage === 8 && scratchCanvasRef.current) {
      const c = scratchCanvasRef.current;
      const parent = c.parentElement;
      const box = parent.getBoundingClientRect();
      const ctx = c.getContext("2d");
      const w = Math.round(box.width || parent.clientWidth || 340);
      const h = Math.round(box.height || parent.clientHeight || 210);
      c.width = w;
      c.height = h;

      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, "#8e95ac");
      g.addColorStop(0.5, "#dce0ec");
      g.addColorStop(1, "#7d849b");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.fillStyle = "#1e1035";
      ctx.font = "bold 18px 'Poppins', sans-serif";
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
          {[...Array(10)].map((_, k) => (
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
          onClick={() => toggleBackgroundMusic(wish.music, setIsPlayingMusic)}
          aria-label={isPlayingMusic ? "Mute music" : "Play music"}
        >
          {isPlayingMusic ? "🎵" : "🔇"}
        </button>
      </header>

      <main>
        {/* 0. ARE YOU READY (KAMMANIIII) */}
        <section className={`stage ${stage === 0 ? "active" : ""}`} id="s-ready">
          <div className="ready-floating-hearts" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="floating-purple-particle"
                style={{
                  left: `${6 + i * 8}%`,
                  animationDelay: `${(i * 0.45) % 3.6}s`,
                  animationDuration: `${3.6 + (i % 4) * 1.1}s`,
                  fontSize: `${14 + (i % 3) * 6}px`
                }}
              >
                💜
              </span>
            ))}
          </div>

          <div className="ready-card">
            <div className="ready-heart-hero">
              <div className="ready-heart-glow-ring"></div>
              <div className="ready-heart-glow-ring delay"></div>
              <div className="ready-heart-glow-ring delay2"></div>
              <div className="ready-heart-badge">
                <span className="ready-big-heart" role="img" aria-label="Purple Heart">💜</span>
              </div>
            </div>

            <p className="ready-question">{wish.readyTitle || "are you ready"}</p>

            <h1 className="ready-name script">
              {wish.readyName || "kammaniiii"} <span className="inline-purple-heart">💜</span>
            </h1>

            <button
              className="btn ready-btn"
              onClick={handleReadyClick}
              aria-label="Yes, I am ready"
            >
              <span>{wish.readyBtn || "Yes, I'm ready! 💜"}</span>
            </button>

            <p className="hint">Tap to unlock your surprise ✨</p>
          </div>
        </section>

        {/* 1. GIFT */}
        <section className={`stage ${stage === 1 ? "active" : ""}`} id="s-gift">
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

        {/* 2. REALISTIC FLOWER BOUQUET STAGE (NEW REVEAL) */}
        <section className={`stage ${stage === 2 ? "active" : ""}`} id="s-bouquet">
          {/* Ambient Falling Flower Petals */}
          <div className="bouquet-petals-field" aria-hidden="true">
            {[...Array(14)].map((_, i) => (
              <span
                key={i}
                className="floating-petal-particle"
                style={{
                  left: `${(i * 7.5) % 100}%`,
                  animationDelay: `${(i * 0.38) % 4}s`,
                  animationDuration: `${3.8 + (i % 3) * 1.4}s`,
                  fontSize: `${15 + (i % 3) * 6}px`
                }}
              >
                {["🌸", "🌹", "🌺", "✨", "🌷", "💜"][i % 6]}
              </span>
            ))}
          </div>

          <div className="bouquet-stage-header">
            <span className="bouquet-pill-tag">💐 A Special Surprise For You</span>
            <h2 className="script bouquet-title">{wish.bouquet?.title || "A Bouquet For You 💐"}</h2>
            <p className="muted bouquet-subtitle">
              {wish.bouquet?.subtitle || "Freshly bloomed with all my love for your special day"}
            </p>
          </div>

          {/* Realistic 3D Flower Bouquet Showcase */}
          <div className="bouquet-presentation-wrapper">
            {/* Glowing Bloom Aura */}
            <div className={`bouquet-glow-aura ${bouquetUnwrapped ? "blooming" : ""}`} />

            {/* Fluttering Butterflies when unwrapped */}
            {bouquetUnwrapped && (
              <div className="bouquet-butterflies" aria-hidden="true">
                <span className="butterfly b1">🦋</span>
                <span className="butterfly b2">✨</span>
                <span className="butterfly b3">🦋</span>
              </div>
            )}

            <div
              className={`bouquet-image-card ${bouquetUnwrapped ? "unwrapped" : ""} ${ribbonUntying ? "untying" : ""}`}
              onClick={!bouquetUnwrapped ? handleUnwrapBouquet : undefined}
            >
              <img
                src={wish.bouquet?.img || "/photos/bouquet.jpg"}
                alt="Luxury Flower Bouquet"
                className="bouquet-main-image"
              />

              {/* Shimmer overlay */}
              <div className="bouquet-shimmer-effect" />

              {/* Interactive Satin Ribbon & Bow */}
              {!bouquetUnwrapped && (
                <div className={`satin-ribbon-overlay ${ribbonUntying ? "slide-off" : ""}`}>
                  <button
                    className="satin-ribbon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnwrapBouquet();
                    }}
                    aria-label="Tap ribbon to unwrap"
                  >
                    <span className="ribbon-bow-icon">🎀</span>
                    <span className="ribbon-bow-text">Tap ribbon to unwrap</span>
                  </button>
                  <div className="ribbon-gold-band" />
                </div>
              )}
            </div>
          </div>

          {/* Unwrapped Romantic Message Card */}
          {bouquetUnwrapped ? (
            <div className="bouquet-card-note">
              <div className="bouquet-card-seal">🌸</div>
              <p className="bouquet-card-text">
                {wish.bouquet?.message ||
                  "Like these flowers, may your year bloom with boundless joy, radiant smiles, and endless love. You make life so much more beautiful! 🌸✨"}
              </p>
              <span className="bouquet-card-signature script">
                — {wish.bouquet?.from || wish.from || "Thujeeban"} 💛
              </span>
            </div>
          ) : (
            <p className="hint">Tap the golden ribbon to unwrap your bouquet 🎀</p>
          )}

          {bouquetUnwrapped && (
            <button className="btn next bouquet-next-btn" onClick={() => goToStage(3)}>
              {wish.bouquet?.btnText || "Step into our memories → 📸"}
            </button>
          )}
        </section>

        {/* 3. OUR STORY IN MEMORIES (15 Photos & Videos - COMPLETELY PRESERVED) */}
        <section className={`stage ${stage === 3 ? "active" : ""}`} id="s-memories">
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
                      {stage === 3 ? (
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
          <button className="btn next" onClick={() => goToStage(4)}>
            Today is all about you →
          </button>
        </section>

        {/* 4. HERO (Title & Celebration) */}
        <section className={`stage ${stage === 4 ? "active" : ""}`} id="s-hero">
          <div className="stage-bg-cutout hero-cutout">
            <img src="/photos/img_32.PNG" alt="Thamil" loading="lazy" decoding="async" />
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
          <button className="btn next" onClick={() => goToStage(5)}>
            Make a birthday wish →
          </button>
        </section>

        {/* 5. CAKE & CANDLE CANDID UNLOCKS */}
        <section className={`stage ${stage === 5 ? "active" : ""}`} id="s-cake">
          <div className="stage-bg-cutout cake-cutout">
            <img src="/photos/img_33.PNG" alt="" loading="lazy" decoding="async" />
          </div>
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
            <button className="btn next" onClick={() => goToStage(6)}>
              Pop some balloons →
            </button>
          )}
        </section>

        {/* 6. BALLOONS WITH PHOTO WISHES */}
        <section className={`stage ${stage === 6 ? "active" : ""}`} id="s-balloons">
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

          {/* Large Interactive Balloon Reveal Dialog (Shows Photo + Kiss GIF that appears & disappears) */}
          {activeBalloonWish && (
            <div className="balloon-reveal-overlay" onClick={() => setActiveBalloonWish(null)}>
              <div className="balloon-reveal-card" onClick={(e) => e.stopPropagation()}>
                {/* Photo showcase with kiss GIF overlay that appears and disappears */}
                <div className="balloon-photo-showcase">
                  {activeBalloonWish.img && (
                    <div
                      className="balloon-photo-frame"
                      onClick={() =>
                        openMediaModal(
                          wish.wishes.map((w) => ({
                            type: "image",
                            src: w.img,
                            title: "Birthday Wish 💫",
                            text: w.text
                          })),
                          activeBalloonWish.index ?? 0
                        )
                      }
                      title="Tap to enlarge memory"
                    >
                      <img
                        src={activeBalloonWish.img}
                        alt=""
                        className="balloon-photo-backdrop-blur"
                        aria-hidden="true"
                      />
                      <img
                        src={activeBalloonWish.img}
                        alt="Special Moment"
                        className="balloon-photo-img"
                      />
                      <span className="balloon-photo-badge">📸 Tap to enlarge</span>
                    </div>
                  )}

                  {/* Kiss GIF overlay: appears after photo shows up, plays kiss, then disappears */}
                  {showKissGif && (
                    <div
                      className={`balloon-kiss-overlay ${kissGifFading ? "fade-out" : "fade-in"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="balloon-kiss-bubble">
                        <div className="balloon-kiss-hearts-fx">
                          <span>💖</span>
                          <span>💋</span>
                          <span>✨</span>
                        </div>
                        <img
                          src={wish.balloonGif || "/photos/kiss.gif"}
                          alt="Sending Kisses"
                          className="balloon-kiss-gif-element"
                        />
                        <div className="balloon-kiss-title">Muah! 💋 Sending you kisses</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="balloon-reveal-text">
                  {activeBalloonWish.text}
                </div>

                <div className="balloon-action-row">
                  {!showKissGif && (
                    <button
                      className="btn-replay-kiss"
                      onClick={triggerKiss}
                      title="Watch the kiss animation again"
                    >
                      💋 Replay kiss
                    </button>
                  )}
                  <button
                    className="balloon-reveal-btn"
                    onClick={() => setActiveBalloonWish(null)}
                  >
                    Pop another balloon 🎈
                  </button>
                </div>
              </div>
            </div>
          )}

          {poppedBalloons.length === wish.wishes.length && (
            <button className="btn next" onClick={() => goToStage(7)}>
              Read your letter →
            </button>
          )}
        </section>

        {/* 7. LOVE LETTER WITH SCRAPBOOK POLAROIDS */}
        <section className={`stage ${stage === 7 ? "active" : ""}`} id="s-letter">
          <div className="stage-bg-cutout letter-cutout">
            <img src="/photos/remove1.png" alt="" loading="lazy" decoding="async" />
          </div>
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

          <button className="btn next" onClick={() => goToStage(8)}>
            One last surprise →
          </button>
        </section>

        {/* 8. SCRATCH SURPRISE WITH VIDEO / PHOTO UNDERNEATH */}
        <section className={`stage ${stage === 8 ? "active" : ""}`} id="s-scratch">
          <h2>Scratch to reveal 🎟️</h2>
          <div className="scratch">
            <div className="prize-media">
              {wish.surpriseMedia.type === "video" ? (
                stage >= 8 ? (
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
              <div className="prize-badge">
                <b>{wish.surpriseMedia.title}</b>
                <span>{wish.surpriseMedia.text}</span>
              </div>
            </div>
            <canvas id="scratchCanvas" ref={scratchCanvasRef}></canvas>
          </div>

          {scratchRevealed ? (
            <div className="scratch-revealed-banner">
              <div className="scratch-revealed-title">{wish.surpriseMedia.title}</div>
              <div className="scratch-revealed-text">{wish.surpriseMedia.text}</div>
            </div>
          ) : (
            <p className="hint">Use your finger or mouse to scratch ✨</p>
          )}

          {scratchRevealed && (
            <button className="btn next" onClick={() => goToStage(9)}>
              Finish ✨
            </button>
          )}
        </section>

        {/* 9. FINALE WITH FULL-SCREEN CUTOUT BACKGROUND */}
        <section className={`stage ${stage === 9 ? "active" : ""}`} id="s-finale">
          {/* Full Screen Ambient Cutout Background */}
          <div className="stage-bg-cutout finale-bg-cover">
            {(wish.finaleCutouts || wish.finaleStream).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Cutout Backdrop"
                className={`finale-bg-img ${idx === finaleSlide ? "active" : ""}`}
                loading="lazy"
                decoding="async"
              />
            ))}
            <div className="finale-bg-overlay" />
          </div>

          <div className="finale-content">
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
                  style={{ maxWidth: "100%", maxHeight: "75vh", width: "auto", height: "auto", objectFit: "contain" }}
                />
              ) : (
                <img
                  src={activeMediaList[lightboxIndex].src || activeMediaList[lightboxIndex]}
                  alt={activeMediaList[lightboxIndex].title || "Memory"}
                  style={{ maxWidth: "100%", maxHeight: "75vh", width: "auto", height: "auto", objectFit: "contain" }}
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
