import { useState, useEffect } from 'react';  
import { Link } from 'wouter';  
import { Menu, X, ChevronDown } from 'lucide-react';  
import ClientPreviewModal from "./ClientPreviewModal";
import ROLLINSXLogo from "./ROLLINSXLogo";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);  
  const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false);  
  const [clientPreviewOpen, setClientPreviewOpen] = useState(false);

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsSolutionsDropdownOpen(false);
    setIsSupportDropdownOpen(false);
  };
  
  // Handle click outside for dropdown menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // This only runs if a dropdown is open
      if (isSolutionsDropdownOpen || isSupportDropdownOpen) {
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
  }, [isSolutionsDropdownOpen, isSupportDropdownOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);  
  
  const toggleSolutionsDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSolutionsDropdownOpen(!isSolutionsDropdownOpen);
    // Close the other dropdown when opening this one
    if (!isSolutionsDropdownOpen) setIsSupportDropdownOpen(false);
  };
  
  const toggleSupportDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSupportDropdownOpen(!isSupportDropdownOpen);
    // Close the other dropdown when opening this one
    if (!isSupportDropdownOpen) setIsSolutionsDropdownOpen(false);
  };
  const toggleClientPreview = () => setClientPreviewOpen(!clientPreviewOpen);

  const menuItems = [  
    { label: 'Home', path: '/' },  
    {  
      label: 'Solutions',  
      dropdown: [  
        { label: 'AI Services', path: '/ai-services' },  
        { label: 'Content Hub', path: '/content-hub' },  
        { label: 'SEO Tools', path: '/seo-tools' },
        { label: 'Design Tools', path: '/design-tools' },
        { label: 'Particle Background', path: '/particle-background' },
      ],  
    },  
    { label: 'Pricing', path: '/subscriptions' },  
    {  
      label: 'Support',  
      dropdown: [  
        { label: 'Mockup Suggestions', path: '/mockup-suggestions' },  
        { label: 'Social Media', path: '/social-media' },  
        { label: 'Analytics', path: '/website-analytics' },  
        { label: 'Share Feedback', path: '/feedback' },  
      ],  
    },  
    { label: 'About', path: '/history' },  
  ];  

  return (  
    <>
      <header className="header bg-[#1E3A8A] text-white py-4 px-6 sticky top-0 z-50 shadow-md">  
        <div className="max-w-7xl mx-auto flex justify-between items-center">  
          {/* Logo */}  
          <Link href="/">  
            <div className="flex items-center space-x-2">
              <ROLLINSXLogo size="sm" animated={true} />
              <div className="text-2xl font-poppins text-[#00D1D1]">rollinsx</div>  
            </div>
          </Link>  

          {/* Desktop Menu */}  
          <nav className="hidden md:flex space-x-8 items-center">  
            {menuItems.map((item) => (  
              <div key={item.label} className="relative">  
                {item.dropdown ? (  
                  <button  
                    onClick={item.label === 'Solutions' ? toggleSolutionsDropdown : toggleSupportDropdown}  
                    className="font-inter text-sm uppercase tracking-wide text-gray-200 hover:text-[#D4A017] flex items-center transition-colors duration-200"  
                  >  
                    {item.label}  
                    <ChevronDown className="ml-1 w-4 h-4" />  
                  </button>  
                ) : (  
                  <Link  
                    href={item.path}  
                    className="font-inter text-sm uppercase tracking-wide text-gray-200 hover:text-[#D4A017] transition-colors duration-200"  
                  >  
                    {item.label}  
                  </Link>  
                )}  
                {item.dropdown && (item.label === 'Solutions' ? isSolutionsDropdownOpen : isSupportDropdownOpen) && (  
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#f5f5f5] rounded-lg shadow-lg z-10">  
                    {item.dropdown.map((subItem) => (  
                      <Link  
                        key={subItem.label}  
                        href={subItem.path}  
                        onClick={() => {
                          setIsSolutionsDropdownOpen(false);
                          setIsSupportDropdownOpen(false);
                        }}
                        className="block px-4 py-2 text-[#1E3A8A] hover:bg-[#00D1D1] hover:text-white transition-colors duration-200"  
                      >  
                        {subItem.label}  
                      </Link>  
                    ))}  
                  </div>  
                )}  
              </div>  
            ))}  
            <button
              onClick={toggleClientPreview}
              className="font-inter text-sm uppercase tracking-wide text-[#00D1D1] hover:text-[#D4A017] transition-colors duration-200 border border-[#00D1D1] px-3 py-1 rounded-md hover:border-[#D4A017]"
            >
              Client Preview
            </button>
            <ThemeToggle />
            <Link  
              href="/login"  
              className="font-inter text-sm uppercase tracking-wide text-[#D4A017] hover:text-[#00D1D1] transition-colors duration-200"  
            >  
              Login  
            </Link>  
          </nav>  

          {/* Mobile Menu Toggle */}  
          <button  
            className="md:hidden text-gray-200 focus:outline-none"  
            onClick={toggleMobileMenu}  
          >  
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}  
          </button>  
        </div>  

        {/* Mobile Menu */}  
        {isMobileMenuOpen && (  
          <nav className="md:hidden bg-[#1E3A8A] py-4">  
            <div className="flex flex-col space-y-4 px-6">  
              {menuItems.map((item) => (  
                <div key={item.label}>  
                  {item.dropdown ? (  
                    <div>  
                      <button  
                        onClick={item.label === 'Solutions' ? toggleSolutionsDropdown : toggleSupportDropdown}  
                        className="font-inter text-sm uppercase tracking-wide text-gray-200 hover:text-[#D4A017] flex items-center"  
                      >  
                        {item.label}  
                        <ChevronDown className="ml-1 w-4 h-4" />  
                      </button>  
                      {(item.label === 'Solutions' ? isSolutionsDropdownOpen : isSupportDropdownOpen) && (  
                        <div className="pl-4 mt-2 space-y-2">  
                          {item.dropdown.map((subItem) => (  
                            <Link  
                              key={subItem.label}  
                              href={subItem.path}  
                              onClick={() => {
                                toggleMobileMenu();
                                setIsSolutionsDropdownOpen(false);
                                setIsSupportDropdownOpen(false);
                              }}  
                              className="block text-gray-200 hover:text-[#D4A017]"  
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
                      className="font-inter text-sm uppercase tracking-wide text-gray-200 hover:text-[#D4A017]"  
                    >  
                      {item.label}  
                    </Link>  
                  )}  
                </div>  
              ))}
              <button
                onClick={() => {
                  toggleMobileMenu();
                  toggleClientPreview();
                }}
                className="font-inter text-sm uppercase tracking-wide text-[#00D1D1] hover:text-[#D4A017] border border-[#00D1D1] px-3 py-1 rounded-md hover:border-[#D4A017]"
              >
                Client Preview
              </button>
              <div className="flex items-center py-2">
                <ThemeToggle />
                <span className="ml-2">Theme</span>
              </div>
              <Link  
                href="/login"  
                onClick={toggleMobileMenu}  
                className="font-inter text-sm uppercase tracking-wide text-[#D4A017] hover:text-[#00D1D1]"  
              >  
                Login  
              </Link>  
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
