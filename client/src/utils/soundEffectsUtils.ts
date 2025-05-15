// Apple-inspired sound effects utility

// Sound effect types
export type SoundEffectType = 
  'click' | 
  'success' | 
  'error' | 
  'notification' | 
  'navigation' |
  'focus';

// Audio context for playing sounds
let audioContext: AudioContext | null = null;

// Create oscillator for simple tones
const createOscillator = (
  frequency: number, 
  type: OscillatorType = 'sine', 
  duration: number = 0.05
): Promise<void> => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return Promise.resolve();
    }
  }
  
  return new Promise((resolve) => {
    // If audio context is not available, resolve immediately
    if (!audioContext) {
      resolve();
      return;
    }
    
    // Create oscillator and gain
    const ctx = audioContext; // Make a copy for TypeScript
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Set oscillator type and frequency
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Configure gain node for a nice fade out
    gainNode.gain.value = 0.1;
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    // Connect and start
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    
    // Resolve when done
    setTimeout(resolve, duration * 1000);
  });
};

// Play Apple-inspired click sound
const playClickSound = async (): Promise<void> => {
  await createOscillator(800, 'sine', 0.03);
};

// Play Apple-inspired success sound
const playSuccessSound = async (): Promise<void> => {
  await createOscillator(1200, 'sine', 0.05);
  setTimeout(() => createOscillator(1600, 'sine', 0.1), 50);
};

// Play Apple-inspired error sound
const playErrorSound = async (): Promise<void> => {
  await createOscillator(400, 'sine', 0.05);
  setTimeout(() => createOscillator(350, 'sine', 0.2), 50);
};

// Play Apple-inspired notification sound
const playNotificationSound = async (): Promise<void> => {
  await createOscillator(880, 'sine', 0.05);
  setTimeout(() => createOscillator(1320, 'sine', 0.1), 100);
};

// Play Apple-inspired navigation sound
const playNavigationSound = async (): Promise<void> => {
  await createOscillator(600, 'sine', 0.03);
};

// Play Apple-inspired focus sound
const playFocusSound = async (): Promise<void> => {
  await createOscillator(720, 'sine', 0.04);
};

// Initialize sound effects
export const initSoundEffects = (): void => {
  // Just try to create the audio context
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('Apple-inspired sound effects initialized');
  } catch (e) {
    console.warn('Web Audio API not supported');
  }
};

// Play a specific sound effect
export const playSoundEffect = (type: SoundEffectType): void => {
  // Respect user's reduced motion/sound preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }
  
  // Play the appropriate sound effect
  switch (type) {
    case 'click':
      playClickSound();
      break;
    case 'success':
      playSuccessSound();
      break;
    case 'error':
      playErrorSound();
      break;
    case 'notification':
      playNotificationSound();
      break;
    case 'navigation':
      playNavigationSound();
      break;
    case 'focus':
      playFocusSound();
      break;
    default:
      playClickSound();
  }
};