import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface EnrollmentType {
  id: number;
  courseId: number;
  userId: string;
  title: string;
  description: string;
  thumbnail: string;
  progressPercentage: number;
  lastAccessedLessonId?: number;
  enrolledAt: string;
  status: string;
}

interface EnrolledCoursesProps {
  enrollments: EnrollmentType[];
}

export default function EnrolledCourses({ enrollments }: EnrolledCoursesProps) {
  const [page, setPage] = useState(0);
  const coursesPerPage = 6;
  const totalPages = Math.ceil(enrollments.length / coursesPerPage);
  
  // No enrollments state
  if (!enrollments.length) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center justify-center py-10">
              <BookOpen className="h-16 w-16 text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-slate-400 mb-6 max-w-md">You haven't enrolled in any courses yet. Explore our catalog to find courses that match your interests.</p>
              <a 
                href="/ai-courses" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              >
                Browse Courses
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Render enrolled courses with pagination
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Courses</h2>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments
          .slice(page * coursesPerPage, (page + 1) * coursesPerPage)
          .map((enrollment) => (
            <Card 
              key={enrollment.id} 
              className="bg-slate-800 border-slate-700 text-white overflow-hidden hover:border-blue-500 transition-all hover:scale-[1.05] duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={enrollment.thumbnail || "https://placehold.co/600x400/1a1a1a/007bff?text=Course"} 
                  alt={enrollment.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70"></div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{enrollment.title}</CardTitle>
                <CardDescription className="text-slate-400 line-clamp-2">
                  {enrollment.description || "Continue your learning journey with this course."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-blue-400">{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="relative">
                    {/* Circular progress bar */}
                    <div className="w-16 h-16 mx-auto relative">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          className="text-slate-700"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        {/* Progress circle */}
                        <circle
                          className="text-blue-500"
                          strokeWidth="8"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                          strokeDasharray={`${40 * 2 * Math.PI}`}
                          strokeDashoffset={`${40 * 2 * Math.PI * (1 - enrollment.progressPercentage / 100)}`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        {enrollment.progressPercentage}%
                      </div>
                    </div>
                    
                    {/* Regular progress bar (mobile friendly) */}
                    <Progress 
                      value={enrollment.progressPercentage} 
                      className="h-2 mt-4 bg-slate-700" 
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                >
                  <a href={`/ai-courses/${enrollment.courseId}`}>Continue Learning</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </section>
  );
}