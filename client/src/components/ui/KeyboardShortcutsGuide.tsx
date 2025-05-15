import React, { useState } from 'react';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
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
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShortcutCategory | 'all'>('all');
  
  // Get shortcuts based on active tab
  const shortcuts = activeTab === 'all' 
    ? getAllShortcuts() 
    : getShortcutsByCategory(activeTab as ShortcutCategory);
  
  // Group shortcuts by category for better organization
  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<ShortcutCategory, KeyboardShortcut[]>);
  
  // Render a group of shortcuts
  const renderShortcutGroup = (
    category: ShortcutCategory, 
    shortcuts: KeyboardShortcut[]
  ) => {
    const getCategoryIcon = (cat: ShortcutCategory) => {
      switch (cat) {
        case 'navigation': return <Navigation className="h-4 w-4" />;
        case 'search': return <Search className="h-4 w-4" />;
        case 'content': return <BookOpen className="h-4 w-4" />;
        case 'accessibility': return <Settings className="h-4 w-4" />;
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
        
        <div className="grid grid-cols-1 gap-2">
          {shortcuts.map((shortcut) => (
            <div 
              key={shortcut.id} 
              className="flex justify-between items-center py-2 px-3 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
                {formatShortcutKey(shortcut)}
              </code>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-2 ${className}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
              }
            }}
          >
            <Keyboard className="h-4 w-4" />
            <span>Keyboard Shortcuts</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full max-w-md sm:max-w-lg">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </SheetTitle>
          <SheetDescription>
            Use these keyboard shortcuts to navigate the platform more efficiently.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ShortcutCategory | 'all')}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            {activeTab === 'all' ? (
              Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
                renderShortcutGroup(category as ShortcutCategory, shortcuts)
              ))
            ) : (
              shortcuts.length > 0 ? (
                renderShortcutGroup(activeTab as ShortcutCategory, shortcuts)
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <HelpCircle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No shortcuts available for this category.
                  </p>
                </div>
              )
            )}
          </div>
        </Tabs>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Keyboard shortcuts can be enabled or disabled in the accessibility settings.
          </p>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default KeyboardShortcutsGuide;