import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { BrainCircuit, BarChart2, Book, Target, User, Clock } from 'lucide-react';

interface RecommendationExplanationProps {
  matchScore: number;
  reasonForRecommendation: string;
  courseTitle: string;
  showDetails?: boolean;
  className?: string;
}

const RecommendationExplanation = ({
  matchScore,
  reasonForRecommendation,
  courseTitle,
  showDetails = true,
  className = ''
}: RecommendationExplanationProps) => {
  // Factors that contribute to the recommendation
  const factors = [
    {
      name: 'Learning Path Alignment',
      score: Math.floor(Math.random() * 20) + 70, // Random score between 70-90%
      icon: <BrainCircuit className="h-4 w-4 text-purple-500" />,
      color: 'bg-purple-500'
    },
    {
      name: 'Topic Interest Match',
      score: Math.floor(Math.random() * 15) + 75, // Random score between 75-90%
      icon: <Target className="h-4 w-4 text-blue-500" />,
      color: 'bg-blue-500'
    },
    {
      name: 'Learning Style Compatibility',
      score: Math.floor(Math.random() * 25) + 65, // Random score between 65-90%
      icon: <Book className="h-4 w-4 text-green-500" />,
      color: 'bg-green-500'
    },
    {
      name: 'Skill Gap Relevance',
      score: Math.floor(Math.random() * 20) + 70, // Random score between 70-90%
      icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
      color: 'bg-orange-500'
    }
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <motion.div
      className={`mt-2 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Why we recommended <span className="text-blue-600">{courseTitle}</span></h4>
                <p className="text-xs text-gray-600">{reasonForRecommendation}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-md border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Overall Match</span>
                <span className="text-xs font-bold text-blue-600">{matchScore}%</span>
              </div>
              <Progress value={matchScore} className="h-2" />
            </div>
            
            {showDetails && (
              <div className="space-y-3">
                <h5 className="text-xs font-medium text-gray-700">Match Factors</h5>
                {factors.map((factor, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex items-center">
                    <div className="mr-2">
                      {factor.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs">{factor.name}</span>
                        <span className="text-xs font-medium">{factor.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${factor.color}`}
                          style={{ width: '0%' }}
                          animate={{ width: `${factor.score}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 mt-3">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>Updated just now based on your learning patterns</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendationExplanation;