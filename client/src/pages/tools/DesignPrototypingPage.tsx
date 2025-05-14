import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ToolLayout from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Move, 
  Type, 
  Image, 
  Square, 
  Circle, 
  ChevronsUpDown, 
  MousePointer, 
  Copy, 
  XOctagon, 
  Save, 
  Download, 
  BarChart, 
  Layers, 
  Plus
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Tutorial content for the Design Prototyping tool
const DesignPrototypingTutorial = (
  <div className="space-y-4">
    <p>Create amazing designs with our prototyping tool:</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Start with a template or blank canvas</li>
      <li>Drag components from the left sidebar onto your canvas</li>
      <li>Customize colors, styles, and properties</li>
      <li>Create interactions with the connections tool</li>
      <li>Preview your design across different screen sizes</li>
    </ol>
    <p className="text-muted-foreground">Use keyboard shortcuts (press H to view) for faster designing!</p>
    
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">Advanced Features:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Create reusable components with variants</li>
        <li>Set up design tokens for consistent styling</li>
        <li>Create complex animations and transitions</li>
        <li>Use constraints for responsive layouts</li>
        <li>Generate code from your designs (React, HTML/CSS)</li>
      </ul>
    </div>
  </div>
);

// Define component categories and items
const componentCategories = [
  {
    id: 'basics',
    name: 'Basic Elements',
    components: [
      { id: 'text', name: 'Text', icon: <Type className="h-4 w-4" /> },
      { id: 'rectangle', name: 'Rectangle', icon: <Square className="h-4 w-4" /> },
      { id: 'circle', name: 'Circle', icon: <Circle className="h-4 w-4" /> },
      { id: 'line', name: 'Line', icon: <ChevronsUpDown className="h-4 w-4" /> },
      { id: 'image', name: 'Image', icon: <Image className="h-4 w-4" /> },
    ]
  },
  {
    id: 'ui',
    name: 'UI Components',
    components: [
      { id: 'button', name: 'Button', icon: <Square className="h-4 w-4" /> },
      { id: 'input', name: 'Input Field', icon: <Type className="h-4 w-4" /> },
      { id: 'card', name: 'Card', icon: <Square className="h-4 w-4" /> },
      { id: 'navigation', name: 'Navigation Bar', icon: <BarChart className="h-4 w-4" /> },
      { id: 'menu', name: 'Menu', icon: <Layers className="h-4 w-4" /> },
    ]
  },
  {
    id: 'layouts',
    name: 'Layouts',
    components: [
      { id: 'grid', name: 'Grid', icon: <Layers className="h-4 w-4" /> },
      { id: 'flexbox', name: 'Flexbox', icon: <Layers className="h-4 w-4" /> },
      { id: 'header', name: 'Header', icon: <Layers className="h-4 w-4" /> },
      { id: 'footer', name: 'Footer', icon: <Layers className="h-4 w-4" /> },
      { id: 'sidebar', name: 'Sidebar', icon: <Layers className="h-4 w-4" /> },
    ]
  }
];

// Template options
const templates = [
  { id: 'blank', name: 'Blank Canvas', description: 'Start with an empty canvas' },
  { id: 'landing', name: 'Landing Page', description: 'Template for a marketing landing page' },
  { id: 'dashboard', name: 'Dashboard', description: 'Admin dashboard layout with components' },
  { id: 'e-commerce', name: 'E-commerce', description: 'Product listing and detail pages' },
  { id: 'blog', name: 'Blog', description: 'Blog layout with posts and sidebar' },
];

const DesignPrototypingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('canvas');
  const [activeTool, setActiveTool] = useState('select');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [templateSelector, setTemplateSelector] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle component drag to canvas
  const handleAddElement = (componentType: string) => {
    // In a real app, we would create proper element instances
    const newElement = {
      id: Date.now(),
      type: componentType,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      content: componentType === 'text' ? 'Text Element' : '',
      style: {
        backgroundColor: componentType === 'text' ? 'transparent' : '#e2e8f0',
        color: '#000000',
        borderRadius: componentType === 'circle' ? '50%' : '0px',
      }
    };
    
    setCanvasElements([...canvasElements, newElement]);
    setSelectedElement(newElement.id);
    trackEvent('add_element', 'design_prototyping', componentType);
    
    toast({
      title: "Element Added",
      description: `Added new ${componentType} element to canvas`,
    });
  };

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setTemplateSelector(false);
    setCanvasElements([]);
    
    trackEvent('select_template', 'design_prototyping', templateId);
    
    toast({
      title: "Template Selected",
      description: `Loading ${templates.find(t => t.id === templateId)?.name} template`,
    });
    
    // In a real implementation, we would load the template elements
    if (templateId !== 'blank') {
      // Create some placeholder elements based on the template
      const demoElements = [
        {
          id: Date.now(),
          type: 'rectangle',
          x: 0,
          y: 0,
          width: canvasSize.width,
          height: 80,
          content: '',
          style: {
            backgroundColor: '#1e293b',
            color: '#ffffff',
            borderRadius: '0px',
          }
        },
        {
          id: Date.now() + 1,
          type: 'text',
          x: 20,
          y: 25,
          width: 200,
          height: 40,
          content: 'Site Logo',
          style: {
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 'bold',
          }
        }
      ];
      
      setCanvasElements(demoElements);
    }
  };

  // Handle canvas zoom
  const handleZoomChange = (value: string) => {
    const zoom = parseInt(value);
    setCanvasZoom(zoom);
    setCanvasScale(zoom / 100);
  };

  // Handle save design
  const handleSaveDesign = () => {
    setIsSaving(true);
    trackEvent('save_design', 'design_prototyping', 'user_design');
    
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Design Saved",
        description: "Your design has been saved successfully",
      });
    }, 1500);
  };

  // Handle export design
  const handleExportDesign = () => {
    trackEvent('export_design', 'design_prototyping', 'html_css');
    
    toast({
      title: "Export Started",
      description: "Your design is being exported as HTML/CSS",
    });
  };

  // Handle delete element
  const handleDeleteElement = () => {
    if (selectedElement === null) return;
    
    setCanvasElements(canvasElements.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
    trackEvent('delete_element', 'design_prototyping', 'canvas_element');
    
    toast({
      title: "Element Deleted",
      description: "Selected element has been removed from the canvas",
    });
  };

  // Handle duplicate element
  const handleDuplicateElement = () => {
    if (selectedElement === null) return;
    
    const elementToDuplicate = canvasElements.find(el => el.id === selectedElement);
    if (!elementToDuplicate) return;
    
    const duplicatedElement = {
      ...elementToDuplicate,
      id: Date.now(),
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20,
    };
    
    setCanvasElements([...canvasElements, duplicatedElement]);
    setSelectedElement(duplicatedElement.id);
    trackEvent('duplicate_element', 'design_prototyping', 'canvas_element');
    
    toast({
      title: "Element Duplicated",
      description: "Selected element has been duplicated",
    });
  };

  return (
    <ToolLayout
      title="Design Prototyping Tool"
      description="Create wireframes and mockups with drag-and-drop functionality and reusable components."
      tutorial={DesignPrototypingTutorial}
      tutorialTitle="Design Prototyping Basics"
    >
      {templateSelector ? (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Choose a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                    {template.id === 'blank' ? (
                      <Plus className="h-12 w-12 text-muted-foreground opacity-30" />
                    ) : (
                      <div className="w-full h-full p-2">
                        {/* Template thumbnail mockup */}
                        {template.id === 'landing' && (
                          <div className="w-full h-full flex flex-col">
                            <div className="h-1/5 w-full bg-slate-700 mb-1"></div>
                            <div className="h-2/5 w-full bg-slate-600 mb-1"></div>
                            <div className="h-2/5 w-full flex space-x-1">
                              <div className="w-1/3 bg-slate-500"></div>
                              <div className="w-1/3 bg-slate-500"></div>
                              <div className="w-1/3 bg-slate-500"></div>
                            </div>
                          </div>
                        )}
                        {template.id === 'dashboard' && (
                          <div className="w-full h-full flex">
                            <div className="w-1/5 h-full bg-slate-700"></div>
                            <div className="w-4/5 h-full flex flex-col pl-1">
                              <div className="h-1/5 w-full bg-slate-600 mb-1"></div>
                              <div className="h-4/5 w-full grid grid-cols-2 gap-1">
                                <div className="bg-slate-500"></div>
                                <div className="bg-slate-500"></div>
                                <div className="bg-slate-500"></div>
                                <div className="bg-slate-500"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {template.id === 'e-commerce' && (
                          <div className="w-full h-full flex flex-col">
                            <div className="h-1/5 w-full bg-slate-700 mb-1"></div>
                            <div className="h-4/5 w-full grid grid-cols-3 gap-1">
                              <div className="bg-slate-500"></div>
                              <div className="bg-slate-500"></div>
                              <div className="bg-slate-500"></div>
                              <div className="bg-slate-500"></div>
                              <div className="bg-slate-500"></div>
                              <div className="bg-slate-500"></div>
                            </div>
                          </div>
                        )}
                        {template.id === 'blog' && (
                          <div className="w-full h-full flex">
                            <div className="w-3/4 h-full flex flex-col pr-1">
                              <div className="h-1/5 w-full bg-slate-700 mb-1"></div>
                              <div className="h-2/5 w-full bg-slate-600 mb-1"></div>
                              <div className="h-2/5 w-full bg-slate-600"></div>
                            </div>
                            <div className="w-1/4 h-full flex flex-col">
                              <div className="h-2/5 w-full bg-slate-500 mb-1"></div>
                              <div className="h-3/5 w-full bg-slate-500"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left sidebar - Tools & Components */}
          <div className="w-16 border-r bg-background flex flex-col">
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'select' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => setActiveTool('select')}
              >
                <MousePointer className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'move' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => setActiveTool('move')}
              >
                <Move className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'text' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => handleAddElement('text')}
              >
                <Type className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'shape' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => handleAddElement('rectangle')}
              >
                <Square className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'circle' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => handleAddElement('circle')}
              >
                <Circle className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-2 border-b">
              <Button 
                variant={activeTool === 'image' ? "default" : "ghost"} 
                size="icon" 
                className="w-full h-10" 
                onClick={() => handleAddElement('image')}
              >
                <Image className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-auto p-2 border-t">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-full h-10" 
                onClick={() => setIsDrawerOpen(true)}
              >
                <Layers className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Main canvas area */}
          <div className="flex-1 overflow-auto bg-muted p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setTemplateSelector(true)}>
                  Change Template
                </Button>
                <Select value={canvasZoom.toString()} onValueChange={handleZoomChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={`${canvasZoom}%`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                    <SelectItem value="125">125%</SelectItem>
                    <SelectItem value="150">150%</SelectItem>
                    <SelectItem value="200">200%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedElement !== null && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleDuplicateElement}>
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeleteElement}>
                      <XOctagon className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleExportDesign}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveDesign}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-background shadow-lg rounded-lg overflow-hidden mx-auto" 
                 style={{ width: canvasSize.width * canvasScale, height: canvasSize.height * canvasScale }}>
              {/* Design canvas */}
              <div 
                ref={canvasRef}
                className="w-full h-full relative"
                style={{ transform: `scale(${canvasScale})`, transformOrigin: '0 0' }}
              >
                {canvasElements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-primary' : ''}`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      backgroundColor: element.style.backgroundColor,
                      color: element.style.color,
                      borderRadius: element.style.borderRadius,
                      fontSize: element.style.fontSize,
                      fontWeight: element.style.fontWeight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: element.type === 'text' ? 'flex-start' : 'center',
                      padding: element.type === 'text' ? '8px' : '0',
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {element.type === 'text' && element.content}
                    {element.type === 'image' && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right sidebar - Properties */}
          <div className="w-64 border-l bg-background">
            <div className="p-4 border-b">
              <h3 className="font-medium">Properties</h3>
            </div>
            
            {selectedElement === null ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>Select an element to edit its properties</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label className="text-xs text-muted-foreground">X</label>
                      <input 
                        type="number" 
                        className="w-full border rounded p-1 text-sm" 
                        value={canvasElements.find(el => el.id === selectedElement)?.x || 0}
                        onChange={() => {}}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Y</label>
                      <input 
                        type="number" 
                        className="w-full border rounded p-1 text-sm" 
                        value={canvasElements.find(el => el.id === selectedElement)?.y || 0}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Size</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label className="text-xs text-muted-foreground">Width</label>
                      <input 
                        type="number" 
                        className="w-full border rounded p-1 text-sm" 
                        value={canvasElements.find(el => el.id === selectedElement)?.width || 0}
                        onChange={() => {}}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height</label>
                      <input 
                        type="number" 
                        className="w-full border rounded p-1 text-sm" 
                        value={canvasElements.find(el => el.id === selectedElement)?.height || 0}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Style</label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <div>
                      <label className="text-xs text-muted-foreground">Background</label>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-6 h-6 rounded mr-2 border" 
                          style={{ backgroundColor: canvasElements.find(el => el.id === selectedElement)?.style.backgroundColor }}
                        ></div>
                        <input 
                          type="text" 
                          className="w-full border rounded p-1 text-sm" 
                          value={canvasElements.find(el => el.id === selectedElement)?.style.backgroundColor || ''}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label className="text-xs text-muted-foreground">Text Color</label>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-6 h-6 rounded mr-2 border" 
                          style={{ backgroundColor: canvasElements.find(el => el.id === selectedElement)?.style.color }}
                        ></div>
                        <input 
                          type="text" 
                          className="w-full border rounded p-1 text-sm" 
                          value={canvasElements.find(el => el.id === selectedElement)?.style.color || ''}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {canvasElements.find(el => el.id === selectedElement)?.type === 'text' && (
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <textarea 
                      className="w-full border rounded p-1 text-sm mt-1" 
                      rows={3}
                      value={canvasElements.find(el => el.id === selectedElement)?.content || ''}
                      onChange={() => {}}
                    ></textarea>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Components drawer */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent className="max-h-[85vh]">
              <div className="p-4 border-b">
                <h3 className="font-medium text-lg">Component Library</h3>
              </div>
              <ScrollArea className="h-[calc(85vh-60px)]">
                <div className="p-4">
                  <Tabs defaultValue="basics" className="w-full">
                    <TabsList className="w-full mb-4">
                      {componentCategories.map(category => (
                        <TabsTrigger key={category.id} value={category.id}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {componentCategories.map(category => (
                      <TabsContent key={category.id} value={category.id} className="mt-0">
                        <div className="grid grid-cols-2 gap-2">
                          {category.components.map(component => (
                            <Button
                              key={component.id}
                              variant="outline"
                              className="h-20 flex flex-col items-center justify-center gap-2"
                              onClick={() => {
                                handleAddElement(component.id);
                                setIsDrawerOpen(false);
                              }}
                            >
                              {component.icon}
                              <span className="text-xs">{component.name}</span>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </ToolLayout>
  );
};

export default DesignPrototypingPage;