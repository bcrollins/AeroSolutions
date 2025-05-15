import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FaLaptop, FaRobot, FaCode, FaPuzzlePiece, FaLightbulb, FaChartLine } from "react-icons/fa";
import { Link } from "wouter";
import Logo from "../Logo";
import { Button } from "@/components/ui/button";

// Enhanced hero with Apple-like design aesthetics
export default function EnhancedHero() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: false, amount: 0.3 });
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Features to highlight with animations
  const features = [
    {
      icon: <FaRobot className="h-6 w-6" />,
      title: "AI Fundamentals",
      description: "Master the core concepts that power modern AI systems"
    },
    {
      icon: <FaLaptop className="h-6 w-6" />,
      title: "Practical Applications",
      description: "Apply AI techniques to solve real-world problems"
    },
    {
      icon: <FaCode className="h-6 w-6" />,
      title: "Coding Skills",
      description: "Develop programming expertise for AI development"
    },
    {
      icon: <FaPuzzlePiece className="h-6 w-6" />,
      title: "Problem Solving",
      description: "Learn analytical approaches to complex AI challenges"
    },
    {
      icon: <FaLightbulb className="h-6 w-6" />,
      title: "Innovation",
      description: "Discover cutting-edge techniques and methodologies"
    },
    {
      icon: <FaChartLine className="h-6 w-6" />,
      title: "Career Growth",
      description: "Accelerate your professional development with AI skills"
    }
  ];

  // Auto-rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const backgroundBlobVariants = {
    initial: {
      scale: 0.8,
      opacity: 0.7,
      filter: "blur(20px)"
    },
    animate: {
      scale: [0.8, 1.2, 0.9, 1.1, 1],
      opacity: [0.7, 0.6, 0.8, 0.7, 0.8],
      filter: ["blur(20px)", "blur(30px)", "blur(25px)", "blur(30px)", "blur(25px)"],
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <section 
      ref={heroRef}
      id="home" 
      className="pt-32 pb-24 min-h-screen flex items-center relative overflow-hidden bg-white"
      aria-label="RXAI Introduction"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-white overflow-hidden">
        {/* Animated blobs */}
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-200/30"
          variants={backgroundBlobVariants}
          initial="initial"
          animate="animate"
          style={{ originX: 0.5, originY: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-blue-300/20"
          variants={backgroundBlobVariants}
          initial="initial"
          animate="animate"
          style={{ originX: 0.5, originY: 0.5, animationDelay: "2s" }}
        />
        <motion.div
          className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full bg-blue-100/30"
          variants={backgroundBlobVariants}
          initial="initial"
          animate="animate"
          style={{ originX: 0.5, originY: 0.5, animationDelay: "4s" }}
        />
      </div>
      
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0zm10 20h10v10H10zM0 40h10v10H0zm30-20h10v10H30zm20-20h10v10H50z' fill='%230066cc' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')", 
          backgroundSize: "60px 60px"
        }}
        aria-hidden="true"
      />
      
      {/* Blue accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0066cc] via-white to-[#0066cc]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div 
              className="inline-block mb-4 px-3 py-1 bg-[#0066cc]/10 border border-[#0066cc]/20 rounded-full"
              variants={itemVariants}
            >
              <span className="text-[#0066cc] text-sm font-medium tracking-wider uppercase">World Leader in AI Education</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 tracking-tight"
              variants={itemVariants}
            >
              Master <span className="text-[#0066cc]">Artificial Intelligence</span> with Expert-Led Courses
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Transform your career with our comprehensive AI curriculum designed for professionals. Learn from industry experts and gain hands-on experience with cutting-edge tools and techniques.
            </motion.p>
            
            {/* Feature highlights with animation */}
            <motion.div 
              className="mt-8 grid sm:grid-cols-2 gap-4"
              variants={itemVariants}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-300 ${index === activeFeature ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'border border-transparent'}`}
                  animate={{
                    scale: index === activeFeature ? 1.05 : 1,
                    y: index === activeFeature ? -5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`mr-4 p-2 rounded-full ${index === activeFeature ? 'bg-[#0066cc] text-white' : 'bg-blue-100 text-[#0066cc]'}`}>
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
              <Link href="/learnai">
                <Button size="lg" className="bg-[#0066cc] hover:bg-[#0055b3] text-white font-semibold py-6 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_5px_15px_rgba(0,102,204,0.35)] text-base">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/subscriptionspage">
                <Button variant="outline" size="lg" className="bg-transparent hover:bg-gray-50 text-gray-900 font-semibold py-6 px-8 rounded-lg border border-gray-300 transition-all duration-300 hover:scale-105 hover:border-[#0066cc]/40 text-base">
                  View Subscription Plans
                </Button>
              </Link>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-medium text-gray-600">{i + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900">Join 10,000+ learners</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm font-medium text-gray-900">4.9/5 rating (2.5k+ reviews)</p>
              </div>
            </motion.div>
          </div>
          
          {/* Right side - Interactive 3D visualization */}
          <motion.div 
            className="relative h-[500px] flex items-center justify-center"
            variants={itemVariants}
          >
            {/* Main visual element */}
            <motion.div 
              className="relative w-full max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Large display with AI visualization */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#0066cc]/10 to-blue-100/30 rounded-2xl shadow-[0_20px_70px_-15px_rgba(0,102,204,0.4)] overflow-hidden border border-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="max-w-[80%] text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/90 shadow-lg flex items-center justify-center border border-blue-100">
                      <Logo width={60} height={60} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">RXAI Learning Platform</h3>
                    <p className="text-sm text-gray-600">Interactive AI courses and tools</p>
                    
                    {/* Animated progress indicator */}
                    <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5">
                      <motion.div 
                        className="bg-[#0066cc] h-1.5 rounded-full" 
                        initial={{ width: "0%" }}
                        animate={{ width: "75%" }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                      />
                    </div>
                    
                    {/* Interactive code snippet */}
                    <div className="mt-6 bg-gray-900 rounded-lg p-4 text-left overflow-hidden">
                      <pre className="text-xs text-gray-300 font-mono">
                        <code>
                          <span className="text-blue-400">import</span> <span className="text-green-400">rxai</span><br />
                          <br />
                          <span className="text-purple-400">model</span> = rxai.load_model(<span className="text-yellow-400">"neural_network"</span>)<br />
                          <span className="text-purple-400">data</span> = rxai.dataset.get(<span className="text-yellow-400">"training_data"</span>)<br />
                          <br />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
                            className="inline-block w-3 h-5 bg-white/80 ml-1"
                          />
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
                
                {/* Floating UI elements */}
                <motion.div 
                  className="absolute -top-6 -right-6 w-24 h-24 bg-white/90 rounded-2xl shadow-lg p-3 transform rotate-6 border border-blue-100"
                  animate={{ y: [0, -10, 0], rotate: [6, 2, 6] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <div className="h-full flex flex-col">
                    <div className="text-xs font-medium text-gray-900 mb-1">AI Progress</div>
                    <div className="flex-1 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                        <motion.circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="#0066cc" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          strokeDasharray="283"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 50 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#0066cc">82%</text>
                      </svg>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-white/90 rounded-xl shadow-lg p-3 transform -rotate-3 border border-blue-100"
                  animate={{ y: [0, 10, 0], rotate: [-3, -6, -3] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaRobot className="w-4 h-4 text-[#0066cc]" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">AI Assistant</div>
                      <div className="text-xs text-gray-500">Ready to help</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-100/50 rounded-full blur-xl"></div>
              <div className="absolute -top-5 -left-5 w-16 h-16 bg-blue-200/40 rounded-full blur-lg"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scrolling indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div 
          className="w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center p-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div 
            className="w-1 h-2 bg-[#0066cc] rounded-full"
            animate={{ y: [0, 4, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}