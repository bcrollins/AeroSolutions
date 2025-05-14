import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Award, 
  Trophy, 
  Star, 
  Zap, 
  CheckCircle, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  Crown,
  Users
} from 'lucide-react';

// Define badge types
interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  date?: string; // Date achieved if applicable
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  category: 'achievement' | 'participation' | 'skill' | 'special';
}

// Define leaderboard entry type
interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  points: number;
  badges: number;
  completionRate: number;
}

// Dummy data for badges
const userBadges: UserBadge[] = [
  {
    id: 'first-login',
    name: 'First Steps',
    description: 'Logged into the platform for the first time',
    icon: <CheckCircle className="h-6 w-6" />,
    achieved: true,
    date: 'May 12, 2025',
    rarity: 'common',
    category: 'achievement'
  },
  {
    id: 'module-completion',
    name: 'Module Master',
    description: 'Completed your first module',
    icon: <BookOpen className="h-6 w-6" />,
    achieved: true,
    date: 'May 13, 2025',
    rarity: 'common',
    category: 'achievement'
  },
  {
    id: 'perfect-quiz',
    name: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    icon: <Award className="h-6 w-6" />,
    achieved: true,
    date: 'May 14, 2025',
    rarity: 'uncommon',
    category: 'skill'
  },
  {
    id: 'forum-contributor',
    name: 'Helpful Hand',
    description: 'Made 5 helpful contributions to the forum',
    icon: <MessageSquare className="h-6 w-6" />,
    achieved: false,
    rarity: 'uncommon',
    category: 'participation'
  },
  {
    id: 'streak-7',
    name: 'Consistency is Key',
    description: 'Logged in for 7 consecutive days',
    icon: <Zap className="h-6 w-6" />,
    achieved: false,
    rarity: 'uncommon',
    category: 'achievement'
  },
  {
    id: 'all-modules',
    name: 'Course Champion',
    description: 'Completed all modules in a course',
    icon: <Trophy className="h-6 w-6" />,
    achieved: false,
    rarity: 'rare',
    category: 'achievement'
  },
  {
    id: 'early-adopter',
    name: 'AI Pioneer',
    description: 'One of the first 100 students on the platform',
    icon: <Star className="h-6 w-6" />,
    achieved: true,
    date: 'May 10, 2025',
    rarity: 'legendary',
    category: 'special'
  },
];

// Dummy data for leaderboard
const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, user: { id: '1', name: 'Alexandra Chen', avatar: '/images/avatars/avatar1.jpg' }, points: 2450, badges: 12, completionRate: 87 },
  { rank: 2, user: { id: '2', name: 'Marcus Johnson', avatar: '/images/avatars/avatar2.jpg' }, points: 2280, badges: 10, completionRate: 85 },
  { rank: 3, user: { id: '3', name: 'Sophia Williams', avatar: '/images/avatars/avatar3.jpg' }, points: 2150, badges: 9, completionRate: 80 },
  { rank: 4, user: { id: '4', name: 'David Rodriguez', avatar: '/images/avatars/avatar4.jpg' }, points: 1970, badges: 8, completionRate: 78 },
  { rank: 5, user: { id: '5', name: 'Emily Wang', avatar: '/images/avatars/avatar5.jpg' }, points: 1840, badges: 7, completionRate: 75 },
  { rank: 6, user: { id: '6', name: 'Juan Morales', avatar: '/images/avatars/avatar6.jpg' }, points: 1760, badges: 7, completionRate: 72 },
  { rank: 7, user: { id: '7', name: 'Aisha Patel', avatar: '/images/avatars/avatar7.jpg' }, points: 1680, badges: 6, completionRate: 70 },
  { rank: 8, user: { id: '8', name: 'Thomas Kim', avatar: '/images/avatars/avatar8.jpg' }, points: 1590, badges: 6, completionRate: 68 },
  { rank: 9, user: { id: '9', name: 'Olivia Smith', avatar: '/images/avatars/avatar9.jpg' }, points: 1520, badges: 5, completionRate: 65 },
  { rank: 10, user: { id: '10', name: 'James Wilson', avatar: '/images/avatars/avatar10.jpg' }, points: 1450, badges: 5, completionRate: 62 },
];

// Get user's position in leaderboard (assuming current user is Marcus Johnson)
const currentUserId = '2';
const userRank = leaderboardData.find(entry => entry.user.id === currentUserId)?.rank || 0;

// Component for displaying badges
export const BadgesDisplay: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Badges Overview */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-lg font-bold mb-2">Your Badges</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-electric-cyan-900 flex items-center justify-center">
                <Award className="h-5 w-5 text-electric-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Badges</p>
                <p className="text-xl font-bold">{userBadges.filter(b => b.achieved).length} / {userBadges.length}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Rarest Badge</p>
                <p className="text-md font-medium">AI Pioneer</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-2">Recent Achievement</p>
          {userBadges.filter(b => b.achieved).length > 0 ? (
            <div className="p-3 bg-gray-750 rounded-md flex items-center">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mr-3
                ${userBadges[2].rarity === 'common' ? 'from-gray-600 to-gray-700' : ''}
                ${userBadges[2].rarity === 'uncommon' ? 'from-blue-600 to-blue-800' : ''}
                ${userBadges[2].rarity === 'rare' ? 'from-purple-600 to-indigo-800' : ''}
                ${userBadges[2].rarity === 'legendary' ? 'from-yellow-400 to-amber-700' : ''}
              `}>
                {userBadges[2].icon}
              </div>
              <div>
                <p className="font-bold">{userBadges[2].name}</p>
                <p className="text-sm text-gray-400">{userBadges[2].description}</p>
                <p className="text-xs text-gray-500 mt-1">Earned on {userBadges[2].date}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Complete more activities to earn badges!</p>
          )}
        </Card>

        {/* Points & Level */}
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-lg font-bold mb-2">Your Progress</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Current Level</p>
                <p className="text-3xl font-bold">7</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Crown className="h-6 w-6" />
                <span className="text-lg font-medium">Intermediate</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Level Progress</span>
                <span>1750 / 2000 XP</span>
              </div>
              <Progress value={87.5} className="h-2 bg-gray-700" />
              <p className="text-xs text-gray-400 mt-1">250 XP until Level 8</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-gray-750 p-3 rounded-md">
                <p className="text-sm text-gray-400">Streak</p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="font-bold">5 days</span>
                </div>
              </div>
              <div className="bg-gray-750 p-3 rounded-md">
                <p className="text-sm text-gray-400">This Week</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-electric-cyan-400" />
                  <span className="font-bold">420 XP</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Badge Collection */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Badge Collection</h3>
            <TabsList className="bg-gray-750">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="achieved">Achieved</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`relative p-4 rounded-md flex flex-col items-center text-center
                    ${badge.achieved ? 'bg-gray-750' : 'bg-gray-850 opacity-70'}`
                  }
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center mb-3
                    ${!badge.achieved ? 'grayscale bg-gray-800' : ''}
                    ${badge.rarity === 'common' && badge.achieved ? 'from-gray-600 to-gray-700' : ''}
                    ${badge.rarity === 'uncommon' && badge.achieved ? 'from-blue-600 to-blue-800' : ''}
                    ${badge.rarity === 'rare' && badge.achieved ? 'from-purple-600 to-indigo-800' : ''}
                    ${badge.rarity === 'legendary' && badge.achieved ? 'from-yellow-400 to-amber-700' : ''}
                  `}>
                    {badge.icon}
                  </div>
                  <h4 className="font-bold">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                  <Badge variant={badge.achieved ? "default" : "outline"} className={
                    badge.rarity === 'common' ? 'bg-gray-600' : 
                    badge.rarity === 'uncommon' ? 'bg-blue-600' :
                    badge.rarity === 'rare' ? 'bg-purple-600' :
                    'bg-amber-600'
                  }>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Badge>
                  {badge.achieved && badge.date && (
                    <p className="text-xs text-gray-500 mt-2">Earned: {badge.date}</p>
                  )}
                  {!badge.achieved && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
                      <Badge variant="outline" className="bg-gray-800/80 text-gray-400 border-gray-600">
                        Locked
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="achieved">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.filter(badge => badge.achieved).map(badge => (
                <div 
                  key={badge.id} 
                  className="p-4 rounded-md bg-gray-750 flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center mb-3
                    ${badge.rarity === 'common' ? 'from-gray-600 to-gray-700' : ''}
                    ${badge.rarity === 'uncommon' ? 'from-blue-600 to-blue-800' : ''}
                    ${badge.rarity === 'rare' ? 'from-purple-600 to-indigo-800' : ''}
                    ${badge.rarity === 'legendary' ? 'from-yellow-400 to-amber-700' : ''}
                  `}>
                    {badge.icon}
                  </div>
                  <h4 className="font-bold">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                  <Badge variant="default" className={
                    badge.rarity === 'common' ? 'bg-gray-600' : 
                    badge.rarity === 'uncommon' ? 'bg-blue-600' :
                    badge.rarity === 'rare' ? 'bg-purple-600' :
                    'bg-amber-600'
                  }>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Badge>
                  {badge.date && (
                    <p className="text-xs text-gray-500 mt-2">Earned: {badge.date}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="locked">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.filter(badge => !badge.achieved).map(badge => (
                <div 
                  key={badge.id} 
                  className="relative p-4 rounded-md bg-gray-850 opacity-70 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full grayscale bg-gray-800 flex items-center justify-center mb-3">
                    {badge.icon}
                  </div>
                  <h4 className="font-bold">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                  <Badge variant="outline" className={
                    badge.rarity === 'common' ? 'border-gray-600' : 
                    badge.rarity === 'uncommon' ? 'border-blue-800' :
                    badge.rarity === 'rare' ? 'border-purple-800' :
                    'border-amber-800'
                  }>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Badge>
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30">
                    <Badge variant="outline" className="bg-gray-800/80 text-gray-400 border-gray-600">
                      Locked
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

// Component for displaying leaderboard
export const LeaderboardDisplay: React.FC = () => {
  return (
    <Card className="bg-gray-800 border-gray-700 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold mb-1">Leaderboard</h3>
          <p className="text-sm text-gray-400">See how you rank against other learners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-750 rounded-md px-4 py-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Your Rank</p>
              <p className="font-bold">{userRank} of {leaderboardData.length}</p>
            </div>
          </div>
          <div className="bg-gray-750 rounded-md px-4 py-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-electric-cyan-400" />
            <div>
              <p className="text-sm text-gray-400">Your Points</p>
              <p className="font-bold">{leaderboardData.find(e => e.user.id === currentUserId)?.points}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-auto max-h-96 overflow-auto">
        <div className="space-y-2">
          {leaderboardData.map((entry) => (
            <div 
              key={entry.user.id} 
              className={`flex items-center gap-3 p-3 rounded-md ${
                entry.user.id === currentUserId 
                  ? 'bg-electric-cyan-900/30 border border-electric-cyan-500/50' 
                  : 'bg-gray-750'
              }`}
            >
              <div className="w-8 text-center">
                {entry.rank <= 3 ? (
                  <Crown className={`h-6 w-6 mx-auto ${
                    entry.rank === 1 ? 'text-yellow-400' : 
                    entry.rank === 2 ? 'text-gray-400' : 
                    'text-amber-700'
                  }`} />
                ) : (
                  <span className="text-gray-500 font-medium">{entry.rank}</span>
                )}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden border-2 border-gray-600">
                {entry.user.avatar ? (
                  <img 
                    src={entry.user.avatar} 
                    alt={entry.user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${entry.user.name}&background=0D8ABC&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-electric-cyan-800 text-white font-bold">
                    {entry.user.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-bold ${entry.user.id === currentUserId ? 'text-white' : ''}`}>
                  {entry.user.name}
                </p>
                <div className="flex gap-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Award className="h-3 w-3" /> {entry.badges} badges
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {entry.completionRate}% complete
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-bold ${entry.user.id === currentUserId ? 'text-electric-cyan-400' : 'text-white'}`}>
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">points</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Updated daily</p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{leaderboardData.length} active learners</span>
        </div>
      </div>
    </Card>
  );
};