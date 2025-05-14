import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  width = 40, 
  height = 40 
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ objectFit: 'contain' }}
    >
      {/* Modern minimalist logo for RXAI */}
      <rect width="64" height="64" rx="12" fill="#000000" />
      
      {/* Stylized "R" */}
      <path 
        d="M16 18C16 18 24 18 28 18C32 18 35 21 35 25C35 29 32 32 28 32C24 32 19 32 19 32L29 46H23L16 35V18Z" 
        fill="#3B82F6"
        strokeLinejoin="round"
      />
      
      {/* Circular accent in the "R" */}
      <circle cx="27" cy="25" r="3" fill="#000000" />
      
      {/* Stylized "X" - modern, clean lines */}
      <path 
        d="M37 18L45 32L37 46H42L47 37L52 46H57L49 32L57 18H52L47 27L42 18H37Z" 
        fill="#3B82F6"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;