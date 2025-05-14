import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Award, Calendar, Unlock, LucideIcon } from 'lucide-react';

type Badge = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  criteria: string;
};

// Map of badge icons
const badgeIcons: Record<string, LucideIcon> = {
  award: Award,
  calendar: Calendar,
  unlock: Unlock,
};

const UserBadges = () => {
  const { data: badges = [], isLoading, error } = useQuery<Badge[]>({
    queryKey: ['/api/dashboard/user-badges'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-3 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted"></div>
              <div className="h-6 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <AlertCircle className="h-10 w-10 mx-auto mb-4" />
        <p className="font-medium">Error loading your badges.</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-10">
        <Award className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
        <p className="text-muted-foreground mb-4">
          Complete courses and challenges to earn achievement badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {badges.map((badge) => {
        const IconComponent = badgeIcons[badge.icon] || Award;
        
        return (
          <Card 
            key={badge.id} 
            className="transition-all duration-300 hover:shadow-md hover:border-blue-400"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${badge.color}15` }} // Using hex color with 15% opacity
              >
                <IconComponent 
                  className="h-8 w-8" 
                  style={{ color: badge.color }}
                />
              </div>
              <h3 className="font-semibold mb-1">{badge.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
              <p className="text-xs text-muted-foreground">
                Earned on {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserBadges;