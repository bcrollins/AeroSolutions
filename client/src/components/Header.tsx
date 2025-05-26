import { useState, useEffect, useRef } from 'react';  
import { Link, useLocation } from 'wouter';  
import { Menu, X, ChevronDown, UserCircle, ShieldCheck, LayoutDashboard, Home, BookOpen, Code, Newspaper, Eye, Zap, Cpu, Globe, Layers, Palette } from 'lucide-react';  
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [clientPreviewOpen, setClientPreviewOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Enhanced navigation structure with icons
  const navigationItems = [
    { 
      label: 'Home', 
      path: '/', 
      icon: Home,
      isActive: location === '/'
    },
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

  // Handle mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const header = headerRef.current;
    if (header) {
      header.addEventListener('mousemove', handleMouseMove);
      return () => header.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
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

  // Initialize magnetic effects
  useEffect(() => {
    const timer = setTimeout(() => {
      initMagneticButtons();
    }, 100);

    return () => clearTimeout(timer);
  }, [isMobileMenuOpen, activeDropdown]);

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleClientPreview = () => setClientPreviewOpen(!clientPreviewOpen);

  // Animation variants
  const headerVariants = {
    transparent: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backdropFilter: 'blur(0px)',
      borderColor: 'rgba(255, 255, 255, 0)',
    },
    scrolled: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 }
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300"
        variants={headerVariants}
        animate={isScrolled ? 'scrolled' : 'transparent'}
        data-branding="rxai"
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 102, 204, 0.3) 0%, transparent 50%)`
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link href="/" className="group">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="relative"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-[#0066cc] to-[#00D1D1] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">RX</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00D1D1] rounded-full animate-pulse" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xl text-white group-hover:text-[#00D1D1] transition-colors duration-300">
                      RXAI
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      AI Web Development Platform
                    </span>
                  </div>
                </div>
              </Link>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <Link
                  href="/learnai"
                  className="btn-magnetic bg-gradient-to-r from-[#0066cc] to-[#00D1D1] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#0066cc]/25 transition-all duration-300"
                >
                  Start Free Training
                </Link>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative dropdown-container">
                  {item.dropdown ? (
                    <motion.button
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "btn-magnetic flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
                        item.isActive || activeDropdown === item.label
                          ? "text-[#00D1D1] bg-white/10"
                          : "text-white hover:text-[#00D1D1] hover:bg-white/5"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      <motion.div
                        animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={item.path}
                        className={cn(
                          "btn-magnetic flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
                          item.isActive
                            ? "text-[#00D1D1] bg-white/10"
                            : "text-white hover:text-[#00D1D1] hover:bg-white/5"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.label && (
                      <motion.div
                        className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <div className="p-2">
                          {item.dropdown.map((subItem, index) => (
                            <motion.div
                              key={subItem.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                href={subItem.path}
                                onClick={() => setActiveDropdown(null)}
                                className={cn(
                                  "flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                  location === subItem.path
                                    ? "bg-[#0066cc]/20 text-[#00D1D1]"
                                    : "text-white hover:bg-white/10 hover:text-[#00D1D1]"
                                )}
                              >
                                <subItem.icon className="w-4 h-4" />
                                <span>{subItem.label}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Client Preview */}
              <motion.button
                onClick={toggleClientPreview}
                className="btn-magnetic hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm text-white hover:text-[#00D1D1] hover:bg-white/5 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                <span>Client Preview</span>
              </motion.button>

              {/* Theme & Sound Toggles */}
              <div className="hidden lg:flex items-center space-x-2">
                <ThemeToggle />
                <SoundToggle />
              </div>

              {/* Auth Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {isAuthenticated ? (
                  <Link
                    href="/member-dashboard"
                    className="btn-magnetic flex items-center space-x-2 bg-gradient-to-r from-[#00D1D1] to-[#0066cc] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#00D1D1]/25 transition-all duration-300"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="btn-magnetic flex items-center space-x-2 border border-[#00D1D1] text-[#00D1D1] hover:bg-[#00D1D1] hover:text-black px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </motion.div>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={toggleMobileMenu}
                className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle mobile menu"
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      exit={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Mobile CTA Button */}
                <div className="sm:hidden mb-6">
                  <Link
                    href="/learnai"
                    onClick={toggleMobileMenu}
                    className="block w-full bg-gradient-to-r from-[#0066cc] to-[#00D1D1] text-white text-center py-3 rounded-lg font-semibold"
                  >
                    Start Free Training
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <div className="space-y-4">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/10 pb-4 last:border-b-0"
                    >
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
                            <motion.div
                              animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
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
                                        ? "text-[#00D1D1]"
                                        : "text-gray-300 hover:text-white"
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
                              ? "text-[#00D1D1]"
                              : "text-white hover:text-[#00D1D1]"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </motion.div>
                  ))}

                  {/* Mobile Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navigationItems.length * 0.1 + 0.1 }}
                    className="pt-4 space-y-4"
                  >
                    <button
                      onClick={() => {
                        toggleMobileMenu();
                        toggleClientPreview();
                      }}
                      className="flex items-center space-x-3 w-full py-2 text-white font-medium"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Client Preview</span>
                    </button>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-white font-medium">Theme & Sound</span>
                      <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <SoundToggle />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Client Preview Modal */}
      <ClientPreviewModal 
        isOpen={clientPreviewOpen}
        onClose={() => setClientPreviewOpen(false)}
      />
    </>
  );
}