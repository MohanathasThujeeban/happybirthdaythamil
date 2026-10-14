// Audio synthesizer for Happy Birthday tune without external files
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 784 };
const TUNE = [
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1],
  ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2]
];

let actx = null;
let isPlaying = false;
let stopTimer = null;

function tone(f, t, dur) {
  if (!actx) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = "triangle";
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(actx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export function playBirthdayTune(onStateChange) {
  if (isPlaying) {
    if (stopTimer) clearTimeout(stopTimer);
    isPlaying = false;
    onStateChange && onStateChange(false);
    return;
  }
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  actx.resume();
  isPlaying = true;
  onStateChange && onStateChange(true);

  let t = actx.currentTime + 0.05;
  const beat = 0.42;
  TUNE.forEach(([n, b]) => {
    tone(N[n], t, b * beat * 0.95);
    t += b * beat;
  });

  const totalTime = (t - actx.currentTime) * 1000;
  stopTimer = setTimeout(() => {
    isPlaying = false;
    onStateChange && onStateChange(false);
  }, totalTime);
}
