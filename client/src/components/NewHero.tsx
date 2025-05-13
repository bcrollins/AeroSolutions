import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import SimpleCube from './SimpleCube';

const NewHero: React.FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.6, ease: 'easeOut' }
    })
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.6, duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section
      id="home"
      className="pt-32 pb-24 hero-section bg-gradient-to-br from-[#1E3A8A] via-[#60A5FA]/20 to-[#1E3A8A]/80 relative overflow-hidden"
      aria-label="ROLLINSX Introduction"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0zm10 20h10v10H10zM0 40h10v10H0zm30-20h10v10H30zm20-20h10v10H50z' fill='%233B82F6' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')",
          backgroundSize: '60px 60px',
          backgroundPosition: 'center'
        }}
        aria-hidden="true"
      />

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1E3A8A]/10 z-0"></div>

      {/* Cyan accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3B82F6] via-[#F3F4F6] to-[#3B82F6]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <motion.div
              className="inline-block mb-4 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <span className="text-[#3B82F6] text-sm font-medium tracking-wider uppercase font-inter">
                Premium Web Solutions
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-6xl font-bold font-poppins leading-tight text-white tracking-tight"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Web <span className="text-[#3B82F6]">Development</span> for Small Businesses
            </motion.h1>

            <motion.p
              className="mt-8 text-xl text-light-gray leading-relaxed font-lato"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Custom web solutions that transform your online presence—WebCraft, EcomPro, ContentHub, and more.
            </motion.p>

            <motion.p
              className="mt-5 text-lg text-gray-200 leading-relaxed font-lato"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <span className="font-semibold">ROLLINSX</span> delivers full-stack web development with our unique
              guarantee: no payment until you're 100% satisfied. Based in Miami and built by developers who understand
              your business challenges, our platforms integrate seamlessly with your existing systems.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap gap-5"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              <a
                href="#contact"
                className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-[#1E3A8A] font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_5px_15px_rgba(59,130,246,0.35)] font-inter"
                aria-label="Get started with a custom web development solution"
              >
                Get Started
              </a>
              <a
                href="#platforms"
                className="bg-transparent hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-lg border border-[#3B82F6]/30 transition-all duration-300 hover:scale-105 hover:border-[#3B82F6]/60 font-inter"
                aria-label="Explore our web development platforms"
              >
                Explore Platforms
              </a>
            </motion.div>
          </div>

          <motion.div
            className="hidden md:block"
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
          >
            {/* Rotating ROLLINSX Logo Cube */}
            <SimpleCube />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;