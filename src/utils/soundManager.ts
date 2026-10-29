/**
 * Sound Manager Utility for Suly Business Game
 * Manages game audio using the browser's built-in Audio API with Web Audio fallback.
 * 
 * Includes 3 primary sound effects:
 * 1. playClick()   - Button tactile click
 * 2. playCash()    - Cash register & profit collection
 * 3. playUpgrade() - Building & facility upgrade achievement fanfare
 */

export type SoundEffectType = 'click' | 'cash' | 'upgrade';

export interface SoundUrls {
  click: string;
  cash: string;
  upgrade: string;
}

// Configurable sound file paths (can be updated or replaced with custom MP3 files)
const soundPaths: SoundUrls = {
  click: '/sounds/click.mp3',
  cash: '/sounds/cash.mp3',
  upgrade: '/sounds/upgrade.mp3',
};

// Local storage keys
const SFX_ENABLED_KEY = 'suly-sound-enabled';
const SFX_VOLUME_KEY = 'suly-sound-volume';

let enabled = typeof window !== 'undefined'
  ? window.localStorage.getItem(SFX_ENABLED_KEY) !== 'false'
  : true;

let volume = typeof window !== 'undefined'
  ? Math.max(0, Math.min(1, Number(window.localStorage.getItem(SFX_VOLUME_KEY) ?? '0.7')))
  : 0.7;

// Cache of HTML5 Audio instances for low-latency playback
const audioPool: Record<SoundEffectType, HTMLAudioElement[]> = {
  click: [],
  cash: [],
  upgrade: [],
};

const POOL_SIZE_PER_SOUND = 4;

function initAudioElement(type: SoundEffectType, url: string): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  try {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.volume = volume;
    return audio;
  } catch {
    return null;
  }
}

function getAudioFromPool(type: SoundEffectType): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;

  let pool = audioPool[type];
  if (!pool || pool.length === 0) {
    pool = [];
    for (let i = 0; i < POOL_SIZE_PER_SOUND; i++) {
      const el = initAudioElement(type, soundPaths[type]);
      if (el) pool.push(el);
    }
    audioPool[type] = pool;
  }

  // Find an element not currently playing or round-robin
  for (const item of pool) {
    if (item.paused || item.ended) {
      return item;
    }
  }

  // If all are playing, use first and restart it
  return pool[0] ?? null;
}

// Fallback Web Audio API synthesizer if audio files are unavailable, blocked, or missing
let fallbackContext: AudioContext | null = null;

function getFallbackContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!fallbackContext || fallbackContext.state === 'closed') {
      fallbackContext = new AudioContextClass();
    }
    if (fallbackContext.state === 'suspended') {
      void fallbackContext.resume();
    }
    return fallbackContext;
  } catch {
    return null;
  }
}

function playSynthesizedFallback(type: SoundEffectType, vol: number) {
  const ctx = getFallbackContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'click') {
      // Crisp 50ms tactile pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(vol * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'cash') {
      // Cash register dual chime + high coin ring (B5 -> E6 -> B6)
      const freqs = [
        { f: 987.77, delay: 0, dur: 0.12, g: 0.6 },
        { f: 1318.51, delay: 0.05, dur: 0.16, g: 0.7 },
        { f: 1975.53, delay: 0.1, dur: 0.35, g: 0.8 },
      ];
      freqs.forEach(({ f, delay, dur, g }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + delay);
        gain.gain.setValueAtTime(vol * g, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.02);
      });
    } else if (type === 'upgrade') {
      // Majestic ascending triumph fanfare (C5 -> E5 -> G5 -> C6)
      const notes = [
        { f: 523.25, delay: 0, dur: 0.18, g: 0.5 },
        { f: 659.25, delay: 0.1, dur: 0.2, g: 0.55 },
        { f: 783.99, delay: 0.2, dur: 0.24, g: 0.65 },
        { f: 1046.5, delay: 0.32, dur: 0.55, g: 0.85 },
      ];
      notes.forEach(({ f, delay, dur, g }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + delay);
        gain.gain.setValueAtTime(vol * g, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.02);
      });
    }
  } catch {
    // Ignore browser audio scheduling errors
  }
}

/**
 * Core playback method using the HTML5 Audio object with Web Audio fallback
 */
function play(type: SoundEffectType) {
  if (!enabled || volume <= 0.01) return;

  const audio = getAudioFromPool(type);
  if (!audio) {
    playSynthesizedFallback(type, volume);
    return;
  }

  try {
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio synthesis if audio file didn't load or Autoplay policy interrupted
        playSynthesizedFallback(type, volume);
      });
    }
  } catch {
    playSynthesizedFallback(type, volume);
  }
}

/**
 * 1. Play button click sound
 */
export function playClick(): void {
  play('click');
}

/**
 * 2. Play cash register sound when collecting profits or completing a task
 */
export function playCash(): void {
  play('cash');
}

/**
 * 3. Play achievement fanfare sound when upgrading a building or property
 */
export function playUpgrade(): void {
  play('upgrade');
}

/**
 * Update the URL for any sound effect
 */
export function setSoundUrl(type: SoundEffectType, url: string): void {
  soundPaths[type] = url;
  // Clear pool so new URL takes effect on next play
  audioPool[type] = [];
}

/**
 * Get current sound URLs
 */
export function getSoundUrls(): SoundUrls {
  return { ...soundPaths };
}

/**
 * Set master sound volume (0.0 to 1.0)
 */
export function setSoundVolume(nextVolume: number): void {
  volume = Math.max(0, Math.min(1, nextVolume));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_VOLUME_KEY, volume.toFixed(2));
  }
  // Update cached audio elements
  Object.values(audioPool).forEach((pool) => {
    pool.forEach((el) => {
      try {
        el.volume = volume;
      } catch {
        // Safe guard
      }
    });
  });
}

/**
 * Get current volume level
 */
export function getSoundVolume(): number {
  return volume;
}

/**
 * Enable or disable sound effects
 */
export function setSoundEnabled(nextEnabled: boolean): void {
  enabled = nextEnabled;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SFX_ENABLED_KEY, String(nextEnabled));
  }
}

/**
 * Check if sound effects are enabled
 */
export function isSoundEnabled(): boolean {
  return enabled;
}

/**
 * Global button click sound listener.
 * Automatically triggers playClick() whenever any button or clickable UI element is pressed.
 * Prevents duplicates via micro-debounce.
 */
let globalListenerAttached = false;
let lastClickTimestamp = 0;

export function initGlobalButtonSounds(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }
  if (globalListenerAttached) {
    return () => {};
  }

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if target or parent is a button or interactive element
    const clickable = target.closest(
      'button, [role="button"], .button, .btn, .nav-item, .fab-button, .tab-btn, a[href="#"]'
    );

    if (clickable) {
      // Check if button is disabled
      if (clickable.hasAttribute('disabled') || clickable.getAttribute('aria-disabled') === 'true') {
        return;
      }

      // Avoid double-play if two events fire closely
      const now = Date.now();
      if (now - lastClickTimestamp < 60) return;
      lastClickTimestamp = now;

      playClick();
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });
  globalListenerAttached = true;

  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
    globalListenerAttached = false;
  };
}

/**
 * Unified Sound Manager export
 */
export const soundManager = {
  playClick,
  playCash,
  playUpgrade,
  play: (type: SoundEffectType) => play(type),
  setSoundUrl,
  getSoundUrls,
  setVolume: setSoundVolume,
  getVolume: getSoundVolume,
  setEnabled: setSoundEnabled,
  isEnabled: isSoundEnabled,
  initGlobalButtonSounds,
};

export default soundManager;
