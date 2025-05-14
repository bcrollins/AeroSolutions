import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Fullscreen, 
  SunMoon, 
  Moon, 
  Sun, 
  Maximize, 
  Minimize,
  ZoomIn,
  ZoomOut,
  ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'wouter';

interface ImmersiveReadingModeProps {
  content: string;
  title: string;
  onExit: () => void;
}

const ImmersiveReadingMode: React.FC<ImmersiveReadingModeProps> = ({ 
  content, 
  title,
  onExit 
}) => {
  // Theme states
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [fontSize, setFontSize] = useState(18);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set the theme when changed
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Return to previous theme on exit
    return () => {
      // We don't reset since we want to keep the user's system preference
    };
  }, [theme]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  // Increase font size
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(prevSize => prevSize + 1);
    }
  };

  // Decrease font size
  const decreaseFontSize = () => {
    if (fontSize > 14) {
      setFontSize(prevSize => prevSize - 1);
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'} overflow-auto`}>
      {/* Control bar */}
      <div className={`sticky top-0 z-10 p-4 flex justify-between items-center border-b ${theme === 'dark' ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={decreaseFontSize}
            disabled={fontSize <= 14}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={increaseFontSize}
            disabled={fontSize >= 24}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          {title}
        </h1>
        
        <article 
          className={`prose prose-lg ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}
          style={{ fontSize: `${fontSize}px` }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};

export default ImmersiveReadingMode;