import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Data Scientist",
    company: "TechInnovate",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    content: "The AI fundamentals course completely transformed my approach to data science. The concepts were explained clearly and the hands-on projects helped solidify my understanding. I've already applied several techniques to my work.",
    rating: 5
  },
  {
    id: 2,
    name: "Mark Reynolds",
    role: "Product Manager",
    company: "FutureTech",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    content: "As a non-technical manager, I needed to understand AI to better lead my team. This course broke down complex concepts into digestible modules. Now I can have meaningful discussions with my engineers about AI implementation.",
    rating: 5
  },
  {
    id: 3,
    name: "Elena Cortez",
    role: "Software Engineer",
    company: "InnovateSoft",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "The machine learning specialization was exactly what I needed to advance my career. The instructors are industry experts who provide real-world context. The community support is also exceptional.",
    rating: 5
  },
  {
    id: 4,
    name: "David Zhang",
    role: "AI Researcher",
    company: "QuantumAI",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    content: "Even as someone with prior experience in AI, I found the advanced courses incredibly valuable. The cutting-edge content and challenging projects have expanded my knowledge and techniques significantly.",
    rating: 4
  },
  {
    id: 5,
    name: "Natalie Brooks",
    role: "Marketing Director",
    company: "GrowthMatrix",
    image: "https://randomuser.me/api/portraits/women/17.jpg",
    content: "The AI for Marketing course helped me implement data-driven strategies that increased our conversion rates by 32%. The practical approach and tools provided are invaluable for modern marketers.",
    rating: 5
  }
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Handle next/previous transitions
  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Set up autoplay
  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        handleNext();
      }, 6000);
    }
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, current]);

  // Pause autoplay when user interacts
  const handleUserInteraction = () => {
    setAutoplay(false);
    
    // Resume autoplay after a period of inactivity
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    
    const timeout = setTimeout(() => {
      setAutoplay(true);
    }, 10000);
    
    return () => clearTimeout(timeout);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    })
  };

  return (
    <div 
      className="relative overflow-hidden px-4 py-12 bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-sm"
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
      <div className="relative max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          What Our <span className="text-[#0066cc]">Students</span> Say
        </h2>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -mt-4 -ml-4 text-[#0066cc]/10">
          <FaQuoteLeft className="w-20 h-20" />
        </div>
        
        <div className="absolute -bottom-8 -right-8 text-[#0066cc]/10 transform rotate-180">
          <FaQuoteLeft className="w-20 h-20" />
        </div>
        
        {/* Testimonial carousel */}
        <div className="relative h-[400px] md:h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-white rounded-xl shadow-md">
                <div className="w-24 h-24 flex-shrink-0">
                  <img 
                    src={testimonials[current].image} 
                    alt={testimonials[current].name}
                    className="w-full h-full object-cover rounded-full border-2 border-[#0066cc]/20 shadow-md"
                    loading="lazy"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonials[current].rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 italic mb-4">
                    "{testimonials[current].content}"
                  </blockquote>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{testimonials[current].name}</p>
                    <p className="text-sm text-gray-600">{testimonials[current].role}, {testimonials[current].company}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Navigation controls */}
        <div className="flex justify-center mt-8 gap-2">
          {/* Dots for direct navigation */}
          <div className="flex space-x-2 mx-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                  handleUserInteraction();
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? 'bg-[#0066cc] scale-110' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Arrow controls */}
        <button
          className="absolute top-1/2 left-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors z-10"
          onClick={() => {
            handlePrevious();
            handleUserInteraction();
          }}
          aria-label="Previous testimonial"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>
        
        <button
          className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors z-10"
          onClick={() => {
            handleNext();
            handleUserInteraction();
          }}
          aria-label="Next testimonial"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}