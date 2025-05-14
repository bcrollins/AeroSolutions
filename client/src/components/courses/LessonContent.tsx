import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LessonContentProps {
  courseId: number;
  lesson: any;
  nextLesson?: { moduleId: number; lessonId: number };
  onComplete: (lessonId: number) => void;
  onNavigate: (moduleId: number, lessonId: number) => void;
  isCompleted: boolean;
}

export function LessonContent({
  courseId,
  lesson,
  nextLesson,
  onComplete,
  onNavigate,
  isCompleted,
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [videoWatched, setVideoWatched] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<number, { correct: boolean; feedback: string }>>({});
  const [showCodeFeedback, setShowCodeFeedback] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lesson quizzes if they exist
  const { data: quizzes } = useQuery({
    queryKey: [`/api/ai-courses/lessons/${lesson.id}/quizzes`],
    enabled: !!lesson.id,
  });

  // Mark lesson as viewed/completed
  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/ai-courses/lessons/${lesson.id}/complete`);
    },
    onSuccess: () => {
      onComplete(lesson.id);
      toast({
        title: "Progress Saved",
        description: "Your progress has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/ai-courses/${courseId}/progress`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress.",
        variant: "destructive",
      });
    },
  });

  // Submit code for AI feedback
  const submitCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", `/api/ai-courses/lessons/${lesson.id}/code-feedback`, { code });
    },
    onSuccess: (data) => {
      setCodeFeedback(data.feedback);
      setShowCodeFeedback(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get code feedback.",
        variant: "destructive",
      });
    },
  });

  // Track video progress
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setVideoProgress(progress);

      // Mark as watched if 90% complete
      if (progress > 90 && !videoWatched) {
        setVideoWatched(true);
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoWatched]);

  // Handle quiz submission
  const handleQuizSubmit = async (quizId: number) => {
    try {
      const response = await apiRequest("POST", `/api/ai-courses/quizzes/${quizId}/check`, {
        answers: { [quizId]: quizAnswers[quizId] },
      });

      setQuizFeedback({
        ...quizFeedback,
        [quizId]: {
          correct: response.correct,
          feedback: response.feedback,
        },
      });

      if (response.correct) {
        toast({
          title: "Correct!",
          description: "You got the right answer.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check quiz answer.",
        variant: "destructive",
      });
    }
  };

  // Handle code submission
  const handleCodeSubmit = () => {
    if (!codeEditorRef.current) return;
    
    // In a real implementation, we would get the code from the editor
    // For now, we'll just simulate it
    const sampleCode = "function example() { console.log('Hello world'); }";
    submitCodeMutation.mutate(sampleCode);
  };

  // Check if lesson can be marked as complete
  const canComplete = videoWatched && 
    (!quizzes || quizzes.length === 0 || 
      quizzes.every(quiz => quizFeedback[quiz.id]?.correct));

  return (
    <div className="flex flex-col space-y-6">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">Lesson Progress</span>
          <span className="text-sm">{Math.round(videoProgress)}%</span>
        </div>
        <Progress value={videoProgress} className="h-2" />
      </div>

      {/* Tabs for different content types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Lesson Content</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Lesson content tab */}
        <TabsContent value="content" className="space-y-4">
          {/* Video player (16:9 aspect ratio) */}
          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
            {lesson.videoUrl ? (
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full"
                controls
                poster={lesson.thumbnailUrl || ""}
              >
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-muted" />
                <p className="mt-4 text-muted">Video not available</p>
              </div>
            )}
          </div>

          {/* Lesson content */}
          <div className="prose prose-invert max-w-none">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="text-base leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: lesson.content || "" }} />
          </div>

          {/* Quizzes section */}
          {quizzes && quizzes.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold">Knowledge Check</h2>
              {quizzes.map((quiz: any) => (
                <Card key={quiz.id} className="p-4">
                  <CardContent className="pt-4 space-y-4">
                    <h3 className="text-lg font-medium">{quiz.question}</h3>
                    <div className="space-y-2">
                      {quiz.options.map((option: any, idx: number) => (
                        <div key={idx} className="flex items-center">
                          <input
                            type="radio"
                            id={`quiz-${quiz.id}-option-${idx}`}
                            name={`quiz-${quiz.id}`}
                            className="mr-2"
                            onChange={() => 
                              setQuizAnswers({ ...quizAnswers, [quiz.id]: idx })
                            }
                            checked={quizAnswers[quiz.id] === idx}
                          />
                          <label htmlFor={`quiz-${quiz.id}-option-${idx}`}>
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleQuizSubmit(quiz.id)}
                      disabled={quizAnswers[quiz.id] === undefined}
                    >
                      Submit Answer
                    </Button>

                    {quizFeedback[quiz.id] && (
                      <div className={`p-4 rounded-md ${
                        quizFeedback[quiz.id].correct 
                          ? "bg-green-900/20 border border-green-800" 
                          : "bg-red-900/20 border border-red-800"
                      }`}>
                        <p>{quizFeedback[quiz.id].feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Complete lesson and navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Back to Course
            </Button>
            
            <div className="space-x-2">
              {!isCompleted && (
                <Button
                  variant="default"
                  className="bg-primary text-white"
                  disabled={!canComplete || isCompleted}
                  onClick={() => completeLessonMutation.mutate()}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              
              {nextLesson && (
                <Button
                  onClick={() => onNavigate(nextLesson.moduleId, nextLesson.lessonId)}
                  disabled={!isCompleted && !canComplete}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Exercises tab with coding sandbox */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold">Practice Exercise</h2>
            <p>{lesson.exerciseInstructions || "Complete the following exercise to practice what you've learned."}</p>
          </div>

          {/* Code editor placeholder - in a real implementation this would be a code editor component */}
          <div 
            ref={codeEditorRef}
            className="min-h-[300px] p-4 bg-black border border-border rounded-md font-mono text-sm"
          >
            <p className="text-muted-foreground mb-2">// Write your code here</p>
            <p>function example() {'{'}</p>
            <p className="pl-4">// Your implementation</p>
            <p>{'}'}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCodeSubmit} disabled={submitCodeMutation.isPending}>
              {submitCodeMutation.isPending ? "Analyzing..." : "Submit for Feedback"}
            </Button>
          </div>

          {/* AI Feedback */}
          {showCodeFeedback && (
            <Card className="p-4 bg-blue-900/20 border border-blue-800">
              <CardContent className="pt-4">
                <h3 className="text-lg font-semibold mb-2">AI Feedback</h3>
                <p>{codeFeedback}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold">Additional Resources</h2>
            <p>Download supplementary materials for this lesson.</p>
          </div>

          {lesson.resources ? (
            <div className="space-y-2">
              {lesson.resources.map((resource: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <span>{resource.title}</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No resources available for this lesson.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}