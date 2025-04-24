import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

const ROLLINSXLogo: React.FC<LogoProps> = ({ 
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  // Define sizes for different size props
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Define colors based on variant
  const colors = {
    default: {
      primary: '#000000',      // Black
      secondary: '#0070F3',    // Blue accent
      text: '#000000'          // Black text
    },
    light: {
      primary: '#FFFFFF',      // White
      secondary: '#0070F3',    // Blue accent
      text: '#FFFFFF'          // White text
    }
  };

  const selectedColors = colors[variant];
  const selectedSize = sizeMap[size];

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        className={selectedSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Logo Shape */}
        <rect width="64" height="64" rx="8" fill={selectedColors.primary} />
        
        {/* R Letter */}
        <path 
          d="M16 16H28C31.3137 16 34 18.6863 34 22V26C34 29.3137 31.3137 32 28 32H22L32 48H26L16 32V16Z" 
          fill={selectedColors.secondary}
          fillRule="evenodd"
        />
        <path 
          d="M22 22H28C28.5523 22 29 22.4477 29 23V26C29 26.5523 28.5523 27 28 27H22V22Z" 
          fill={selectedColors.primary}
          fillRule="evenodd"
        />
        
        {/* X Letter */}
        <path 
          d="M36 16L46 32L36 48H42L48 38L54 48H60L50 32L60 16H54L48 26L42 16H36Z" 
          fill={selectedColors.secondary}
          fillRule="evenodd"
        />
      </svg>
      
      {/* Text ROLLINSX */}
      <span className={`ml-2 font-bold text-${size === 'sm' ? 'base' : size === 'md' ? 'xl' : '2xl'}`} style={{ color: selectedColors.text }}>
        ROLLINSX
      </span>
    </div>
  );
};

export default ROLLINSXLogo;