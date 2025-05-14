import { useState } from "react";
import { FaSyncAlt, FaServer, FaUserTie, FaCode, FaArrowLeft, FaTimes, FaLink, FaFire, FaRocket } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PlatformPreview from "./PlatformPreview";
import WebConnectPlatformView from "./WebConnectPlatformView";
import RXAIBot from "./RXAIBot";
import { useLocation } from "wouter";
import wolfOfWallStreetImage from "../assets/wolf-of-wall-street.jpg";
import familyImage1 from "../assets/family/D22397D6-2EF2-45C5-A107-D6BD5E7210F4.jpeg";
import familyImage2 from "../assets/family/IMG_0165.jpeg";
import nicoleImage from "../assets/family/a22i5967.jpeg";
import bernieImage from "../assets/family/IMG_1431.jpeg";

interface ClientLandingPageProps {
  accessCode: string;
}

interface ClientPlatform {
  id: string;
  name: string;
  shortDescription: string;
  icon: JSX.Element;
  description: string;
  features: string[];
  techStack: string[];
  integrations?: string[];
  useCases: string[] | { title: string; description: string }[];
  screenshots: { image: string; caption: string }[];
  testimonial?: { quote: string; author: string; company: string };
  apiEndpoints?: { method: string; endpoint: string; description: string }[];
}

export default function ClientLandingPage({ accessCode }: ClientLandingPageProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<ClientPlatform | null>(null);
  const [showInvestorPopup, setShowInvestorPopup] = useState(false);
  const [showWebConnect, setShowWebConnect] = useState(false);
  const [, setLocation] = useLocation();
  const [openRXAIBot, setOpenRXAIBot] = useState(false);
  const [rollinsBotOption, setRollinsBotOption] = useState<string | null>(null);
  
  // Check if the code matches any of our special access codes
  const isSpecialCode = accessCode.toLowerCase() === 'demo' || accessCode.toLowerCase() === 'special-access';

  const platforms: ClientPlatform[] = [
    {
      id: "weblink",
      name: "WebLink",
      shortDescription: "Ultimate connectivity solution for enterprise systems",
      icon: <FaLink className="text-3xl" />,
      description: "WebLink is our flagship enterprise platform that revolutionizes how business systems communicate. It provides seamless integration between disparate technologies, creating a unified digital ecosystem that enhances operational efficiency, data accuracy, and decision-making capabilities across your entire organization.",
      features: [
        "Cross-platform integration with all major enterprise software systems",
        "Real-time data streaming with millisecond latency",
        "Military-grade encryption for secure data transmission",
        "AI-powered predictive maintenance alerts",
        "Automatic compliance documentation for regulatory requirements",
        "Unified dashboard for cross-system monitoring",
        "Custom API development for legacy system integration",
        "Digital twin modeling for system optimization"
      ],
      techStack: [
        "Frontend: Next.js with TypeScript",
        "Backend: Go microservices architecture",
        "Database: Multi-model database with CockroachDB",
        "Event Bus: Apache Pulsar",
        "ML Infrastructure: TensorFlow with custom models",
        "Edge Computing: Custom FPGA implementation",
        "Security: Zero-trust architecture with HSM integration",
        "Infrastructure: Multi-cloud with Kubernetes Federation"
      ],
      screenshots: [
        { 
          image: "https://images.unsplash.com/photo-1517586979036-b7d1e86b3345?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "WebLink Command Center showing real-time system integration status" 
        },
        { 
          image: "https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "WebLink's global data visualization dashboard" 
        },
        { 
          image: "https://images.unsplash.com/photo-1526659666037-6119ad61ee05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Secure endpoint management console with threat detection" 
        }
      ],
      useCases: [
        "Global enterprises connecting reservation, maintenance, and staff management systems",
        "Business authorities integrating resource management with corporate systems",
        "Software manufacturers linking production, maintenance, and customer systems",
        "Corporate IT units securing communication between tactical and strategic systems",
        "Industry regulators automating compliance monitoring across business participants"
      ],
      apiEndpoints: [
        {
          method: "GET",
          endpoint: "/api/v1/systems/status",
          description: "Retrieve real-time status of all connected systems"
        },
        {
          method: "POST",
          endpoint: "/api/v1/connections/establish",
          description: "Establish new connection between specified systems"
        },
        {
          method: "GET",
          endpoint: "/api/v1/analytics/performance",
          description: "Retrieve performance metrics for system integrations"
        },
        {
          method: "POST",
          endpoint: "/api/v1/compliance/verify",
          description: "Verify and document regulatory compliance status"
        }
      ]
    },
    {
      id: "websync",
      name: "WebSync",
      shortDescription: "Comprehensive data synchronization platform",
      icon: <FaSyncAlt className="text-3xl" />,
      description: "WebSync is an advanced data synchronization platform designed to streamline operations across multiple systems. It integrates business data, maintenance records, staff scheduling, and other critical information into a unified ecosystem, ensuring real-time updates and data consistency across all departments.",
      features: [
        "Real-time data synchronization across all connected systems",
        "Automated conflict resolution for simultaneous updates",
        "Role-based access control with detailed permission settings",
        "Comprehensive audit trail and change tracking",
        "Integration with major business software systems",
        "Custom workflow automation tools",
        "Advanced reporting and analytics dashboard",
        "Mobile access with offline capabilities"
      ],
      techStack: [
        "Frontend: React with TypeScript",
        "Backend: Node.js with NestJS",
        "Database: PostgreSQL with TimescaleDB extension",
        "Caching: Redis",
        "Messaging: Apache Kafka",
        "APIs: GraphQL and REST",
        "Authentication: OAuth 2.0 with JWT",
        "Containerization: Docker with Kubernetes"
      ],
      screenshots: [
        { 
          image: "https://images.unsplash.com/photo-1551373884-8a0750f6c71f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "WebSync Dashboard showing real-time synchronization status" 
        },
        { 
          image: "https://images.unsplash.com/photo-1577400808258-62d255afacea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80", 
          caption: "Integration configuration panel with multiple enterprise systems" 
        },
        { 
          image: "https://images.unsplash.com/photo-1605292356963-b8a9595a1c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Conflict resolution interface with data comparison view" 
        }
      ],
      useCases: [
        "Enterprises synchronizing business data across scheduling, maintenance, and staff management systems",
        "Facilities integrating inventory management with maintenance tracking",
        "Training centers synchronizing student records with equipment usage",
        "Service companies managing resource data across multiple operators",
        "Operations departments coordinating services with business information"
      ],
      apiEndpoints: [
        {
          method: "GET",
          endpoint: "/api/v1/sync/status",
          description: "Retrieve the current synchronization status for all systems"
        },
        {
          method: "POST",
          endpoint: "/api/v1/sync/manual",
          description: "Trigger a manual synchronization between specified systems"
        },
        {
          method: "GET",
          endpoint: "/api/v1/conflicts",
          description: "Retrieve a list of current data conflicts requiring resolution"
        },
        {
          method: "PUT",
          endpoint: "/api/v1/conflicts/:id/resolve",
          description: "Resolve a specific conflict with provided resolution data"
        }
      ]
    },
    {
      id: "webops",
      name: "WebOps",
      shortDescription: "End-to-end operations management platform",
      icon: <FaServer className="text-3xl" />,
      description: "WebOps is a comprehensive platform designed to help businesses manage their operations efficiently. It offers powerful tools for resource scheduling, staff management, regulatory compliance, and operational analytics. The platform streamlines complex operational processes, making it a critical solution for professionals seeking to optimize their operations and reduce costs.",
      features: [
        "Intelligent resource scheduling with conflict detection",
        "Staff management with qualification tracking and workload monitoring",
        "Regulatory compliance monitoring and automatic updates",
        "Maintenance tracking and integration with WebSync",
        "Resource optimization algorithms and utilization tracking",
        "Disruption management with automated recovery scenarios",
        "Performance analytics with customizable KPIs",
        "Real-time operational control dashboards"
      ],
      techStack: [
        "Frontend: Vue.js with Typescript",
        "Backend: Java with Spring Boot",
        "Database: Oracle with geographic extensions",
        "Caching: Hazelcast",
        "Machine Learning: TensorFlow for optimization algorithms",
        "APIs: REST with OpenAPI specification",
        "Authentication: SAML 2.0",
        "Containerization: Docker with ECS"
      ],
      screenshots: [
        { 
          image: "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80", 
          caption: "WebOps control center with real-time resource tracking" 
        },
        { 
          image: "https://images.unsplash.com/photo-1540339832862-474599807836?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Staff scheduling interface with qualification overlays" 
        },
        { 
          image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80", 
          caption: "Resource optimization panel showing efficiency metrics" 
        }
      ],
      useCases: [
        "Regional businesses optimizing staff utilization across multiple locations",
        "Service providers managing on-demand resource scheduling",
        "Operations departments ensuring regulatory compliance across jurisdictions",
        "E-commerce companies maximizing fulfillment efficiency with tight timelines",
        "Technology providers managing complex project-based operations"
      ],
      apiEndpoints: [
        {
          method: "GET",
          endpoint: "/api/v1/resources",
          description: "Retrieve scheduled resources with filtering options"
        },
        {
          method: "POST",
          endpoint: "/api/v1/resources/optimize",
          description: "Run optimization algorithms on resource schedules with specified parameters"
        },
        {
          method: "GET",
          endpoint: "/api/v1/staff/availability",
          description: "Check staff availability with qualification filters"
        },
        {
          method: "POST",
          endpoint: "/api/v1/disruptions/recover",
          description: "Generate recovery plans for operational disruptions"
        }
      ]
    },
    {
      id: "execsync",
      name: "ExecSync",
      shortDescription: "Executive productivity and communication platform",
      icon: <FaUserTie className="text-3xl" />,
      description: "ExecSync is a powerful platform designed specifically for executives to manage their schedules, tasks, and communications efficiently. It integrates seamlessly with calendar systems, email clients, and collaboration tools to provide a unified productivity environment. The platform offers intelligent prioritization, automated follow-ups, and comprehensive analytics to help executives maximize their productivity and effectiveness.",
      features: [
        "AI-powered email prioritization and summarization",
        "Intelligent scheduling with conflict resolution",
        "Automated meeting preparation with briefing generation",
        "Task delegation with automated follow-up",
        "Voice-to-text transcription for meetings and notes",
        "Secure document sharing with granular access control",
        "Executive dashboard with key metrics and priorities",
        "Mobile-first design with offline capabilities"
      ],
      techStack: [
        "Frontend: React Native (mobile) and React (web)",
        "Backend: Python with Django",
        "Database: MongoDB with document versioning",
        "AI Services: Custom NLP models using PyTorch",
        "APIs: GraphQL",
        "Authentication: Multi-factor with biometric options",
        "Storage: AWS S3 with client-side encryption",
        "Search: Elasticsearch"
      ],
      screenshots: [
        { 
          image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "ExecSync dashboard showing prioritized tasks and communications" 
        },
        { 
          image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Meeting scheduler with AI-suggested time slots" 
        },
        { 
          image: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Secure document sharing interface with tracking capabilities" 
        }
      ],
      useCases: [
        "Technology industry executives managing global teams and operations",
        "Corporate department directors coordinating executive projects",
        "Enterprise C-suite executives balancing operational and strategic priorities",
        "Business authority leaders managing stakeholder communications",
        "Technology consultancy principals managing multiple client engagements"
      ],
      apiEndpoints: [
        {
          method: "GET",
          endpoint: "/api/v1/priorities",
          description: "Retrieve prioritized list of tasks, emails, and meetings"
        },
        {
          method: "POST",
          endpoint: "/api/v1/meetings/schedule",
          description: "Schedule a meeting with automated time slot suggestions"
        },
        {
          method: "POST",
          endpoint: "/api/v1/emails/summarize",
          description: "Generate summaries of email threads or conversations"
        },
        {
          method: "GET",
          endpoint: "/api/v1/analytics/productivity",
          description: "Retrieve productivity analytics and insights"
        }
      ]
    },
    {
      id: "webtrainer",
      name: "WebTrainer",
      shortDescription: "Advanced simulation and training platform",
      icon: <FaCode className="text-3xl" />,
      description: "WebTrainer is a sophisticated simulation platform designed for professional training and skill development. It provides high-fidelity virtual environments, realistic scenario simulation, and comprehensive performance analysis tools. The platform supports both desktop and immersive VR configurations, making it versatile for various training needs from individual professionals to large training centers and enterprises.",
      features: [
        "High-fidelity simulation models with accurate physics",
        "Real-world data integration and procedural learning",
        "Dynamic scenario engine with comprehensive variables",
        "Customizable training scenarios for skill development",
        "Performance tracking and detailed analytics",
        "Integration with industry-standard tools and protocols",
        "Multi-user interaction capabilities",
        "VR support for immersive training experiences"
      ],
      techStack: [
        "Frontend: C++ with custom graphics engine",
        "Physics: Custom simulation engine",
        "Backend: Rust for high-performance computing",
        "Database: Time-series database for telemetry data",
        "Data: Integration with real-time data APIs",
        "Navigation: Custom mapping with global location support",
        "Hardware: Interface support for various input devices",
        "Audio: Spatial audio engine with accurate environmental modeling"
      ],
      screenshots: [
        { 
          image: "https://images.unsplash.com/photo-1521409818504-e246d5956192?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "WebTrainer simulation view with realistic environment" 
        },
        { 
          image: "https://images.unsplash.com/photo-1530745352768-266b00975f8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Performance analysis dashboard showing detailed metrics" 
        },
        { 
          image: "https://images.unsplash.com/photo-1524741111534-9133a872029a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", 
          caption: "Training scenario builder with workflow planning" 
        }
      ],
      useCases: [
        "Training centers conducting standardized professional programs",
        "Enterprises maintaining staff certifications and qualifications",
        "Individual professionals practicing procedures and emergency scenarios",
        "Educational institutions teaching technical skills and procedures",
        "Corporate training departments conducting specialized training"
      ],
      apiEndpoints: [
        {
          method: "GET",
          endpoint: "/api/v1/environments",
          description: "Retrieve available simulation environments with specifications"
        },
        {
          method: "GET",
          endpoint: "/api/v1/conditions",
          description: "Get current environmental conditions for specific scenarios"
        },
        {
          method: "POST",
          endpoint: "/api/v1/scenarios/create",
          description: "Create custom training scenarios"
        },
        {
          method: "GET",
          endpoint: "/api/v1/telemetry/:sessionId",
          description: "Retrieve telemetry data for specific training sessions"
        }
      ]
    }
  ];

  const handleBackToHome = () => {
    setLocation("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={handleBackToHome} className="mr-4 hover:text-gray-200">
                <FaArrowLeft className="text-xl" />
              </button>
              <h1 className="text-xl font-bold">Client Platform Preview</h1>
            </div>
            <div className="text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Access Code: {accessCode.substring(0, 3)}*****
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Banner */}
          {isSpecialCode ? (
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-lg overflow-hidden mb-8 shadow-xl">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:h-full bg-blue-800 flex items-center justify-center overflow-hidden">
                  <img 
                    src={familyImage2} 
                    alt="Family" 
                    className="w-full h-full object-cover shadow-lg"
                  />
                </div>
                <div className="w-full p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Surprise! Welcome to Brandon's ROLLINSX Software Platforms</h3>
                      <p className="text-sm text-white/80">Something special I've been working on...</p>
                    </div>
                  </div>
                  
                  <p className="mb-4 text-lg">
                    Hello Mom and Dad! I wanted to show you what I've been building - a suite of advanced web software platforms. Each one solves critical problems for modern enterprises and represents thousands of hours of development. I'm so excited to show you my work!
                  </p>
                
                  <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/30">
                    <div className="flex items-center text-yellow-300 mb-2">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">About These Platforms</span>
                    </div>
                    <p className="text-white/90 mb-3">
                      I've created these sophisticated software platforms specifically for enterprise businesses. They handle everything from real-time data synchronization to resource management, executive services, and operations.
                    </p>
                    <ul className="space-y-1 ml-7 text-sm text-white/90 list-disc">
                      <li>All platforms are designed with modern technology stacks</li>
                      <li>They solve real problems for today's businesses</li>
                      <li>Each has been carefully crafted with attention to detail</li>
                      <li>Together they form a comprehensive enterprise technology ecosystem</li>
                    </ul>
                  </div>
                
                  <p className="text-white/90 italic">
                    "After years of coding and development, I've built something I'm really proud of. Take your time exploring each platform - click on their cards below to see detailed information about what they do!"
                  </p>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 flex flex-wrap md:flex-nowrap items-center justify-between">
                <div className="flex items-center mb-3 md:mb-0">
                  <svg className="w-5 h-5 text-yellow-300 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-sm">Special Family Access Granted</span>
                </div>
                <div className="flex space-x-2">
                  <a href="#platforms" className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full transition-colors">
                    Explore Platforms
                  </a>
                  <a href="#founder" className="text-xs bg-white/20 hover:bg-white/30 text-white py-1 px-3 rounded-full transition-colors">
                    About the Founder
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-luxury text-white rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Welcome to Your Secure Platform Preview</h3>
                </div>
                
                <p className="mb-4">
                  Hello, <span className="font-semibold">Special Client</span>! This private environment gives you exclusive access to explore our ROLLINSX software platforms. Each platform is fully interactive and showcases the powerful features we've built specifically for modern enterprise needs.
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-highlight mb-2">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Your Access Details</span>
                  </div>
                  <ul className="space-y-1 ml-7 text-sm text-white/90">
                    <li>• Access Code: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{accessCode}</span></li>
                    <li>• Session Started: <span className="font-mono">{new Date().toLocaleString()}</span></li>
                    <li>• Authorized Platforms: WebSync, WebTrainer, ExecSync, WebOps</li>
                  </ul>
                </div>
                
                <p className="text-sm text-white/80">
                  This preview is confidential and provided exclusively for your evaluation. Please do not share access or content with unauthorized parties.
                </p>
              </div>
              
              <div className="bg-black/20 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-highlight mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm">Secure session active</span>
                </div>
                <a href="#" onClick={handleBackToHome} className="text-sm text-highlight hover:underline">Request Pricing Info</a>
              </div>
            </div>
          )}
          
          {/* Platforms Section */}
          <div id="platforms" className="mb-16">
            <h2 className="text-2xl font-bold text-primary mb-8 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor" />
                </svg>
              </span>
              Available Platforms
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {platforms.map((platform) => (
                <motion.div
                  key={platform.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    // Only show the WebConnect dedicated view for the AeroLink platform
                    if (platform.id === "aerolink") {
                      setShowWebConnect(true);
                    } else {
                      setSelectedPlatform(platform);
                    }
                  }}
                >
                  <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {platform.icon}
                    </div>
                    <h4 className="text-lg font-bold text-primary">{platform.name}</h4>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">{platform.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {platform.id === "websync" && (
                        <>
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Real-time Sync</span>
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Data Integration</span>
                        </>
                      )}
                      {platform.id === "webtrainer" && (
                        <>
                          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">Training Programs</span>
                          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">Performance Analytics</span>
                        </>
                      )}
                      {platform.id === "execsync" && (
                        <>
                          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">Executive Management</span>
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">Premium Services</span>
                        </>
                      )}
                      {platform.id === "webops" && (
                        <>
                          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">Operations</span>
                          <span className="bg-cyan-100 text-cyan-700 text-xs font-semibold px-3 py-1 rounded-full">Compliance</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        className="text-sm text-luxury font-medium hover:underline flex items-center group-hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlatform(platform);
                        }}
                      >
                        View Platform Details
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                      <div className="text-xs text-gray-500">Client ID: {accessCode.substring(0, 3)}*****</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Family Profiles Section (Only for Special Code) */}
          {isSpecialCode && (
            <div id="founder" className="border-t border-gray-200 pt-12 pb-16">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-primary mb-8 flex items-center">
                  <span className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5.5C13.93 5.5 15.5 3.93 15.5 2C15.5 0.07 13.93 -1.5 12 -1.5C10.07 -1.5 8.5 0.07 8.5 2C8.5 3.93 10.07 5.5 12 5.5ZM12 8.5C9.79 8.5 6 9.79 6 12V13H18V12C18 9.79 14.21 8.5 12 8.5Z" fill="currentColor" />
                    </svg>
                  </span>
                  The Team Behind ROLLINSX
                </h2>
                
                {/* Founder Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                  <div className="md:flex">
                    <div className="md:w-2/5 bg-gradient-to-br from-blue-800 to-blue-900">
                      <img 
                        src={familyImage1} 
                        alt="Brandon Rollins - Professional Developer" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-8 md:p-6 md:flex-1">
                      <div className="uppercase tracking-wide text-sm text-blue-700 font-semibold">Founder & Lead Developer</div>
                      <h4 className="mt-1 text-xl font-semibold text-gray-900">Brandon Rollins</h4>
                      <p className="mt-2 text-gray-600">
                        As a self-taught software engineer with extensive experience, Brandon combines real-world business knowledge with technical expertise to create innovative solutions for enterprise needs. His unique perspective allows him to identify critical pain points and build software that addresses actual needs faced by business professionals daily.
                      </p>
                      <p className="mt-3 text-gray-600">
                        Brandon has dedicated thousands of hours to developing the ROLLINSX platform suite, creating a comprehensive ecosystem of enterprise software solutions from the ground up using modern technologies and best practices in software development.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Full-Stack Development</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Web Development</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Microservices</span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Cloud Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Family Investors */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {/* Bernie Rollins */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-2/5">
                        <img 
                          src={bernieImage} 
                          alt="Bernie Rollins" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-3/5 p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-4">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Bernie Rollins</h4>
                            <p className="text-sm text-gray-500">Advisor & Investor (The Count)</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">
                          A successful entrepreneur from Wilmington, NC, Bernie founded Gulfstream Steel and Supply, demonstrating remarkable business acumen and leadership. His experience and guidance have been invaluable in shaping the strategic direction of ROLLINSX.
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          Proud to support innovation in web technology
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nicole Rollins */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-2/5">
                        <img 
                          src={nicoleImage} 
                          alt="Nicole Rollins" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-3/5 p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 mr-4">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Nicole Rollins</h4>
                            <p className="text-sm text-gray-500">Visionary Investor (The Duchess)</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">
                          A mother of three, Nicole is the reason Brandon didn't get a "doo bah" degree, instead pursuing his passion for technology and web development. Her unwavering support and encouragement have been essential to Brandon's journey in building ROLLINSX.
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          "Seeing how Brandon has combined his love for innovation and technology into these sophisticated platforms makes me incredibly proud."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* The Special NC DOT Button */}
                <div className="text-center mt-10 mb-6">
                  <button 
                    onClick={() => setShowInvestorPopup(true)} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Click Here If You Hate The NC DOT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-700">© {new Date().getFullYear()} ROLLINSX. All platform previews are provided under NDA.</p>
              <p className="text-xs text-gray-500 mt-1">Accessing with code: {accessCode.substring(0, 3)}*****</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleBackToHome}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Platform Detail Modal */}
      {selectedPlatform && (
        <PlatformPreview 
          isOpen={!!selectedPlatform} 
          onClose={() => setSelectedPlatform(null)} 
          platform={selectedPlatform} 
        />
      )}

      {/* NC DOT Investor Popup */}
      {showInvestorPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowInvestorPopup(false)}>
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 85%)' }}></div>
                
                {/* Wolf of Wall Street Image */}
                <div className="absolute bottom-0 w-full flex justify-center">
                  <img 
                    src={wolfOfWallStreetImage} 
                    alt="Business Success"
                    className="w-full h-full object-cover opacity-85"
                    style={{ objectPosition: 'center 35%' }}
                  />
                </div>
                
                {/* Falling Money Animation - More money! */}
                {Array.from({ length: 40 }).map((_, index) => (
                  <div 
                    key={index} 
                    className="absolute text-3xl animate-fall"
                    style={{
                      left: `${(index % 20) * 5}%`,
                      animationDuration: `${2 + (index % 5)}s`,
                      animationDelay: `${(index * 0.1) % 3}s`,
                      top: `-${index * 3}%`,
                      zIndex: 30
                    }}
                  >
                    {index % 2 === 0 ? '💵' : '💰'}
                  </div>
                ))}
              </div>
              
              <div className="relative p-10 pt-32 text-center">
                <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Congratulations!</h3>
                <p className="text-2xl text-white mb-6 drop-shadow-lg">The Money Keeps Coming!</p>
                
                {/* Added margin-bottom to ensure image is fully visible */}
                <div className="mb-10">
                  <img 
                    src={wolfOfWallStreetImage} 
                    alt="Success Celebration" 
                    className="mx-auto rounded-lg shadow-xl max-w-sm w-full" 
                  />
                </div>
                
                {/* The Count Chatbot Container - Now positioned below the image */}
                <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 mb-8 w-full max-w-lg mx-auto">
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center mr-3">
                      <FaFire className="text-red-600" />
                    </div>
                    The Count's Special Portal
                  </h4>
                  
                  <div className="text-sm text-gray-300 mb-4">
                    Use this secure communication portal to receive assistance from The Count
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 mb-3">
                    <div className="flex mb-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-[#EDEFF2] text-[#3B5B9D] flex items-center justify-center mr-2 flex-shrink-0">
                        <FaRocket className="text-[#00D1D1] text-xs" />
                      </div>
                      <p className="text-white text-sm">
                        Welcome to ROLLINSX's Web Services! How can we help your business succeed online today?
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button 
                        onClick={() => {
                          setRollinsBotOption("website-design");
                          setOpenRXAIBot(true);
                          setShowInvestorPopup(false);
                        }} 
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs rounded p-2 flex items-center"
                      >
                        <span className="mr-1 text-[#FF7043]">✓</span> Website Design Services
                      </button>
                      <button 
                        onClick={() => {
                          setRollinsBotOption("web-development");
                          setOpenRXAIBot(true);
                          setShowInvestorPopup(false);
                        }} 
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs rounded p-2 flex items-center"
                      >
                        <span className="mr-1 text-[#3B5B9D]">✓</span> Web Development
                      </button>
                      <button 
                        onClick={() => {
                          setRollinsBotOption("mobile-optimization");
                          setOpenRXAIBot(true);
                          setShowInvestorPopup(false);
                        }}  
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs rounded p-2 flex items-center"
                      >
                        <span className="mr-1 text-[#00D1D1]">✓</span> Mobile Optimization
                      </button>
                      <button 
                        onClick={() => {
                          setRollinsBotOption("branding-design");
                          setOpenRXAIBot(true);
                          setShowInvestorPopup(false);
                        }} 
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs rounded p-2 flex items-center"
                      >
                        <span className="mr-1 text-[#3B5B9D]">✓</span> Branding & Identity
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => {
                        console.log("Opening RXAIBot", {isSpecialCode});
                        setRollinsBotOption(null); // Reset any previous option
                        setOpenRXAIBot(true);
                        setShowInvestorPopup(false);
                      }}
                      className="bg-[#3B5B9D] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#2A4A8C] transition-colors"
                    >
                      Chat with ROLLINSX Assistant
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowInvestorPopup(false)}
                  className="bg-white text-[#3B5B9D] font-bold py-2 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RXAIBot - Always rendered but only shown when needed */}
      <RXAIBot isOpen={isSpecialCode && openRXAIBot} initialOption={rollinsBotOption} />
      
      {/* WebConnect Platform View */}
      <WebConnectPlatformView
        isOpen={showWebConnect}
        onClose={() => setShowWebConnect(false)}
        onBackToLanding={() => setShowWebConnect(false)}
      />
    </div>
  );
}