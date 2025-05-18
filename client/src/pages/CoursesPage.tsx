import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, TrendingUp, Clock, Tag, ChevronDown, BarChart3 } from 'lucide-react';
import CourseCard from '@/components/course/CourseCard';
import PersonalizedRecommendations from '@/components/recommendations/PersonalizedRecommendations';
import useRecommendationTracker from '@/hooks/useRecommendationTracker';
import { useAuth } from '@/hooks/useAuth';

const CoursesPage = () => {
  const { isAuthenticated } = useAuth();
  const { trackPageView } = useRecommendationTracker();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    category: 'all',
    difficulty: 'all',
    sort: 'newest'
  });
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    // Track that the user viewed the courses page (for recommendation improvement)
    trackPageView('courses');
  }, [trackPageView]);
  
  // Fetch all courses
  const { 
    data: coursesData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    }
  });
  
  // Featured trending topics
  const trendingTopics = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Neural Networks',
    'Reinforcement Learning'
  ];
  
  // Filter and sort courses
  const filteredCourses = React.useMemo(() => {
    if (!coursesData?.courses) return [];
    
    return coursesData.courses
      .filter((course: any) => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Category filter
        const matchesCategory = filter.category === 'all' || 
          course.category === filter.category;
        
        // Difficulty filter
        const matchesDifficulty = filter.difficulty === 'all' || 
          course.difficulty === filter.difficulty;
        
        // Tab filter
        const matchesTab = activeTab === 'all' || 
          (activeTab === 'beginner' && course.difficulty === 'beginner') ||
          (activeTab === 'intermediate' && course.difficulty === 'intermediate') ||
          (activeTab === 'advanced' && course.difficulty === 'advanced') ||
          (activeTab === 'featured' && course.featured === true);
        
        return matchesSearch && matchesCategory && matchesDifficulty && matchesTab;
      })
      .sort((a: any, b: any) => {
        // Sort options
        if (filter.sort === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else if (filter.sort === 'popular') {
          return (b.popularity || 0) - (a.popularity || 0);
        } else if (filter.sort === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        } else {
          return 0;
        }
      });
  }, [coursesData, searchTerm, filter, activeTab]);
  
  const handleTopicClick = (topic: string) => {
    setSearchTerm(topic);
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Explore AI Courses | Learn at Your Own Pace</title>
      </Helmet>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with filter options */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={filter.category} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="machine-learning">Machine Learning</SelectItem>
                    <SelectItem value="deep-learning">Deep Learning</SelectItem>
                    <SelectItem value="nlp">Natural Language Processing</SelectItem>
                    <SelectItem value="computer-vision">Computer Vision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select 
                  value={filter.difficulty} 
                  onValueChange={(value) => handleFilterChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select 
                  value={filter.sort} 
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map(topic => (
                    <Badge 
                      key={topic} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleTopicClick(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content - course listings */}
        <div className="lg:col-span-3 space-y-6">
          {isAuthenticated && (
            <PersonalizedRecommendations limit={3} className="mb-8" />
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">Explore AI Courses</h1>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <div className="mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Failed to Load Courses</h2>
              <p className="text-gray-600 mb-6">We couldn't load the courses at this time. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          ) : (
            <>
              <AnimatePresence>
                {filteredCourses.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredCourses.map((course: any, index: number) => (
                      <motion.div
                        key={course.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * (index % 6) }}
                      >
                        <CourseCard 
                          course={course}
                          featured={course.featured}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setFilter({ category: 'all', difficulty: 'all', sort: 'newest' });
                      setActiveTab('all');
                    }}>
                      Reset Filters
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {filteredCourses.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">Showing {filteredCourses.length} of {coursesData?.courses?.length || 0} courses</p>
                  <Button variant="outline">
                    Load More <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;