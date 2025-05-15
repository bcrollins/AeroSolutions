import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger,
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getAllShortcuts,
  getShortcutsByCategory,
  formatShortcutKey,
  KeyboardShortcut
} from '@/utils/keyboardShortcuts';
import { Keyboard, Search, Navigation, BookOpen, Settings, HelpCircle } from 'lucide-react';

// Define the category type to match the utility
type ShortcutCategory = 'navigation' | 'content' | 'accessibility' | 'ui' | 'search';

interface KeyboardShortcutsGuideProps {
  trigger?: React.ReactNode;
  className?: string;
}

const KeyboardShortcutsGuide: React.FC<KeyboardShortcutsGuideProps> = ({ 
  trigger,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ShortcutCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  
  // Initialize categories and shortcuts
  useEffect(() => {
    // Get all shortcuts
    const allShortcuts = getAllShortcuts();
    setShortcuts(allShortcuts);
    
    // Extract unique categories
    const uniqueCategories = Array.from(
      new Set(allShortcuts.map(s => s.category))
    ) as ShortcutCategory[];
    
    setCategories(uniqueCategories);
  }, [open]);
  
  // Listen for the custom event to open the guide
  useEffect(() => {
    const handleShowShortcutsGuide = () => setOpen(true);
    window.addEventListener('show-shortcuts-guide', handleShowShortcutsGuide);
    
    return () => {
      window.removeEventListener('show-shortcuts-guide', handleShowShortcutsGuide);
    };
  }, []);
  
  // Render shortcut list
  const renderShortcutsByCategory = (category: ShortcutCategory) => {
    const categoryShortcuts = getShortcutsByCategory(category);
    
    const getCategoryIcon = (cat: ShortcutCategory) => {
      switch (cat) {
        case 'navigation': return <Navigation className="h-4 w-4" />;
        case 'search': return <Search className="h-4 w-4" />;
        case 'content': return <BookOpen className="h-4 w-4" />;
        case 'accessibility': return <Settings className="h-4 w-4" />;
        case 'ui': return <HelpCircle className="h-4 w-4" />;
        default: return <Keyboard className="h-4 w-4" />;
      }
    };
    
    const getCategoryLabel = (cat: ShortcutCategory) => {
      switch (cat) {
        case 'navigation': return 'Navigation';
        case 'search': return 'Search';
        case 'content': return 'Content';
        case 'accessibility': return 'Accessibility';
        case 'ui': return 'User Interface';
        default: return String(cat).charAt(0).toUpperCase() + String(cat).slice(1);
      }
    };
    
    return (
      <div className="mb-6" key={category}>
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-primary">
          {getCategoryIcon(category)}
          <h3>{getCategoryLabel(category)}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categoryShortcuts.map((shortcut) => (
            <div 
              key={shortcut.id} 
              className="flex items-center justify-between p-2 rounded-md bg-secondary/30"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{shortcut.description}</div>
              </div>
              <kbd className="px-2 py-1 text-xs font-mono rounded bg-secondary text-secondary-foreground">
                {formatShortcutKey(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render all shortcuts
  const renderAllShortcuts = () => {
    return categories.map(category => renderShortcutsByCategory(category));
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="icon"
            className={className}
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </SheetTitle>
          <SheetDescription>
            Master the platform with these keyboard shortcuts for faster navigation and productivity.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="all">All Shortcuts</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            {renderAllShortcuts()}
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category} value={category}>
              {renderShortcutsByCategory(category)}
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6 text-sm text-secondary-foreground/70">
          <p className="mb-2">
            <span className="font-medium">Tip:</span> Press{' '}
            <kbd className="px-1 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">?</kbd>{' '}
            at any time to open this shortcuts guide.
          </p>
          <div className="text-xs mt-4 border-t border-secondary/20 pt-4">
            <p>
              Customize your keyboard shortcuts in Settings &rarr; Accessibility &rarr; Keyboard.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default KeyboardShortcutsGuide;