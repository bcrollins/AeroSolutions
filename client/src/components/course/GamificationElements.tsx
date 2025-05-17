import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  Award,
  Trophy,
  Star,
  Clock,
  Zap,
  Flame,
  BookOpen,
  ThumbsUp,
  Target,
  Gift,
  Check,
  Users,
  CheckCircle
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Type definitions
interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  requiredValue: number;
  currentValue: number;
  category: 'achievement' | 'skill' | 'engagement' | 'completion';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  completedDate?: string;
  points: number;
  type: 'streak' | 'completion' | 'engagement' | 'quiz';
  progress?: number;
  total?: number;
}

interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string;
  history: {
    date: string;
    activities: number;
  }[];
  nextMilestone: {
    days: number;
    reward: string;
    points: number;
  };
}

interface Leaderboard {
  ranking: number;
  topUsers: {
    id: number;
    name: string;
    avatar?: string;
    points: number;
    rank: number;
    badges: number;
    streak: number;
  }[];
  userPosition: {
    points: number;
    pointsToNextRank: number;
    nextRankName: string;
    percentileRanking: number;
  };
}

interface GamificationProps {
  userId: number;
  courseId?: number; // Optional, if showing for a specific course
  showLeaderboard?: boolean;
  showStreaks?: boolean;
  showBadges?: boolean;
  showMilestones?: boolean;
  onEarnBadge?: (badge: Badge) => void;
  onCompleteMilestone?: (milestone: Milestone) => void;
}

const GamificationElements: React.FC<GamificationProps> = ({
  userId,
  courseId,
  showLeaderboard = true,
  showStreaks = true,
  showBadges = true,
  showMilestones = true,
  onEarnBadge,
  onCompleteMilestone
}) => {
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const [showBadgeDetails, setShowBadgeDetails] = useState<Badge | null>(null);
  
  // Fetch badges data
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ['/api/gamification/badges', userId, courseId],
    placeholderData: mockBadges, // Using mock data
  });
  
  // Fetch milestones data
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ['/api/gamification/milestones', userId, courseId],
    placeholderData: mockMilestones, // Using mock data
  });
  
  // Fetch streak data
  const { data: streak, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['/api/gamification/streak', userId],
    placeholderData: mockStreak, // Using mock data
  });
  
  // Fetch leaderboard data
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/gamification/leaderboard', courseId],
    placeholderData: mockLeaderboard, // Using mock data
  });
  
  // Check for newly earned badges
  useEffect(() => {
    if (badges) {
      const newlyEarnedBadge = badges.find(badge => {
        const unlockTime = badge.unlockedAt ? new Date(badge.unlockedAt).getTime() : 0;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return badge.unlockedAt && unlockTime > fiveMinutesAgo;
      });
      
      if (newlyEarnedBadge) {
        playSound('achievement');
        
        toast({
          title: "New Badge Earned!",
          description: `Congratulations! You've earned the ${newlyEarnedBadge.name} badge.`,
          variant: "default",
        });
        
        if (onEarnBadge) {
          onEarnBadge(newlyEarnedBadge);
        }
      }
    }
  }, [badges, toast, playSound, onEarnBadge]);
  
  // Check for newly completed milestones
  useEffect(() => {
    if (milestones) {
      const newlyCompletedMilestone = milestones.find(milestone => {
        const completeTime = milestone.completedDate ? new Date(milestone.completedDate).getTime() : 0;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return milestone.isCompleted && milestone.completedDate && completeTime > fiveMinutesAgo;
      });
      
      if (newlyCompletedMilestone) {
        playSound('complete');
        
        toast({
          title: "Milestone Completed!",
          description: `You've completed the "${newlyCompletedMilestone.title}" milestone and earned ${newlyCompletedMilestone.points} XP.`,
          variant: "default",
        });
        
        if (onCompleteMilestone) {
          onCompleteMilestone(newlyCompletedMilestone);
        }
      }
    }
  }, [milestones, toast, playSound, onCompleteMilestone]);
  
  // Helper to get icon for a badge
  const getBadgeIcon = (badge: Badge) => {
    switch (badge.category) {
      case 'achievement':
        return <Trophy className="h-6 w-6" />;
      case 'skill':
        return <Target className="h-6 w-6" />;
      case 'engagement':
        return <Users className="h-6 w-6" />;
      case 'completion':
        return <Check className="h-6 w-6" />;
      default:
        return <Award className="h-6 w-6" />;
    }
  };
  
  // Helper to get icon for a milestone
  const getMilestoneIcon = (milestone: Milestone) => {
    switch (milestone.type) {
      case 'streak':
        return <Flame className="h-6 w-6" />;
      case 'completion':
        return <BookOpen className="h-6 w-6" />;
      case 'engagement':
        return <ThumbsUp className="h-6 w-6" />;
      case 'quiz':
        return <Star className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };
  
  // Helper to get color class for badge rarity
  const getRarityColorClass = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-600';
      case 'uncommon':
        return 'bg-green-100 text-green-600';
      case 'rare':
        return 'bg-blue-100 text-blue-600';
      case 'epic':
        return 'bg-purple-100 text-purple-600';
      case 'legendary':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  // Format dates for readability
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Streak tracking */}
      {showStreaks && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Streak</h2>
          
          {isLoadingStreak ? (
            <Skeleton className="h-32 w-full" />
          ) : streak ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Current streak */}
                  <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Flame className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-amber-600">{streak.current}</span>
                        <span className="text-gray-600 ml-1">days</span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Longest streak: {streak.longest} days
                      </p>
                    </div>
                  </div>
                  
                  {/* Next milestone */}
                  <div className="flex-1 border-l-0 md:border-l border-gray-200 md:pl-6">
                    <p className="text-sm text-gray-600 mb-1">Next Streak Reward</p>
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Gift className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{streak.nextMilestone.reward}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Flame className="h-3 w-3 mr-1" /> 
                            In {streak.nextMilestone.days} more {streak.nextMilestone.days === 1 ? 'day' : 'days'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-1" /> 
                            {streak.nextMilestone.points} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Streak calendar */}
                  <div className="hidden lg:block">
                    <div className="flex space-x-1">
                      {streak.history.slice(-7).map((day, index) => (
                        <div 
                          key={index} 
                          className={`h-8 w-8 rounded-md flex items-center justify-center text-xs ${
                            day.activities > 0 
                              ? 'bg-amber-100 text-amber-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          title={`${formatDate(day.date)}: ${day.activities} ${day.activities === 1 ? 'activity' : 'activities'}`}
                        >
                          {new Date(day.date).getDate()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-amber-50 border-t border-amber-100 py-3 px-6">
                <div className="flex items-center text-sm text-amber-700">
                  <Clock className="h-4 w-4 mr-2" />
                  <p>Log in and complete a lesson each day to maintain your streak!</p>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">
                No streak data available. Start learning to build your streak!
              </p>
            </Card>
          )}
        </section>
      )}
      
      {/* Badges */}
      {showBadges && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges & Achievements</h2>
          
          {isLoadingBadges ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : badges?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map(badge => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`h-full flex flex-col cursor-pointer transition-colors hover:bg-gray-50 ${!badge.unlockedAt && 'opacity-70'}`}
                    onClick={() => setShowBadgeDetails(badge)}
                  >
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="flex items-center text-base">
                        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${getRarityColorClass(badge.rarity)}`}>
                          {badge.icon ? (
                            <img src={badge.icon} alt={badge.name} className="h-5 w-5" />
                          ) : (
                            getBadgeIcon(badge)
                          )}
                        </div>
                        <span className="truncate">{badge.name}</span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="py-2 flex-1">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {badge.description}
                      </p>
                      
                      {badge.unlockedAt ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Earned on {formatDate(badge.unlockedAt)}
                        </Badge>
                      ) : badge.progress !== undefined ? (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span>{Math.round((badge.currentValue / badge.requiredValue) * 100)}%</span>
                          </div>
                          <Progress value={(badge.currentValue / badge.requiredValue) * 100} className="h-1.5" />
                          <p className="text-xs text-gray-500 mt-1">
                            {badge.currentValue} / {badge.requiredValue}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          Locked
                        </Badge>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-2 pb-4">
                      <div className="text-xs text-gray-500 flex justify-between w-full">
                        <span className="capitalize">{badge.category}</span>
                        <span className="capitalize">{badge.rarity}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No badges yet</h3>
              <p className="text-gray-600 mb-4">
                Complete lessons, quizzes, and challenges to earn badges!
              </p>
            </Card>
          )}
        </section>
      )}
      
      {/* Milestones */}
      {showMilestones && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Milestones</h2>
          
          {isLoadingMilestones ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : milestones?.length ? (
            <div className="space-y-4">
              {milestones.map(milestone => (
                <Card key={milestone.id} className={milestone.isCompleted ? 'border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                        milestone.isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getMilestoneIcon(milestone)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                          <Badge className="ml-2">+{milestone.points} XP</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 mb-2">{milestone.description}</p>
                        
                        {milestone.isCompleted ? (
                          <div className="flex items-center text-sm text-green-600">
                            <Check className="h-4 w-4 mr-1" />
                            <span>Completed {milestone.completedDate ? formatDate(milestone.completedDate) : ''}</span>
                          </div>
                        ) : milestone.progress !== undefined && milestone.total !== undefined ? (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Progress</span>
                              <span>{Math.round((milestone.progress / milestone.total) * 100)}%</span>
                            </div>
                            <Progress value={(milestone.progress / milestone.total) * 100} className="h-1.5" />
                            <p className="text-xs text-gray-500 mt-1">
                              {milestone.progress} / {milestone.total}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm italic text-gray-500">
                            In progress...
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">
                No milestones available. Continue learning to unlock milestones!
              </p>
            </Card>
          )}
        </section>
      )}
      
      {/* Leaderboard */}
      {showLeaderboard && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leaderboard</h2>
          
          {isLoadingLeaderboard ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : leaderboard ? (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Top Learners</CardTitle>
                <CardDescription>
                  See how you rank among other learners
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="pt-4">
                  {/* Top 3 users get special styling */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                    {leaderboard.topUsers.slice(0, 3).map((user, index) => (
                      <Card key={user.id} className={`border-0 shadow-sm ${
                        index === 0 
                          ? 'bg-gradient-to-b from-amber-50 to-white' 
                          : index === 1 
                            ? 'bg-gradient-to-b from-gray-50 to-white' 
                            : 'bg-gradient-to-b from-orange-50 to-white'
                      }`}>
                        <CardContent className="p-4 text-center">
                          <div className="relative inline-block">
                            <Avatar className="h-16 w-16 mx-auto border-2 border-white">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="text-lg">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -top-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-white ${
                              index === 0 
                                ? 'bg-amber-500' 
                                : index === 1 
                                  ? 'bg-gray-500' 
                                  : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mt-3">{user.name}</h3>
                          <p className="text-gray-500 text-sm">
                            {user.points.toLocaleString()} XP
                          </p>
                          
                          <div className="flex justify-center space-x-2 mt-2 text-xs">
                            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                              {user.badges} badges
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                              {user.streak} day streak
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Rest of the top users */}
                  <div className="divide-y">
                    {leaderboard.topUsers.slice(3).map((user) => (
                      <div key={user.id} className="flex items-center p-4 hover:bg-gray-50">
                        <div className="w-8 text-center font-medium text-gray-500 mr-4">
                          {user.rank}
                        </div>
                        
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.points.toLocaleString()} XP</div>
                        </div>
                        
                        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 mr-1 text-blue-400" />
                            <span>{user.badges}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Flame className="h-4 w-4 mr-1 text-amber-400" />
                            <span>{user.streak}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 p-4 border-t">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Your Ranking:</span>
                      <Badge>{leaderboard.ranking}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Top {leaderboard.userPosition.percentileRanking}%
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <div className="font-medium">{leaderboard.userPosition.points.toLocaleString()} XP</div>
                      <div className="text-sm text-gray-500">
                        {leaderboard.userPosition.pointsToNextRank.toLocaleString()} XP to {leaderboard.userPosition.nextRankName}
                      </div>
                    </div>
                    
                    <Button size="sm" className="mt-3 sm:mt-0">
                      View Full Leaderboard
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600">
                Leaderboard data not available. Keep learning to appear on the leaderboard!
              </p>
            </Card>
          )}
        </section>
      )}
      
      {/* Badge Details Modal */}
      <AnimatePresence>
        {showBadgeDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgeDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${getRarityColorClass(showBadgeDetails.rarity)}`}>
                  {showBadgeDetails.icon ? (
                    <img src={showBadgeDetails.icon} alt={showBadgeDetails.name} className="h-10 w-10" />
                  ) : (
                    <div className="text-3xl">
                      {getBadgeIcon(showBadgeDetails)}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{showBadgeDetails.name}</h3>
                <div className="flex justify-center gap-2 mb-3">
                  <Badge variant="outline" className="capitalize">
                    {showBadgeDetails.category}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {showBadgeDetails.rarity}
                  </Badge>
                </div>
                <p className="text-gray-600">{showBadgeDetails.description}</p>
              </div>
              
              {showBadgeDetails.unlockedAt ? (
                <div className="bg-green-50 text-green-700 rounded-lg p-4 text-center">
                  <Check className="h-5 w-5 mx-auto mb-2" />
                  <p className="font-medium">Earned on {formatDate(showBadgeDetails.unlockedAt)}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 text-blue-700 rounded-lg p-4">
                    <h4 className="font-medium mb-1">How to earn this badge:</h4>
                    <p className="text-sm">Complete {showBadgeDetails.requiredValue} {showBadgeDetails.category === 'skill' ? 'skills' : showBadgeDetails.category === 'completion' ? 'courses' : 'actions'}.</p>
                    
                    {showBadgeDetails.currentValue > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Your progress</span>
                          <span>{Math.round((showBadgeDetails.currentValue / showBadgeDetails.requiredValue) * 100)}%</span>
                        </div>
                        <Progress value={(showBadgeDetails.currentValue / showBadgeDetails.requiredValue) * 100} className="h-2" />
                        <p className="text-xs text-blue-600 mt-1 text-right">
                          {showBadgeDetails.currentValue} / {showBadgeDetails.requiredValue}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowBadgeDetails(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mock data for demonstration
const mockBadges: Badge[] = [
  {
    id: 1,
    name: "Fast Learner",
    description: "Complete 5 lessons in a single day",
    icon: "/images/badges/fast-learner.svg",
    unlockedAt: "2025-05-10T14:30:00",
    requiredValue: 5,
    currentValue: 5,
    category: "achievement",
    rarity: "common"
  },
  {
    id: 2,
    name: "Quiz Master",
    description: "Score 90% or higher on 3 consecutive quizzes",
    icon: "/images/badges/quiz-master.svg",
    unlockedAt: "2025-05-08T11:15:00",
    requiredValue: 3,
    currentValue: 3,
    category: "skill",
    rarity: "uncommon"
  },
  {
    id: 3,
    name: "Consistency Champion",
    description: "Maintain a 10-day learning streak",
    icon: "/images/badges/consistency-champion.svg",
    unlockedAt: "2025-05-07T09:45:00",
    requiredValue: 10,
    currentValue: 12,
    category: "engagement",
    rarity: "rare"
  },
  {
    id: 4,
    name: "AI Pioneer",
    description: "Complete the AI Foundations course with distinction",
    icon: "/images/badges/ai-pioneer.svg",
    requiredValue: 1,
    currentValue: 0,
    category: "completion",
    rarity: "epic"
  },
  {
    id: 5,
    name: "Neural Network Ninja",
    description: "Successfully implement 5 different neural network architectures",
    icon: "/images/badges/neural-network-ninja.svg",
    progress: 60,
    requiredValue: 5,
    currentValue: 3,
    category: "skill",
    rarity: "rare"
  },
  {
    id: 6,
    name: "Learning Legend",
    description: "Complete all courses in the AI & Machine Learning track",
    icon: "/images/badges/learning-legend.svg",
    requiredValue: 6,
    currentValue: 1,
    category: "completion",
    rarity: "legendary"
  }
];

const mockMilestones: Milestone[] = [
  {
    id: 1,
    title: "7-Day Streak",
    description: "Log in and complete at least one lesson every day for 7 days",
    isCompleted: true,
    completedDate: "2025-05-07T09:45:00",
    points: 50,
    type: "streak"
  },
  {
    id: 2,
    title: "Complete Your First Course",
    description: "Successfully finish all lessons in any course",
    isCompleted: true,
    completedDate: "2025-05-05T16:30:00",
    points: 100,
    type: "completion"
  },
  {
    id: 3,
    title: "Machine Learning Expert",
    description: "Complete all courses in the Machine Learning specialization",
    isCompleted: false,
    points: 500,
    type: "completion",
    progress: 1,
    total: 4
  },
  {
    id: 4,
    title: "Quiz Perfectionist",
    description: "Score 100% on 10 different quizzes",
    isCompleted: false,
    points: 200,
    type: "quiz",
    progress: 4,
    total: 10
  },
  {
    id: 5,
    title: "Active Community Member",
    description: "Participate in 5 discussion forums by posting quality responses",
    isCompleted: false,
    points: 150,
    type: "engagement",
    progress: 2,
    total: 5
  }
];

const mockStreak: Streak = {
  current: 12,
  longest: 15,
  lastActivityDate: "2025-05-16T15:30:00",
  history: [
    { date: "2025-05-10T12:30:00", activities: 3 },
    { date: "2025-05-11T14:20:00", activities: 1 },
    { date: "2025-05-12T10:10:00", activities: 2 },
    { date: "2025-05-13T16:45:00", activities: 4 },
    { date: "2025-05-14T09:30:00", activities: 1 },
    { date: "2025-05-15T11:15:00", activities: 2 },
    { date: "2025-05-16T15:30:00", activities: 3 }
  ],
  nextMilestone: {
    days: 3,
    reward: "15-Day Streak Badge",
    points: 100
  }
};

const mockLeaderboard: Leaderboard = {
  ranking: 7,
  topUsers: [
    {
      id: 101,
      name: "Alex Chen",
      avatar: "/images/avatars/alex-chen.jpg",
      points: 8750,
      rank: 1,
      badges: 15,
      streak: 23
    },
    {
      id: 102,
      name: "Maria Rodriguez",
      avatar: "/images/avatars/maria-rodriguez.jpg",
      points: 7920,
      rank: 2,
      badges: 12,
      streak: 18
    },
    {
      id: 103,
      name: "David Kim",
      avatar: "/images/avatars/david-kim.jpg",
      points: 7540,
      rank: 3,
      badges: 14,
      streak: 16
    },
    {
      id: 104,
      name: "Sophie Taylor",
      avatar: "/images/avatars/sophie-taylor.jpg",
      points: 6890,
      rank: 4,
      badges: 11,
      streak: 14
    },
    {
      id: 105,
      name: "James Wilson",
      avatar: "/images/avatars/james-wilson.jpg",
      points: 6740,
      rank: 5,
      badges: 10,
      streak: 12
    }
  ],
  userPosition: {
    points: 5750,
    pointsToNextRank: 990,
    nextRankName: "Gold Tier",
    percentileRanking: 15
  }
};

export default GamificationElements;