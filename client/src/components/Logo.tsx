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
    <img 
      src="https://cdn.shopify.com/s/files/1/0888/0363/9598/files/31152851-983c-41de-801d-36807175af34.png?v=1747108236"
      alt="RXAI Logo" 
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;