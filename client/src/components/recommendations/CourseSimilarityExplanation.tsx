import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { 
  BookOpen, 
  Tag, 
  Users, 
  BarChart,
  Clock
} from 'lucide-react';

interface CourseSimilarityExplanationProps {
  sourceCourse: any;
  recommendedCourse: any;
  similarityScore: number;
  className?: string;
}

const CourseSimilarityExplanation = ({
  sourceCourse,
  recommendedCourse,
  similarityScore,
  className = '',
}: CourseSimilarityExplanationProps) => {
  
  // Calculate matching aspects based on the two courses
  const getMatchingData = () => {
    const matchingTopics = recommendedCourse.category === sourceCourse.category;
    const matchingDifficulty = recommendedCourse.difficulty === sourceCourse.difficulty;
    const matchingInstructor = recommendedCourse.instructor === sourceCourse.instructor;
    
    // Calculate similarity weight for each aspect
    return [
      { 
        name: 'Topic Match', 
        value: matchingTopics ? 40 : 10, 
        color: '#3b82f6',
        icon: <Tag className="h-4 w-4" />
      },
      { 
        name: 'Difficulty', 
        value: matchingDifficulty ? 25 : 15, 
        color: '#10b981',
        icon: <BookOpen className="h-4 w-4" />
      },
      { 
        name: 'Student Overlap', 
        value: 20,
        color: '#f59e0b',
        icon: <Users className="h-4 w-4" />
      },
      { 
        name: 'Learning Time', 
        value: 15, 
        color: '#6366f1',
        icon: <Clock className="h-4 w-4" />
      },
    ];
  };

  const matchData = getMatchingData();
  
  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded-md shadow-md">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm">{`Weight: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">Why These Courses Are Similar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left side - Pie chart */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={matchData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {matchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Right side - Matching details */}
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <h4 className="text-base font-medium mb-1">Overall Similarity</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${similarityScore}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-600 mt-1">{similarityScore}%</div>
            </div>
            
            <div className="space-y-2">
              {matchData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mr-2" style={{ background: item.color, opacity: 0.2 }}>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div className="text-sm">{item.name}</div>
                  <div className="flex-grow"></div>
                  <div className="text-sm font-medium">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-4 border-t pt-3">
          <p>Students who take one of these courses often enroll in the other as well.</p>
        </div>
      </div>
    </Card>
  );
};

export default CourseSimilarityExplanation;