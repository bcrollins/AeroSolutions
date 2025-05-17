import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  UserIcon, 
  BookOpen, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

interface RecommendationExplanationProps {
  matchScore: number;
  reasonForRecommendation: string;
  matchFactors?: {
    relevance: number;
    popularity: number;
    difficulty: number;
    completion: number;
  };
  className?: string;
}

const RecommendationExplanation = ({
  matchScore,
  reasonForRecommendation,
  matchFactors = {
    relevance: 85,
    popularity: 70,
    difficulty: 65,
    completion: 90
  },
  className = '',
}: RecommendationExplanationProps) => {
  
  // Transform match factors into data for the chart
  const chartData = [
    { name: 'Content Relevance', value: matchFactors.relevance, icon: <Sparkles className="h-4 w-4" /> },
    { name: 'Popularity', value: matchFactors.popularity, icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Difficulty Match', value: matchFactors.difficulty, icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Completion Rate', value: matchFactors.completion, icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-blue-600 text-sm font-semibold">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`overflow-hidden bg-gray-50 dark:bg-gray-800 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
            Why We Recommended This
          </h3>
          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            <span className="text-sm font-semibold">{matchScore}% Match</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">
          "{reasonForRecommendation}"
        </p>
        
        <div className="mt-4 mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Match Factors</h4>
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  scale="band" 
                  width={120}
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <Clock className="h-3 w-3 mr-1" />
          <span>AI-generated recommendation based on your profile and learning history</span>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationExplanation;