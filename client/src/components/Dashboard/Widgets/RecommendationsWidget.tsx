import React from 'react';
import PersonalizedRecommendations from '@/components/recommendations/PersonalizedRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Widget } from '@/contexts/DashboardContext';
import { Sparkles } from 'lucide-react';

interface RecommendationsWidgetProps {
  widget: Widget;
  className?: string;
}

export default function RecommendationsWidget({ widget, className = '' }: RecommendationsWidgetProps) {
  // Determine number of recommendations to show based on widget size
  const getRecommendationLimit = () => {
    switch (widget.size) {
      case 'small':
        return 1;
      case 'medium':
        return 2;
      case 'large':
      case 'full':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <PersonalizedRecommendations 
          limit={getRecommendationLimit()}
          withAnimation={true}
        />
      </CardContent>
    </Card>
  );
}