import { useState, useEffect, useRef } from 'react';  
import { Link, useLocation } from 'wouter';  
import { Menu, X, ChevronDown, UserCircle, ShieldCheck, LayoutDashboard } from 'lucide-react';  
import ClientPreviewModal from "./ClientPreviewModal";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./UI/SoundToggle";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { initMagneticButtons } from '@/utils/appleEffects';

export default function Header() {  
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);  
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);  
  const [clientPreviewOpen, setClientPreviewOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
  
  // Handle scroll effect for enhanced header appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Initialize Apple-inspired magnetic button effect
  useEffect(() => {
    // Initialize magnetic effect on header nav items
    const navItemsRef = document.querySelectorAll('.header-nav-item');
    navItemsRef.forEach(item => {
      item.classList.add('btn-magnetic');
    });
    
    // Initialize magnetic buttons
    initMagneticButtons();
    
    // Re-initialize when mobile menu changes (to capture newly rendered elements)
    return () => {
      // Cleanup if needed
    };
  }, [isMobileMenuOpen]);

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
    { label: 'AI News & Articles', path: '/news' },
    { label: 'Client Preview', path: '/client-preview' }
  ];  

  return (  
    <>
      <header className={cn(
        "header bg-gradient-to-r from-gray-900 to-black text-white py-4 px-4 sm:px-6 sticky top-0 z-50 shadow-lg",
        isScrolled && "scrolled"
      )} data-branding="rxai">  
        <div className="max-w-7xl mx-auto flex justify-between items-center">  
          {/* Logo and Training CTA Button */}  
          <div className="flex items-center gap-4">
            <Link href="/">  
              <div className="flex items-center group">
                <div className="flex flex-col">
                  <span className="font-bold tracking-wider text-xl text-white group-hover:text-electric-cyan-400 transition-colors duration-300">RXAI</span>
                  <span className="text-xs text-gray-400">The World Leader in Artificial Intelligence Education</span>
                </div>
              </div>
            </Link>
            
            {/* Start AI Training Free button moved here */}
            <Link  
              href="/learnai"  
              className="header-nav-item enhanced-btn enhanced-btn-primary font-medium text-sm px-4 py-1.5 rounded-md transition-apple hover-lift hidden sm:block whitespace-nowrap min-w-[180px] text-center"  
            >  
              Start AI Training Free
            </Link>
          </div>

          {/* Desktop Menu */}  
          <nav className="hidden md:flex space-x-2 lg:space-x-4 xl:space-x-6 items-center whitespace-nowrap">  
            {menuItems.map((item) => (  
              <div key={item.label} className="relative">  
                {item.dropdown ? (  
                  <button  
                    onClick={item.label === 'AI Products' ? toggleSolutionsDropdown : toggleResourcesDropdown}  
                    className={cn(
                      "header-nav-item font-medium text-sm tracking-wide apple-nav-item flex items-center transition-apple",
                      (item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                      (item.label === 'Resources' && isResourcesDropdownOpen) 
                        ? "active" : ""
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
                      "header-nav-item font-medium text-sm tracking-wide apple-nav-item transition-apple",
                      location === item.path ? "active" : ""
                    )}
                  >  
                    {item.label}  
                  </Link>  
                )}  
                {item.dropdown && 
                  ((item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                   (item.label === 'Resources' && isResourcesDropdownOpen)) && (  
                  <div className="absolute top-full left-0 mt-2 w-56 glass-effect rounded-lg subtle-shadow z-10 overflow-hidden">  
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
                            "block px-4 py-2 text-white hover:bg-white/10 transition-apple hover-lift",
                            location === subItem.path ? "bg-white/5 text-electric-cyan-400" : ""
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
              className="header-nav-item enhanced-btn enhanced-btn-secondary font-medium text-sm tracking-wide px-3 py-1.5 rounded-md transition-apple"
            >
              Client Preview
            </button>
            <ThemeToggle />
            <SoundToggle />
            
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Link  
                  href="/member-dashboard"  
                  className="header-nav-item apple-btn-accent font-medium text-sm px-4 py-2 rounded-md transition-apple hover-lift flex items-center gap-2"  
                >  
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard  
                </Link>
              ) : (
                <Link  
                  href="/login"  
                  className="header-nav-item enhanced-btn enhanced-btn-primary font-medium text-sm px-4 py-2 rounded-md transition-apple hover-lift flex items-center gap-2"  
                >  
                  <ShieldCheck className="w-4 h-4" />
                  Login  
                </Link>
              )}
            </div>  
          </nav>  

          {/* Mobile Menu Actions */}  
          <div className="md:hidden flex items-center gap-3">
            {/* Show Start AI Training Free button on small screens but not xs */}
            <Link  
              href="/learnai"  
              className="header-nav-item apple-btn-primary font-medium text-xs px-3 py-1.5 rounded-md transition-apple hover-lift hidden sm:block md:hidden whitespace-nowrap min-w-[160px] text-center"  
            >  
              Start AI Training Free
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button  
              className="text-white focus:outline-none"  
              onClick={toggleMobileMenu}  
              aria-label="Toggle mobile menu"
            >  
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}  
            </button>
          </div>  
        </div>  

        {/* Mobile Menu */}  
        {isMobileMenuOpen && (  
          <nav className="md:hidden glass-effect py-4 mt-4 rounded-b-lg subtle-shadow apple-scrollbar">  
            {/* Mobile CTA button for xs screens only */}
            <div className="sm:hidden px-6 pt-2 pb-4 border-b border-gray-800/20">
              <Link  
                href="/learnai"  
                onClick={toggleMobileMenu}  
                className="apple-btn-primary font-medium text-sm py-2 px-4 rounded-md text-center w-full block hover-lift transition-apple whitespace-nowrap"  
              >  
                Start AI Training Free
              </Link>
            </div>
            <div className="flex flex-col space-y-4 px-6">  
              {menuItems.map((item) => (  
                <div key={item.label} className="py-2 border-b border-gray-800/20 last:border-b-0">  
                  {item.dropdown ? (  
                    <div>  
                      <button  
                        onClick={item.label === 'AI Products' ? toggleSolutionsDropdown : toggleResourcesDropdown}  
                        className={cn(
                          "header-nav-item font-medium text-sm tracking-wide apple-nav-item flex items-center justify-between w-full transition-apple",
                          (item.label === 'AI Products' && isSolutionsDropdownOpen) || 
                          (item.label === 'Resources' && isResourcesDropdownOpen) 
                            ? "active" : ""
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
                        <div className="pl-4 mt-3 mb-1 space-y-3 border-l border-white/10">  
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
                                "block text-sm py-1 hover-lift apple-nav-item transition-apple",
                                location === subItem.path ? "active" : ""
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
                        "header-nav-item font-medium text-sm tracking-wide apple-nav-item block py-1 transition-apple",
                        location === item.path ? "active" : ""
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
                  className="apple-btn-secondary font-medium text-sm tracking-wide px-3 py-2 rounded-md text-center hover-lift transition-apple"
                >
                  Client Preview
                </button>
                
                <div className="flex items-center py-2 justify-between glass-effect px-3 rounded-md subtle-shadow">
                  <span className="text-white text-sm font-medium">Toggle Theme</span>
                  <ThemeToggle />
                </div>
                
                <div className="flex items-center py-2 justify-between glass-effect px-3 rounded-md subtle-shadow">
                  <span className="text-white text-sm font-medium">Sound Effects</span>
                  <SoundToggle />
                </div>
                
                {/* Mobile menu training button removed from here since it's now at the top */}
                
                {isAuthenticated ? (
                  <Link  
                    href="/member-dashboard"  
                    onClick={toggleMobileMenu}  
                    className="apple-btn-primary font-medium text-sm py-3 px-4 rounded-md hover-lift transition-apple flex items-center justify-center gap-2"  
                  >  
                    <LayoutDashboard className="w-5 h-5" />
                    Member Dashboard
                  </Link>
                ) : (
                  <Link  
                    href="/login"  
                    onClick={toggleMobileMenu}  
                    className="apple-btn-primary font-medium text-sm py-3 px-4 rounded-md hover-lift transition-apple flex items-center justify-center gap-2"  
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
