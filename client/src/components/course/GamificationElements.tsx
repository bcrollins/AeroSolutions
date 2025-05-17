import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  Flame, 
  Star, 
  Zap, 
  Users,
  Medal,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Progress Tracker Component for course completion
export function ProgressTracker({ progress, total }: { progress: number; total: number }) {
  const percentage = Math.round((progress / total) * 100) || 0;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Learning Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress} of {total} completed</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              <span>Current streak: 3 days</span>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              Level {Math.floor(percentage / 20) + 1}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Badges Display Component
export function BadgesDisplay({ badges = [] }: { badges?: Array<any> }) {
  // Default badges if none provided
  const defaultBadges = [
    { id: 1, name: 'Fast Learner', iconName: 'zap', color: 'text-yellow-500', earned: true },
    { id: 2, name: 'Knowledge Seeker', iconName: 'book', color: 'text-blue-500', earned: true },
    { id: 3, name: 'Course Master', iconName: 'award', color: 'text-purple-500', earned: false },
    { id: 4, name: 'Perfect Score', iconName: 'target', color: 'text-green-500', earned: false },
  ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap />;
      case 'award': return <Award />;
      case 'star': return <Star />;
      case 'medal': return <Medal />;
      default: return <Trophy />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {displayBadges.map(badge => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className={`flex flex-col items-center justify-center p-2 rounded-md border 
                    ${badge.earned ? 'bg-primary/5 border-primary/20' : 'bg-gray-100 border-gray-200 opacity-50 dark:bg-gray-800 dark:border-gray-700'}`}
                    whileHover={{ scale: badge.earned ? 1.05 : 1 }}
                  >
                    <div className={`p-2 rounded-full ${badge.color} bg-opacity-10 mb-1`}>
                      {getIcon(badge.iconName)}
                    </div>
                    <span className="text-xs font-medium text-center">{badge.name}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.earned ? 'Earned' : 'Locked'}: {badge.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Streak Display Component
export function StreakDisplay({ currentStreak = 3, longestStreak = 7 }: { currentStreak?: number; longestStreak?: number }) {
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - 6 + i);
    return {
      date: day,
      active: i < currentStreak
    };
  });

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Flame className="mr-2 h-5 w-5 text-primary" />
          Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {streakDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {dayLabels[day.date.getDay()]}
                </div>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${day.active ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {day.active && <Flame className="h-4 w-4" />}
                </motion.div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-1">{currentStreak} days</span>
              <span className="text-muted-foreground">current</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">{longestStreak} days</span>
              <span className="text-muted-foreground">best</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard Display Component
export function LeaderboardDisplay({ leaders = [] }: { leaders?: Array<any> }) {
  // Default leaders if none provided
  const defaultLeaders = [
    { id: 1, name: "Alex Johnson", points: 1250, avatar: "/avatars/01.png", rank: 1 },
    { id: 2, name: "Jordan Smith", points: 980, avatar: "/avatars/02.png", rank: 2 },
    { id: 3, name: "Taylor Wilson", points: 875, avatar: "/avatars/03.png", rank: 3 },
    { id: 4, name: "Casey Brown", points: 760, avatar: "/avatars/04.png", rank: 4 },
    { id: 5, name: "Riley Davis", points: 630, avatar: "/avatars/05.png", rank: 5 }
  ];

  const displayLeaders = leaders.length > 0 ? leaders : defaultLeaders;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px] pr-4">
          {displayLeaders.map((leader, index) => (
            <div key={leader.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 mr-3">
                  {index < 3 ? (
                    <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted overflow-hidden mr-2">
                    <img 
                      src={leader.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${leader.name}`} 
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{leader.name}</span>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-semibold">{leader.points}</span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}