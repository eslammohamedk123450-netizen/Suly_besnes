export type SoundEffect = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'unlock'
  | 'cash'
  | 'auction'
  | 'factory'
  | 'levelUp'
  | 'loan';

let audioContext: AudioContext | null = null;
let enabled = typeof window === 'undefined' ? true : window.localStorage.getItem('business-empire-sfx-enabled') !== 'false';
let volume = 0.22;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  audioContext ??= new AudioContextCtor();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(context: AudioContext, frequency: number, duration: number, delay = 0, type: OscillatorType = 'sine', gainAmount = 1) {
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * gainAmount), start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSound(effect: SoundEffect) {
  if (!enabled) return;
  const context = getAudioContext();
  if (!context) return;
  
  if (effect === 'click') {
    tone(context, 520, 0.055, 0, 'triangle', 0.42);
  } else if (effect === 'success') { 
    tone(context, 523.25, 0.13, 0, 'sine', 0.72); 
    tone(context, 659.25, 0.2, 0.075, 'sine', 0.72); 
  } else if (effect === 'error') { 
    tone(context, 240, 0.12, 0, 'sawtooth', 0.42); 
    tone(context, 180, 0.16, 0.09, 'sawtooth', 0.35); 
  } else if (effect === 'unlock') { 
    tone(context, 392, 0.12, 0, 'sine', 0.58); 
    tone(context, 523.25, 0.14, 0.09, 'sine', 0.62); 
    tone(context, 783.99, 0.25, 0.18, 'sine', 0.68); 
  } else if (effect === 'cash') {
    // Crisp coin chime & cash register
    tone(context, 987.77, 0.1, 0, 'triangle', 0.85); // B5
    tone(context, 1318.51, 0.12, 0.06, 'triangle', 0.9); // E6
    tone(context, 1975.53, 0.22, 0.12, 'sine', 0.75); // B6
  } else if (effect === 'auction') {
    // Gavel knock impact
    tone(context, 140, 0.08, 0, 'triangle', 1.0);
    tone(context, 90, 0.12, 0.03, 'sawtooth', 0.8);
  } else if (effect === 'factory') {
    // Industrial assembly hum
    tone(context, 220, 0.1, 0, 'square', 0.4);
    tone(context, 440, 0.15, 0.08, 'sine', 0.5);
    tone(context, 660, 0.2, 0.15, 'sine', 0.6);
  } else if (effect === 'levelUp') {
    // Victorious fanfare
    tone(context, 440, 0.12, 0, 'sine', 0.7);
    tone(context, 554.37, 0.12, 0.08, 'sine', 0.75);
    tone(context, 659.25, 0.14, 0.16, 'sine', 0.8);
    tone(context, 880, 0.35, 0.24, 'sine', 0.9);
  } else if (effect === 'loan') {
    // Reassuring warm chord
    tone(context, 349.23, 0.2, 0, 'sine', 0.6);
    tone(context, 440, 0.22, 0.05, 'sine', 0.65);
    tone(context, 523.25, 0.3, 0.1, 'sine', 0.7);
  }
}

export function setSoundEnabled(nextEnabled: boolean) { 
  enabled = nextEnabled; 
  if (typeof window !== 'undefined') window.localStorage.setItem('business-empire-sfx-enabled', String(nextEnabled)); 
  if (!nextEnabled && musicActive) {
    stopAmbientMusic();
  }
}
export function isSoundEnabled() { return enabled; }
export function setSoundVolume(nextVolume: number) { volume = Math.max(0, Math.min(1, nextVolume)); }

// Ambient Lo-Fi Corporate Background Music Generator
let musicActive = false;
let musicInterval: number | null = null;
let musicGainNode: GainNode | null = null;
let musicVolume = 0.12;

export function setMusicVolume(vol: number) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (musicGainNode && audioContext) {
    musicGainNode.gain.setValueAtTime(musicVolume, audioContext.currentTime);
  }
}

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
  }

  // Chords in Hz: Warm corporate lo-fi progression [Am7, Fmaj7, C, G]
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
        // Audio node creation safe guard
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
