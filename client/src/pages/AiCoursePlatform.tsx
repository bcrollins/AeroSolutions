import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Clock, Trophy, Users, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AiCourse = {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: string;
  duration: string | null;
  instructorName: string | null;
  price: string;
  enrollmentCount: number;
  averageRating: number | null;
};

type AiCourseCategory = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
};

export default function AiCoursePlatform() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("all");

  // Fetch all courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses, 
    error: coursesError 
  } = useQuery({
    queryKey: ["/api/ai-courses"],
  });

  // Fetch categories
  const { 
    data: categories, 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: ["/api/ai-course-categories"],
  });

  // Fetch user enrollments if authenticated
  const { 
    data: enrollments, 
    isLoading: isLoadingEnrollments 
  } = useQuery({
    queryKey: ["/api/user/enrollments"],
    enabled: isAuthenticated,
  });

  // Filter courses based on search, category, and difficulty
  const filteredCourses = courses?.filter((course: AiCourse) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === "all" || 
      course.categoryId === parseInt(selectedCategory);
    
    // Difficulty filter
    const matchesDifficulty = difficulty === "all" || 
      course.difficulty.toLowerCase() === difficulty.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get enrolled courses
  const enrolledCourses = enrollments?.map((enrollment: any) => enrollment.course) || [];

  useEffect(() => {
    if (coursesError) {
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again later.",
        variant: "destructive",
      });
    }
  }, [coursesError, toast]);

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Course Platform</h1>
          <p className="text-muted-foreground mt-2">
            Learn AI skills with our comprehensive courses taught by industry experts
          </p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-secondary/30 p-4 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: AiCourseCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for All Courses and My Courses */}
        <Tabs defaultValue="all-courses" className="space-y-6">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="my-courses" disabled={!isAuthenticated}>
              My Courses
            </TabsTrigger>
          </TabsList>
          
          {/* All Courses Tab */}
          <TabsContent value="all-courses" className="space-y-6">
            {isLoadingCourses || isLoadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredCourses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course: AiCourse) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={enrolledCourses.some((c: AiCourse) => c.id === course.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium">No courses found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* My Courses Tab */}
          <TabsContent value="my-courses" className="space-y-6">
            {!isAuthenticated ? (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-medium">Sign In Required</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Please sign in to view your enrolled courses
                </p>
                <Button asChild>
                  <Link href="/api/login">Sign In</Link>
                </Button>
              </div>
            ) : isLoadingEnrollments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course: AiCourse) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    isEnrolled={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary/30 rounded-lg">
                <h3 className="text-xl font-medium">No Enrolled Courses</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  You haven't enrolled in any courses yet
                </p>
                <Button asChild>
                  <Link href="#all-courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, isEnrolled }: { course: AiCourse, isEnrolled: boolean }) {
  const defaultThumbnail = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80";
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner": return "bg-green-500 hover:bg-green-600";
      case "intermediate": return "bg-blue-500 hover:bg-blue-600";
      case "advanced": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-slate-500 hover:bg-slate-600";
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img
          src={course.thumbnail || defaultThumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <Badge 
          className={`absolute top-2 right-2 ${getDifficultyColor(course.difficulty)}`}
        >
          {course.difficulty}
        </Badge>
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
        <CardDescription>
          {course.instructorName ? `By ${course.instructorName}` : "Expert Instructor"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {course.description}
        </p>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.duration || "Self-paced"}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.enrollmentCount} enrolled</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <div className="font-semibold">
            {course.price === "0" || course.price === "0.00" 
              ? "Free" 
              : `$${parseFloat(course.price).toFixed(2)}`
            }
          </div>
          
          <Button asChild variant={isEnrolled ? "secondary" : "default"}>
            <Link href={`/ai-courses/${course.id}`}>
              {isEnrolled ? (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Enroll Now
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}