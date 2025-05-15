import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Link } from 'wouter';
import { 
  BarChart4, Brain, Zap, Award, Users, LucideIcon, CheckCircle, Play, 
  ChevronRight, Sparkles, BookOpen, Bot, Rocket, ArrowRight
} from 'lucide-react';

// Course feature card component
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, accentColor, delay }: FeatureCardProps) => (
  <motion.div 
    className="bg-gradient-to-br from-gray-900/80 to-gray-800/30 rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/40 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <div className={`mb-4 p-3 rounded-lg w-12 h-12 flex items-center justify-center ${accentColor}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed flex-grow">{description}</p>
  </motion.div>
);

// Course module card component
interface ModuleCardProps {
  number: number;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  featured?: boolean;
  delay: number;
}

const ModuleCard = ({ number, title, description, lessons, duration, featured = false, delay }: ModuleCardProps) => (
  <motion.div 
    className={`relative rounded-xl overflow-hidden ${featured ? 'border-[3px] border-blue-500/50' : 'border border-gray-700/40'}`}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: delay * 0.15 }}
  >
    {featured && (
      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium z-10">
        Most Popular
      </div>
    )}
    <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold">
          {number}
        </div>
        <div className="flex space-x-2 text-sm">
          <div className="px-2 py-1 rounded bg-gray-800/80 text-gray-300 flex items-center">
            <BookOpen className="mr-1 h-3 w-3" /> {lessons} lessons
          </div>
          <div className="px-2 py-1 rounded bg-gray-800/80 text-gray-300 flex items-center">
            <Clock className="mr-1 h-3 w-3" /> {duration}
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex justify-end">
        <button className="text-blue-400 text-sm font-medium flex items-center hover:text-blue-300 transition-colors">
          Preview Module <ChevronRight className="ml-1 w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

// Testimonial Card component
interface TestimonialProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
  rating: number;
  delay: number;
}

const TestimonialCard = ({ name, role, company, quote, image, rating, delay }: TestimonialProps) => (
  <motion.div 
    className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl p-6 border border-gray-700/30 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.2 }}
  >
    <div className="flex items-center mb-4">
      <div className="w-14 h-14 rounded-full overflow-hidden mr-4 border-2 border-blue-500/30">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-gray-400">{role}, {company}</p>
        <div className="flex mt-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
            />
          ))}
        </div>
      </div>
    </div>
    <p className="text-gray-300 text-sm italic leading-relaxed">"{quote}"</p>
  </motion.div>
);

// The Clock component imported for ModuleCard
function Clock(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// The Star component imported for TestimonialCard
function Star(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// Main AI Course Section Component
export default function AICourseSection() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [activeTab, setActiveTab] = useState('beginners');
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Course features data
  const features = [
    {
      icon: Brain,
      title: "Expert-Crafted Curriculum",
      description: "Curriculum designed by AI industry leaders and researchers with cutting-edge methodologies and practices.",
      accentColor: "bg-gradient-to-r from-blue-600 to-blue-400"
    },
    {
      icon: Zap,
      title: "Hands-On AI Projects",
      description: "Build real-world AI applications through guided projects that strengthen your portfolio and practical skills.",
      accentColor: "bg-gradient-to-r from-purple-600 to-purple-400"
    },
    {
      icon: BarChart4,
      title: "Personalized Learning",
      description: "AI-powered learning paths adapt to your progress, focusing on areas where you need the most development.",
      accentColor: "bg-gradient-to-r from-sky-600 to-sky-400"
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Join our thriving community of AI learners and professionals for networking and collaborative learning.",
      accentColor: "bg-gradient-to-r from-emerald-600 to-emerald-400"
    },
    {
      icon: Rocket,
      title: "Career Acceleration",
      description: "Gain skills that are in high demand across industries with tailored career resources and mentorship.",
      accentColor: "bg-gradient-to-r from-amber-600 to-amber-400"
    },
    {
      icon: Award,
      title: "Recognized Certification",
      description: "Earn industry-recognized certificates upon completion to showcase your AI expertise to employers.",
      accentColor: "bg-gradient-to-r from-rose-600 to-rose-400"
    }
  ];

  // Course modules data
  const modules = {
    beginners: [
      {
        number: 1,
        title: "AI Fundamentals",
        description: "Master the core concepts of artificial intelligence and machine learning principles.",
        lessons: 12,
        duration: "14 hours",
        featured: true
      },
      {
        number: 2,
        title: "Python for AI Development",
        description: "Learn essential Python programming skills focused on AI application development.",
        lessons: 10,
        duration: "12 hours"
      },
      {
        number: 3,
        title: "Introduction to Neural Networks",
        description: "Understand the building blocks of neural networks and their applications.",
        lessons: 8,
        duration: "10 hours"
      }
    ],
    intermediate: [
      {
        number: 1,
        title: "Deep Learning Foundations",
        description: "Dive deeper into neural networks, backpropagation, and optimization techniques.",
        lessons: 14,
        duration: "16 hours"
      },
      {
        number: 2,
        title: "Computer Vision with AI",
        description: "Implement image recognition, object detection, and visual data analysis.",
        lessons: 12,
        duration: "15 hours",
        featured: true
      },
      {
        number: 3,
        title: "Natural Language Processing",
        description: "Build applications that understand, interpret, and generate human language.",
        lessons: 10,
        duration: "14 hours"
      }
    ],
    advanced: [
      {
        number: 1,
        title: "Generative AI & Transformers",
        description: "Master the cutting-edge architectures behind today's most powerful AI models.",
        lessons: 15,
        duration: "20 hours",
        featured: true
      },
      {
        number: 2,
        title: "Reinforcement Learning",
        description: "Develop AI systems that make sequential decisions and optimize for long-term rewards.",
        lessons: 12,
        duration: "18 hours"
      },
      {
        number: 3,
        title: "AI Ethics & Responsible Deployment",
        description: "Address the ethical considerations and responsible implementation of AI systems.",
        lessons: 8,
        duration: "10 hours"
      }
    ]
  };

  // Testimonials data
  const testimonials = [
    {
      name: "Alex Morgan",
      role: "Data Scientist",
      company: "TechInnova",
      quote: "The RXAI course transformed my career. The curriculum is incredibly well-structured and the hands-on projects gave me skills I use daily in my job.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      name: "Jamal Wilson",
      role: "Software Engineer",
      company: "DataFlex",
      quote: "As someone transitioning into AI, this course provided the perfect balance of theory and practical application. The community support is outstanding.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "AI Product Manager",
      company: "InnovateAI",
      quote: "This is not just another online course. The curriculum depth, teaching quality, and practical focus put it leagues ahead of anything else available.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    }
  ];

  // Stats data
  const stats = [
    { label: "Students Enrolled", value: "50,000+" },
    { label: "Success Rate", value: "94%" },
    { label: "Job Placement", value: "89%" },
    { label: "Instructor Rating", value: "4.9/5" }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 z-0">
          <svg viewBox="0 0 1200 1000" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0,800L48,768C96,736,192,672,288,661.3C384,651,480,693,576,713.3C672,733,768,731,864,697.3C960,664,1056,600,1152,586.7C1248,573,1344,611,1392,629.3L1440,648L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              fill="url(#tech-pattern)"
              fillOpacity="0.1"
            />
            <defs>
              <pattern id="tech-pattern" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="scale(0.5) rotate(0)">
                <rect x="0" y="0" width="100%" height="100%" fill="none" />
                <path d="M10,10L90,10L50,90Z" stroke="#3B82F6" strokeWidth="1" fill="none" />
                <circle cx="50" cy="50" r="20" stroke="#3B82F6" strokeWidth="1" fill="none" />
                <path d="M30,30L70,70M30,70L70,30" stroke="#3B82F6" strokeWidth="1" />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Transform Your Future with AI</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Master <span className="text-blue-400">Artificial Intelligence</span> Through Expert-Led Courses
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Our comprehensive AI curriculum takes you from beginner to advanced, with hands-on projects, personalized learning paths, and industry-recognized certifications.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              className="text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-blue-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Course Features */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <motion.h3 
            className="text-2xl font-bold text-center text-white mb-12"
            variants={itemVariants}
          >
            What Makes Our AI Course Exceptional
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                accentColor={feature.accentColor}
                delay={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Course structure tabs */}
        <div className="mb-20">
          <motion.h3 
            className="text-2xl font-bold text-center text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Structured Learning Path
          </motion.h3>

          <motion.div 
            className="flex flex-wrap justify-center mb-10 space-x-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <button 
              onClick={() => setActiveTab('beginners')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'beginners' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
              }`}
            >
              Beginners
            </button>
            <button 
              onClick={() => setActiveTab('intermediate')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'intermediate' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
              }`}
            >
              Intermediate
            </button>
            <button 
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'advanced' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
              }`}
            >
              Advanced
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules[activeTab as keyof typeof modules].map((module, index) => (
              <ModuleCard 
                key={`${activeTab}-${index}`}
                number={module.number}
                title={module.title}
                description={module.description}
                lessons={module.lessons}
                duration={module.duration}
                featured={module.featured}
                delay={index}
              />
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={sectionVariants}
        >
          <motion.h3 
            className="text-2xl font-bold text-center text-white mb-12"
            variants={itemVariants}
          >
            Success Stories from Our Students
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard 
                key={testimonial.name}
                name={testimonial.name}
                role={testimonial.role}
                company={testimonial.company}
                quote={testimonial.quote}
                image={testimonial.image}
                rating={testimonial.rating}
                delay={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Video Preview Section */}
        <motion.div 
          className="mb-16 bg-gradient-to-r from-blue-900/20 to-blue-600/20 p-6 sm:p-10 rounded-2xl border border-blue-500/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">See Our Course in Action</h3>
              <p className="text-gray-300 mb-6">
                Get a taste of our teaching style and course quality with this preview of our popular Neural Networks module.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Expert instructor guidance",
                  "Clear visual explanations",
                  "Step-by-step implementation",
                  "Real-world applications"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="text-blue-400 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/learnai" 
                className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                View Full Curriculum <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl group cursor-pointer border border-white/10">
              {/* Video Thumbnail Image */}
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="AI Course Preview" 
                className="w-full h-full object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-all">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-all group-hover:scale-110">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-white mb-6">Ready to Master AI?</h3>
          <p className="text-gray-300 text-lg mb-8">
            Begin your journey with a 7-day free trial and experience our comprehensive AI curriculum firsthand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/learnai"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/subscriptions"
              className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white/50 font-bold rounded-lg transition-all hover:scale-105"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}