import { useState, useEffect, useCallback } from 'react';

type SoundEffect = 'click' | 'success' | 'error' | 'notification' | 'complete' | 'achievement';

interface SoundEffectOptions {
  volume?: number;
  enabled?: boolean;
}

const soundUrls: Record<SoundEffect, string> = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  notification: '/sounds/notification.mp3',
  complete: '/sounds/complete.mp3',
  achievement: '/sounds/achievement.mp3'
};

export const useSoundEffects = (options: SoundEffectOptions = {}) => {
  const [sounds, setSounds] = useState<Record<SoundEffect, HTMLAudioElement | null>>({
    click: null,
    success: null,
    error: null,
    notification: null,
    complete: null,
    achievement: null
  });
  
  const [isEnabled, setIsEnabled] = useState(options.enabled !== false);
  const [volume, setVolume] = useState(options.volume || 0.5);
  
  // Initialize sound effects
  useEffect(() => {
    const newSounds: Record<SoundEffect, HTMLAudioElement | null> = { ...sounds };
    
    // Create audio elements for each sound effect
    (Object.keys(soundUrls) as SoundEffect[]).forEach(effect => {
      try {
        const audio = new Audio(soundUrls[effect]);
        audio.volume = volume;
        audio.preload = 'auto';
        newSounds[effect] = audio;
      } catch (error) {
        console.error(`Failed to load sound effect: ${effect}`, error);
        newSounds[effect] = null;
      }
    });
    
    setSounds(newSounds);
    
    // Clean up audio elements when component unmounts
    return () => {
      Object.values(newSounds).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);
  
  // Update volume when it changes
  useEffect(() => {
    Object.values(sounds).forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume, sounds]);
  
  // Function to play a sound effect
  const playSound = useCallback((effect: SoundEffect) => {
    if (!isEnabled) return;
    
    const audio = sounds[effect];
    if (audio) {
      // Reset the audio to the beginning if it's already playing
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error(`Error playing sound effect: ${effect}`, error);
      });
    }
  }, [isEnabled, sounds]);
  
  // Toggle sound effects on/off
  const toggleSounds = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);
  
  // Adjust volume (value between 0 and 1)
  const adjustVolume = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);
  
  return {
    playSound,
    toggleSounds,
    isEnabled,
    adjustVolume,
    volume
  };
};

// Export the hook as both named and default
// This ensures backward compatibility with existing code
export default useSoundEffects;