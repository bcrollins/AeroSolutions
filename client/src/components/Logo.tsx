import React from 'react';
import logoImage from '../assets/rollinsx-logo.png';

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
    <img 
      src={logoImage}
      alt="ROLLINSX Logo" 
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;