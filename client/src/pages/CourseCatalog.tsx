import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PersonalizedRecommendations from '@/components/recommendations/PersonalizedRecommendations';
import { Search, Clock, User, Book, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

// Define the types based on the shared schema
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
  categoryId: number | null;
};

type AiCourseCategory = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
};

// Function to get difficulty badge color
function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
}

const CourseCatalog = () => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(localStorage.getItem("course_catalog_tab") || "all");
  const { isAuthenticated } = useAuth();
  const coursesPerPage = 9;

  // Fetch courses data
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/ai-courses"],
  });

  // Fetch categories data
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/ai-courses/categories"],
  });
  
  // Extract courses and categories from response data
  const courses = coursesData?.courses || [];
  const categories = categoriesData || [];
  
  // Save the active tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("course_catalog_tab", value);
  };

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter((course: AiCourse) => {
    // Search filter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.instructorName && course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Difficulty filter
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    // Category filter
    const matchesCategory = categoryFilter === "all" || course.categoryId === parseInt(categoryFilter);

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Calculate pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Pagination change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>
        
        {/* Tabs Navigation */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={handleTabChange} 
          className="mb-8"
        >
          <TabsList className="bg-[#252525] border border-gray-700 p-1">
            {isAuthenticated && (
              <TabsTrigger 
                value="recommendations" 
                className="data-[state=active]:bg-[#007bff] data-[state=active]:text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recommended For You
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-[#007bff] data-[state=active]:text-white"
            >
              <Book className="h-4 w-4 mr-2" />
              All Courses
            </TabsTrigger>
          </TabsList>
          
          {/* Recommendations Tab */}
          {isAuthenticated && (
            <TabsContent value="recommendations" className="pt-6 pb-10">
              <div className="bg-[#252525] rounded-lg border border-gray-700 p-6 mb-6">
                <PersonalizedRecommendations limit={6} withAnimation={true} />
                <Separator className="my-8 bg-gray-700" />
                <div className="text-center">
                  <p className="text-gray-400 mb-4">
                    These recommendations are powered by AI and tailored to your learning profile.
                    The more courses you engage with, the better your recommendations will become.
                  </p>
                  <button 
                    onClick={() => handleTabChange('all')}
                    className="text-[#007bff] hover:text-[#0056b3] font-medium transition-colors"
                  >
                    View all courses →
                  </button>
                </div>
              </div>
            </TabsContent>
          )}
          
          {/* All Courses Tab */}
          <TabsContent value="all" className="mt-6">
            {/* Search and Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#252525] border-[#007bff] text-white focus:ring-[#007bff] focus:border-[#007bff]"
                />
              </div>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="bg-[#252525] border-[#007bff] text-white">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#007bff] text-white">
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-[#252525] border-[#007bff] text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#007bff] text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: AiCourseCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {coursesLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007bff]"></div>
              </div>
            )}

            {/* No Results */}
            {!coursesLoading && filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentCourses.map((course: AiCourse) => (
                <Card key={course.id} className="bg-[#252525] border-gray-700 overflow-hidden hover:border-[#007bff] transition-all">
                  <div className="h-[200px] overflow-hidden bg-gray-800">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500">
                        <Book className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-white line-clamp-2">{course.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-300 line-clamp-3 mb-4">{course.description}</p>
                    <div className="flex items-center text-sm text-gray-400 mb-1">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.duration || 'Self-paced'}</span>
                    </div>
                    {course.instructorName && (
                      <div className="flex items-center text-sm text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>{course.instructorName}</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-0">
                    <span className="text-[#007bff] font-semibold">{course.price}</span>
                    <button className="px-3 py-1 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-md transition-colors">
                      View Course
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md bg-[#252525] border border-gray-700 hover:bg-[#333] disabled:opacity-50 disabled:hover:bg-[#252525]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] h-10 rounded-md flex items-center justify-center transition-colors
                      ${currentPage === page 
                        ? 'bg-[#007bff] text-white' 
                        : 'bg-[#252525] text-gray-300 hover:bg-[#333]'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md bg-[#252525] border border-gray-700 hover:bg-[#333] disabled:opacity-50 disabled:hover:bg-[#252525]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseCatalog;