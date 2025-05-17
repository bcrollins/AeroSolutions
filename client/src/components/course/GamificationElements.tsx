import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star, Zap, Trophy, Clock } from 'lucide-react';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  dateEarned?: string;
  isLocked?: boolean;
}

export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
}

// Progress Tracker component for courses
export const ProgressTracker = ({ 
  progress, 
  label 
}: { 
  progress: number; 
  label?: string 
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
};

// Badges Display component for achievements
export const BadgesDisplay = ({ 
  badges,
  compact = false
}: { 
  badges: Badge[];
  compact?: boolean;
}) => {
  if (badges.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No badges earned yet. Complete lessons to earn badges!
      </div>
    );
  }

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="h-5 w-5" />;
      case 'star':
        return <Star className="h-5 w-5" />;
      case 'zap':
        return <Zap className="h-5 w-5" />;
      case 'trophy':
        return <Trophy className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Badge 
            key={badge.id} 
            variant={badge.isLocked ? "outline" : "secondary"}
            className={`flex items-center gap-1 ${badge.isLocked ? 'opacity-50' : ''}`}
          >
            {renderIcon(badge.icon)}
            <span>{badge.name}</span>
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {badges.map((badge) => (
        <Card key={badge.id} className={badge.isLocked ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {renderIcon(badge.icon)}
              {badge.name}
              {badge.isLocked && <Badge variant="outline">Locked</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            {badge.dateEarned && !badge.isLocked && (
              <p className="text-xs text-muted-foreground mt-2">
                Earned on {new Date(badge.dateEarned).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Streak Display component
export const StreakDisplay = ({ 
  currentStreak, 
  longestStreak 
}: { 
  currentStreak: number; 
  longestStreak: number;
}) => {
  return (
    <div className="flex gap-4">
      <div className="bg-primary/10 rounded-lg p-3 flex flex-col items-center flex-1">
        <span className="text-xs text-muted-foreground">Current Streak</span>
        <div className="flex items-center gap-1 mt-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-xl font-bold">{currentStreak}</span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>
      
      <div className="bg-primary/10 rounded-lg p-3 flex flex-col items-center flex-1">
        <span className="text-xs text-muted-foreground">Longest Streak</span>
        <div className="flex items-center gap-1 mt-1">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-xl font-bold">{longestStreak}</span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>
    </div>
  );
};

// Leaderboard display component
export const LeaderboardDisplay = ({
  leaderboard,
  currentUserId
}: {
  leaderboard: Array<{
    userId: string;
    name: string;
    avatar?: string;
    score: number;
    rank: number;
  }>;
  currentUserId?: string;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 text-sm font-medium px-4 py-2 bg-muted/50 rounded-md">
        <div className="col-span-1">Rank</div>
        <div className="col-span-7">Student</div>
        <div className="col-span-4 text-right">Points</div>
      </div>
      
      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <div 
            key={entry.userId}
            className={`grid grid-cols-12 items-center p-2 rounded-md ${
              entry.userId === currentUserId ? 'bg-primary/10 border border-primary/20' : ''
            }`}
          >
            <div className="col-span-1 font-bold">{entry.rank}</div>
            <div className="col-span-7 flex items-center gap-2">
              {entry.avatar ? (
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img 
                    src={entry.avatar} 
                    alt={entry.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold">{entry.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span>
                {entry.name} 
                {entry.userId === currentUserId && (
                  <span className="ml-1 text-xs text-muted-foreground">(You)</span>
                )}
              </span>
            </div>
            <div className="col-span-4 text-right font-semibold">{entry.score.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  ProgressTracker,
  BadgesDisplay,
  StreakDisplay,
  LeaderboardDisplay
};