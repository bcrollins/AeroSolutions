import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Code, BookOpen, Timer, Users, Star, Shield, CheckCircle2 } from 'lucide-react';

type UserBadge = {
  id: number;
  name: string;
  description: string;
  type: 'achievement' | 'milestone' | 'skill' | 'participation';
  earnedAt: string;
};

// Badge icons based on type
const getBadgeIcon = (type: string) => {
  switch (type) {
    case 'achievement':
      return <Award className="h-6 w-6 text-amber-500" />;
    case 'milestone':
      return <Star className="h-6 w-6 text-blue-500" />;
    case 'skill':
      return <Code className="h-6 w-6 text-green-500" />;
    case 'participation':
      return <Users className="h-6 w-6 text-purple-500" />;
    default:
      return <CheckCircle2 className="h-6 w-6 text-primary" />;
  }
};

// Badge color based on type
const getBadgeColor = (type: string) => {
  switch (type) {
    case 'achievement':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    case 'milestone':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'skill':
      return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'participation':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
    default:
      return 'bg-primary/10 text-primary border-primary/30';
  }
};

export const UserBadges = () => {
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/badges'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>Error loading badges. Please try again later.</p>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-10">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
        <p className="text-muted-foreground">
          Complete courses and interactions to earn badges.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {badges.map((badge: UserBadge) => (
        <Card 
          key={badge.id}
          className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-500"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`rounded-full p-3 ${getBadgeColor(badge.type)}`}>
              {getBadgeIcon(badge.type)}
            </div>
            
            <div className="flex flex-col">
              <h3 className="font-medium text-base">{badge.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {badge.description}
              </p>
              <div className="flex items-center mt-1 space-x-2">
                <Badge variant="outline" className={getBadgeColor(badge.type)}>
                  {badge.type.charAt(0).toUpperCase() + badge.type.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserBadges;