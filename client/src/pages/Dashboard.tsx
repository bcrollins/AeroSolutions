import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import EnrolledCourses from "@/components/dashboard/EnrolledCourses";
import UserBadges from "@/components/dashboard/UserBadges";
import CourseRecommendations from "@/components/dashboard/CourseRecommendations";
import MainLayout from "@/components/MainLayout";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");

  // Fetch enrolled courses
  const { 
    data: enrollments, 
    isLoading: enrollmentsLoading,
    error: enrollmentsError 
  } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: isAuthenticated,
  });

  // Fetch user badges
  const { 
    data: badges, 
    isLoading: badgesLoading,
    error: badgesError 
  } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: isAuthenticated,
  });

  // Fetch course recommendations
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading,
    error: recommendationsError 
  } = useQuery({
    queryKey: ["/api/user/course-recommendations"],
    enabled: isAuthenticated,
  });

  // Show error toasts for data fetching errors
  useEffect(() => {
    if (enrollmentsError) {
      toast({
        title: "Error loading courses",
        description: "We couldn't load your enrolled courses. Please try again later.",
        variant: "destructive",
      });
    }
    
    if (badgesError) {
      toast({
        title: "Error loading achievements",
        description: "We couldn't load your achievement badges. Please try again later.",
        variant: "destructive",
      });
    }
    
    if (recommendationsError) {
      toast({
        title: "Error loading recommendations",
        description: "We couldn't load your course recommendations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [enrollmentsError, badgesError, recommendationsError, toast]);

  // Not authenticated redirect handling
  if (!authLoading && !isAuthenticated) {
    // Redirect to login page after a brief delay
    useEffect(() => {
      const timer = setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
      
      return () => clearTimeout(timer);
    }, []);

    return (
      <MainLayout>
        <div className="container py-12 mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Required</h1>
          <p className="text-xl text-slate-400 mb-8">Please log in to view your dashboard</p>
          <div className="animate-pulse">
            <p className="text-blue-400">Redirecting to login page...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Loading state
  const isLoading = authLoading || enrollmentsLoading || badgesLoading || recommendationsLoading;

  return (
    <MainLayout>
      <Helmet>
        <title>My Dashboard | ROLLINSX</title>
        <meta 
          name="description" 
          content="Track your course progress, view achievements, and discover recommended courses tailored to your interests."
        />
      </Helmet>

      <div className="container py-8 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLoading ? <Skeleton className="h-10 w-1/3 bg-slate-700" /> : `Welcome Back, ${user?.firstName || 'Learner'}`}
          </h1>
          <p className="text-slate-400 text-lg">
            {isLoading ? <Skeleton className="h-6 w-1/2 bg-slate-700" /> : 'Track your progress and discover new learning opportunities'}
          </p>
        </div>

        <Tabs defaultValue="courses" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600">My Courses</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">Achievements</TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600">Recommended</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <EnrolledCourses enrollments={enrollments || []} />
            )}
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-60 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <UserBadges badges={badges || []} />
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-80 w-full bg-slate-800" />
              </div>
            ) : (
              <CourseRecommendations recommendations={recommendations || []} />
            )}
          </TabsContent>
        </Tabs>

        {/* Always show other sections regardless of active tab */}
        {activeTab !== "achievements" && (
          <div className={activeTab === "achievements" ? "hidden" : "block"}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-60 w-full bg-slate-800" />
                ))}
              </div>
            ) : (
              <UserBadges badges={badges || []} />
            )}
          </div>
        )}
        
        {activeTab !== "recommendations" && (
          <div className={activeTab === "recommendations" ? "hidden" : "block"}>
            {isLoading ? (
              <div className="space-y-6 mt-12">
                <Skeleton className="h-80 w-full bg-slate-800" />
              </div>
            ) : (
              <CourseRecommendations recommendations={recommendations || []} />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}