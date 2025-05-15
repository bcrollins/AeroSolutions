import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('rxai-theme') as Theme;
      return savedTheme || 'system';
    }
    return 'system';
  });

  // Update body class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    localStorage.setItem('rxai-theme', theme);
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    
    // Listen for system theme changes if in system mode
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        root.classList.toggle('dark', e.matches);
      }
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  // Determine which icon to show based on the active theme
  const getIcon = () => {
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemDark ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />;
    }
    return theme === 'dark' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md p-2 bg-transparent text-gray-200 hover:bg-white/10 transition-colors"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;