import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, ThumbsUp, Filter, ChevronDown, Search, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserReview {
  id: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  completionRate?: number;
  userProgress?: string; // e.g., '45% complete'
}

interface UserReviewsProps {
  courseId: number;
  rating?: number;
  ratingCount?: number;
}

const UserReviews: React.FC<UserReviewsProps> = ({ 
  courseId, 
  rating = 4.8, 
  ratingCount = 324 
}) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  
  // In a real app, we'd fetch this from the API
  const { data: reviews, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}/reviews`],
    placeholderData: mockReviews, // Using mock data for now
  });
  
  const handleMarkHelpful = (reviewId: number) => {
    if (helpfulReviews.includes(reviewId)) return;
    
    setHelpfulReviews([...helpfulReviews, reviewId]);
    toast({
      title: "Thanks for your feedback",
      description: "You marked this review as helpful.",
      variant: "default",
    });
    
    // In a real app, this would be an API call
  };
  
  const handleReportReview = (reviewId: number) => {
    toast({
      title: "Review reported",
      description: "Thanks for helping keep our community respectful.",
      variant: "default",
    });
    
    // In a real app, this would be an API call
  };
  
  const handleFilterChange = (newFilter: 'all' | 'positive' | 'negative') => {
    setFilter(newFilter);
  };
  
  const handleSortChange = (newSort: 'recent' | 'helpful' | 'highest' | 'lowest') => {
    setSortBy(newSort);
  };
  
  // Filter and sort reviews
  const filteredReviews = reviews
    ?.filter(review => {
      // Apply rating filter
      if (filter === 'positive' && review.rating < 4) return false;
      if (filter === 'negative' && review.rating >= 4) return false;
      
      // Apply search filter if there's a search term
      if (search && !review.content.toLowerCase().includes(search.toLowerCase()) && 
          !review.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    ?.sort((a, b) => {
      // Apply sorting
      if (sortBy === 'recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });
  
  // Calculate rating distribution 
  const ratingDistribution = reviews?.reduce(
    (acc, review) => {
      const rating = Math.floor(review.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  ) || {};
  
  // Calculate percentages for each rating
  const totalReviews = ratingCount || (reviews?.length || 0);
  const ratingPercentages = {
    5: ((ratingDistribution[5] || 0) / totalReviews) * 100,
    4: ((ratingDistribution[4] || 0) / totalReviews) * 100,
    3: ((ratingDistribution[3] || 0) / totalReviews) * 100,
    2: ((ratingDistribution[2] || 0) / totalReviews) * 100,
    1: ((ratingDistribution[1] || 0) / totalReviews) * 100
  };
  
  // Calculate ratings summary info
  const fiveStarCount = ratingDistribution[5] || 0;
  const fiveStarPercent = Math.round((fiveStarCount / totalReviews) * 100);
  
  // Function to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <CardTitle className="text-2xl font-bold">Student Reviews</CardTitle>
          <CardDescription>
            See what students are saying about this course
          </CardDescription>
          
          <div className="mt-4 flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-900">{rating}</div>
            <div>
              <div className="flex text-yellow-400 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(rating)
                        ? "fill-current"
                        : "fill-none"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">Course Rating • {totalReviews} reviews</div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 bg-gray-50 p-4 rounded-lg w-full sm:w-64">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
          
          {[5, 4, 3, 2, 1].map((num) => (
            <div key={num} className="flex items-center space-x-2 mb-2">
              <div className="text-sm text-gray-600 w-3">{num}</div>
              <div className="flex text-yellow-400">
                <Star className="h-3 w-3 fill-current" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${ratingPercentages[num as keyof typeof ratingPercentages]}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 w-8 text-right">
                {Math.round(ratingPercentages[num as keyof typeof ratingPercentages])}%
              </div>
            </div>
          ))}
          
          <div className="text-sm text-gray-600 mt-4">
            {fiveStarPercent}% of reviewers gave this course 5 stars
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reviews..."
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
              Filters
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                All Reviews
              </Button>
              <Button
                variant={filter === 'positive' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('positive')}
              >
                4-5 Stars
              </Button>
              <Button
                variant={filter === 'negative' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('negative')}
              >
                1-3 Stars
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <h4 className="font-medium mb-2">Sort by</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'recent' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange('recent')}
                >
                  Most Recent
                </Button>
                <Button
                  variant={sortBy === 'helpful' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange('helpful')}
                >
                  Most Helpful
                </Button>
                <Button
                  variant={sortBy === 'highest' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange('highest')}
                >
                  Highest Rated
                </Button>
                <Button
                  variant={sortBy === 'lowest' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange('lowest')}
                >
                  Lowest Rated
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Reviews list */}
        {filteredReviews?.length ? (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
                <div className="flex items-start gap-4 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-medium">{review.userName}</h4>
                      <div className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                          Verified Purchase
                        </Badge>
                      )}
                      
                      {review.completionRate !== undefined && (
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                          {review.completionRate}% Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-14">
                  <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-700 mb-4">{review.content}</p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className={`flex items-center ${helpfulReviews.includes(review.id) ? 'bg-gray-100 text-gray-800' : ''}`}
                      onClick={() => handleMarkHelpful(review.id)}
                      disabled={helpfulReviews.includes(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful {review.helpfulCount + (helpfulReviews.includes(review.id) ? 1 : 0) > 0 && `(${review.helpfulCount + (helpfulReviews.includes(review.id) ? 1 : 0)})`}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => handleReportReview(review.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews match your criteria</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <Button 
              onClick={() => {
                setFilter('all');
                setSearch('');
                setSortBy('recent');
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
const mockReviews: UserReview[] = [
  {
    id: 1,
    userId: 'user1',
    userName: 'Michael Johnson',
    userAvatar: '/images/avatars/avatar-1.jpg',
    rating: 5,
    title: 'Exactly what I needed to level up my skills',
    content: "This course provided a perfect blend of theory and practical examples. The instructor's explanations were crystal clear and I was able to implement everything I learned right away in my current projects. Highly recommend for anyone looking to master AI development.",
    date: '2023-12-01',
    helpfulCount: 24,
    isVerifiedPurchase: true,
    completionRate: 100
  },
  {
    id: 2,
    userId: 'user2',
    userName: 'Sarah Chen',
    userAvatar: '/images/avatars/avatar-2.jpg',
    rating: 4,
    title: 'Great content but some sections could be more detailed',
    content: "The course was very informative and well-structured. I particularly enjoyed the hands-on projects. However, I felt that some of the more advanced topics could have been explained in greater depth. That said, it's still one of the best courses I've taken on this subject.",
    date: '2023-11-15',
    helpfulCount: 18,
    isVerifiedPurchase: true,
    completionRate: 95
  },
  {
    id: 3,
    userId: 'user3',
    userName: 'David Kim',
    userAvatar: '/images/avatars/avatar-3.jpg',
    rating: 5,
    title: 'Transformed how I approach AI projects',
    content: "I've taken several AI courses before, but this one truly stands out. The instructor's approach to explaining complex concepts makes them accessible without oversimplifying. The course projects are challenging but achievable, and they've given me practical skills I'm already using in my job.",
    date: '2023-10-22',
    helpfulCount: 32,
    isVerifiedPurchase: true,
    userProgress: '100% complete'
  },
  {
    id: 4,
    userId: 'user4',
    userName: 'Emily Rodriguez',
    userAvatar: '/images/avatars/avatar-4.jpg',
    rating: 3,
    title: 'Good introduction but moves too quickly',
    content: "The content is high quality and the instructor clearly knows the subject matter well. However, I found that new concepts were introduced too rapidly without enough time to practice. I had to pause frequently and spend time researching on my own to fully understand the material.",
    date: '2023-10-10',
    helpfulCount: 7,
    isVerifiedPurchase: true,
    completionRate: 65
  },
  {
    id: 5,
    userId: 'user5',
    userName: 'Alex Thompson',
    userAvatar: '/images/avatars/avatar-5.jpg',
    rating: 5,
    title: 'Worth every penny',
    content: "I hesitated due to the price, but this course delivered exceptional value. The instructor provides insights that go beyond what you'd find in documentation or free tutorials. I particularly appreciated the sections on model optimization and deployment strategies.",
    date: '2023-09-28',
    helpfulCount: 15,
    isVerifiedPurchase: true,
    completionRate: 100
  }
];

export default UserReviews;