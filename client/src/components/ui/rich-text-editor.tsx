import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Import editor icons
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Indent,
  Outdent,
  Type,
  PanelTop,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RichTextEditorProps {
  /**
   * Initial HTML content
   */
  initialValue?: string;
  
  /**
   * Change callback
   */
  onChange?: (html: string) => void;
  
  /**
   * When the editor loses focus
   */
  onBlur?: () => void;
  
  /**
   * CSS class for styling
   */
  className?: string;
  
  /**
   * Minimum height
   * @default "200px"
   */
  minHeight?: string;
  
  /**
   * Maximum height
   * @default "600px"
   */
  maxHeight?: string;
  
  /**
   * Placeholder text
   * @default "Write something..."
   */
  placeholder?: string;
  
  /**
   * Read-only mode
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Available toolbar buttons
   * @default All buttons enabled
   */
  toolbarButtons?: ToolbarButton[];
  
  /**
   * Show word and character count
   * @default true
   */
  showCounters?: boolean;
  
  /**
   * Toolbar placement
   * @default "top"
   */
  toolbarPlacement?: 'top' | 'bottom';
  
  /**
   * Editor language
   * @default "en"
   */
  language?: 'en' | 'fr' | 'es' | 'de';
  
  /**
   * Auto-focus on mount
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * Compact mode (smaller toolbar)
   * @default false
   */
  compact?: boolean;
  
  /**
   * Label text displayed above the editor
   */
  label?: string;
  
  /**
   * Description text displayed below the editor
   */
  description?: string;
}

type ToolbarButton = 
  | 'bold' 
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'link'
  | 'orderedList'
  | 'unorderedList'
  | 'heading'
  | 'quote'
  | 'code'
  | 'image'
  | 'alignment'
  | 'undo'
  | 'redo'
  | 'indent'
  | 'outdent'
  | 'clear';

// Default toolbar configuration
const DEFAULT_TOOLBAR: ToolbarButton[] = [
  'bold', 'italic', 'underline', 'strikethrough', 'link',
  'unorderedList', 'orderedList', 'heading', 'quote', 'code',
  'image', 'alignment', 'undo', 'redo', 'indent', 'outdent', 'clear'
];

export function RichTextEditor({
  initialValue = '',
  onChange,
  onBlur,
  className,
  minHeight = '200px',
  maxHeight = '600px',
  placeholder = 'Write something...',
  readOnly = false,
  toolbarButtons = DEFAULT_TOOLBAR,
  showCounters = true,
  toolbarPlacement = 'top',
  language = 'en',
  autoFocus = false,
  compact = false,
  label,
  description,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialValue);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [selection, setSelection] = useState<Range | null>(null);
  
  // Localized strings based on language
  const strings = {
    en: {
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strikethrough: 'Strikethrough',
      link: 'Link',
      unorderedList: 'Bullet List',
      orderedList: 'Numbered List',
      heading: 'Heading',
      quote: 'Quote',
      code: 'Code',
      image: 'Image',
      alignment: 'Alignment',
      undo: 'Undo',
      redo: 'Redo',
      indent: 'Indent',
      outdent: 'Outdent',
      clear: 'Clear Formatting',
      words: 'words',
      characters: 'characters',
      insertLink: 'Insert Link',
      insertImage: 'Insert Image',
      url: 'URL',
      text: 'Text',
      alt: 'Alt Text',
      cancel: 'Cancel',
      insert: 'Insert',
      h1: 'Heading 1',
      h2: 'Heading 2',
      h3: 'Heading 3',
      alignLeft: 'Align Left',
      alignCenter: 'Align Center',
      alignRight: 'Align Right',
    },
    fr: {
      bold: 'Gras',
      italic: 'Italique',
      underline: 'Souligner',
      strikethrough: 'Barré',
      link: 'Lien',
      unorderedList: 'Liste à puces',
      orderedList: 'Liste numérotée',
      heading: 'Titre',
      quote: 'Citation',
      code: 'Code',
      image: 'Image',
      alignment: 'Alignement',
      undo: 'Annuler',
      redo: 'Rétablir',
      indent: 'Indenter',
      outdent: 'Désindenter',
      clear: 'Effacer le formatage',
      words: 'mots',
      characters: 'caractères',
      insertLink: 'Insérer un lien',
      insertImage: 'Insérer une image',
      url: 'URL',
      text: 'Texte',
      alt: 'Texte alternatif',
      cancel: 'Annuler',
      insert: 'Insérer',
      h1: 'Titre 1',
      h2: 'Titre 2',
      h3: 'Titre 3',
      alignLeft: 'Aligner à gauche',
      alignCenter: 'Centrer',
      alignRight: 'Aligner à droite',
    },
    // Add other languages as needed
  }[language] || strings.en;
  
  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
      if (autoFocus) {
        editorRef.current.focus();
      }
    }
  }, [initialValue, autoFocus]);
  
  // Update word and character counts
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const charCount = text.length;
      
      setWordCount(wordCount);
      setCharCount(charCount);
    }
  }, [content]);
  
  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    }
  };
  
  // Save selection before opening dialogs
  const saveSelection = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.getRangeAt && sel.rangeCount) {
        setSelection(sel.getRangeAt(0).cloneRange());
      }
    }
  };
  
  // Restore selection after dialogs close
  const restoreSelection = () => {
    if (selection && window.getSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection);
      }
    }
  };
  
  // Execute document commands
  const execCommand = (command: string, value: string = '') => {
    if (readOnly) return;
    
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    // Common editor shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'k':
          if (toolbarButtons.includes('link')) {
            e.preventDefault();
            saveSelection();
            const selectedText = window.getSelection()?.toString() || '';
            setLinkText(selectedText);
            setLinkDialogOpen(true);
          }
          break;
        // Add more shortcuts as needed
      }
    }
  };
  
  // Handle link insertion
  const handleInsertLink = useCallback(() => {
    restoreSelection();
    
    if (linkUrl) {
      if (linkText && window.getSelection()?.toString() === '') {
        // If text is provided and no selection, insert both text and link
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
      } else {
        // If there's a selection, wrap it with a link
        execCommand('createLink', linkUrl);
        // Make links open in new tab
        const links = editorRef.current?.querySelectorAll('a');
        if (links) {
          links.forEach(link => {
            if (link.href === linkUrl) {
              link.setAttribute('target', '_blank');
            }
          });
        }
      }
    }
    
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText]);
  
  // Handle image insertion
  const handleInsertImage = useCallback(() => {
    restoreSelection();
    
    if (imageUrl) {
      execCommand(
        'insertHTML', 
        `<img src="${imageUrl}" alt="${imageAlt}" class="editor-image" />`
      );
    }
    
    setImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
  }, [imageUrl, imageAlt]);
  
  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    title,
    command,
    value,
    active,
    disabled = false,
    onClick,
  }: {
    icon: React.ElementType;
    title: string;
    command?: string;
    value?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={active ? "default" : "ghost"}
            size={compact ? "sm" : "icon"}
            onClick={() => {
              if (onClick) {
                onClick();
              } else if (command) {
                execCommand(command, value || '');
              }
            }}
            className={cn(
              "h-8 w-8 p-0",
              compact && "h-7 w-7",
              active && "bg-primary text-primary-foreground"
            )}
            disabled={disabled || readOnly}
          >
            <Icon className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
            <span className="sr-only">{title}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
  
  // Toolbar component
  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/40 rounded-md border">
      {toolbarButtons.includes('bold') && (
        <ToolbarButton icon={Bold} title={strings.bold} command="bold" />
      )}
      
      {toolbarButtons.includes('italic') && (
        <ToolbarButton icon={Italic} title={strings.italic} command="italic" />
      )}
      
      {toolbarButtons.includes('underline') && (
        <ToolbarButton icon={Underline} title={strings.underline} command="underline" />
      )}
      
      {toolbarButtons.includes('strikethrough') && (
        <ToolbarButton icon={Strikethrough} title={strings.strikethrough} command="strikeThrough" />
      )}
      
      {(toolbarButtons.includes('bold') || toolbarButtons.includes('italic') || 
        toolbarButtons.includes('underline') || toolbarButtons.includes('strikethrough')) && (
        <Separator orientation="vertical" className="h-6 mx-1" />
      )}
      
      {toolbarButtons.includes('heading') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={compact ? "sm" : "icon"}
              className={cn("h-8 w-8 p-0", compact && "h-7 w-7")}
              disabled={readOnly}
            >
              <Heading2 className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
              <span className="sr-only">{strings.heading}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => execCommand('formatBlock', '<h1>')}>
              <Heading1 className="h-4 w-4 mr-2" />
              {strings.h1}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', '<h2>')}>
              <Heading2 className="h-4 w-4 mr-2" />
              {strings.h2}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('formatBlock', '<h3>')}>
              <Heading3 className="h-4 w-4 mr-2" />
              {strings.h3}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => execCommand('formatBlock', '<p>')}>
              <Type className="h-4 w-4 mr-2" />
              Normal Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {toolbarButtons.includes('unorderedList') && (
        <ToolbarButton icon={List} title={strings.unorderedList} command="insertUnorderedList" />
      )}
      
      {toolbarButtons.includes('orderedList') && (
        <ToolbarButton icon={ListOrdered} title={strings.orderedList} command="insertOrderedList" />
      )}
      
      {toolbarButtons.includes('quote') && (
        <ToolbarButton icon={Quote} title={strings.quote} command="formatBlock" value="<blockquote>" />
      )}
      
      {toolbarButtons.includes('code') && (
        <ToolbarButton icon={Code} title={strings.code} command="formatBlock" value="<pre>" />
      )}
      
      {toolbarButtons.includes('alignment') && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={compact ? "sm" : "icon"}
              className={cn("h-8 w-8 p-0", compact && "h-7 w-7")}
              disabled={readOnly}
            >
              <AlignLeft className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
              <span className="sr-only">{strings.alignment}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => execCommand('justifyLeft')}>
              <AlignLeft className="h-4 w-4 mr-2" />
              {strings.alignLeft}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('justifyCenter')}>
              <AlignCenter className="h-4 w-4 mr-2" />
              {strings.alignCenter}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand('justifyRight')}>
              <AlignRight className="h-4 w-4 mr-2" />
              {strings.alignRight}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {(toolbarButtons.includes('heading') || toolbarButtons.includes('unorderedList') || 
        toolbarButtons.includes('orderedList') || toolbarButtons.includes('quote') || 
        toolbarButtons.includes('code') || toolbarButtons.includes('alignment')) && (
        <Separator orientation="vertical" className="h-6 mx-1" />
      )}
      
      {toolbarButtons.includes('link') && (
        <ToolbarButton 
          icon={Link} 
          title={strings.link} 
          onClick={() => {
            saveSelection();
            const selectedText = window.getSelection()?.toString() || '';
            setLinkText(selectedText);
            setLinkDialogOpen(true);
          }} 
        />
      )}
      
      {toolbarButtons.includes('image') && (
        <ToolbarButton 
          icon={Image} 
          title={strings.image} 
          onClick={() => {
            saveSelection();
            setImageDialogOpen(true);
          }} 
        />
      )}
      
      {(toolbarButtons.includes('link') || toolbarButtons.includes('image')) && (
        <Separator orientation="vertical" className="h-6 mx-1" />
      )}
      
      {toolbarButtons.includes('indent') && (
        <ToolbarButton icon={Indent} title={strings.indent} command="indent" />
      )}
      
      {toolbarButtons.includes('outdent') && (
        <ToolbarButton icon={Outdent} title={strings.outdent} command="outdent" />
      )}
      
      {(toolbarButtons.includes('indent') || toolbarButtons.includes('outdent')) && (
        <Separator orientation="vertical" className="h-6 mx-1" />
      )}
      
      {toolbarButtons.includes('undo') && (
        <ToolbarButton icon={Undo} title={strings.undo} command="undo" />
      )}
      
      {toolbarButtons.includes('redo') && (
        <ToolbarButton icon={Redo} title={strings.redo} command="redo" />
      )}
      
      {toolbarButtons.includes('clear') && (
        <ToolbarButton icon={X} title={strings.clear} command="removeFormat" />
      )}
    </div>
  );
  
  // Render editor
  return (
    <div className={cn("space-y-2", className)}>
      {/* Label if provided */}
      {label && (
        <Label htmlFor="editor">{label}</Label>
      )}
      
      {/* Editor container */}
      <div className="space-y-2">
        {/* Toolbar placement */}
        {toolbarPlacement === 'top' && <Toolbar />}
        
        {/* Content editable area */}
        <div
          className={cn(
            "relative border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring",
            readOnly && "bg-muted cursor-default"
          )}
        >
          <div
            ref={editorRef}
            id="editor"
            contentEditable={!readOnly}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            className={cn(
              "outline-none w-full overflow-y-auto",
              "[&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic",
              "[&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto",
              "dark:[&_pre]:bg-slate-800"
            )}
            style={{
              minHeight,
              maxHeight,
            }}
            data-placeholder={placeholder}
          />
          
          {/* Placeholder effect */}
          {!content && !readOnly && (
            <div 
              className="absolute top-0 left-0 text-muted-foreground p-3 pointer-events-none" 
              style={{ marginTop: '-1px' }}
            >
              {placeholder}
            </div>
          )}
          
          {/* Word and character counters */}
          {showCounters && (
            <div className="text-xs text-muted-foreground pt-1 flex justify-end">
              <span>{wordCount} {strings.words}</span>
              <span className="mx-1.5">•</span>
              <span>{charCount} {strings.characters}</span>
            </div>
          )}
        </div>
        
        {/* Bottom toolbar */}
        {toolbarPlacement === 'bottom' && <Toolbar />}
      </div>
      
      {/* Description if provided */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{strings.insertLink}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">{strings.url}</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkText">{strings.text}</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setLinkDialogOpen(false)}
            >
              {strings.cancel}
            </Button>
            <Button 
              onClick={handleInsertLink}
              disabled={!linkUrl}
            >
              {strings.insert}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{strings.insertImage}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{strings.url}</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageAlt">{strings.alt}</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setImageDialogOpen(false)}
            >
              {strings.cancel}
            </Button>
            <Button 
              onClick={handleInsertImage}
              disabled={!imageUrl}
            >
              {strings.insert}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RichTextEditor;