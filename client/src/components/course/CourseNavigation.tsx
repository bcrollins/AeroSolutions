import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Trophy,
  BarChart,
  Settings,
  GraduationCap,
  HomeIcon,
  Clock,
  Users,
  User,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CourseNavigation: React.FC = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/courses/dashboard',
      icon: <HomeIcon className="h-5 w-5" />
    },
    {
      name: 'All Courses',
      path: '/courses',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      name: 'My Learning',
      path: '/courses/my-learning',
      icon: <GraduationCap className="h-5 w-5" />,
      requireAuth: true
    },
    {
      name: 'Master AI Course',
      path: '/courses/master-ai',
      icon: <Star className="h-5 w-5" />
    },
    {
      name: 'Progress Stats',
      path: '/courses/progress',
      icon: <BarChart className="h-5 w-5" />,
      requireAuth: true
    },
    {
      name: 'Certificates',
      path: '/certificates',
      icon: <Trophy className="h-5 w-5" />,
      requireAuth: true
    }
  ];

  // Secondary items
  const secondaryItems = [
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
      requireAuth: true
    },
    {
      name: 'Community',
      path: '/community',
      icon: <Users className="h-5 w-5" />
    }
  ];

  // Filter out items that require authentication if user is not authenticated
  const filteredNavItems = navItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated)
  );
  
  const filteredSecondaryItems = secondaryItems.filter(item => 
    !item.requireAuth || (item.requireAuth && isAuthenticated)
  );

  return (
    <div className="bg-white border-r h-full py-6 flex flex-col w-64">
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold">AI Learning Hub</h2>
        <p className="text-sm text-gray-500">Expand your AI knowledge</p>
      </div>
      
      <div className="space-y-1 px-3">
        {filteredNavItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant={location === item.path ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <span className="flex items-center">
                {React.cloneElement(item.icon, { 
                  className: `mr-2 h-5 w-5 ${location === item.path ? 'text-primary' : 'text-gray-500'}` 
                })}
                {item.name}
              </span>
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="mt-auto px-3">
        <Separator className="my-4" />
        {filteredSecondaryItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <Button
              variant={location === item.path ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
            >
              <span className="flex items-center">
                {React.cloneElement(item.icon, { 
                  className: `mr-2 h-5 w-5 ${location === item.path ? 'text-primary' : 'text-gray-500'}` 
                })}
                {item.name}
              </span>
            </Button>
          </Link>
        ))}
        
        {!isAuthenticated && (
          <div className="px-2 pt-4">
            <Link href="/api/login">
              <Button className="w-full">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseNavigation;