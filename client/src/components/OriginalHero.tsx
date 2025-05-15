import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { FaCode, FaLaptop, FaHandshake, FaClock, FaDesktop, FaUsers, FaLaptopCode, FaShieldAlt, FaMobileAlt, FaStore } from "react-icons/fa";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function OriginalHero() {
  // Auto-rotation state
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  // Motion values for user controlled rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform mouse position to rotation values with dampening
  const rotateY = useTransform(mouseX, [-200, 200], [60, -60]);
  const rotateX = useTransform(mouseY, [-200, 200], [-30, 30]);
  
  // Animation controls for auto-rotation
  const controls = useAnimation();
  
  // Handle click to toggle auto-rotation
  const handleCubeClick = () => {
    setIsAutoRotating(!isAutoRotating);
  };
  
  // Update auto-rotation based on state
  useEffect(() => {
    if (isAutoRotating) {
      controls.start({
        rotateY: 360,
        rotateX: [5, -5, 5],
        rotateZ: [2, -2, 2],
        transition: { 
          rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }
      });
    } else {
      controls.stop();
    }
  }, [isAutoRotating, controls]);
  
  // Mouse drag handler
  const handleDrag = (event: any, info: any) => {
    if (!isAutoRotating) {
      mouseX.set(info.offset.x);
      mouseY.set(info.offset.y);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.6, ease: "easeOut" }
    })
  };
  
  const fadeInLeft = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.6, duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section 
      id="home" 
      className="pt-32 pb-24 hero-section bg-white relative overflow-hidden"
      aria-label="ROLLINSX Introduction"
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0zm10 20h10v10H10zM0 40h10v10H0zm30-20h10v10H30zm20-20h10v10H50z' fill='%230066cc' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')", 
          backgroundSize: "60px 60px", 
          backgroundPosition: "center"
        }}
        aria-hidden="true"
      />
      
      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white z-0"></div>
      
      {/* Blue accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066cc] via-[#f8f9fa] to-[#0066cc]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="text-gray-900">
            <motion.div 
              className="inline-block mb-4 px-3 py-1 bg-[#0066cc]/10 border border-[#0066cc]/20 rounded-full"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <span className="text-[#0066cc] text-sm font-medium tracking-wider uppercase font-inter">Premier AI Education Platform</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold font-poppins leading-tight text-gray-900 tracking-tight"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <span className="text-[#0066cc]">AI Courses</span> & Digital Tools for Modern Creators
            </motion.h1>
            
            <motion.p 
              className="mt-8 text-xl text-gray-700 leading-relaxed font-lato"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Master the future of artificial intelligence with our comprehensive AI courses. Learn cutting-edge techniques from industry experts and gain hands-on experience with our professional toolsets.
            </motion.p>
            
            <motion.p 
              className="mt-5 text-lg text-gray-600 leading-relaxed font-lato"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <span className="font-semibold">RXAI</span> offers flexible monthly and annual subscriptions with a 16% discount on yearly plans. Subscribers gain exclusive access to our premium AI course library, powerful AI-driven tools, and a supportive community of AI practitioners and educators.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-wrap gap-5"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              <Link 
                href="/learnai" 
                className="bg-[#0066cc] hover:bg-[#0055b3] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_5px_15px_rgba(0,102,204,0.35)] font-inter"
                aria-label="Browse AI courses and start learning"
              >
                Learn AI Today
              </Link>
              <Link 
                href="/subscriptionspage" 
                className="bg-transparent hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-lg border border-gray-300 transition-all duration-300 hover:scale-105 hover:border-[#0066cc]/40 font-inter"
                aria-label="View all subscription plans"
              >
                View Plans
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="hidden md:block"
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
          >
            {/* Web development image */}
            <motion.div 
              className="relative overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-h-[550px] h-[550px] w-full perspective-1000 transform hover:scale-105 transition-all duration-700"
              initial={{ rotateY: 10, rotateX: -10 }}
              animate={{ 
                rotateY: [10, -10, 10], 
                rotateX: [-10, 10, -10],
                z: [0, 30, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 15, 
                ease: "easeInOut" 
              }}
            >
              {/* 3D hexagonal backdrop */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-blue via-slate-blue/80 to-electric-cyan/20 z-10 rounded-xl">
                {/* Geometric accent lines */}
                <div className="absolute w-full h-full">
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={`line-${i}`} 
                        className="absolute h-[1px] bg-electric-cyan"
                        style={{ 
                          width: `${Math.random() * 100}%`, 
                          top: `${Math.random() * 100}%`, 
                          left: `${Math.random() * 100}%`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                          opacity: Math.random() * 0.8 + 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-electric-cyan blur-md animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-electric-cyan blur-md animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-sunset-orange/80 blur-sm animate-pulse" style={{ animationDelay: '2.3s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-5 h-5 rounded-full bg-sunset-orange/70 blur-md animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              </div>
              
              {/* Holographic shine overlay */}
              <div className="absolute inset-0 opacity-20 z-20 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-xl"></div>
              
              {/* 3D Logo Effect */}
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <motion.div 
                  className="text-center p-8 relative z-10 flex flex-col items-center justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                >
                  {/* Fully 3D cube with ROLLINSX logo on all sides */}
                  <div className="relative mb-6" style={{ perspective: "1000px" }}>
                    <motion.div
                      className="w-48 h-48 relative cursor-pointer"
                      style={{ 
                        transformStyle: "preserve-3d",
                        rotate: isAutoRotating ? undefined : `${rotateX.get()}deg ${rotateY.get()}deg 0deg`
                      }}
                      initial={{ rotateY: 0 }}
                      animate={controls}
                      drag={!isAutoRotating}
                      dragConstraints={{ top: -100, left: -100, right: 100, bottom: 100 }}
                      dragElastic={0.2}
                      whileTap={{ scale: 1.1 }}
                      onDragEnd={handleDrag}
                      onClick={handleCubeClick}
                    >
                      {/* Main face - front */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0066cc] to-white shadow-[0_10px_30px_rgba(0,102,204,0.25)] flex items-center justify-center rounded-xl z-10"
                           style={{ transformStyle: "preserve-3d" }}>
                        <div className="relative flex items-center justify-center h-full w-full" 
                             style={{ transform: "translateZ(2px)" }}>
                          {/* ROLLINSX logo */}
                          <div className="relative w-32 h-32 flex items-center justify-center">
                            <Logo width={96} height={96} className="z-10" />
                            
                            {/* Glow effect behind logo */}
                            <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 border border-white/50 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                            
                            {/* Accent dots */}
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/90 animate-pulse"></div>
                            <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" style={{ animationDelay: "1s" }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side */}
                      <div className="absolute inset-0 w-full h-full bg-[#0066cc]/60 rounded-xl flex items-center justify-center"
                           style={{ 
                             transform: "rotateY(90deg) translateZ(24px)",
                             transformOrigin: "right"
                           }}>
                        {/* Right side ROLLINSX Logo */}
                        <div className="relative w-28 h-28 rotate-12 flex items-center justify-center">
                          {/* Background glow */}
                          <div className="absolute inset-0 rounded-full bg-[#0066cc]/10 border border-[#0066cc]/30 shadow-[0_0_10px_rgba(0,102,204,0.2)]"></div>
                          
                          {/* Logo image */}
                          <Logo width={80} height={80} className="z-10" />
                          
                          {/* Accent dot */}
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#0066cc]/90 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Left side */}
                      <div className="absolute inset-0 w-full h-full bg-white rounded-xl flex items-center justify-center"
                           style={{ 
                             transform: "rotateY(-90deg) translateZ(24px)",
                             transformOrigin: "left"
                           }}>
                        {/* Left side ROLLINSX Logo */}
                        <div className="relative w-28 h-28 -rotate-12 flex items-center justify-center">
                          {/* Background glow */}
                          <div className="absolute inset-0 rounded-full bg-white/10 border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.4)]"></div>
                          
                          {/* Logo image */}
                          <Logo width={80} height={80} className="z-10" />
                          
                          {/* Accent dot */}
                          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6]/90 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Top side */}
                      <div className="absolute inset-0 w-full h-full bg-[#1E3A8A]/60 rounded-xl flex items-center justify-center"
                           style={{ 
                             transform: "rotateX(90deg) translateZ(24px)",
                             transformOrigin: "top"
                           }}>
                        {/* Top side ROLLINSX Logo */}
                        <div className="relative w-28 h-28 rotate-45 flex items-center justify-center">
                          {/* Background glow */}
                          <div className="absolute inset-0 rounded-full bg-white/10 border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
                          
                          {/* Logo image */}
                          <Logo width={72} height={72} className="z-10" />
                        </div>
                      </div>
                      
                      {/* Bottom side */}
                      <div className="absolute inset-0 w-full h-full bg-[#3B82F6]/60 rounded-xl flex items-center justify-center"
                           style={{ 
                             transform: "rotateX(-90deg) translateZ(24px)",
                             transformOrigin: "bottom"
                           }}>
                        {/* Bottom side ROLLINSX Logo */}
                        <div className="relative w-28 h-28 -rotate-45 flex items-center justify-center">
                          {/* Background glow */}
                          <div className="absolute inset-0 rounded-full bg-white/10 border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.3)]"></div>
                          
                          {/* Logo image */}
                          <Logo width={72} height={72} className="z-10" />
                        </div>
                      </div>
                      
                      {/* Back side */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6]/80 rounded-xl flex items-center justify-center"
                           style={{ 
                             transform: "rotateY(180deg) translateZ(24px)",
                             transformOrigin: "center"
                           }}>
                        {/* Back side ROLLINSX Logo */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          {/* Background glow */}
                          <div className="absolute inset-0 rounded-full bg-[#3B82F6]/20 border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.4)]"></div>
                          
                          {/* Logo image */}
                          <Logo width={88} height={88} className="z-10" />
                          
                          {/* Accent dots */}
                          <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse"></div>
                          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Additional animated elements */}
                  <div className="text-center mt-8 relative">
                    <p className="text-white font-semibold font-inter text-xl mb-2">
                      <span className="text-[#3B82F6]">Web Development</span> Excellence
                    </p>
                    <p className="text-gray-300 opacity-90 text-sm">
                      {isAutoRotating ? "Click cube to interact" : "Drag to rotate • Click to auto-rotate"}
                    </p>
                    
                    {/* Tech icons */}
                    <div className="flex justify-center mt-6 space-x-4">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="bg-[#1E293B] p-2 rounded-lg shadow-md hover:bg-[#1E293B]/80 cursor-pointer transition-all"
                      >
                        <FaCode className="text-[#3B82F6] w-6 h-6" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.3, duration: 0.5 }}
                        className="bg-[#1E293B] p-2 rounded-lg shadow-md hover:bg-[#1E293B]/80 cursor-pointer transition-all"
                      >
                        <FaLaptopCode className="text-[#3B82F6] w-6 h-6" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="bg-[#1E293B] p-2 rounded-lg shadow-md hover:bg-[#1E293B]/80 cursor-pointer transition-all"
                      >
                        <FaMobileAlt className="text-[#3B82F6] w-6 h-6" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="bg-[#1E293B] p-2 rounded-lg shadow-md hover:bg-[#1E293B]/80 cursor-pointer transition-all"
                      >
                        <FaShieldAlt className="text-[#3B82F6] w-6 h-6" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}