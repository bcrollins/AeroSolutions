import { useState, useEffect } from 'react';  
import { Link, useLocation } from 'wouter';  
import { Menu, X, ChevronDown, UserCircle, ShieldCheck, LayoutDashboard } from 'lucide-react';  
import ClientPreviewModal from "./ClientPreviewModal";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Header() {  
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);  
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);  
  const [clientPreviewOpen, setClientPreviewOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Handle different dropdown menus
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsSolutionsDropdownOpen(false);
    setIsResourcesDropdownOpen(false);
  };
  
  // Handle click outside for dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // This only runs if a dropdown is open
      if (isSolutionsDropdownOpen || isResourcesDropdownOpen) {
        // Don't close if it's a button click (handled by toggle functions)
        if ((e.target as Element).closest('button')) return;
        
        closeAllDropdowns();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSolutionsDropdownOpen, isResourcesDropdownOpen]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);  
  
  const toggleSolutionsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen);
    setIsResourcesDropdownOpen(false);
  };
  
  const toggleResourcesDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResourcesDropdownOpen(!isResourcesDropdownOpen);
    setIsSolutionsDropdownOpen(false);
  };
  const toggleClientPreview = () => setClientPreviewOpen(!clientPreviewOpen);

  const menuItems = [  
    { label: 'Home', path: '/' },  
    {  
      label: 'AI Products',  
      dropdown: [  
        { label: 'Learn AI', path: '/learnai' },
        { label: 'AI Courses', path: '/ai-course-platform' },
        { label: 'Course Catalog', path: '/course-catalog' },
        { label: 'Design Tools', path: '/design-tools' },
        { label: 'Content Generator', path: '/tools/content-generator' },
        { label: 'Digital Tools', path: '/digital-tools' },
      ],  
    },  
    {
      label: 'Resources',
      dropdown: [
        { label: 'Articles', path: '/articles' },
        { label: 'News Hub', path: '/news' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    { label: 'Client Preview', path: '/client-preview' }
  ];  

  return (  
    <>
      <header className="header bg-gradient-to-r from-gray-900 to-black text-white py-4 px-4 sm:px-6 sticky top-0 z-50 shadow-lg" data-branding="rxai">  
        <div className="max-w-7xl mx-auto flex justify-between items-center">  
          {/* Logo */}  
          <Link href="/">  
            <div className="flex items-center group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <Logo height={28} width={28} className="mr-2" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-wider text-xl text-white group-hover:text-electric-cyan-400 transition-colors duration-300">RXAI</span>
                <span className="text-xs text-gray-400">The World Leader in Artificial Intelligence Education</span>
              </div>
            </div>
          </Link>  

          {/* Desktop Menu */}  
          <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">  
            {menuItems.map((item) => (  
              <div key={item.label} className="relative">  
                {item.dropdown ? (  
                  <button  
                    onClick={item.label === 'AI Products' ? toggleSolutionsDropdown : toggleResourcesDropdown}  
                    className={cn(
                      "font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 flex items-center transition-colors duration-200",
                      (item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                      (item.label === 'Resources' && isResourcesDropdownOpen) 
                        ? "text-electric-cyan-400" : ""
                    )}
                  >  
                    {item.label}  
                    <ChevronDown className={cn(
                      "ml-1 w-4 h-4 transition-transform duration-200",
                      (item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                      (item.label === 'Resources' && isResourcesDropdownOpen)
                        ? "rotate-180" : ""
                    )} />  
                  </button>  
                ) : (  
                  <Link  
                    href={item.path}  
                    className={cn(
                      "font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 transition-colors duration-200",
                      location === item.path ? "text-electric-cyan-400" : ""
                    )}
                  >  
                    {item.label}  
                  </Link>  
                )}  
                {item.dropdown && 
                  ((item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                   (item.label === 'Resources' && isResourcesDropdownOpen)) && (  
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-100">  
                    <div className="py-1">
                      {item.dropdown.map((subItem) => (  
                        <Link  
                          key={subItem.label}  
                          href={subItem.path}  
                          onClick={() => {
                            setIsSolutionsDropdownOpen(false);
                            setIsResourcesDropdownOpen(false);
                            setIsSupportDropdownOpen(false);
                          }}
                          className={cn(
                            "block px-4 py-2 text-gray-800 hover:bg-slate-blue-50 hover:text-slate-blue-700 transition-colors duration-200",
                            location === subItem.path ? "bg-slate-blue-50 text-slate-blue-700" : ""
                          )}
                        >  
                          {subItem.label}  
                        </Link>  
                      ))}
                    </div>  
                  </div>  
                )}  
              </div>  
            ))}  
            <button
              onClick={toggleClientPreview}
              className="font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 transition-colors duration-200 border border-gray-700 hover:border-electric-cyan-400 px-3 py-1.5 rounded-md"
            >
              Client Preview
            </button>
            <ThemeToggle />
            
            <div className="flex items-center space-x-3">
              <Link  
                href="/learnai"  
                className="font-medium text-sm px-4 py-2 rounded-md border border-electric-cyan-400 text-white hover:bg-electric-cyan-400/20 transition-all duration-300 hover:shadow-lg"  
              >  
                Learn AI
              </Link>
              
              <Link  
                href="/subscriptions"  
                className="font-medium text-sm px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"  
              >  
                Try Free  
              </Link>
              
              {isAuthenticated ? (
                <Link  
                  href="/member-dashboard"  
                  className="font-medium text-sm px-4 py-2 rounded-md bg-electric-cyan-600 text-white hover:bg-electric-cyan-700 transition-all duration-300 hover:shadow-lg flex items-center gap-2"  
                >  
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard  
                </Link>
              ) : (
                <Link  
                  href="/login"  
                  className="font-medium text-sm px-4 py-2 rounded-md bg-electric-cyan-600 text-white hover:bg-electric-cyan-700 transition-all duration-300 hover:shadow-lg flex items-center gap-2"  
                >  
                  <ShieldCheck className="w-4 h-4" />
                  Login  
                </Link>
              )}
            </div>  
          </nav>  

          {/* Mobile Menu Toggle */}  
          <button  
            className="md:hidden text-white focus:outline-none"  
            onClick={toggleMobileMenu}  
            aria-label="Toggle mobile menu"
          >  
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}  
          </button>  
        </div>  

        {/* Mobile Menu */}  
        {isMobileMenuOpen && (  
          <nav className="md:hidden bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 py-4 mt-4 rounded-b-lg shadow-2xl">  
            <div className="flex flex-col space-y-4 px-6">  
              {menuItems.map((item) => (  
                <div key={item.label} className="py-2 border-b border-gray-800 last:border-b-0">  
                  {item.dropdown ? (  
                    <div>  
                      <button  
                        onClick={item.label === 'AI Products' ? toggleSolutionsDropdown : toggleResourcesDropdown}  
                        className={cn(
                          "font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 flex items-center justify-between w-full",
                          (item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                          (item.label === 'Resources' && isResourcesDropdownOpen) 
                            ? "text-electric-cyan-400" : ""
                        )}
                      >  
                        <span>{item.label}</span>  
                        <ChevronDown className={cn(
                          "ml-1 w-5 h-5 transition-transform duration-200",
                          (item.label === 'AI Products' && isSolutionsDropdownOpen) ||
                          (item.label === 'Resources' && isResourcesDropdownOpen)
                            ? "rotate-180" : ""
                        )} />  
                      </button>  
                      {((item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                       (item.label === 'Resources' && isResourcesDropdownOpen)) && (  
                        <div className="pl-4 mt-3 mb-1 space-y-3 border-l-2 border-gray-700">  
                          {item.dropdown.map((subItem) => (  
                            <Link  
                              key={subItem.label}  
                              href={subItem.path}  
                              onClick={() => {
                                toggleMobileMenu();
                                setIsSolutionsDropdownOpen(false);
                                setIsResourcesDropdownOpen(false);
                              }}  
                              className={cn(
                                "block text-gray-300 hover:text-electric-cyan-400 transition-colors duration-200 text-sm py-1",
                                location === subItem.path ? "text-electric-cyan-400" : ""
                              )}
                            >  
                              {subItem.label}  
                            </Link>  
                          ))}  
                        </div>  
                      )}  
                    </div>  
                  ) : (  
                    <Link  
                      href={item.path}  
                      onClick={toggleMobileMenu}  
                      className={cn(
                        "font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 block",
                        location === item.path ? "text-electric-cyan-400" : ""
                      )}
                    >  
                      {item.label}  
                    </Link>  
                  )}  
                </div>  
              ))}
              
              <div className="flex flex-col space-y-4 pt-2">
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    toggleClientPreview();
                  }}
                  className="font-medium text-sm tracking-wide text-white hover:text-electric-cyan-400 border border-gray-700 hover:border-electric-cyan-400 px-3 py-2 rounded-md text-center transition-colors duration-200"
                >
                  Client Preview
                </button>
                
                <div className="flex items-center py-2 justify-between bg-gray-800 px-3 rounded-md">
                  <span className="text-white text-sm">Toggle Theme</span>
                  <ThemeToggle />
                </div>
                
                <Link  
                  href="/learnai"  
                  onClick={toggleMobileMenu}  
                  className="font-medium text-sm border border-electric-cyan-400 text-white py-3 px-4 rounded-md hover:bg-electric-cyan-400/20 transition-colors duration-200 text-center"  
                >  
                  Learn AI
                </Link>

                <Link  
                  href="/subscriptions"  
                  onClick={toggleMobileMenu}  
                  className="font-medium text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 text-center"  
                >  
                  Try Free
                </Link>
                
                {isAuthenticated ? (
                  <Link  
                    href="/member-dashboard"  
                    onClick={toggleMobileMenu}  
                    className="font-medium text-sm bg-electric-cyan-600 text-white py-3 px-4 rounded-md hover:bg-electric-cyan-700 transition-colors duration-200 flex items-center justify-center gap-2"  
                  >  
                    <LayoutDashboard className="w-5 h-5" />
                    Member Dashboard
                  </Link>
                ) : (
                  <Link  
                    href="/login"  
                    onClick={toggleMobileMenu}  
                    className="font-medium text-sm bg-electric-cyan-600 text-white py-3 px-4 rounded-md hover:bg-electric-cyan-700 transition-colors duration-200 flex items-center justify-center gap-2"  
                  >  
                    <ShieldCheck className="w-5 h-5" />
                    Login  
                  </Link>
                )}
              </div>  
            </div>  
          </nav>  
        )}  
      </header>  

      <ClientPreviewModal 
        isOpen={clientPreviewOpen} 
        onClose={() => setClientPreviewOpen(false)} 
      />
    </>
  );  
}
