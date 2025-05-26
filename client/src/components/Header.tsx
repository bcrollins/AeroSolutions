import { useState, useEffect } from 'react';  
import { Link, useLocation } from 'wouter';  
import { Menu, X, ChevronDown, ShieldCheck, LayoutDashboard, Home, BookOpen, Code, Newspaper, Eye, Zap, Cpu, Globe, Layers, Palette } from 'lucide-react';  
import { motion, AnimatePresence } from 'framer-motion';
import ClientPreviewModal from "./ClientPreviewModal";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./UI/SoundToggle";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Header() {  
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [clientPreviewOpen, setClientPreviewOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Navigation structure - exclude Home when on homepage
  const navigationItems = [
    ...(location !== '/' ? [{ 
      label: 'Home', 
      path: '/', 
      icon: Home,
      isActive: location === '/'
    }] : []),
    {
      label: 'AI Training',
      icon: Cpu,
      dropdown: [
        { label: 'Learn AI', path: '/learnai', icon: BookOpen },
        { label: 'AI Courses', path: '/ai-course-platform', icon: Layers },
        { label: 'Course Catalog', path: '/course-catalog', icon: Globe },
        { label: 'AI Tools', path: '/digital-tools', icon: Zap },
        { label: 'Content Generator', path: '/tools/content-generator', icon: Palette },
      ],
      isActive: ['/learnai', '/ai-course-platform', '/course-catalog', '/digital-tools', '/tools/content-generator'].includes(location)
    },
    {
      label: 'Web Development',
      icon: Code,
      dropdown: [
        { label: 'Frontend Development', path: '/web-dev/frontend', icon: Globe },
        { label: 'Backend Development', path: '/web-dev/backend', icon: Layers },
        { label: 'Full-Stack Courses', path: '/web-dev/fullstack', icon: Code },
        { label: 'JavaScript Mastery', path: '/web-dev/javascript', icon: Zap },
        { label: 'React & Modern Frameworks', path: '/web-dev/react', icon: Cpu },
        { label: 'Web Design', path: '/design-tools', icon: Palette },
      ],
      isActive: ['/web-dev/frontend', '/web-dev/backend', '/web-dev/fullstack', '/web-dev/javascript', '/web-dev/react', '/design-tools'].includes(location)
    },
    { 
      label: 'Tech News', 
      path: '/news', 
      icon: Newspaper,
      isActive: location === '/news'
    },
  ];

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown && !(e.target as Element).closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleClientPreview = () => setClientPreviewOpen(!clientPreviewOpen);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-[#0066cc] shadow-lg border-b border-blue-400/20" 
          : "bg-[#0066cc]"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <Link href="/" className="group flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-lg">RX</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-white group-hover:text-blue-100 transition-colors duration-300">
                    RXAI
                  </span>
                  <span className="text-xs text-blue-100 font-medium">
                    A RollinsX Technologies Company
                  </span>
                </div>
              </Link>

              {/* CTA Button */}
              <Link
                href="/learnai"
                className="hidden sm:block bg-white text-[#0066cc] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all duration-300 shadow-sm"
              >
                Start Free Training
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative dropdown-container">
                  {item.dropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap",
                        item.isActive || activeDropdown === item.label
                          ? "text-white bg-white/10 border border-white/20"
                          : "text-blue-100 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        activeDropdown === item.label ? "rotate-180" : ""
                      )} />
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap",
                        item.isActive
                          ? "text-white bg-white/10 border border-white/20"
                          : "text-blue-100 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.label && (
                      <motion.div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="p-2">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.path}
                              onClick={() => setActiveDropdown(null)}
                              className={cn(
                                "flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                location === subItem.path
                                  ? "bg-[#0066cc]/10 text-[#0066cc]"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-[#0066cc]"
                              )}
                            >
                              <subItem.icon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Client Preview */}
              <button
                onClick={toggleClientPreview}
                className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <Eye className="w-4 h-4" />
                <span>Client Preview</span>
              </button>

              {/* Theme & Sound Toggles */}
              <div className="hidden lg:flex items-center space-x-2">
                <ThemeToggle />
                <SoundToggle />
              </div>

              {/* Auth Button */}
              {isAuthenticated ? (
                <Link
                  href="/member-dashboard"
                  className="flex items-center space-x-2 bg-white text-[#0066cc] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-all duration-300 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 border-2 border-white text-white hover:bg-white hover:text-[#0066cc] px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden bg-[#0066cc] border-t border-white/20"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Mobile CTA Button */}
                <div className="sm:hidden mb-6">
                  <Link
                    href="/learnai"
                    onClick={toggleMobileMenu}
                    className="block w-full bg-white text-[#0066cc] text-center py-3 rounded-lg font-semibold shadow-sm"
                  >
                    Start Free Training
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="space-y-4">
                  {navigationItems.map((item) => (
                    <div key={item.label} className="border-b border-white/20 pb-4 last:border-b-0">
                      {item.dropdown ? (
                        <div>
                          <button
                            onClick={() => toggleDropdown(item.label)}
                            className="flex items-center justify-between w-full py-2 text-white font-medium"
                          >
                            <div className="flex items-center space-x-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </div>
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              activeDropdown === item.label ? "rotate-180" : ""
                            )} />
                          </button>
                          
                          <AnimatePresence>
                            {activeDropdown === item.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 pl-8 space-y-2 border-l border-white/20"
                              >
                                {item.dropdown.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    href={subItem.path}
                                    onClick={toggleMobileMenu}
                                    className={cn(
                                      "flex items-center space-x-3 py-2 text-sm transition-colors duration-200",
                                      location === subItem.path
                                        ? "text-white"
                                        : "text-blue-100 hover:text-white"
                                    )}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    <span>{subItem.label}</span>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.path}
                          onClick={toggleMobileMenu}
                          className={cn(
                            "flex items-center space-x-3 py-2 font-medium transition-colors duration-200",
                            item.isActive
                              ? "text-white"
                              : "text-blue-100 hover:text-white"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}

                  {/* Mobile Actions */}
                  <div className="pt-4 space-y-4">
                    <button
                      onClick={() => {
                        toggleMobileMenu();
                        toggleClientPreview();
                      }}
                      className="flex items-center space-x-3 w-full py-2 text-blue-100 hover:text-white font-medium"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Client Preview</span>
                    </button>

                    <div className="flex items-center justify-between py-2 border-t border-white/20 pt-4">
                      <span className="text-blue-100 font-medium">Settings</span>
                      <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <SoundToggle />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Client Preview Modal */}
      <ClientPreviewModal 
        isOpen={clientPreviewOpen}
        onClose={() => setClientPreviewOpen(false)}
      />
    </>
  );
}