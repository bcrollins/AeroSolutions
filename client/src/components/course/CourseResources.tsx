import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, FileImage, Video, Download, Link as LinkIcon, 
  Code, ArrowDown, Search, Filter, ArrowUpDown, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseResource {
  id: number;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'image' | 'code' | 'link' | 'zip';
  url: string;
  size?: string;
  uploadDate: string;
  downloadCount?: number;
  locked?: boolean;
  moduleName?: string;
  moduleId?: number;
  tags?: string[];
}

interface CourseResourcesProps {
  courseId: number;
  isEnrolled: boolean;
}

const CourseResources: React.FC<CourseResourcesProps> = ({ courseId, isEnrolled }) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'name'>('recent');
  
  // In a real app, we'd fetch this from the API
  const { data: resources, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/resources`],
    placeholderData: mockResources, // Using mock data for now
  });
  
  const handleDownload = (resource: CourseResource) => {
    if (!isEnrolled && resource.locked) {
      toast({
        title: "Resource locked",
        description: "Please enroll in the course to access this resource.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would trigger the actual download
    toast({
      title: "Download started",
      description: `${resource.title} is being downloaded.`,
      variant: "default",
    });
    
    // Simulate download by opening in new tab
    window.open(resource.url, '_blank');
  };
  
  // Filter types for the resources
  const resourceTypes = Array.from(
    new Set(resources?.map(resource => resource.type) || [])
  );
  
  // Filter by module
  const modules = Array.from(
    new Set(resources?.map(resource => resource.moduleName).filter(Boolean) || [])
  );
  
  // Filter and sort resources
  const filteredResources = resources
    ?.filter(resource => {
      // Apply type filter
      if (filter !== 'all' && resource.type !== filter && resource.moduleName !== filter) {
        return false;
      }
      
      // Apply search filter if there's a search term
      if (search && !resource.title.toLowerCase().includes(search.toLowerCase()) && 
          !(resource.description?.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }
      
      return true;
    })
    ?.sort((a, b) => {
      // Apply sorting
      if (sortBy === 'recent') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'popular' && a.downloadCount !== undefined && b.downloadCount !== undefined) {
        return b.downloadCount - a.downloadCount;
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'image':
        return <FileImage className="h-6 w-6 text-purple-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-blue-500" />;
      case 'code':
        return <Code className="h-6 w-6 text-green-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-amber-500" />;
      case 'zip':
        return <ArrowDown className="h-6 w-6 text-gray-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-1/3" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!resources?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Resources</CardTitle>
          <CardDescription>
            Supplementary materials for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resources available</h3>
            <p className="text-gray-500 mb-4">Resources will be added as you progress through the course</p>
            
            {!isEnrolled && (
              <Button>Enroll to access course resources</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Resources</CardTitle>
        <CardDescription>
          Downloadable materials to enhance your learning experience
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter & Sort
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Resources
              </Button>
              
              {resourceTypes.map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className="capitalize"
                >
                  {type}s
                </Button>
              ))}
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-gray-50 rounded-lg space-y-4"
              >
                {modules.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Filter by module</h4>
                    <div className="flex flex-wrap gap-2">
                      {modules.map((module) => (
                        <Button
                          key={module}
                          variant={filter === module ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilter(module)}
                        >
                          {module}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Sort by</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortBy === 'recent' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('recent')}
                    >
                      Most Recent
                    </Button>
                    <Button
                      variant={sortBy === 'popular' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('popular')}
                    >
                      Most Downloaded
                    </Button>
                    <Button
                      variant={sortBy === 'name' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('name')}
                    >
                      Name (A-Z)
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Resources list */}
        {filteredResources?.length ? (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <div 
                key={resource.id} 
                className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  !isEnrolled && resource.locked ? 'opacity-70' : ''
                }`}
              >
                <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md">
                  {getResourceIcon(resource.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start">
                    <h4 className="font-medium text-gray-900 truncate">{resource.title}</h4>
                    {resource.locked && !isEnrolled && (
                      <Badge variant="outline" className="ml-2 text-amber-700 bg-amber-50 border-amber-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  
                  {resource.description && (
                    <p className="text-sm text-gray-600 truncate">{resource.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    {resource.moduleName && (
                      <span>{resource.moduleName}</span>
                    )}
                    
                    {resource.size && (
                      <span>{resource.size}</span>
                    )}
                    
                    <span>
                      Added {new Date(resource.uploadDate).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    
                    {resource.downloadCount !== undefined && (
                      <span>{resource.downloadCount} downloads</span>
                    )}
                  </div>
                  
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button
                  variant={(!isEnrolled && resource.locked) ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleDownload(resource)}
                  className="flex-shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {resource.type === 'link' ? 'Open Link' : 'Download'}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No matching resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <Button 
              onClick={() => {
                setFilter('all');
                setSearch('');
              }}
              variant="link"
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Mock data for demo purposes
const mockResources: CourseResource[] = [
  {
    id: 1,
    title: "Course Slides - Introduction to AI",
    type: "pdf",
    url: "/resources/introduction-to-ai-slides.pdf",
    size: "5.2 MB",
    uploadDate: "2023-11-10",
    downloadCount: 245,
    locked: false,
    moduleName: "Foundations of Modern AI",
    moduleId: 1,
    tags: ["slides", "week 1"]
  },
  {
    id: 2,
    title: "Neural Network Architecture Diagrams",
    type: "image",
    url: "/resources/neural-network-diagrams.zip",
    size: "12.7 MB",
    uploadDate: "2023-11-12",
    downloadCount: 189,
    locked: false,
    moduleName: "Foundations of Modern AI",
    moduleId: 1,
    tags: ["diagrams", "visual aids"]
  },
  {
    id: 3,
    title: "CNN Implementation Exercise - Starter Code",
    type: "code",
    url: "/resources/cnn-exercise-starter.zip",
    size: "3.8 MB",
    uploadDate: "2023-11-20",
    downloadCount: 167,
    locked: true,
    moduleName: "Deep Learning Architectures",
    moduleId: 2,
    tags: ["exercise", "code", "CNN"]
  },
  {
    id: 4,
    title: "Extended Interview: Machine Learning Trends",
    type: "video",
    url: "/resources/ml-trends-interview.mp4",
    size: "82.5 MB",
    uploadDate: "2023-11-25",
    downloadCount: 93,
    locked: true,
    moduleName: "Deep Learning Architectures",
    moduleId: 2,
    tags: ["interview", "supplementary"]
  },
  {
    id: 5,
    title: "Additional Reading: Transformers Architecture",
    type: "link",
    url: "https://example.com/transformers-architecture",
    uploadDate: "2023-11-28",
    downloadCount: 120,
    locked: false,
    tags: ["reading", "research paper"]
  },
  {
    id: 6,
    title: "Comprehensive Dataset for Project",
    type: "zip",
    url: "/resources/project-dataset.zip",
    size: "156 MB",
    uploadDate: "2023-12-01",
    downloadCount: 78,
    locked: true,
    moduleName: "Deep Learning Architectures",
    moduleId: 2,
    tags: ["dataset", "project"]
  }
];

export default CourseResources;