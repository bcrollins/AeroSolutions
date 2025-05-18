import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trophy, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourseCompletionProps {
  courseName: string;
  userName: string;
  completedDate: Date;
  score?: number;
}

const CourseCompletion: React.FC<CourseCompletionProps> = ({
  courseName,
  userName,
  completedDate,
  score
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(completedDate);

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  React.useEffect(() => {
    // Auto celebrate when component mounts
    const timer = setTimeout(() => {
      handleCelebrate();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="max-w-3xl mx-auto border-2 border-blue-200">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Course Completion Certificate</h2>
          <p className="text-gray-600">Congratulations on your achievement!</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-6">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-1">This certifies that</p>
            <h3 className="text-2xl font-bold mb-1">{userName}</h3>
            <p className="text-lg text-gray-600 mb-4">has successfully completed</p>
            <h4 className="text-xl font-bold mb-4">{courseName}</h4>
            {score !== undefined && (
              <p className="text-lg mb-4">
                with a score of <span className="font-bold text-blue-600">{score}%</span>
              </p>
            )}
            <p className="text-sm text-gray-500">Completed on {formattedDate}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center gap-4 p-6 bg-gray-50 border-t">
        <Button onClick={handleCelebrate} className="gap-2">
          <Trophy className="h-4 w-4" />
          Celebrate
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCompletion;