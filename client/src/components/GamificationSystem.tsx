import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Gift, ChevronRight, Zap, Trophy, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface GamificationSystemProps {
  className?: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  category: 'discount' | 'feature' | 'content';
  isAvailable: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  progress?: number;
  pointsAwarded: number;
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({ className }) => {
  const [points, setPoints] = useState(350);
  const [level, setLevel] = useState(2);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  // Mock data for rewards
  const rewards: Reward[] = [
    { 
      id: 'discount-10', 
      title: '10% Off Monthly Subscription', 
      description: 'Get 10% off your next monthly subscription payment',
      pointCost: 500,
      category: 'discount',
      isAvailable: true
    },
    { 
      id: 'discount-20', 
      title: '20% Off Annual Subscription', 
      description: 'Get 20% off when you upgrade to an annual subscription',
      pointCost: 1000,
      category: 'discount',
      isAvailable: false
    },
    { 
      id: 'feature-premium', 
      title: '1 Week of Premium Features', 
      description: 'Try all premium features for 1 week, regardless of your current plan',
      pointCost: 250,
      category: 'feature',
      isAvailable: true
    },
    { 
      id: 'content-course', 
      title: 'Free Premium Course', 
      description: 'Unlock one premium course for free',
      pointCost: 750,
      category: 'content',
      isAvailable: true
    },
    { 
      id: 'feature-priority', 
      title: 'Priority Support (1 month)', 
      description: 'Get priority support responses for one month',
      pointCost: 350,
      category: 'feature',
      isAvailable: true
    }
  ];

  // Mock data for achievements
  const achievements: Achievement[] = [
    {
      id: 'first-login',
      title: 'First Steps',
      description: 'Complete your first login',
      icon: <Zap size={20} className="text-blue-400" />,
      isCompleted: true,
      pointsAwarded: 50
    },
    {
      id: 'profile-complete',
      title: 'Identity Established',
      description: 'Complete your profile information',
      icon: <Award size={20} className="text-blue-400" />,
      isCompleted: true,
      pointsAwarded: 100
    },
    {
      id: 'first-course',
      title: 'Knowledge Seeker',
      description: 'Complete your first course',
      icon: <Trophy size={20} className="text-blue-400" />,
      isCompleted: true,
      pointsAwarded: 200
    },
    {
      id: 'five-tools',
      title: 'Tool Explorer',
      description: 'Use 5 different digital tools',
      icon: <Trophy size={20} className="text-yellow-400" />,
      isCompleted: false,
      progress: 60,
      pointsAwarded: 250
    },
    {
      id: 'three-courses',
      title: 'Learning Enthusiast',
      description: 'Complete 3 courses',
      icon: <Star size={20} className="text-yellow-400" />,
      isCompleted: false,
      progress: 33,
      pointsAwarded: 500
    }
  ];

  const handleRewardClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRewardDialog(true);
  };

  const redeemReward = () => {
    if (selectedReward && points >= selectedReward.pointCost) {
      setPoints(points - selectedReward.pointCost);
      // Here you would normally call an API to redeem the reward
      setShowRewardDialog(false);
    }
  };

  return (
    <div className={className}>
      <Card className="border-gray-800 bg-gray-900 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white">Your Progress</CardTitle>
            <Badge className="bg-blue-600 text-white">{points} Points</Badge>
          </div>
          <CardDescription className="text-gray-400">Level {level} - Keep going to earn rewards!</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Level {level}</span>
                <span className="text-gray-400">Level {level + 1}</span>
              </div>
              <Progress value={65} className="h-2 bg-gray-800" />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {achievements.filter(a => a.isCompleted).slice(0, 3).map((achievement, index) => (
                  <TooltipProvider key={achievement.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-gray-900 ${index === 0 ? '' : '-ml-2'}`}>
                          {achievement.icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{achievement.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {achievements.filter(a => a.isCompleted).length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-900 text-sm text-white">
                    +{achievements.filter(a => a.isCompleted).length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-400">
                {achievements.filter(a => a.isCompleted).length} of {achievements.length} achievements unlocked
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="text-blue-400 border-gray-700 hover:bg-blue-950/20 hover:border-blue-500/50">
                View Achievements
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-900 border-l border-gray-800 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Your Achievements</SheetTitle>
                <SheetDescription className="text-gray-400">
                  Complete achievements to earn points and unlock rewards.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`border ${achievement.isCompleted ? 'border-blue-500/50 bg-blue-950/10' : 'border-gray-800 bg-gray-900'}`}>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${achievement.isCompleted ? 'bg-blue-500/20' : 'bg-gray-800'} flex items-center justify-center`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
                            <p className="text-xs text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                        <Badge variant={achievement.isCompleted ? "default" : "outline"} className={achievement.isCompleted ? "bg-green-600" : "border-gray-700"}>
                          {achievement.isCompleted ? "Completed" : `+${achievement.pointsAwarded}`}
                        </Badge>
                      </div>
                      {!achievement.isCompleted && achievement.progress !== undefined && (
                        <div className="mt-2 space-y-1">
                          <Progress value={achievement.progress} className="h-1 bg-gray-800" />
                          <div className="flex justify-end">
                            <span className="text-xs text-gray-400">{achievement.progress}% complete</span>
                          </div>
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Gift size={16} className="mr-2" />
                Redeem Rewards
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-900 border-l border-gray-800 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Rewards Store</SheetTitle>
                <SheetDescription className="text-gray-400">
                  Use your points to redeem exclusive rewards.
                </SheetDescription>
              </SheetHeader>
              <div className="flex items-center justify-between mt-4 mb-6 py-2 px-4 bg-gray-800 rounded-md">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-blue-400" />
                  <span className="text-sm text-white">Your Points</span>
                </div>
                <Badge className="bg-blue-600 text-white">{points}</Badge>
              </div>
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <motion.div
                    key={reward.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Card className={`border-gray-800 bg-gray-900 ${points >= reward.pointCost ? 'hover:border-blue-500/50' : 'opacity-70'}`}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm text-white">{reward.title}</CardTitle>
                            <CardDescription className="text-xs text-gray-400">
                              {reward.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-blue-950/20 border-blue-500/30 text-blue-400">
                            {reward.pointCost} pts
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-0 pb-3 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className={`ml-auto ${points >= reward.pointCost ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-950/20' : 'text-gray-500 cursor-not-allowed'}`}
                          onClick={() => points >= reward.pointCost && handleRewardClick(reward)}
                          disabled={points < reward.pointCost}
                        >
                          {points >= reward.pointCost ? 'Redeem' : 'Not enough points'} <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </CardFooter>
      </Card>

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <Card className="border-blue-500/30 bg-blue-950/10">
                <CardHeader>
                  <CardTitle className="text-base text-white">{selectedReward.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedReward.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge className="bg-blue-600 text-white ml-auto">
                    {selectedReward.pointCost} points
                  </Badge>
                </CardFooter>
              </Card>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={redeemReward}
                  disabled={points < selectedReward.pointCost}
                >
                  Confirm Redemption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamificationSystem;