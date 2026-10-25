/**
 * Business Empire Web Audio API Sound System
 * Pure synthesized audio - zero external audio assets, zero network latency, 100% offline-ready.
 */

export type SoundEffect = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'unlock'
  | 'cash'
  | 'gold'
  | 'diamond'
  | 'auction'
  | 'factory'
  | 'maintenance'
  | 'ship'
  | 'stock'
  | 'levelUp'
  | 'vip'
  | 'loan'
  | 'vault';

let audioContext: AudioContext | null = null;

// Volume and preference initial state with local storage persistence
const SFX_STORAGE_KEY = 'business-empire-sfx-enabled';
const SFX_VOL_KEY = 'business-empire-sfx-volume';
const MUSIC_VOL_KEY = 'business-empire-music-volume';

let enabled = typeof window === 'undefined' ? true : window.localStorage.getItem(SFX_STORAGE_KEY) !== 'false';
let soundVolume = typeof window === 'undefined' ? 0.35 : Math.max(0, Math.min(1, Number(window.localStorage.getItem(SFX_VOL_KEY) ?? '0.35')));
let musicVolume = typeof window === 'undefined' ? 0.15 : Math.max(0, Math.min(1, Number(window.localStorage.getItem(MUSIC_VOL_KEY) ?? '0.15')));

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  audioContext ??= new AudioContextCtor();
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

/**
 * Synthesize a single envelope-controlled oscillator tone
 */
function tone(
  context: AudioContext, 
  frequency: number, 
  duration: number, 
  delay = 0, 
  type: OscillatorType = 'sine', 
  gainAmount = 1,
  lowPassCutoff?: number
) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  
  const targetGain = Math.max(0.0001, soundVolume * gainAmount);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(targetGain, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  if (lowPassCutoff) {
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowPassCutoff, start);
    oscillator.connect(filter).connect(gain).connect(context.destination);
  } else {
    oscillator.connect(gain).connect(context.destination);
  }

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/**
 * Noise burst for mechanical clicks, impacts, and ratchet gear effects
 */
function noiseBurst(
  context: AudioContext,
  duration: number,
  delay = 0,
  filterFreq = 800,
  gainAmount = 0.5
) {
  const bufferSize = Math.floor(context.sampleRate * duration);
  if (bufferSize <= 0) return;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const start = context.currentTime + delay;
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(filterFreq, start);
  filter.Q.setValueAtTime(3.0, start);

  const gain = context.createGain();
  const targetGain = Math.max(0.0001, soundVolume * gainAmount);
  gain.gain.setValueAtTime(targetGain, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  noiseSource.connect(filter).connect(gain).connect(context.destination);
  noiseSource.start(start);
  noiseSource.stop(start + duration);
}

/**
 * Play a specific high-fidelity synthesized game sound
 */
export function playSound(effect: SoundEffect) {
  if (!enabled || soundVolume <= 0.01) return;
  const context = getAudioContext();
  if (!context) return;

  try {
    switch (effect) {
      case 'click':
        // Crisp, ultra-light tactile UI click
        tone(context, 750, 0.035, 0, 'triangle', 0.35, 2000);
        break;

      case 'success':
        // Modern, uplifting bright ascending arpeggio (C5 -> E5 -> G5)
        tone(context, 523.25, 0.12, 0, 'sine', 0.65);
        tone(context, 659.25, 0.15, 0.065, 'sine', 0.7);
        tone(context, 783.99, 0.22, 0.13, 'sine', 0.75);
        break;

      case 'error':
        // Soft low double-buzz/drop
        tone(context, 260, 0.12, 0, 'sawtooth', 0.35, 900);
        tone(context, 200, 0.16, 0.08, 'sawtooth', 0.3, 750);
        break;

      case 'unlock':
        // Sparkly unlock triad
        tone(context, 440, 0.12, 0, 'sine', 0.55);
        tone(context, 587.33, 0.14, 0.08, 'sine', 0.6);
        tone(context, 880, 0.28, 0.16, 'sine', 0.7);
        break;

      case 'cash':
        // Crisp dual coin chime + register bell (B5 -> E6 -> B6)
        tone(context, 987.77, 0.08, 0, 'triangle', 0.8);
        tone(context, 1318.51, 0.12, 0.05, 'triangle', 0.85);
        tone(context, 1975.53, 0.25, 0.10, 'sine', 0.7);
        break;

      case 'gold':
        // Rich, heavy metallic bullion chime with acoustic shimmer
        tone(context, 415.3, 0.35, 0, 'sine', 0.75); // G#4
        tone(context, 830.6, 0.45, 0.02, 'triangle', 0.8); // G#5
        tone(context, 1245.9, 0.5, 0.05, 'sine', 0.65); // Overtones
        tone(context, 2489.0, 0.35, 0.08, 'sine', 0.45);
        break;

      case 'diamond':
        // Pristine crystalline sparkle (E6 -> G#6 -> B6 -> E7)
        tone(context, 1318.5, 0.15, 0, 'sine', 0.6);
        tone(context, 1661.2, 0.18, 0.05, 'sine', 0.65);
        tone(context, 1975.5, 0.22, 0.10, 'sine', 0.75);
        tone(context, 2637.0, 0.35, 0.16, 'sine', 0.85);
        break;

      case 'auction':
        // Authoritative wooden gavel knock
        tone(context, 160, 0.07, 0, 'triangle', 1.0, 800);
        tone(context, 95, 0.14, 0.02, 'sawtooth', 0.85, 450);
        noiseBurst(context, 0.04, 0.005, 1200, 0.6);
        break;

      case 'factory':
        // Industrial dynamo motor & heavy machinery rev
        tone(context, 140, 0.18, 0, 'sawtooth', 0.45, 600);
        tone(context, 280, 0.22, 0.05, 'square', 0.35, 800);
        tone(context, 420, 0.25, 0.12, 'sine', 0.5);
        noiseBurst(context, 0.12, 0.06, 950, 0.35);
        break;

      case 'maintenance':
        // Mechanical ratchet wrench click-clack
        noiseBurst(context, 0.035, 0, 1800, 0.7);
        tone(context, 620, 0.05, 0.01, 'triangle', 0.55);
        noiseBurst(context, 0.04, 0.065, 2200, 0.75);
        tone(context, 780, 0.05, 0.075, 'triangle', 0.6);
        break;

      case 'ship':
        // Low majestic maritime container ship horn chord
        tone(context, 110, 0.65, 0, 'sawtooth', 0.65, 380); // A2
        tone(context, 138.59, 0.65, 0, 'sawtooth', 0.55, 380); // C#3
        tone(context, 164.81, 0.7, 0.02, 'sine', 0.7); // E3
        break;

      case 'stock':
        // Electronic stock market ticker bell
        tone(context, 880, 0.08, 0, 'sine', 0.7);
        tone(context, 1174.66, 0.15, 0.05, 'sine', 0.8);
        tone(context, 1760, 0.22, 0.10, 'sine', 0.75);
        break;

      case 'levelUp':
      case 'vip':
        // Grand imperial royal fanfare
        tone(context, 392.00, 0.14, 0, 'triangle', 0.7);      // G4
        tone(context, 523.25, 0.16, 0.08, 'triangle', 0.75);  // C5
        tone(context, 659.25, 0.18, 0.16, 'triangle', 0.8);   // E5
        tone(context, 783.99, 0.22, 0.24, 'sine', 0.85);     // G5
        tone(context, 1046.50, 0.45, 0.32, 'sine', 0.95);    // C6
        break;

      case 'loan':
        // Warm reassuring corporate banking chord
        tone(context, 349.23, 0.24, 0, 'sine', 0.55);
        tone(context, 440.00, 0.28, 0.05, 'sine', 0.6);
        tone(context, 523.25, 0.36, 0.11, 'sine', 0.65);
        break;

      case 'vault':
        // Heavy steel vault locking bolt mechanism
        tone(context, 180, 0.12, 0, 'triangle', 0.7, 600);
        noiseBurst(context, 0.06, 0.05, 1400, 0.7);
        tone(context, 120, 0.25, 0.11, 'sawtooth', 0.8, 400);
        break;
    }
  } catch {
    // Ignore audio node scheduling errors on detached browsers
  }
}

// -------------------------------------------------------------
// Volume and Preferences API
// -------------------------------------------------------------

export function setSoundEnabled(nextEnabled: boolean) { 
  enabled = nextEnabled; 
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_STORAGE_KEY, String(nextEnabled)); 
  }
  if (!nextEnabled && musicActive) {
    stopAmbientMusic();
  }
}

export function isSoundEnabled(): boolean { 
  return enabled; 
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(nextVolume: number) { 
  soundVolume = Math.max(0, Math.min(1, nextVolume));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_VOL_KEY, soundVolume.toFixed(2));
  }
}

export function getMusicVolume(): number {
  return musicVolume;
}

export function setMusicVolume(vol: number) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUSIC_VOL_KEY, musicVolume.toFixed(2));
  }
  if (musicGainNode && audioContext) {
    try {
      musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
    } catch {
      // Safe guard
    }
  }
}

// -------------------------------------------------------------
// Ambient Lo-Fi Corporate Background Music Generator
// -------------------------------------------------------------
let musicActive = false;
let musicInterval: number | null = null;
let musicGainNode: GainNode | null = null;

export function isMusicPlaying(): boolean {
  return musicActive;
}

export function toggleAmbientMusic(): boolean {
  if (musicActive) {
    stopAmbientMusic();
    return false;
  } else {
    startAmbientMusic();
    return true;
  }
}

export function startAmbientMusic() {
  if (musicActive) return;
  const context = getAudioContext();
  if (!context) return;
  musicActive = true;

  if (!musicGainNode) {
    musicGainNode = context.createGain();
    musicGainNode.gain.setValueAtTime(musicVolume, context.currentTime);
    musicGainNode.connect(context.destination);
  } else {
    musicGainNode.gain.setValueAtTime(musicVolume, context.currentTime);
  }

  // Warm corporate lo-fi progression [Am7, Fmaj7, C, G]
  const chords = [
    [220.0, 261.63, 329.63, 392.0], // A3, C4, E4, G4
    [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
    [261.63, 329.63, 392.0, 523.25], // C4, E4, G4, C5
    [196.0, 246.94, 293.66, 392.0], // G3, B3, D4, G4
  ];

  let chordIndex = 0;

  const playNextChord = () => {
    if (!musicActive || !audioContext || audioContext.state === 'closed') return;
    const currentNotes = chords[chordIndex % chords.length];
    chordIndex++;

    const startTime = audioContext.currentTime;
    const duration = 4.2;

    currentNotes.forEach((freq, i) => {
      if (!audioContext || !musicGainNode) return;
      try {
        const osc = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, startTime);

        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.06 * musicVolume, startTime + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(filter).connect(noteGain).connect(musicGainNode);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      } catch {
        // Safe guard
      }
    });
  };

  playNextChord();
  musicInterval = window.setInterval(playNextChord, 4200);
}

export function stopAmbientMusic() {
  musicActive = false;
  if (musicInterval !== null) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
