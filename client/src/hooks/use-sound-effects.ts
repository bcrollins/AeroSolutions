import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './use-local-storage';

// Sound effect types
export type SoundEffectType = 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'click' 
  | 'hover'
  | 'complete'
  | 'warning';

/**
 * Hook for playing Apple-inspired sound effects with user preferences
 */
export function useSoundEffects() {
  // User preference for sound effects (enabled/disabled)
  const [soundEnabled, setSoundEnabled] = useLocalStorage('rxai-sound-effects-enabled', true);
  // Volume level (between 0 and 1)
  const [volume, setVolume] = useLocalStorage('rxai-sound-effects-volume', 0.5);
  
  // Audio contexts for different sound effects
  const [audioContexts, setAudioContexts] = useState<{[key in SoundEffectType]?: AudioContext}>({});
  
  // Initialize audio contexts on mount
  useEffect(() => {
    // Only create contexts if sound is enabled
    if (soundEnabled) {
      const contexts: {[key in SoundEffectType]?: AudioContext} = {};
      
      // Create a context for each sound type
      const soundTypes: SoundEffectType[] = ['success', 'error', 'notification', 'click', 'hover', 'complete', 'warning'];
      soundTypes.forEach(type => {
        try {
          contexts[type] = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
          console.error(`Failed to create audio context for ${type}:`, error);
        }
      });
      
      setAudioContexts(contexts);
      
      // Clean up audio contexts on unmount
      return () => {
        Object.values(contexts).forEach(context => {
          if (context && context.state !== 'closed') {
            context.close();
          }
        });
      };
    }
  }, [soundEnabled]);
  
  // Play a sound effect
  const playSound = useCallback((type: SoundEffectType) => {
    if (!soundEnabled || !audioContexts[type]) return;
    
    try {
      const context = audioContexts[type];
      if (!context) return;
      
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      // Configure oscillator based on sound type
      switch (type) {
        case 'success':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.1); // E6
          gainNode.gain.setValueAtTime(volume, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.3);
          break;
          
        case 'error':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(220, context.currentTime); // A3
          oscillator.frequency.exponentialRampToValueAtTime(196, context.currentTime + 0.3); // G3
          gainNode.gain.setValueAtTime(volume, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.4);
          break;
          
        case 'notification':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(659.25, context.currentTime); // E5
          oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.1); // A5
          gainNode.gain.setValueAtTime(volume * 0.7, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.3);
          
          // Add a second tone after a short delay
          setTimeout(() => {
            if (context.state !== 'closed') {
              const oscillator2 = context.createOscillator();
              const gainNode2 = context.createGain();
              oscillator2.type = 'sine';
              oscillator2.frequency.setValueAtTime(987.77, context.currentTime); // B5
              gainNode2.gain.setValueAtTime(volume * 0.8, context.currentTime);
              gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
              oscillator2.connect(gainNode2);
              gainNode2.connect(context.destination);
              oscillator2.start();
              oscillator2.stop(context.currentTime + 0.2);
            }
          }, 120);
          break;
          
        case 'click':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1046.5, context.currentTime); // C6
          gainNode.gain.setValueAtTime(volume * 0.3, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.05);
          break;
          
        case 'hover':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(1318.51, context.currentTime); // E6
          gainNode.gain.setValueAtTime(volume * 0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.03);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.03);
          break;
          
        case 'complete':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
          oscillator.frequency.exponentialRampToValueAtTime(783.99, context.currentTime + 0.1); // G5
          gainNode.gain.setValueAtTime(volume * 0.6, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.3);
          
          // Add a second tone after a short delay
          setTimeout(() => {
            if (context.state !== 'closed') {
              const oscillator2 = context.createOscillator();
              const gainNode2 = context.createGain();
              oscillator2.type = 'sine';
              oscillator2.frequency.setValueAtTime(1046.5, context.currentTime); // C6
              gainNode2.gain.setValueAtTime(volume * 0.7, context.currentTime);
              gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
              oscillator2.connect(gainNode2);
              gainNode2.connect(context.destination);
              oscillator2.start();
              oscillator2.stop(context.currentTime + 0.4);
            }
          }, 150);
          break;
          
        case 'warning':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(415.3, context.currentTime); // G#4
          oscillator.frequency.exponentialRampToValueAtTime(392, context.currentTime + 0.2); // G4
          gainNode.gain.setValueAtTime(volume * 0.5, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.3);
          break;
      }
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  }, [audioContexts, soundEnabled, volume]);

  // Initialize sound system by playing silent sound to enable audio on iOS/Safari
  const initializeSoundSystem = useCallback(() => {
    if (soundEnabled) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Set volume to 0 (silent)
      gainNode.gain.setValueAtTime(0, context.currentTime);
      
      oscillator.start();
      oscillator.stop(context.currentTime + 0.001);
      
      console.log('Apple-inspired sound effects enabled');
    }
  }, [soundEnabled]);

  // Log status on mount
  useEffect(() => {
    if (soundEnabled) {
      console.log('Apple-inspired sound effects initialized');
    }
  }, [soundEnabled]);
  
  return {
    playSound,
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    initializeSoundSystem
  };
}

export default useSoundEffects;