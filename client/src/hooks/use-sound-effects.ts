import { useEffect, useState, useCallback } from 'react';

// Define the available sound types
export type SoundType = 
  'click' | 
  'navigation' | 
  'success' | 
  'error' | 
  'notification' | 
  'hover';

// Create a global variable to control sound effects state
declare global {
  interface Window {
    soundEffectsEnabled: boolean;
  }
}

/**
 * Hook that provides Apple-inspired sound effects for UI interactions
 * These sound effects are subtle, intuitive, and enhance user experience
 * The sound system respects user's accessibility preferences
 */
export const useSoundEffects = () => {
  const [initialized, setInitialized] = useState(false);
  
  // Initialize the sound effects system
  useEffect(() => {
    // Default to enabled if not set
    if (typeof window.soundEffectsEnabled === 'undefined') {
      try {
        // Try to load from localStorage
        const savedPrefs = localStorage.getItem('accessibilityPreferences');
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          window.soundEffectsEnabled = prefs.soundEffects !== false;
        } else {
          window.soundEffectsEnabled = true;
        }
      } catch (e) {
        window.soundEffectsEnabled = true;
      }
    }
    
    setInitialized(true);
  }, []);
  
  // Play a sound effect if enabled
  const playSound = useCallback((type: SoundType) => {
    if (!initialized || !window.soundEffectsEnabled) return;
    
    // Create an audio context for the sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Generate the oscillator based on sound type
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound based on type
    switch (type) {
      case 'click':
        // Subtle tap sound (high frequency, very short)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
        
      case 'navigation':
        // Smooth transition sound (medium frequency, slight fade)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.04, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
        
      case 'success':
        // Pleasant confirmation sound (rising tone)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'error':
        // Gentle alert sound (falling tone)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
        
      case 'notification':
        // Soft bell-like sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'hover':
        // Ultra-subtle feedback (very quiet, short)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
    }
  }, [initialized]);
  
  // Toggle sound effects on/off
  const toggleSoundEffects = useCallback(() => {
    window.soundEffectsEnabled = !window.soundEffectsEnabled;
    
    // Save to localStorage if available
    try {
      const savedPrefs = localStorage.getItem('accessibilityPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        prefs.soundEffects = window.soundEffectsEnabled;
        localStorage.setItem('accessibilityPreferences', JSON.stringify(prefs));
      } else {
        localStorage.setItem('accessibilityPreferences', JSON.stringify({
          soundEffects: window.soundEffectsEnabled,
        }));
      }
    } catch (e) {
      console.warn('Could not save sound preference to localStorage', e);
    }
    
    return window.soundEffectsEnabled;
  }, []);
  
  return {
    playSound,
    toggleSoundEffects,
    soundEffectsEnabled: window.soundEffectsEnabled,
  };
};

// Export the provider for use in the application
export default useSoundEffects;