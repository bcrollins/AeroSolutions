import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Calendar, 
  Star, 
  Trophy, 
  Flame, 
  Gift,
  Share2,
  Calendar as CalendarIcon
} from 'lucide-react';

interface StreakDay {
  date: string;
  isCompleted: boolean;
  minutesLearned: number;
}

interface LearningStreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalMinutesLearned: number;
  lastWeekStreak: StreakDay[];
  onShareStreak?: () => void;
  onClaimReward?: (rewardId: string) => void;
}

const LearningStreakTracker: React.FC<LearningStreakTrackerProps> = ({
  currentStreak = 0,
  longestStreak = 0,
  totalMinutesLearned = 0,
  lastWeekStreak = [],
  onShareStreak,
  onClaimReward
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  
  // Determine which rewards are unlocked
  const rewardsUnlocked = {
    badge3: currentStreak >= 3,
    badge7: currentStreak >= 7,
    badge14: currentStreak >= 14,
    badge30: currentStreak >= 30
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Get day of week abbreviation
  const getDayAbbreviation = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Calculate total days with learning
  const totalDaysLearned = lastWeekStreak.filter(day => day.isCompleted).length;
  
  // Determine if a milestone was just reached
  useEffect(() => {
    if (currentStreak === 3 || currentStreak === 7 || currentStreak === 14 || currentStreak === 30) {
      setShowCelebration(true);
      
      // Auto-hide celebration after 3 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);
  
  // Handle claiming a reward
  const handleClaimReward = (rewardId: string) => {
    setClaimedRewards(prev => [...prev, rewardId]);
    if (onClaimReward) {
      onClaimReward(rewardId);
    }
  };
  
  return (
    <Card className="bg-gray-800 border-gray-700 p-6 relative overflow-hidden">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6,
                type: 'spring',
                stiffness: 260,
                damping: 20
              }}
            >
              <Trophy className="w-16 h-16 text-yellow-400 mb-4" />
            </motion.div>
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {currentStreak} Day Streak!
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-300 mb-4"
            >
              You've unlocked a new achievement. Keep up the excellent work!
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                className="bg-electric-cyan-600 hover:bg-electric-cyan-700"
                onClick={() => setShowCelebration(false)}
              >
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <Flame className="w-5 h-5 text-orange-400 mr-2" />
          Learning Streak
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          className="text-sm"
          onClick={onShareStreak}
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Streak Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-orange-600/20 to-red-600/20 p-4 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Current Streak</h4>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold">{currentStreak}</span>
            <span className="ml-1 text-sm text-gray-400">days</span>
          </div>
          {currentStreak > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Keep going! You're building a habit.
            </p>
          )}
        </motion.div>
        
        {/* Longest Streak Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-4 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Longest Streak</h4>
            <Trophy className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold">{longestStreak}</span>
            <span className="ml-1 text-sm text-gray-400">days</span>
          </div>
          {currentStreak < longestStreak && (
            <p className="mt-1 text-xs text-gray-400">
              {longestStreak - currentStreak} days to beat your record!
            </p>
          )}
        </motion.div>
        
        {/* Total Learning Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-4 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">Total Learning</h4>
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold">{Math.floor(totalMinutesLearned / 60)}</span>
            <span className="ml-1 text-sm text-gray-400">hours</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Across {totalDaysLearned} days of activity
          </p>
        </motion.div>
      </div>
      
      {/* Last 7 Days Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Last 7 Days</h4>
        <div className="flex justify-between">
          {lastWeekStreak.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  day.isCompleted 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20' 
                    : 'bg-gray-700'
                }`}
              >
                {day.isCompleted ? (
                  <Flame className="w-5 h-5 text-white" />
                ) : (
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                )}
              </motion.div>
              <span className="text-xs mt-1 font-mono text-gray-400">
                {getDayAbbreviation(day.date)}
              </span>
              {day.isCompleted && (
                <span className="text-xs text-orange-400">{day.minutesLearned}m</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Streak Rewards */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Streak Rewards</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 3 Day Streak Reward */}
          <motion.div 
            whileHover={{ scale: rewardsUnlocked.badge3 ? 1.05 : 1 }}
            className={`p-3 rounded-lg ${
              rewardsUnlocked.badge3 
                ? 'bg-gradient-to-br from-amber-600/30 to-yellow-600/30 cursor-pointer' 
                : 'bg-gray-700/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                rewardsUnlocked.badge3 ? 'bg-amber-500/30' : 'bg-gray-600'
              }`}>
                <Award className={`w-6 h-6 ${
                  rewardsUnlocked.badge3 ? 'text-amber-400' : 'text-gray-500'
                }`} />
              </div>
              <h5 className="text-sm font-medium">3 Day Streak</h5>
              <p className="text-xs text-center text-gray-400 mt-1">
                Bronze Learner Badge
              </p>
              
              {rewardsUnlocked.badge3 && !claimedRewards.includes('badge3') ? (
                <Button 
                  size="sm" 
                  className="mt-2 text-xs h-7 bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleClaimReward('badge3')}
                >
                  Claim
                </Button>
              ) : rewardsUnlocked.badge3 ? (
                <span className="mt-2 text-xs text-green-400">Claimed</span>
              ) : (
                <span className="mt-2 text-xs text-gray-500">Locked</span>
              )}
            </div>
          </motion.div>
          
          {/* 7 Day Streak Reward */}
          <motion.div 
            whileHover={{ scale: rewardsUnlocked.badge7 ? 1.05 : 1 }}
            className={`p-3 rounded-lg ${
              rewardsUnlocked.badge7 
                ? 'bg-gradient-to-br from-slate-400/30 to-slate-500/30 cursor-pointer' 
                : 'bg-gray-700/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                rewardsUnlocked.badge7 ? 'bg-slate-400/30' : 'bg-gray-600'
              }`}>
                <Award className={`w-6 h-6 ${
                  rewardsUnlocked.badge7 ? 'text-slate-300' : 'text-gray-500'
                }`} />
              </div>
              <h5 className="text-sm font-medium">7 Day Streak</h5>
              <p className="text-xs text-center text-gray-400 mt-1">
                Silver Learner Badge
              </p>
              
              {rewardsUnlocked.badge7 && !claimedRewards.includes('badge7') ? (
                <Button 
                  size="sm" 
                  className="mt-2 text-xs h-7 bg-slate-500 hover:bg-slate-600"
                  onClick={() => handleClaimReward('badge7')}
                >
                  Claim
                </Button>
              ) : rewardsUnlocked.badge7 ? (
                <span className="mt-2 text-xs text-green-400">Claimed</span>
              ) : (
                <span className="mt-2 text-xs text-gray-500">Locked</span>
              )}
            </div>
          </motion.div>
          
          {/* 14 Day Streak Reward */}
          <motion.div 
            whileHover={{ scale: rewardsUnlocked.badge14 ? 1.05 : 1 }}
            className={`p-3 rounded-lg ${
              rewardsUnlocked.badge14 
                ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 cursor-pointer' 
                : 'bg-gray-700/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                rewardsUnlocked.badge14 ? 'bg-yellow-500/30' : 'bg-gray-600'
              }`}>
                <Award className={`w-6 h-6 ${
                  rewardsUnlocked.badge14 ? 'text-yellow-300' : 'text-gray-500'
                }`} />
              </div>
              <h5 className="text-sm font-medium">14 Day Streak</h5>
              <p className="text-xs text-center text-gray-400 mt-1">
                Gold Learner Badge
              </p>
              
              {rewardsUnlocked.badge14 && !claimedRewards.includes('badge14') ? (
                <Button 
                  size="sm" 
                  className="mt-2 text-xs h-7 bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => handleClaimReward('badge14')}
                >
                  Claim
                </Button>
              ) : rewardsUnlocked.badge14 ? (
                <span className="mt-2 text-xs text-green-400">Claimed</span>
              ) : (
                <span className="mt-2 text-xs text-gray-500">Locked</span>
              )}
            </div>
          </motion.div>
          
          {/* 30 Day Streak Reward */}
          <motion.div 
            whileHover={{ scale: rewardsUnlocked.badge30 ? 1.05 : 1 }}
            className={`p-3 rounded-lg ${
              rewardsUnlocked.badge30 
                ? 'bg-gradient-to-br from-purple-500/30 to-purple-700/30 cursor-pointer' 
                : 'bg-gray-700/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                rewardsUnlocked.badge30 ? 'bg-purple-600/30' : 'bg-gray-600'
              }`}>
                <Gift className={`w-6 h-6 ${
                  rewardsUnlocked.badge30 ? 'text-purple-300' : 'text-gray-500'
                }`} />
              </div>
              <h5 className="text-sm font-medium">30 Day Streak</h5>
              <p className="text-xs text-center text-gray-400 mt-1">
                Special Course Bonus
              </p>
              
              {rewardsUnlocked.badge30 && !claimedRewards.includes('badge30') ? (
                <Button 
                  size="sm" 
                  className="mt-2 text-xs h-7 bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleClaimReward('badge30')}
                >
                  Claim
                </Button>
              ) : rewardsUnlocked.badge30 ? (
                <span className="mt-2 text-xs text-green-400">Claimed</span>
              ) : (
                <span className="mt-2 text-xs text-gray-500">Locked</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};

// Clock component for the learning time
const Clock: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

export default LearningStreakTracker;