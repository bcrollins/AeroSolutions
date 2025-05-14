import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, ChevronDown, Settings, LogOut, Home, BookOpen, MessageSquare, Award, Calendar, BarChart2, AlertCircle } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Function to get initials from name
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">ROLLINS X</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Home
              </Link>
              <Link href="/ai-products" className={`transition-colors hover:text-primary ${location.startsWith('/ai-products') ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                AI Products
              </Link>
              <Link href="/pricing" className={`transition-colors hover:text-primary ${location === '/pricing' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Pricing
              </Link>
              <Link href="/news-hub" className={`transition-colors hover:text-primary ${location === '/news-hub' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                News Hub
              </Link>
              <Link href="/contact" className={`transition-colors hover:text-primary ${location === '/contact' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                      ) : (
                        <AvatarFallback>{getInitials(user?.firstName)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">Logout</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <a href="/api/login">Log In</a>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Dashboard Navigation */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 border-r min-h-[calc(100vh-4rem)] bg-background p-4">
          <nav className="space-y-2">
            <Button variant={location === '/dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant={location.startsWith('/ai-courses') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/ai-courses">
                <BookOpen className="mr-2 h-4 w-4" />
                AI Courses
              </Link>
            </Button>
            <Button variant={location.startsWith('/forum') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/forum">
                <MessageSquare className="mr-2 h-4 w-4" />
                Community Forum
              </Link>
            </Button>
            <Button variant={location.startsWith('/certificates') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/certificates">
                <Award className="mr-2 h-4 w-4" />
                Certificates
              </Link>
            </Button>
            <Button variant={location.startsWith('/content-calendar') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/content-calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Content Calendar
              </Link>
            </Button>
            <Button variant={location.startsWith('/analytics') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/analytics">
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button variant={location.startsWith('/help') ? 'secondary' : 'ghost'} className="w-full justify-start" asChild>
              <Link href="/help">
                <AlertCircle className="mr-2 h-4 w-4" />
                Help Center
              </Link>
            </Button>
          </nav>
          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100" asChild>
              <a href="/api/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </a>
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}