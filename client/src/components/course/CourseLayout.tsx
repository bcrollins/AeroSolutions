import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseNavigation from './CourseNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CourseLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  sidebarCollapsible?: boolean;
  backLink?: string;
  backLinkText?: string;
  nextLink?: string;
  nextLinkText?: string;
}

const CourseLayout: React.FC<CourseLayoutProps> = ({
  children,
  title = "AI Learning Platform",
  description = "Master artificial intelligence concepts and applications with our comprehensive courses",
  showSidebar = true,
  sidebarCollapsible = true,
  backLink,
  backLinkText,
  nextLink,
  nextLinkText
}) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Only collapse sidebar on mobile by default
  React.useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setSidebarCollapsed(isMobile);
  }, []);

  const toggleSidebar = () => {
    if (sidebarCollapsible) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} | RXAI Learning Platform</title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        {/* Main navbar */}
        <NavBar />

        <div className="flex-1 flex">
          {/* Course sidebar */}
          {showSidebar && (
            <div
              className={`fixed md:static inset-y-0 left-0 z-20 transform ${
                sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
              } md:translate-x-0 transition-transform duration-300 ease-in-out md:flex bg-white border-r`}
              style={{ top: '64px', height: 'calc(100vh - 64px)' }}
            >
              <CourseNavigation />

              {/* Sidebar toggle for mobile */}
              {sidebarCollapsible && (
                <div
                  className="absolute right-0 top-2 transform translate-x-full md:hidden"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-6 rounded-l-none rounded-r-md border border-l-0"
                    onClick={toggleSidebar}
                  >
                    {sidebarCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-x-hidden bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              {/* Back/Next navigation for lessons */}
              {(backLink || nextLink) && (
                <div className="flex justify-between mb-6">
                  {backLink ? (
                    <Link href={backLink}>
                      <Button variant="outline" className="flex items-center">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        {backLinkText || "Previous"}
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextLink && (
                    <Link href={nextLink}>
                      <Button className="flex items-center">
                        {nextLinkText || "Next"}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Main content */}
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebar && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
          style={{ top: '64px' }}
        />
      )}
    </>
  );
};

export default CourseLayout;