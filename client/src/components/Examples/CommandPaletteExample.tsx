import React, { useEffect } from 'react';
import { useRegisterCommandActions } from '@/hooks/use-command-palette';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Lightbulb, 
  Star,
  Coffee,
  FileCheck,
  Trash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * CommandPaletteExample - Component that demonstrates how to add commands to the CommandPalette
 * 
 * This component registers commands with the CommandPalette via the useRegisterCommandActions hook.
 * When the component unmounts, the commands are automatically removed from the palette.
 */
const CommandPaletteExample: React.FC = () => {
  const { toast } = useToast();

  // Define commands related to this component
  const exampleActions = [
    {
      id: 'example-rocket',
      name: 'Launch Rocket',
      description: 'Start a new rocket launch sequence',
      icon: <Rocket className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'Rocket launched!',
          description: 'Your rocket has been successfully launched 🚀',
        });
        close();
      },
      section: 'actions',
      shortcut: ['r', 'l'],
      keywords: ['rocket', 'launch', 'space', 'start'],
      badge: 'popular',
    },
    {
      id: 'example-idea',
      name: 'Create Idea',
      description: 'Add a new idea to your collection',
      icon: <Lightbulb className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'New idea created',
          description: 'Your brilliant idea has been saved',
        });
        close();
      },
      section: 'actions',
      shortcut: ['i', 'c'],
      keywords: ['idea', 'create', 'new', 'lightbulb'],
    },
    {
      id: 'example-favorite',
      name: 'Add to Favorites',
      description: 'Add current item to your favorites',
      icon: <Star className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'Added to favorites',
          description: 'Item has been added to your favorites',
        });
        close();
      },
      section: 'actions',
      shortcut: ['f', 'a'],
      keywords: ['favorite', 'star', 'like', 'bookmark'],
      badge: 'new',
    },
    {
      id: 'example-break',
      name: 'Take a Coffee Break',
      description: 'Set a reminder for a coffee break',
      icon: <Coffee className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'Coffee break scheduled',
          description: 'We\'ll remind you in 25 minutes',
        });
        close();
      },
      section: 'actions',
      shortcut: ['c', 'b'],
      keywords: ['coffee', 'break', 'rest', 'reminder'],
    },
    {
      id: 'example-complete-task',
      name: 'Mark Task as Complete',
      description: 'Mark the current task as finished',
      icon: <FileCheck className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'Task completed',
          description: 'Your task has been marked as complete',
        });
        close();
      },
      section: 'actions',
      shortcut: ['t', 'c'],
      keywords: ['task', 'complete', 'finish', 'done'],
    },
    {
      id: 'example-trash',
      name: 'Empty Trash',
      description: 'Remove all items from the trash',
      icon: <Trash className="h-4 w-4" />,
      action: (close) => { 
        toast({
          title: 'Trash emptied',
          description: 'All items have been permanently removed',
          variant: 'destructive',
        });
        close();
      },
      section: 'actions',
      shortcut: ['e', 't'],
      keywords: ['trash', 'delete', 'remove', 'clean'],
    },
  ];

  // Register commands with the CommandPalette
  useRegisterCommandActions(exampleActions);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Command Palette Example</h2>
      <p className="text-muted-foreground">
        This component has registered 6 example commands with the CommandPalette.
        Press <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted">⌘K</kbd> or 
        <kbd className="px-1.5 py-0.5 text-xs rounded border bg-muted ml-1">Ctrl+K</kbd> to open 
        the command palette and see them.
      </p>
      
      <div className="flex flex-wrap gap-2 pt-2">
        <Button onClick={() => toast({ title: 'Rocket launched!', description: 'Your rocket has been successfully launched 🚀' })}>
          <Rocket className="h-4 w-4 mr-2" /> Launch Rocket
        </Button>
        <Button variant="outline" onClick={() => toast({ title: 'New idea created', description: 'Your brilliant idea has been saved' })}>
          <Lightbulb className="h-4 w-4 mr-2" /> Create Idea
        </Button>
        <Button variant="secondary" onClick={() => toast({ title: 'Coffee break scheduled', description: 'We\'ll remind you in 25 minutes' })}>
          <Coffee className="h-4 w-4 mr-2" /> Take a Break
        </Button>
      </div>
    </div>
  );
};

export default CommandPaletteExample;