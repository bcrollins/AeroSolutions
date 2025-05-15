import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUniversalAccess, FaFont, FaTextHeight, FaTimes, FaAdjust, FaRegLightbulb } from 'react-icons/fa';
import { MdSpaceBar, MdOutlineLineWeight, MdInvertColors } from 'react-icons/md';

// Types
type TextSize = 'normal' | 'large' | 'x-large';
type ContrastMode = 'normal' | 'high-contrast' | 'inverted';
type AnimationSetting = 'normal' | 'reduced' | 'none';
type LineSpacing = 'normal' | 'increased' | 'double';
type FontType = 'normal' | 'dyslexic' | 'sans-serif';

export interface AccessibilitySettings {
  textSize: TextSize;
  contrastMode: ContrastMode;
  reducedAnimations: AnimationSetting;
  lineSpacing: LineSpacing;
  fontType: FontType;
  highlightLinks: boolean;
  highlightButtons: boolean;
  focusIndicators: boolean;
}

// Default settings
const defaultSettings: AccessibilitySettings = {
  textSize: 'normal',
  contrastMode: 'normal',
  reducedAnimations: 'normal',
  lineSpacing: 'normal',
  fontType: 'normal',
  highlightLinks: false,
  highlightButtons: false,
  focusIndicators: true,
};

// Context
type AccessibilityContextType = {
  settings: AccessibilitySettings;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  isOpen: false,
  setOpen: () => {},
  updateSetting: () => {},
  resetSettings: () => {},
});

// Hook to use accessibility settings
export const useAccessibility = () => useContext(AccessibilityContext);

// Provider component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage if available
    const savedSettings = localStorage.getItem('rxai_a11y_settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing accessibility settings', e);
      }
    }
    return defaultSettings;
  });
  
  const [isOpen, setOpen] = useState(false);

  // Update a single setting
  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('rxai_a11y_settings', JSON.stringify(settings));
    
    // Apply settings to document body as data attributes
    const body = document.body;
    body.setAttribute('data-text-size', settings.textSize);
    body.setAttribute('data-contrast', settings.contrastMode);
    body.setAttribute('data-animations', settings.reducedAnimations);
    body.setAttribute('data-line-spacing', settings.lineSpacing);
    body.setAttribute('data-font-type', settings.fontType);
    body.setAttribute('data-highlight-links', settings.highlightLinks.toString());
    body.setAttribute('data-highlight-buttons', settings.highlightButtons.toString());
    body.setAttribute('data-focus-indicators', settings.focusIndicators.toString());
    
    // Apply CSS variables
    switch (settings.textSize) {
      case 'large':
        body.style.setProperty('--a11y-font-scale', '1.2');
        break;
      case 'x-large':
        body.style.setProperty('--a11y-font-scale', '1.4');
        break;
      default:
        body.style.setProperty('--a11y-font-scale', '1');
    }
    
    switch (settings.lineSpacing) {
      case 'increased':
        body.style.setProperty('--a11y-line-height', '1.5');
        break;
      case 'double':
        body.style.setProperty('--a11y-line-height', '2');
        break;
      default:
        body.style.setProperty('--a11y-line-height', 'normal');
    }
    
    // Add font-family if needed
    if (settings.fontType === 'dyslexic') {
      body.style.setProperty('--a11y-font-family', '"Open Dyslexic", sans-serif');
    } else if (settings.fontType === 'sans-serif') {
      body.style.setProperty('--a11y-font-family', 'Arial, sans-serif');
    } else {
      body.style.setProperty('--a11y-font-family', 'inherit');
    }
    
    // Add special CSS classes
    if (settings.contrastMode === 'high-contrast') {
      body.classList.add('a11y-high-contrast');
      body.classList.remove('a11y-inverted');
    } else if (settings.contrastMode === 'inverted') {
      body.classList.add('a11y-inverted');
      body.classList.remove('a11y-high-contrast');
    } else {
      body.classList.remove('a11y-high-contrast', 'a11y-inverted');
    }
    
    if (settings.highlightLinks) {
      body.classList.add('a11y-highlight-links');
    } else {
      body.classList.remove('a11y-highlight-links');
    }
    
    if (settings.highlightButtons) {
      body.classList.add('a11y-highlight-buttons');
    } else {
      body.classList.remove('a11y-highlight-buttons');
    }
    
    if (settings.focusIndicators) {
      body.classList.add('a11y-focus-indicators');
    } else {
      body.classList.remove('a11y-focus-indicators');
    }
    
    if (settings.reducedAnimations !== 'normal') {
      body.classList.add('a11y-reduced-animations');
      if (settings.reducedAnimations === 'none') {
        body.classList.add('a11y-no-animations');
      } else {
        body.classList.remove('a11y-no-animations');
      }
    } else {
      body.classList.remove('a11y-reduced-animations', 'a11y-no-animations');
    }
    
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, isOpen, setOpen, updateSetting, resetSettings }}>
      {children}
      <AccessibilityPanelUI />
      <AccessibilityToggleButton />
    </AccessibilityContext.Provider>
  );
};

// Accessibility Panel UI
const AccessibilityPanelUI = () => {
  const { settings, isOpen, setOpen, updateSetting, resetSettings } = useAccessibility();
  
  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      x: 300,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaUniversalAccess className="mr-2 text-blue-600" />
                  Accessibility
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Close accessibility panel"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Text Size */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <FaTextHeight className="mr-2 text-blue-600" />
                    Text Size
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSetting('textSize', 'normal')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.textSize === 'normal' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting('textSize', 'large')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.textSize === 'large' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Large
                    </button>
                    <button
                      onClick={() => updateSetting('textSize', 'x-large')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.textSize === 'x-large' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Extra Large
                    </button>
                  </div>
                </div>
                
                {/* Contrast Mode */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <FaAdjust className="mr-2 text-blue-600" />
                    Contrast
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSetting('contrastMode', 'normal')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.contrastMode === 'normal' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting('contrastMode', 'high-contrast')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.contrastMode === 'high-contrast' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      High Contrast
                    </button>
                    <button
                      onClick={() => updateSetting('contrastMode', 'inverted')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.contrastMode === 'inverted' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Inverted
                    </button>
                  </div>
                </div>
                
                {/* Motion */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <FaRegLightbulb className="mr-2 text-blue-600" />
                    Animations
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSetting('reducedAnimations', 'normal')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.reducedAnimations === 'normal' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting('reducedAnimations', 'reduced')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.reducedAnimations === 'reduced' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Reduced
                    </button>
                    <button
                      onClick={() => updateSetting('reducedAnimations', 'none')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.reducedAnimations === 'none' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      None
                    </button>
                  </div>
                </div>
                
                {/* Line Spacing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <MdOutlineLineWeight className="mr-2 text-blue-600" />
                    Line Spacing
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSetting('lineSpacing', 'normal')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.lineSpacing === 'normal' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting('lineSpacing', 'increased')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.lineSpacing === 'increased' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Increased
                    </button>
                    <button
                      onClick={() => updateSetting('lineSpacing', 'double')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.lineSpacing === 'double' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Double
                    </button>
                  </div>
                </div>
                
                {/* Font */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                    <FaFont className="mr-2 text-blue-600" />
                    Font Type
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateSetting('fontType', 'normal')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.fontType === 'normal' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting('fontType', 'sans-serif')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.fontType === 'sans-serif' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Sans-serif
                    </button>
                    <button
                      onClick={() => updateSetting('fontType', 'dyslexic')}
                      className={`px-4 py-2 rounded-lg ${
                        settings.fontType === 'dyslexic' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      Dyslexic
                    </button>
                  </div>
                </div>
                
                {/* Additional Settings Toggles */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox" 
                        id="highlight-links"
                        checked={settings.highlightLinks}
                        onChange={(e) => updateSetting('highlightLinks', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="highlight-links" className="ml-2 text-gray-700">
                        Highlight Links
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox" 
                        id="highlight-buttons"
                        checked={settings.highlightButtons}
                        onChange={(e) => updateSetting('highlightButtons', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="highlight-buttons" className="ml-2 text-gray-700">
                        Highlight Buttons
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox" 
                        id="focus-indicators"
                        checked={settings.focusIndicators}
                        onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="focus-indicators" className="ml-2 text-gray-700">
                        Enhanced Focus Indicators
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Reset Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={resetSettings}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Reset to Default Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Toggle button
const AccessibilityToggleButton = () => {
  const { setOpen } = useAccessibility();
  
  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-6 left-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Open accessibility options"
    >
      <FaUniversalAccess className="h-6 w-6" />
    </button>
  );
};

// CSS Utility class to apply to the <html> element
export const accessibilityCss = `
  /* Base accessibility variables */
  :root {
    --a11y-font-scale: 1;
    --a11y-line-height: normal;
    --a11y-font-family: inherit;
  }
  
  /* Apply scaled font sizes */
  html[data-text-size] {
    font-size: calc(100% * var(--a11y-font-scale));
  }
  
  /* Apply line spacing */
  html[data-line-spacing] body {
    line-height: var(--a11y-line-height);
  }
  
  /* Apply font changes */
  html[data-font-type] body {
    font-family: var(--a11y-font-family);
  }
  
  /* High contrast mode */
  body.a11y-high-contrast {
    color: #fff !important;
    background: #000 !important;
  }
  
  body.a11y-high-contrast * {
    background-color: #000 !important;
    color: #fff !important;
    border-color: #fff !important;
  }
  
  body.a11y-high-contrast a,
  body.a11y-high-contrast button:not([disabled]) {
    color: #ffff00 !important;
    text-decoration: underline !important;
  }
  
  body.a11y-high-contrast img,
  body.a11y-high-contrast video {
    filter: grayscale(100%) contrast(120%);
  }
  
  /* Inverted colors */
  body.a11y-inverted {
    filter: invert(100%) hue-rotate(180deg);
  }
  
  body.a11y-inverted img,
  body.a11y-inverted video {
    filter: invert(100%) hue-rotate(180deg);
  }
  
  /* Highlight links */
  body.a11y-highlight-links a {
    text-decoration: underline !important;
    font-weight: bold !important;
    color: #0000ff !important;
    background-color: #ffff00 !important;
    outline: 2px solid #ffff00 !important;
  }
  
  /* Highlight buttons */
  body.a11y-highlight-buttons button,
  body.a11y-highlight-buttons [role="button"] {
    outline: 3px solid #ff0000 !important;
    background-color: #ffff00 !important;
    color: #000000 !important;
    font-weight: bold !important;
  }
  
  /* Focus indicators */
  body.a11y-focus-indicators *:focus {
    outline: 3px solid #0066cc !important;
    outline-offset: 2px !important;
  }
  
  /* Reduced animations */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-delay: 0s !important;
      animation-delay: 0s !important;
    }
  }
  
  body.a11y-reduced-animations * {
    transition-duration: 0.1s !important;
    animation-duration: 0.1s !important;
  }
  
  body.a11y-no-animations * {
    transition-property: none !important;
    animation: none !important;
    transition: none !important;
  }
`;

/*
// Example usage
import { AccessibilityProvider, useAccessibility } from '@/components/UI/AccessibilityPanel';

// In your app root
<AccessibilityProvider>
  <App />
</AccessibilityProvider>

// Optional: Add CSS (in a global CSS file or using a CSS-in-JS solution)
const GlobalStyles = createGlobalStyle\`
  ${accessibilityCss}
\`;
*/