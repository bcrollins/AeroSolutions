import React from 'react';

interface LogoProps {
  /**
   * Additional classes to apply to the logo container
   */
  className?: string;
  
  /**
   * Size of the logo
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Color variant to use
   * @default "default"
   */
  variant?: 'default' | 'light';
  
  /**
   * Whether to show the text "ROLLINSX" alongside the logo
   * @default true
   */
  showText?: boolean;
}

/**
 * ROLLINSX Logo Component
 * Minimalist, modern logo with consistent branding
 */
const ROLLINSXLogo: React.FC<LogoProps> = ({ 
  className = '',
  size = 'md',
  variant = 'default',
  showText = true
}) => {
  // Define sizes for different size props
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Text sizes based on logo size
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  // Define colors based on variant - using standardized blue
  const colors = {
    default: {
      primary: '#000000',      // Black
      secondary: '#3B82F6',    // Standardized blue
      accent: '#2563EB',       // Darker blue for accents
      text: '#000000'          // Black text
    },
    light: {
      primary: '#FFFFFF',      // White
      secondary: '#3B82F6',    // Standardized blue
      accent: '#2563EB',       // Darker blue for accents
      text: '#FFFFFF'          // White text
    }
  };

  const selectedColors = colors[variant];
  const selectedSize = sizeMap[size];
  const selectedTextSize = textSizeMap[size];

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        className={selectedSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern minimalist logo */}
        <rect width="64" height="64" rx="12" fill={selectedColors.primary} />
        
        {/* Stylized "R" */}
        <path 
          d="M16 18C16 18 24 18 28 18C32 18 35 21 35 25C35 29 32 32 28 32C24 32 19 32 19 32L29 46H23L16 35V18Z" 
          fill={selectedColors.secondary}
          strokeLinejoin="round"
        />
        
        {/* Circular accent in the "R" */}
        <circle cx="27" cy="25" r="3" fill={selectedColors.primary} />
        
        {/* Stylized "X" - modern, clean lines */}
        <path 
          d="M37 18L45 32L37 46H42L47 37L52 46H57L49 32L57 18H52L47 27L42 18H37Z" 
          fill={selectedColors.secondary}
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Text ROLLINSX */}
      {showText && (
        <span 
          className={`ml-2 font-bold tracking-wider ${selectedTextSize}`} 
          style={{ color: selectedColors.text }}
        >
          ROLLINSX
        </span>
      )}
    </div>
  );
};

export default ROLLINSXLogo;