import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type CourseSidebarProps = {
  courseId: number;
  modules: any[];
  currentModuleId?: number;
  currentLessonId?: number;
  onSelectLesson: (moduleId: number, lessonId: number) => void;
  completedLessons: Set<number>;
};

export function CourseSidebar({
  courseId,
  modules,
  currentModuleId,
  currentLessonId,
  onSelectLesson,
  completedLessons,
}: CourseSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(currentModuleId ? [currentModuleId] : [])
  );

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Calculate overall progress
  const totalLessons = modules.reduce(
    (acc, module) => acc + module.lessons.length, 
    0
  );
  
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessons.size / totalLessons) * 100) 
    : 0;

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:sticky top-0 h-screen md:h-[calc(100vh-4rem)] border-r border-border bg-background z-40 transition-all duration-300 ease-in-out",
          isOpen ? "left-0 w-72" : "-left-72 md:left-0 w-72 md:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Course Navigation</h3>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 py-2">
            <div className="space-y-1 p-2">
              {modules.map((module) => (
                <div key={module.id} className="mb-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between font-medium text-left"
                    onClick={() => toggleModule(module.id)}
                  >
                    <span className="truncate">{module.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        expandedModules.has(module.id) && "rotate-90"
                      )}
                    />
                  </Button>
                  
                  {expandedModules.has(module.id) && (
                    <div className="pl-4 border-l ml-4 mt-1 space-y-1">
                      {module.lessons.map((lesson: any) => {
                        const isActive = currentLessonId === lesson.id;
                        const isCompleted = completedLessons.has(lesson.id);
                        
                        return (
                          <Button
                            key={lesson.id}
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left relative pl-7",
                              isCompleted && "text-primary"
                            )}
                            onClick={() => {
                              onSelectLesson(module.id, lesson.id);
                              if (window.innerWidth < 768) {
                                setIsOpen(false);
                              }
                            }}
                          >
                            {isCompleted && (
                              <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
                                <div className="h-3 w-3 rounded-full bg-primary" />
                              </div>
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.href = `/ai-courses/${courseId}/forum`}
            >
              Forum
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.location.href = `/ai-courses/${courseId}/resources`}
            >
              Resources
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}