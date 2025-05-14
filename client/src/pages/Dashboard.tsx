import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import EnrolledCourses from "@/components/dashboard/EnrolledCourses";
import UserBadges from "@/components/dashboard/UserBadges";
import CourseRecommendations from "@/components/dashboard/CourseRecommendations";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Fetch user's course enrollments
  const { 
    data: enrollments, 
    isLoading: enrollmentsLoading,
    error: enrollmentsError
  } = useQuery({
    queryKey: ['/api/ai-courses/enrollments'],
    enabled: isAuthenticated,
  });

  // Fetch user's badges
  const { 
    data: badges, 
    isLoading: badgesLoading,
    error: badgesError
  } = useQuery({
    queryKey: ['/api/users/badges'],
    enabled: isAuthenticated,
  });

  // Fetch recommended courses based on user progress
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading,
    error: recommendationsError
  } = useQuery({
    queryKey: ['/api/ai-courses/recommendations'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (enrollmentsError) {
      toast({
        title: "Error",
        description: "Failed to load your enrolled courses. Please try again later.",
        variant: "destructive",
      });
    }

    if (badgesError) {
      toast({
        title: "Error",
        description: "Failed to load your badges. Please try again later.",
        variant: "destructive",
      });
    }

    if (recommendationsError) {
      toast({
        title: "Error",
        description: "Failed to load course recommendations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [enrollmentsError, badgesError, recommendationsError, toast]);

  // Handle loading states
  const isLoading = authLoading || enrollmentsLoading || badgesLoading || recommendationsLoading;
  
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="bg-slate-900 text-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="mb-6">Please login to view your dashboard.</p>
          <a 
            href="/api/login" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            Login Now
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
            <p className="text-slate-400 mt-1">Track your progress and explore new courses</p>
          </div>
          
          {enrollments?.length > 0 && enrollments.find(e => e.lastAccessedLessonId) && (
            <a 
              href={`/ai-courses/lesson/${enrollments.find(e => e.lastAccessedLessonId)?.lastAccessedLessonId}`}
              className="mt-4 md:mt-0 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
            >
              Continue Learning
            </a>
          )}
        </div>

        {/* Enrolled Courses with Progress Section */}
        <EnrolledCourses enrollments={enrollments || []} />
        
        {/* User Badges Section */}
        <UserBadges badges={badges || []} />
        
        {/* Course Recommendations Section */}
        <CourseRecommendations recommendations={recommendations || []} />
      </div>
    </div>
  );
}