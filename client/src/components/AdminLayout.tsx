import React from 'react';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import {
  Users,
  LayoutDashboard,
  Settings,
  FileText,
  BarChart4,
  MessageSquare,
  Globe,
  Database,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin',
      active: location === '/admin',
    },
    {
      title: 'Users',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      active: location === '/admin/users',
    },
    {
      title: 'Content',
      icon: <FileText className="h-5 w-5" />,
      href: '/admin/content',
      active: location === '/admin/content',
    },
    {
      title: 'Analytics',
      icon: <BarChart4 className="h-5 w-5" />,
      href: '/admin/analytics',
      active: location === '/admin/analytics',
    },
    {
      title: 'Forum',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/admin/forum',
      active: location === '/admin/forum',
    },
    {
      title: 'SEO',
      icon: <Globe className="h-5 w-5" />,
      href: '/admin/seo',
      active: location === '/admin/seo',
    },
    {
      title: 'Database',
      icon: <Database className="h-5 w-5" />,
      href: '/admin/database',
      active: location === '/admin/database',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/settings',
      active: location === '/admin/settings',
    },
  ];
  
  return (
    <>
      <Helmet>
        <title>{title} | RXAI Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop */}
        <div className={cn(
          "bg-secondary/50 w-64 hidden md:flex flex-col fixed inset-y-0 z-50",
          "border-r border-border/50 transition-all duration-300"
        )}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold">RXAI Admin</span>
              </a>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.active 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  )}>
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign out</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background shadow-lg">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/">
                <a className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-bold">RXAI Admin</span>
                </a>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            
            <nav className="mt-5 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      item.active 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col flex-1 w-full md:pl-64">
          {/* Top navbar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </div>
              
              <div className="flex-1 text-xl font-semibold px-4 md:px-0 md:ml-0 truncate">
                {title}
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href="/">
                  <a className="text-sm text-muted-foreground hover:text-foreground">
                    View Site
                  </a>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;