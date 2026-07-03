import { loadSettings } from './db';

// Lazy initialized audio context to prevent browser autoplay blocks
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playKeyClick = (isSpace = false, isBackspace = false) => {
  const settings = loadSettings();
  if (!settings.soundOn) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create sound sources
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (isSpace) {
      // Deeper, heavier sound for spacebar
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (isBackspace) {
      // Double click or hollow plastic tick for backspace
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Crisp mechanical key click sound
      // We combine a triangle wave with a high-pass noise click for keyboard tactile feedback
      osc.type = 'sine';
      // Add slight random pitch to simulate organic typing variation
      const randomPitch = Math.random() * 200 - 100;
      osc.frequency.setValueAtTime(800 + randomPitch, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.03);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      osc.start(now);
      osc.stop(now + 0.03);

      // Brief noise click
      const bufferSize = ctx.sampleRate * 0.01; // 10ms of noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1500, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.01);
    }
  } catch (error) {
    console.warn("Audio Context playback failed:", error);
  }
};

export const playErrorBuzz = () => {
  const settings = loadSettings();
  if (!settings.soundOn) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.15);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (error) {
    console.warn("Audio Context error buzzer failed:", error);
  }
};
