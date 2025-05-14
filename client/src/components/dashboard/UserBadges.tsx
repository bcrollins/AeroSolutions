import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, BookmarkCheck, Clock, Flame, Lightbulb, Rocket, Trophy, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Type definition for badge data
type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  criteria: string;
};

// A mapping of badge icon names to their components
const iconMap: Record<string, React.ReactNode> = {
  award: <Award />,
  book: <BookOpen />,
  bookmark: <BookmarkCheck />,
  clock: <Clock />,
  flame: <Flame />,
  lightbulb: <Lightbulb />,
  rocket: <Rocket />,
  trophy: <Trophy />,
  user: <UserCheck />
};

const UserBadges: React.FC = () => {
  // Fetch user badges data
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/user-badges'],
    retry: 1,
  });

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={`skeleton-${i}`} className="flex flex-col items-center p-6">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse mb-4"></div>
            <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse mb-3"></div>
            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Unable to load your badges</h3>
          <p className="text-muted-foreground mb-4">
            We encountered a problem while trying to fetch your achievement badges.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  // Show empty state if no badges
  if (!badges || badges.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="mb-4 w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Badges Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Complete courses and lessons to earn achievement badges. They'll appear 
            here once you've earned them.
          </p>
          <Button variant="outline">How to Earn Badges</Button>
        </div>
      </Card>
    );
  }

  // Render badges grid
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge: Badge) => {
          // Get the icon component or default to Trophy
          const Icon = badge.icon && iconMap[badge.icon] ? (
            iconMap[badge.icon]
          ) : (
            <Trophy />
          );

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Card className="flex flex-col items-center p-6 hover:shadow-md transition-all cursor-help">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4`}
                    style={{ backgroundColor: `${badge.color}20` }} // 20 is hex for 12% opacity
                  >
                    <div className="w-8 h-8" style={{ color: badge.color }}>
                      {Icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-center">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-2">{badge.description}</p>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Earned {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true })}</span>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">{badge.name}</p>
                <p className="text-sm">{badge.criteria}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default UserBadges;