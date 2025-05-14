import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart3,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'AI Courses',
    href: '/courses',
    icon: Home,
  },
  {
    name: 'Community Forum',
    href: '/forum',
    icon: MessageSquare,
  },
  {
    name: 'Certificates',
    href: '/certificates',
    icon: Award,
  },
  {
    name: 'Content Calendar',
    href: '/content-calendar',
    icon: Calendar,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Account Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to determine if a navigation item is active
  const isActive = (href: string) => {
    return location === href;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex h-16 items-center px-4 border-b">
            <Link href="/" className="flex items-center font-semibold text-lg">
              <span className="text-primary mr-2">RXAI</span>
              <span className="text-xs align-bottom">A Rollins X Technologies Company</span>
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5 p-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href) && "bg-secondary/50"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:flex-col">
        <div
          className={cn(
            "flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background",
            isCollapsed ? "w-16" : "w-60"
          )}
        >
          <div className="flex h-16 shrink-0 items-center border-b px-4">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center font-semibold text-lg">
                <span className="text-primary mr-2">RXAI</span>
                <span className="text-xs align-bottom">A Rollins X Technologies Company</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center justify-center font-bold text-lg mx-auto">
                <span className="text-primary">RXAI</span>
              </Link>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 p-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.href) && "bg-secondary/50",
                    isCollapsed && "px-2 justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-full"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col",
          isCollapsed ? "md:pl-16" : "md:pl-60"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>

            <div className="ml-auto flex items-center gap-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.profileImageUrl || undefined}
                          alt={user?.firstName || 'User'}
                        />
                        <AvatarFallback>
                          {user?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout">Log out</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm">
                  <a href="/api/login">Log In</a>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}