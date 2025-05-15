import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import design from '@/styles/design-system';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('light');
  
  useEffect(() => {
    // Check for theme in localStorage or default to system
    const savedTheme = localStorage.getItem('rxai-theme') as Theme | null;
    const initialTheme = savedTheme || 'system';
    setTheme(initialTheme);
    applyTheme(initialTheme);
    
    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const isDark = 
      newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('rxai-theme', newTheme);
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  return (
    <button 
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        transition: `all ${design.animations.durations.normal} ${design.animations.easings.default}`
      }}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-600" />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
      <span className="text-sm font-medium hidden md:inline">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;