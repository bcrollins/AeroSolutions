import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const SimpleCube: React.FC = () => {
  const [isRotating, setIsRotating] = useState(true);

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  return (
    <div className="perspective-1000 w-full h-[400px] flex items-center justify-center">
      <motion.div 
        className="relative w-64 h-64 cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={isRotating ? {
          rotateY: 360,
          transition: { duration: 20, repeat: Infinity, ease: "linear" }
        } : {}}
        onClick={toggleRotation}
      >
        {/* Front face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/90 rounded-lg border border-white/30"
             style={{ transform: 'translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>

        {/* Back face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/90 rounded-lg border border-white/30"
             style={{ transform: 'rotateY(180deg) translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>

        {/* Right face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/80 rounded-lg border border-white/30"
             style={{ transform: 'rotateY(90deg) translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>

        {/* Left face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/80 rounded-lg border border-white/30"
             style={{ transform: 'rotateY(-90deg) translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>

        {/* Top face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/70 rounded-lg border border-white/30"
             style={{ transform: 'rotateX(90deg) translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>

        {/* Bottom face */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#3B82F6]/70 rounded-lg border border-white/30"
             style={{ transform: 'rotateX(-90deg) translateZ(8rem)' }}>
          <Logo width={160} height={160} />
        </div>
      </motion.div>
    </div>
  );
};

export default SimpleCube;