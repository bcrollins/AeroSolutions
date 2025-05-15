import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUniversalAccess, 
  FaFont, 
  FaAdjust, 
  FaTimes, 
  FaPalette,
  FaEye, 
  FaMoon, 
  FaSun, 
  FaMousePointer,
  FaKeyboard,
  FaHeadphones,
  FaCheck
} from 'react-icons/fa';
import { useNotification } from './NotificationSystem';

// Types for accessibility settings
interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large';
  highContrast: boolean;
  reducedMotion: boolean;
  colorScheme: 'system' | 'light' | 'dark';
  dyslexicFont: boolean;
  cursorSize: 'normal' | 'large' | 'x-large';
  keyboardNavigationEnabled: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  colorScheme: 'system',
  dyslexicFont: false,
  cursorSize: 'normal',
  keyboardNavigationEnabled: false,
  screenReaderOptimized: false
};

// Create the context
const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// Provider component
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Load settings from localStorage
  const loadSettings = (): AccessibilitySettings => {
    if (typeof window === 'undefined') return defaultSettings;
    
    const savedSettings = localStorage.getItem('rxai-accessibility-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }
    return defaultSettings;
  };
  
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  
  // Load settings on initial mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rxai-accessibility-settings', JSON.stringify(settings));
    }
    
    // Apply settings to the document
    applySettings(settings);
  }, [settings]);
  
  // Apply settings to the document
  const applySettings = (settings: AccessibilitySettings) => {
    // Apply font size
    document.documentElement.classList.remove('text-size-normal', 'text-size-large', 'text-size-x-large');
    document.documentElement.classList.add(`text-size-${settings.fontSize}`);
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply color scheme
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    if (settings.colorScheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else if (settings.colorScheme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    }
    
    // Apply dyslexic font
    if (settings.dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
    
    // Apply cursor size
    document.documentElement.classList.remove('cursor-normal', 'cursor-large', 'cursor-x-large');
    document.documentElement.classList.add(`cursor-${settings.cursorSize}`);
    
    // Apply keyboard navigation
    if (settings.keyboardNavigationEnabled) {
      document.documentElement.classList.add('keyboard-navigation');
    } else {
      document.documentElement.classList.remove('keyboard-navigation');
    }
    
    // Apply screen reader optimizations
    if (settings.screenReaderOptimized) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }
  };
  
  // Update settings
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };
  
  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// Hook for using accessibility settings
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

// Accessibility Panel Component
export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const { showNotification } = useNotification();
  
  const handleSettingsChange = (newSettings: Partial<AccessibilitySettings>) => {
    updateSettings(newSettings);
    
    // Show notification for certain settings
    if ('fontSize' in newSettings) {
      showNotification({
        title: 'Font Size Updated',
        message: `Text size has been changed to ${newSettings.fontSize}`,
        type: 'info',
        duration: 3000
      });
    } else if ('colorScheme' in newSettings) {
      showNotification({
        title: 'Color Scheme Updated',
        message: `Color scheme has been changed to ${newSettings.colorScheme} mode`,
        type: 'info',
        duration: 3000
      });
    }
  };
  
  const handleReset = () => {
    resetSettings();
    showNotification({
      title: 'Settings Reset',
      message: 'Accessibility settings have been reset to defaults',
      type: 'info',
      duration: 3000
    });
  };
  
  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
        aria-label="Open accessibility settings"
      >
        <FaUniversalAccess className="h-6 w-6" />
      </button>
      
      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaUniversalAccess className="mr-2 text-blue-600 dark:text-blue-500" />
                  Accessibility Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Close accessibility panel"
                >
                  <FaTimes className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Panel Content */}
              <div className="p-4 space-y-6">
                {/* Font Size */}
                <div>
                  <h3 className="text-base font-medium mb-2 flex items-center">
                    <FaFont className="mr-2 text-blue-600 dark:text-blue-500" />
                    Text Size
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSettingsChange({ fontSize: 'normal' })}
                      className={`px-3 py-2 rounded border ${
                        settings.fontSize === 'normal'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => handleSettingsChange({ fontSize: 'large' })}
                      className={`px-3 py-2 rounded border ${
                        settings.fontSize === 'large'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{ fontSize: '1.1em' }}
                    >
                      Large
                    </button>
                    <button
                      onClick={() => handleSettingsChange({ fontSize: 'x-large' })}
                      className={`px-3 py-2 rounded border ${
                        settings.fontSize === 'x-large'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{ fontSize: '1.2em' }}
                    >
                      X-Large
                    </button>
                  </div>
                </div>
                
                {/* Color Scheme */}
                <div>
                  <h3 className="text-base font-medium mb-2 flex items-center">
                    <FaPalette className="mr-2 text-blue-600 dark:text-blue-500" />
                    Color Scheme
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSettingsChange({ colorScheme: 'system' })}
                      className={`px-3 py-2 rounded border flex items-center justify-center ${
                        settings.colorScheme === 'system'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <FaAdjust className="mr-1" />
                      System
                    </button>
                    <button
                      onClick={() => handleSettingsChange({ colorScheme: 'light' })}
                      className={`px-3 py-2 rounded border flex items-center justify-center ${
                        settings.colorScheme === 'light'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <FaSun className="mr-1" />
                      Light
                    </button>
                    <button
                      onClick={() => handleSettingsChange({ colorScheme: 'dark' })}
                      className={`px-3 py-2 rounded border flex items-center justify-center ${
                        settings.colorScheme === 'dark'
                          ? 'bg-blue-100 border-blue-500 text-blue-800'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <FaMoon className="mr-1" />
                      Dark
                    </button>
                  </div>
                </div>
                
                {/* Toggle Options */}
                <div className="space-y-4">
                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <FaEye className="mr-2 text-blue-600 dark:text-blue-500" />
                      <span>High Contrast</span>
                    </label>
                    <button
                      onClick={() => handleSettingsChange({ highContrast: !settings.highContrast })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={settings.highContrast}
                      aria-label="Toggle high contrast"
                    >
                      <motion.div
                        className="bg-white w-4 h-4 rounded-full shadow-md"
                        animate={{ 
                          x: settings.highContrast ? 24 : 0 
                        }}
                      />
                    </button>
                  </div>
                  
                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <FaMousePointer className="mr-2 text-blue-600 dark:text-blue-500" />
                      <span>Reduced Motion</span>
                    </label>
                    <button
                      onClick={() => handleSettingsChange({ reducedMotion: !settings.reducedMotion })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={settings.reducedMotion}
                      aria-label="Toggle reduced motion"
                    >
                      <motion.div
                        className="bg-white w-4 h-4 rounded-full shadow-md"
                        animate={{ 
                          x: settings.reducedMotion ? 24 : 0 
                        }}
                      />
                    </button>
                  </div>
                  
                  {/* Dyslexic Font */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <FaFont className="mr-2 text-blue-600 dark:text-blue-500" />
                      <span>Dyslexia-friendly Font</span>
                    </label>
                    <button
                      onClick={() => handleSettingsChange({ dyslexicFont: !settings.dyslexicFont })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.dyslexicFont ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={settings.dyslexicFont}
                      aria-label="Toggle dyslexia-friendly font"
                    >
                      <motion.div
                        className="bg-white w-4 h-4 rounded-full shadow-md"
                        animate={{ 
                          x: settings.dyslexicFont ? 24 : 0 
                        }}
                      />
                    </button>
                  </div>
                  
                  {/* Keyboard Navigation */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <FaKeyboard className="mr-2 text-blue-600 dark:text-blue-500" />
                      <span>Enhanced Keyboard Navigation</span>
                    </label>
                    <button
                      onClick={() => handleSettingsChange({ 
                        keyboardNavigationEnabled: !settings.keyboardNavigationEnabled 
                      })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.keyboardNavigationEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={settings.keyboardNavigationEnabled}
                      aria-label="Toggle keyboard navigation"
                    >
                      <motion.div
                        className="bg-white w-4 h-4 rounded-full shadow-md"
                        animate={{ 
                          x: settings.keyboardNavigationEnabled ? 24 : 0 
                        }}
                      />
                    </button>
                  </div>
                  
                  {/* Screen Reader Optimizations */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <FaHeadphones className="mr-2 text-blue-600 dark:text-blue-500" />
                      <span>Screen Reader Optimizations</span>
                    </label>
                    <button
                      onClick={() => handleSettingsChange({ 
                        screenReaderOptimized: !settings.screenReaderOptimized 
                      })}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        settings.screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={settings.screenReaderOptimized}
                      aria-label="Toggle screen reader optimizations"
                    >
                      <motion.div
                        className="bg-white w-4 h-4 rounded-full shadow-md"
                        animate={{ 
                          x: settings.screenReaderOptimized ? 24 : 0 
                        }}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Reset Button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center"
                  >
                    <FaUndo className="mr-2" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
              
              {/* Current Settings Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Settings:</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Font: {settings.fontSize}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Theme: {settings.colorScheme}
                  </span>
                  {settings.highContrast && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <FaCheck className="mr-1 h-2.5 w-2.5" />
                      High Contrast
                    </span>
                  )}
                  {settings.reducedMotion && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <FaCheck className="mr-1 h-2.5 w-2.5" />
                      Reduced Motion
                    </span>
                  )}
                  {settings.dyslexicFont && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                      <FaCheck className="mr-1 h-2.5 w-2.5" />
                      Dyslexic Font
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}