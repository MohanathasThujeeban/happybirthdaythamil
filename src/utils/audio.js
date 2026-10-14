// Background Music & Audio Engine with Automatic Ducking
let actx = null;
let masterGain = null;
let bgAudio = null;
let isPlaying = false;
let isDucked = false;
let loopTimeout = null;
let fadeInterval = null;

const NORMAL_VOLUME = 0.65;
const DUCKED_VOLUME = 0.12;

// Musical scale & Celesta notes for soothing Happy Birthday music-box loop
const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784.00, A5: 880.00, B5: 987.77,
  C6: 1046.50
};

// [Melody Note, Duration beats, Optional Harmony Chord Note]
const BIRTHDAY_SCORE = [
  ["G4", 0.75, "C4"], ["G4", 0.25], ["A4", 1.0, "F4"], ["G4", 1.0], ["C5", 1.0, "E4"], ["B4", 2.0, "G4"],
  ["G4", 0.75, "D4"], ["G4", 0.25], ["A4", 1.0, "F4"], ["G4", 1.0], ["D5", 1.0, "F4"], ["C5", 2.0, "E4"],
  ["G4", 0.75, "C4"], ["G4", 0.25], ["G5", 1.0, "E4"], ["E5", 1.0, "C4"], ["C5", 1.0, "A4"], ["B4", 1.0, "G4"], ["A4", 1.5, "F4"],
  ["F5", 0.75, "D4"], ["F5", 0.25], ["E5", 1.0, "C4"], ["C5", 1.0, "E4"], ["D5", 1.0, "G4"], ["C5", 2.5, "C4"]
];

function initAudioContext() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = actx.createGain();
    masterGain.gain.setValueAtTime(NORMAL_VOLUME, actx.currentTime);
    masterGain.connect(actx.destination);
  }
  if (actx.state === "suspended") {
    actx.resume();
  }
}

// Gentle celesta chime / bell sound generator
function playMusicBoxChime(freq, time, dur, vol = 0.25) {
  if (!actx || !masterGain) return;

  const osc = actx.createOscillator();
  const chimeGain = actx.createGain();

  // Bell/celesta timbre with soft harmonic
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, time);

  chimeGain.gain.setValueAtTime(0, time);
  chimeGain.gain.linearRampToValueAtTime(vol, time + 0.015);
  chimeGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(chimeGain);
  chimeGain.connect(masterGain);

  osc.start(time);
  osc.stop(time + dur + 0.05);

  // Soft sparkle octave overtone
  if (vol > 0.1) {
    const overtone = actx.createOscillator();
    const overGain = actx.createGain();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(freq * 2, time);
    overGain.gain.setValueAtTime(0, time);
    overGain.gain.linearRampToValueAtTime(vol * 0.22, time + 0.01);
    overGain.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.6);
    overtone.connect(overGain);
    overGain.connect(masterGain);
    overtone.start(time);
    overtone.stop(time + dur * 0.6 + 0.05);
  }
}

// Play continuous melodic synthesizer loop
function scheduleMelodyLoop(onStateChange) {
  if (!isPlaying || bgAudio) return;
  initAudioContext();

  const beatSec = 0.46;
  let t = actx.currentTime + 0.05;

  BIRTHDAY_SCORE.forEach(([melodyNote, beats, harmonyNote]) => {
    const dur = beats * beatSec * 1.35;
    if (NOTES[melodyNote]) {
      playMusicBoxChime(NOTES[melodyNote], t, dur, 0.28);
    }
    if (harmonyNote && NOTES[harmonyNote]) {
      playMusicBoxChime(NOTES[harmonyNote], t, dur * 1.5, 0.12);
    }
    t += beats * beatSec;
  });

  const loopDurationMs = (t - actx.currentTime + 1.8) * 1000;
  loopTimeout = setTimeout(() => {
    if (isPlaying && !bgAudio) {
      scheduleMelodyLoop(onStateChange);
    }
  }, loopDurationMs);
}

// Smoothly transition volume (ducking or restoring)
function fadeVolume(targetVol, durationMs = 350) {
  if (fadeInterval) clearInterval(fadeInterval);

  const startVol = bgAudio ? bgAudio.volume : masterGain ? masterGain.gain.value : NORMAL_VOLUME;
  const startTime = Date.now();

  fadeInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    const curVol = startVol + (targetVol - startVol) * progress;

    if (bgAudio) {
      bgAudio.volume = Math.max(0, Math.min(1, curVol));
    }
    if (masterGain && actx) {
      masterGain.gain.setValueAtTime(curVol, actx.currentTime);
    }

    if (progress >= 1) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }
  }, 25);
}

// Public API: Duck music volume down when videos / sound effects play
export function duckMusic(shouldDuck) {
  isDucked = shouldDuck;
  const target = shouldDuck ? DUCKED_VOLUME : NORMAL_VOLUME;
  fadeVolume(target, 400);
}

// Public API: Toggle background music play/pause
export function toggleBackgroundMusic(musicSrc, onStateChange) {
  if (isPlaying) {
    pauseBackgroundMusic(onStateChange);
  } else {
    startBackgroundMusic(musicSrc, onStateChange);
  }
}

// Public API: Start background music
export function startBackgroundMusic(musicSrc, onStateChange) {
  if (isPlaying) return;
  isPlaying = true;
  onStateChange && onStateChange(true);

  // If a custom audio file is provided (e.g. /music.mp3)
  if (musicSrc && typeof musicSrc === "string") {
    if (!bgAudio) {
      bgAudio = new Audio(musicSrc);
      bgAudio.loop = true;
      bgAudio.volume = isDucked ? DUCKED_VOLUME : NORMAL_VOLUME;
    }

    bgAudio.play().then(() => {
      // Custom audio file playing successfully
    }).catch(() => {
      // Fallback to built-in enchanted music-box loop if audio file not reachable or blocked
      bgAudio = null;
      scheduleMelodyLoop(onStateChange);
    });
    return;
  }

  // Built-in melodic music loop
  scheduleMelodyLoop(onStateChange);
}

// Public API: Pause background music
export function pauseBackgroundMusic(onStateChange) {
  isPlaying = false;
  if (loopTimeout) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
  if (bgAudio) {
    try { bgAudio.pause(); } catch {}
  }
  if (actx && actx.state === "running") {
    try { actx.suspend(); } catch {}
  }
  onStateChange && onStateChange(false);
}

// Backward-compatible alias for existing imports
export const playBirthdayTune = (onStateChange, musicSrc) => {
  toggleBackgroundMusic(musicSrc, onStateChange);
};
