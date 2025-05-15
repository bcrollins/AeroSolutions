/**
 * Sound Effects Utilities
 * Apple-inspired sound effects system for RXAI platform
 */

/**
 * Initialize the sound effects system
 * This needs to be called on user interaction to enable audio in browsers like Safari
 */
export const initSoundEffects = () => {
  try {
    // Create a short, silent sound to enable audio context in browsers that require user interaction
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set volume to 0 (silent)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.001);
    
    // Log initialization
    console.log('Sound effects system initialized');
    
    // Store in local storage that sound is enabled by default
    if (localStorage.getItem('rxai-sound-effects-enabled') === null) {
      localStorage.setItem('rxai-sound-effects-enabled', 'true');
    }
    
    if (localStorage.getItem('rxai-sound-effects-volume') === null) {
      localStorage.setItem('rxai-sound-effects-volume', '0.5');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize sound effects system:', error);
    return false;
  }
};

/**
 * Get user sound preferences
 */
export const getSoundPreferences = () => {
  const enabled = localStorage.getItem('rxai-sound-effects-enabled') === 'true';
  const volume = parseFloat(localStorage.getItem('rxai-sound-effects-volume') || '0.5');
  
  return {
    enabled,
    volume
  };
};

/**
 * Update sound preferences
 */
export const updateSoundPreferences = (enabled: boolean, volume: number) => {
  localStorage.setItem('rxai-sound-effects-enabled', enabled.toString());
  localStorage.setItem('rxai-sound-effects-volume', volume.toString());
  
  return {
    enabled,
    volume
  };
};

export default {
  initSoundEffects,
  getSoundPreferences,
  updateSoundPreferences
};