import { useCallback, useEffect, useState } from 'react';
import { playSoundEffect, SoundEffectType } from '@/utils/soundEffectsUtils';

/**
 * Apple-inspired sound effects hook
 * 
 * This hook provides a simple way to play Apple-like sound effects
 * throughout the application while respecting user preferences.
 * 
 * Example usage:
 * ```
 * const { playSound, isMuted, toggleMute } = useSoundEffects();
 * 
 * // Play a sound when a button is clicked
 * const handleClick = () => {
 *   playSound('click');
 *   // Do something...
 * };
 * ```
 */
export const useSoundEffects = () => {
  // Track mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    // Check local storage for saved preference
    const saved = localStorage.getItem('sound-effects-muted');
    return saved === 'true';
  });
  
  // Save mute state to local storage
  useEffect(() => {
    localStorage.setItem('sound-effects-muted', String(isMuted));
  }, [isMuted]);
  
  // Toggle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // Play a sound if not muted
  const playSound = useCallback((type: SoundEffectType) => {
    if (!isMuted) {
      playSoundEffect(type);
    }
  }, [isMuted]);
  
  return {
    playSound,
    isMuted,
    toggleMute
  };
};

export default useSoundEffects;