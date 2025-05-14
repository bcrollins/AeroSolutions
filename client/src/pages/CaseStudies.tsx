import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { FaArrowRight, FaLaptopCode, FaShoppingCart, FaMobileAlt, FaDatabase, FaSearch, FaChartLine, FaCheckCircle, FaCode } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  image: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  technologies: string[];
  results: string[];
  testimonial?: {
    text: string;
    author: string;
    position: string;
  };
}

export default function CaseStudies() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample case studies data
  const caseStudies: CaseStudy[] = [
    {
      id: "ecompro-shopping",
      title: "EcomPro Shopping Platform",
      client: "StyleHaven Boutique",
      industry: "E-commerce",
      image: "/images/portfolio/ecommerce-platform.jpg",
      shortDescription: "A fully responsive e-commerce solution with advanced product filtering and secure checkout flow.",
      challenge: "StyleHaven Boutique was struggling with an outdated online store that had poor mobile responsiveness, slow load times, and an inefficient checkout process leading to cart abandonment. They needed a modern e-commerce platform that could showcase their extensive product catalog while providing a seamless shopping experience across all devices.",
      solution: "We developed a custom e-commerce platform using React for the frontend and Node.js for the backend. The solution included advanced product filtering, real-time inventory management, secure payment processing with Stripe, and a streamlined checkout flow to reduce abandonment. We also implemented a robust product recommendation engine and integrated with their existing inventory management system.",
      technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe API", "Redis", "AWS S3"],
      results: [
        "42% increase in mobile conversions within the first month",
        "28% reduction in cart abandonment rate",
        "3.5x improvement in website load speed",
        "68% increase in average order value through AI-powered product recommendations"
      ],
      testimonial: {
        text: "The new platform has completely transformed our online presence. Sales have increased substantially, and customers regularly comment on how easy it is to shop with us. The RXAI team delivered beyond our expectations and continues to provide excellent support.",
        author: "Sarah Johnson",
        position: "E-commerce Director, StyleHaven Boutique"
      }
    },
    {
      id: "medconnect-portal",
      title: "MedConnect Patient Portal",
      client: "Midwest Health Network",
      industry: "Healthcare",
      image: "/images/portfolio/healthcare-portal.jpg",
      shortDescription: "Secure healthcare platform allowing patients to schedule appointments and access records.",
      challenge: "Midwest Health Network, a group of 12 clinics, was using an inefficient paper-based system for appointment scheduling and patient records. They needed a HIPAA-compliant digital solution that would streamline administrative tasks, improve patient communication, and provide secure access to medical records.",
      solution: "We created a secure, HIPAA-compliant patient portal using React for the frontend and Express/PostgreSQL for the backend. The portal includes features such as online appointment scheduling, secure messaging with healthcare providers, access to medical records and test results, prescription refill requests, and secure payment processing for medical bills.",
      technologies: ["React", "Express", "PostgreSQL", "AWS", "OAuth 2.0", "PDF.js", "Twilio API"],
      results: [
        "Reduced administrative workload by 35% by automating appointment scheduling",
        "Decreased missed appointments by 47% through automated reminders",
        "95% patient satisfaction rating based on post-implementation survey",
        "Estimated annual cost savings of $180,000 from improved operational efficiency"
      ],
      testimonial: {
        text: "MedConnect has revolutionized our patient engagement and clinic operations. The secure portal gives our patients the convenience they expect while maintaining the privacy they deserve. The development team was exceptional at understanding our unique healthcare requirements.",
        author: "Dr. Michael Chen",
        position: "Medical Director, Midwest Health Network"
      }
    },
    {
      id: "fintrack-dashboard",
      title: "FinTrack Investment Dashboard",
      client: "Capital Strategies Group",
      industry: "Finance",
      image: "/images/portfolio/fintech-dashboard.jpg",
      shortDescription: "Real-time financial analytics platform with customizable widgets and reporting tools.",
      challenge: "Capital Strategies Group needed a comprehensive dashboard for their investment advisors and clients to visualize complex financial data, track portfolio performance, and generate custom reports. Their existing solutions were siloed, requiring manual data aggregation and offering limited visualization capabilities.",
      solution: "We developed a real-time financial analytics dashboard using Vue.js and GraphQL. The system integrates with multiple financial data providers through secure APIs, features customizable widgets for different types of financial analysis, includes interactive data visualization tools powered by D3.js, and provides automated reporting with exportable formats.",
      technologies: ["Vue.js", "Node.js", "GraphQL", "D3.js", "PostgreSQL", "WebSockets", "Docker"],
      results: [
        "Reduced report generation time from 3 hours to under 5 minutes",
        "Increased client retention by 18% through improved transparency",
        "Enabled advisors to handle 30% more clients with the same resources",
        "Decreased decision-making time for investment strategies by 40%"
      ],
      testimonial: {
        text: "FinTrack has given us a competitive edge in the industry. Our advisors can now provide clients with real-time insights and beautiful visualizations that make complex financial data understandable. This platform has become essential to our daily operations.",
        author: "Alexandra Rivera",
        position: "CTO, Capital Strategies Group"
      }
    },
    {
      id: "edulearn-lms",
      title: "EduLearn LMS Platform",
      client: "Global Education Institute",
      industry: "Education",
      image: "/images/portfolio/education-lms.jpg",
      shortDescription: "Comprehensive learning management system with interactive course materials and progress tracking.",
      challenge: "Global Education Institute was struggling to deliver their professional certification courses online. They needed a robust learning management system that could support diverse content types, track student progress, facilitate instructor-student communication, and integrate with their existing student information system.",
      solution: "We built a comprehensive LMS using React for the frontend and Firebase/Node.js for the backend. The platform includes features like multimedia content delivery, interactive assessments, real-time progress tracking, discussion forums, virtual classrooms via WebRTC, automated certificate generation, and analytics for instructors.",
      technologies: ["React", "Firebase", "Node.js", "MongoDB", "WebRTC", "Redis", "Canvas API"],
      results: [
        "Successfully transitioned 120+ courses to the online platform",
        "Increased student completion rate by 32%",
        "Expanded global student base by 45% in the first year",
        "Achieved 99.8% platform uptime even during peak usage periods"
      ],
      testimonial: {
        text: "EduLearn has transformed how we deliver education. The intuitive interface makes it easy for instructors to create engaging content and for students to access materials from anywhere. The detailed analytics have been invaluable for improving our courses based on real data.",
        author: "Professor David Wilson",
        position: "Academic Director, Global Education Institute"
      }
    },
    {
      id: "travelbuddy-planner",
      title: "TravelBuddy Trip Planner",
      client: "Explore World Tours",
      industry: "Travel",
      image: "/images/portfolio/travel-planner.jpg",
      shortDescription: "AI-powered travel planning app with itinerary generation and local recommendations.",
      challenge: "Explore World Tours wanted to modernize their travel planning services with a digital solution that could generate personalized itineraries, provide local insights, and keep travelers informed during their trips. They needed a mobile-first application that worked offline and integrated with multiple travel service providers.",
      solution: "We developed a React Native mobile app with a Node.js/Express backend. The app features AI-powered itinerary generation based on user preferences, interactive maps with offline support, real-time updates on flight status and local conditions, integration with hospitality partners via APIs, and social sharing capabilities for travelers.",
      technologies: ["React Native", "Express", "MongoDB", "Google Maps API", "TensorFlow", "Twilio", "Stripe"],
      results: [
        "Reduced average planning time from 3 days to 30 minutes",
        "Increased customer trip add-ons by 58% through targeted recommendations",
        "Achieved 125,000+ app downloads in the first six months",
        "4.8/5 average rating across both iOS and Android app stores"
      ],
      testimonial: {
        text: "TravelBuddy has completely changed our business model for the better. We can now offer truly personalized travel experiences at scale. The offline functionality and real-time updates have received particularly positive feedback from our customers traveling to remote destinations.",
        author: "Marco Lombardi",
        position: "CEO, Explore World Tours"
      }
    },
    {
      id: "restaurant-os",
      title: "RestaurantOS Management System",
      client: "Urban Dining Group",
      industry: "Hospitality",
      image: "/images/portfolio/restaurant-pos.jpg",
      shortDescription: "Complete restaurant management solution with inventory, ordering, and reservation features.",
      challenge: "Urban Dining Group, managing 8 restaurants, needed to replace their fragmented systems for point-of-sale, inventory management, reservations, and staff scheduling. They required an integrated solution that would provide real-time insights across all locations and streamline operations.",
      solution: "We created a comprehensive restaurant management system using Vue.js and Laravel. The platform includes modules for POS with tableside ordering via tablets, real-time inventory tracking with automatic purchasing, an online reservation system with customer profiles, kitchen display systems, staff scheduling and payroll integration, and detailed business analytics.",
      technologies: ["Vue.js", "Laravel", "MySQL", "Twilio", "Socket.io", "Stripe", "AWS"],
      results: [
        "Reduced food waste by 34% through improved inventory management",
        "Decreased table turnover time by 24 minutes on average",
        "Increased online reservations by 76%",
        "Improved staff scheduling efficiency, saving approximately $8,000 per month across all locations"
      ],
      testimonial: {
        text: "RestaurantOS is the backbone of our operation now. Having all these functions in one integrated system has eliminated so many headaches and inefficiencies. The real-time data across all our locations gives us insights we never had before, helping us make better business decisions every day.",
        author: "James Rodriguez",
        position: "Operations Director, Urban Dining Group"
      }
    }
  ];
  
  // Get unique industries for filtering
  const industries = Array.from(new Set(caseStudies.map(study => study.industry)));
  
  // Filter case studies based on selected industry and search query
  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesIndustry = !selectedIndustry || study.industry === selectedIndustry;
    const matchesSearch = searchQuery.trim() === '' || 
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesIndustry && matchesSearch;
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
    <>
      <SEOHead
        title="Case Studies | Full-Stack Development Success Stories | RXAI"
        description="Explore our portfolio of successful full-stack development projects across various industries. See how we've helped clients solve complex challenges with innovative web solutions."
        keywords="case studies, development portfolio, web development success stories, full-stack development projects, software development case studies"
      />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={0}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our Full-Stack Development Success Stories
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Explore how we've helped businesses solve complex challenges with innovative web solutions. Each case study demonstrates our approach, technologies used, and measurable results achieved.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Filters Section */}
        <section className="py-12 bg-black border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-3 flex-wrap justify-center">
                <span className="text-white font-medium">Filter by Industry:</span>
                <button
                  onClick={() => setSelectedIndustry(null)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedIndustry === null
                      ? 'bg-blue-700 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {industries.map((industry, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndustry(industry)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedIndustry === industry
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search case studies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Case Studies List */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            {filteredCaseStudies.length > 0 ? (
              <div className="space-y-16">
                {filteredCaseStudies.map((study, index) => (
                  <motion.div
                    key={study.id}
                    className="grid md:grid-cols-2 gap-8 items-center border-b border-gray-800 pb-16 last:border-b-0 last:pb-0"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={fadeIn}
                    custom={index * 0.2}
                  >
                    <div className={`order-2 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                      <div className="flex items-center mb-4">
                        <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          {study.industry}
                        </span>
                        <span className="ml-3 text-gray-400 text-sm border-l border-gray-700 pl-3">
                          Client: {study.client}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {study.title}
                      </h2>
                      
                      <p className="text-gray-300 mb-6">
                        {study.shortDescription}
                      </p>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">The Challenge</h3>
                        <p className="text-gray-300">{study.challenge.substring(0, 150)}...</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Key Results</h3>
                        <ul className="space-y-2">
                          {study.results.slice(0, 2).map((result, i) => (
                            <li key={i} className="flex items-start">
                              <FaCheckCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                              <span className="text-gray-300">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {study.technologies.map((tech, i) => (
                          <span key={i} className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <Link href={`/case-studies/${study.id}`}>
                        <a className="inline-flex items-center bg-blue-700 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                          View full case study <FaArrowRight className="ml-2" />
                        </a>
                      </Link>
                    </div>
                    
                    <div className={`order-1 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                      <div className="bg-gray-800 rounded-xl overflow-hidden h-64 relative">
                        {/* This would typically display the actual image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {study.industry === 'E-commerce' && <FaShoppingCart className="text-6xl text-blue-500/20" />}
                          {study.industry === 'Healthcare' && <FaDatabase className="text-6xl text-blue-500/20" />}
                          {study.industry === 'Finance' && <FaChartLine className="text-6xl text-blue-500/20" />}
                          {study.industry === 'Education' && <FaLaptopCode className="text-6xl text-blue-500/20" />}
                          {study.industry === 'Travel' && <FaMobileAlt className="text-6xl text-blue-500/20" />}
                          {study.industry === 'Hospitality' && <FaCode className="text-6xl text-blue-500/20" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FaSearch className="text-5xl text-blue-500/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No case studies found</h3>
                <p className="text-gray-300">
                  Try adjusting your search or filter criteria to see more results.
                </p>
                <button
                  onClick={() => {
                    setSelectedIndustry(null);
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-black border-t border-gray-800">
          <div className="container mx-auto px-4">
            <motion.div
              className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 shadow-lg text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              custom={0}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Build Your Success Story?
              </h2>
              <p className="text-blue-100 mb-8 max-w-3xl mx-auto">
                Let's discuss how our full-stack development expertise can help solve your business challenges and create measurable results.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/service-packages">
                  <a className="px-6 py-3 bg-white text-blue-900 hover:bg-gray-100 font-bold rounded-lg transition-colors">
                    View Service Packages
                  </a>
                </Link>
                <Link href="/contact">
                  <a className="px-6 py-3 bg-blue-700 bg-opacity-30 hover:bg-opacity-40 text-white font-bold rounded-lg transition-colors border border-blue-600">
                    Contact Us
                  </a>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}