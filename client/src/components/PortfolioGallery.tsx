import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaDesktop, FaCode, FaMobileAlt, FaChartLine } from 'react-icons/fa';
import { Link } from 'wouter';

// Portfolio project interface
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  industry: string;
  technologies: string[];
  url: string;
}

// Sample portfolio data
const portfolioData: Project[] = [
  {
    id: 1,
    title: "EcomPro Shopping Platform",
    description: "A fully responsive e-commerce solution with advanced product filtering and secure checkout flow.",
    image: "/images/portfolio/ecommerce-platform.jpg",
    industry: "E-commerce",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    url: "/case-studies/ecompro-shopping"
  },
  {
    id: 2,
    title: "MedConnect Patient Portal",
    description: "Secure healthcare platform allowing patients to schedule appointments and access records.",
    image: "/images/portfolio/healthcare-portal.jpg",
    industry: "Healthcare",
    technologies: ["React", "Express", "PostgreSQL", "AWS"],
    url: "/case-studies/medconnect-portal"
  },
  {
    id: 3,
    title: "FinTrack Investment Dashboard",
    description: "Real-time financial analytics platform with customizable widgets and reporting tools.",
    image: "/images/portfolio/fintech-dashboard.jpg",
    industry: "Finance",
    technologies: ["Vue.js", "Node.js", "GraphQL", "D3.js"],
    url: "/case-studies/fintrack-dashboard"
  },
  {
    id: 4,
    title: "EduLearn LMS Platform",
    description: "Comprehensive learning management system with interactive course materials and progress tracking.",
    image: "/images/portfolio/education-lms.jpg",
    industry: "Education",
    technologies: ["React", "Firebase", "Node.js", "MongoDB"],
    url: "/case-studies/edulearn-lms"
  },
  {
    id: 5,
    title: "TravelBuddy Trip Planner",
    description: "AI-powered travel planning app with itinerary generation and local recommendations.",
    image: "/images/portfolio/travel-planner.jpg",
    industry: "Travel",
    technologies: ["React Native", "Express", "MongoDB", "Google Maps API"],
    url: "/case-studies/travelbuddy-planner"
  },
  {
    id: 6,
    title: "RestaurantOS Management System",
    description: "Complete restaurant management solution with inventory, ordering, and reservation features.",
    image: "/images/portfolio/restaurant-pos.jpg",
    industry: "Hospitality",
    technologies: ["Vue.js", "Laravel", "MySQL", "Twilio"],
    url: "/case-studies/restaurant-os"
  }
];

// Industry and technology filter options
const industries = ["All", "E-commerce", "Healthcare", "Finance", "Education", "Travel", "Hospitality"];
const technologies = ["All", "React", "Vue.js", "Node.js", "Express", "MongoDB", "PostgreSQL", "Firebase", "AWS"];

export default function PortfolioGallery() {
  const [industryFilter, setIndustryFilter] = useState("All");
  const [techFilter, setTechFilter] = useState("All");
  
  // Filter projects based on selected filters
  const filteredProjects = portfolioData.filter(project => {
    const matchesIndustry = industryFilter === "All" || project.industry === industryFilter;
    const matchesTech = techFilter === "All" || project.technologies.includes(techFilter);
    return matchesIndustry && matchesTech;
  });
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 }
    })
  };

  return (
    <section id="portfolio" className="py-20 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          custom={0}
        >
          <div className="inline-block px-4 py-1 bg-blue-900/30 border border-blue-800/30 rounded-full mb-4">
            <span className="text-blue-400 text-sm font-medium tracking-wider uppercase">Our Portfolio</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Full-Stack Development Projects</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore our diverse range of successful web development projects across multiple industries and technologies.
          </p>
        </motion.div>
        
        {/* Filters */}
        <motion.div 
          className="mb-10 flex flex-col md:flex-row gap-4 justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          custom={1}
        >
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-gray-300 font-medium mr-2 my-auto">Industry:</span>
            {industries.map((industry, index) => (
              <button
                key={`industry-${index}`}
                onClick={() => setIndustryFilter(industry)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  industryFilter === industry 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-gray-300 font-medium mr-2 my-auto">Technology:</span>
            {technologies.map((tech, index) => (
              <button
                key={`tech-${index}`}
                onClick={() => setTechFilter(tech)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  techFilter === tech 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
                custom={index * 0.1 + 2}
              >
                <div className="h-48 bg-gray-700 overflow-hidden">
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    {/* Placeholder icon if image fails to load */}
                    <FaDesktop className="text-5xl text-blue-500 opacity-20" />
                    
                    {/* Overlay tech stack badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {project.technologies.slice(0, 2).map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-900/80 text-blue-400 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 2 && (
                        <span className="text-xs bg-gray-900/80 text-blue-400 px-2 py-1 rounded">
                          +{project.technologies.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                      {project.industry}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">{project.description}</p>
                  <Link href={project.url} className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
                    View case study <FaArrowRight className="ml-1 text-sm" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <FaCode className="text-4xl text-blue-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-300">No projects match the selected filters. Try changing your selection.</p>
            </div>
          )}
        </div>
        
        {/* View All Projects Button */}
        <motion.div
          className="text-center mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
          custom={8}
        >
          <Link href="/case-studies" className="inline-flex items-center bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            View all projects <FaArrowRight className="ml-2" />
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            Discover our complete portfolio of full-stack development solutions
          </p>
        </motion.div>
      </div>
    </section>
  );
}