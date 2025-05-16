import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

// Sound types
export type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'notification' 
  | 'hover' 
  | 'navigation' 
  | 'focus' 
  | 'typing' 
  | 'complete' 
  | 'screenshot';

// Interface for sound settings
interface SoundSettings {
  enabled: boolean;
  volume: number;
  appleSound: boolean;
}

// Sound context to share settings across components
const defaultSoundSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
  appleSound: true
};

/**
 * Hook for using Apple-inspired sound effects throughout the application
 * 
 * Features:
 * - High-quality, subtle sound effects
 * - Volume control
 * - Enable/disable functionality
 * - Sound grouping to avoid overlapping sounds
 * - Accessibility integration
 */
export const useSoundEffects = () => {
  const theme = useContext(ThemeContext);
  const reduceMotion = theme?.preferences?.reduceMotion;
  const soundsDisabled = reduceMotion === true;
  
  const [settings, setSettings] = useState<SoundSettings>(() => {
    // Try to load settings from localStorage
    const storedSettings = localStorage.getItem('sound-settings');
    
    if (storedSettings) {
      try {
        return { ...defaultSoundSettings, ...JSON.parse(storedSettings) };
      } catch (e) {
        console.error('Failed to parse sound settings:', e);
      }
    }
    
    return defaultSoundSettings;
  });
  
  // Sound effect URLs
  const soundUrls: Record<SoundType, string> = {
    click: '/sounds/apple-click.mp3',
    success: '/sounds/apple-success.mp3',
    error: '/sounds/apple-error.mp3',
    notification: '/sounds/apple-notification.mp3',
    hover: '/sounds/apple-hover.mp3',
    navigation: '/sounds/apple-navigation.mp3',
    focus: '/sounds/apple-focus.mp3',
    typing: '/sounds/apple-typing.mp3',
    complete: '/sounds/apple-complete.mp3',
    screenshot: '/sounds/apple-screenshot.mp3'
  };
  
  // Preload sounds
  useEffect(() => {
    if (!settings.enabled) return;
    
    // Preload commonly used sounds
    const commonSounds: SoundType[] = ['click', 'navigation', 'success', 'error', 'notification'];
    
    commonSounds.forEach(soundType => {
      const audio = new Audio(soundUrls[soundType]);
      audio.preload = 'auto';
      
      // Just trigger a load - we don't need to play it
      audio.load();
    });
  }, [settings.enabled, soundUrls]);
  
  // Track last sound play time to avoid sound overlapping
  const lastPlayedTime = useRef<Record<SoundType, number>>({
    click: 0,
    success: 0,
    error: 0,
    notification: 0,
    hover: 0,
    navigation: 0,
    focus: 0,
    typing: 0,
    complete: 0,
    screenshot: 0
  });
  
  // Track if sounds are currently playing to avoid overlapping
  const isPlaying = useRef<Record<SoundType, boolean>>({
    click: false,
    success: false,
    error: false,
    notification: false,
    hover: false,
    navigation: false,
    focus: false,
    typing: false,
    complete: false,
    screenshot: false
  });
  
  // Play a sound with debouncing
  const playSound = useCallback(
    (type: SoundType, forcePlay: boolean = false) => {
      // Check if sounds are enabled in both settings and accessibility
      const soundsEnabled = settings.enabled && !soundsDisabled;
      
      if (!soundsEnabled && !forcePlay) return;
      
      // Don't play sounds that were just played
      const now = Date.now();
      const minTimeBetweenSounds = 100; // ms
      
      if (
        !forcePlay &&
        now - lastPlayedTime.current[type] < minTimeBetweenSounds
      ) {
        return;
      }
      
      // Don't play if another instance of this sound is already playing
      if (isPlaying.current[type] && !forcePlay) return;
      
      try {
        const audio = new Audio(soundUrls[type]);
        audio.volume = settings.volume;
        isPlaying.current[type] = true;
        
        // Update last played time
        lastPlayedTime.current[type] = now;
        
        // Play the sound
        audio.play()
          .then(() => {
            // Mark as not playing when done
            audio.addEventListener('ended', () => {
              isPlaying.current[type] = false;
            });
          })
          .catch(e => {
            // Autoplay might be blocked, gracefully handle the error
            console.warn(`Sound playback failed: ${e.message}`);
            isPlaying.current[type] = false;
          });
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [settings.enabled, settings.volume, soundsDisabled, soundUrls]
  );
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save to localStorage
      localStorage.setItem('sound-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Toggle sound effects
  const toggleSounds = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
    
    // Play feedback when enabling
    if (!settings.enabled) {
      playSound('success', true);
    }
  }, [settings.enabled, updateSettings, playSound]);
  
  // Set volume
  const setVolume = useCallback(
    (volume: number) => {
      // Ensure volume is between 0 and 1
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      updateSettings({ volume: normalizedVolume });
      
      // Play feedback at new volume
      playSound('click', true);
    },
    [updateSettings, playSound]
  );
  
  // Expose the API
  return {
    playSound,
    toggleSounds,
    setVolume,
    settings,
    updateSettings
  };
};