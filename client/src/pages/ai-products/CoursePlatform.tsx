import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const CoursePlatform: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Helmet>
        <title>RXAI - AI Course Platform</title>
        <meta name="description" content="Welcome to the RXAI AI Course Platform - Learn AI with interactive courses and earn certifications" />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center mb-8"
          >
            AI Course Platform
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-center mb-12 max-w-2xl"
          >
            Comprehensive AI learning resources designed to help you master artificial intelligence technologies
          </motion.p>
          
          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#2a2a2a] rounded-lg p-6 md:p-8 mb-8 text-center"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">Welcome to the AI Course Platform</h2>
              <p className="text-base md:text-lg text-gray-300 p-6">
                Our cutting-edge AI courses are designed by industry experts to provide you with the knowledge and skills needed to excel in the field of artificial intelligence.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Course Categories */}
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">Machine Learning</h3>
                <p className="text-gray-300">Master the fundamentals of machine learning algorithms and applications.</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">Deep Learning</h3>
                <p className="text-gray-300">Explore neural networks, computer vision, and advanced deep learning techniques.</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">Natural Language Processing</h3>
                <p className="text-gray-300">Learn to build applications that understand and generate human language.</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">Reinforcement Learning</h3>
                <p className="text-gray-300">Discover how AI can learn from interactions with dynamic environments.</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">Computer Vision</h3>
                <p className="text-gray-300">Build AI systems that can see and interpret visual information.</p>
              </div>
              
              <div className="bg-[#2a2a2a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer">
                <h3 className="text-xl font-bold mb-3 text-[#007bff]">AI Ethics</h3>
                <p className="text-gray-300">Understand the ethical implications and responsible use of AI technologies.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Ready to start your AI learning journey?</h2>
              <button className="bg-[#007bff] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
                Browse Course Catalog
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlatform;