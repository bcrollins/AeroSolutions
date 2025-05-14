import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, ExternalLink, Tag, Users, Calendar, Code, CheckCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnhancedRXAIBot from '@/components/EnhancedRXAIBot';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
};

interface CaseStudyProps {
  id: string;
  title: string;
  client: string;
  industry: string;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  timeframe: string;
  teamSize: number;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  imageUrl: string;
  liveSiteUrl?: string;
  category: 'ecommerce' | 'saas' | 'web-app' | 'website' | 'ai-integration';
}

const caseStudies: CaseStudyProps[] = [
  {
    id: 'ecom-fusion',
    title: 'Multi-Channel E-Commerce Platform',
    client: 'EcomFusion',
    industry: 'Retail & E-Commerce',
    tags: ['E-Commerce', 'Inventory Management', 'Payment Processing', 'API Integration'],
    shortDescription: 'A comprehensive e-commerce solution with real-time inventory management across multiple sales channels.',
    fullDescription: 'EcomFusion needed a scalable e-commerce solution that could integrate with multiple marketplaces and provide centralized inventory management. The platform needed to handle high volumes of traffic and transactions while providing detailed analytics.',
    challenge: 'The client was struggling with inventory discrepancies across their Shopify store, Amazon, and eBay listings, leading to overselling issues and negative customer experiences. They also lacked a consolidated view of sales data, making business decisions difficult.',
    solution: 'We developed a centralized platform that synchronizes inventory and orders across all sales channels in real-time. The solution includes automated repricing based on competitor analysis, comprehensive analytics dashboards, and a streamlined order fulfillment process.',
    results: [
      'Increased sales by 45% within the first six months',
      'Reduced inventory discrepancies to near-zero',
      'Cut order processing time by 60%',
      'Improved customer satisfaction score from 3.8 to 4.7/5',
      'Consolidated reporting led to more informed purchasing decisions'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API', 'Amazon MWS API', 'eBay API', 'Shopify API'],
    timeframe: '4 months',
    teamSize: 5,
    testimonial: {
      quote: "RXAI's platform transformed our business operations. The multi-channel integration is seamless, and we now have complete confidence in our inventory management. The analytics tools have given us insights we never had before.",
      author: "Sarah Johnson",
      position: "Operations Director, EcomFusion"
    },
    imageUrl: "https://images.unsplash.com/photo-1629059042714-4509ff638d1f?auto=format&fit=crop&w=1600&q=80",
    liveSiteUrl: "https://ecomfusion.example.com",
    category: 'ecommerce'
  },
  {
    id: 'medtrack-pro',
    title: 'Healthcare Patient Management System',
    client: 'MedTrack Pro',
    industry: 'Healthcare',
    tags: ['Patient Management', 'Appointment Scheduling', 'HIPAA Compliant', 'Electronic Medical Records'],
    shortDescription: 'A secure, HIPAA-compliant patient management system designed for small to medium-sized medical practices.',
    fullDescription: 'MedTrack Pro required a comprehensive solution to streamline patient management, appointment scheduling, and electronic medical records while ensuring strict compliance with healthcare regulations and data security standards.',
    challenge: 'The client was using multiple disjointed systems for appointment scheduling, billing, and medical records, causing inefficiencies and increasing the risk of errors. Their legacy systems could not keep up with growing patient volume and lacked modern security features.',
    solution: 'We developed a unified web application that brought all aspects of patient management into one secure platform. Key features included an intuitive appointment scheduling system with automated reminders, secure electronic medical records with role-based access, billing integration, and comprehensive reporting tools.',
    results: [
      'Reduced administrative work by 35%',
      'Decreased appointment no-shows by 42%',
      'Improved patient satisfaction scores by 28%',
      'Achieved full HIPAA compliance with robust security measures',
      'Enabled secure telehealth consultations during pandemic'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'JWT Authentication', 'Socket.io', 'AWS HIPAA-eligible services'],
    timeframe: '6 months',
    teamSize: 6,
    testimonial: {
      quote: "The system RXAI built has revolutionized our practice. We've eliminated paper records, reduced administrative overhead, and can focus more time on patient care. The security features give us peace of mind for HIPAA compliance.",
      author: "Dr. Michael Chen",
      position: "Medical Director, MedTrack Pro"
    },
    imageUrl: "https://images.unsplash.com/photo-1581650286735-b1648a7abe9b?auto=format&fit=crop&w=1600&q=80",
    category: 'web-app'
  },
  {
    id: 'analytics-hub',
    title: 'Real-time Business Analytics Platform',
    client: 'AnalyticsHub',
    industry: 'Business Intelligence',
    tags: ['Data Visualization', 'Real-time Analytics', 'Custom Dashboards', 'Predictive Analysis'],
    shortDescription: 'A sophisticated data analytics platform with real-time monitoring, custom dashboards, and predictive analytics capabilities.',
    fullDescription: 'AnalyticsHub needed a powerful analytics platform to serve their enterprise clients across multiple industries. The solution required real-time data processing, advanced visualization options, and the ability to create custom dashboards tailored to specific business needs.',
    challenge: 'The client needed to process vast amounts of data from diverse sources and present actionable insights through intuitive visual interfaces. Their existing solution could not handle the increasing data volume and lacked the flexibility to customize dashboards for different industry requirements.',
    solution: 'We developed a scalable analytics platform with a modular architecture that allows for easy customization. The solution integrates with multiple data sources, processes information in real-time, and provides advanced visualization tools with drill-down capabilities. We implemented predictive analytics using machine learning algorithms to forecast trends.',
    results: [
      'Reduced dashboard loading time from 45 seconds to under 3 seconds',
      'Enabled processing of 500+ million data points daily',
      'Improved prediction accuracy by 37% using custom ML models',
      'Increased client retention rate from 68% to 92%',
      'Expanded service offering to 4 new industry verticals'
    ],
    technologies: ['React', 'D3.js', 'Node.js', 'Python', 'TensorFlow', 'Apache Kafka', 'Elasticsearch', 'Redis', 'AWS'],
    timeframe: '8 months',
    teamSize: 7,
    testimonial: {
      quote: "The analytics platform RXAI built has become our core product offering. Their team understood our vision and delivered a solution that exceeds expectations in both performance and flexibility. Our clients are amazed by the insights they can now access.",
      author: "Alex Rivera",
      position: "CEO, AnalyticsHub"
    },
    imageUrl: "https://images.unsplash.com/photo-1562577307-42d3cec2b511?auto=format&fit=crop&w=1600&q=80",
    liveSiteUrl: "https://analyticshub.example.com",
    category: 'saas'
  },
  {
    id: 'travel-explorer',
    title: 'Adventure Travel Booking Platform',
    client: 'TravelExplorer',
    industry: 'Travel & Tourism',
    tags: ['Booking System', 'Payment Processing', 'User Reviews', 'Interactive Maps'],
    shortDescription: 'A comprehensive travel booking platform focused on adventure tourism, featuring interactive maps and personalized experiences.',
    fullDescription: 'TravelExplorer needed a modern booking platform specialized in adventure travel that would allow them to showcase destinations, manage bookings, and provide personalized recommendations to travelers looking for unique experiences.',
    challenge: 'The client wanted to differentiate themselves in the competitive travel market by offering a more personalized and interactive booking experience for adventure travel. They needed a solution that could handle complex itineraries, integrate with local tour providers, and provide rich destination information.',
    solution: 'We created a feature-rich booking platform with interactive destination maps, AI-powered trip recommendations, secure payment processing, and a review system for authentic traveler feedback. The platform includes a custom content management system for easily updating destination information and a mobile-responsive design for travelers on the go.',
    results: [
      'Increased bookings by 78% in the first year',
      'Achieved 65% higher conversion rate compared to industry average',
      'Generated 4,200+ authentic traveler reviews in six months',
      'Expanded from 12 to 45 adventure destinations',
      'Reduced customer support inquiries by 35% through improved UX'
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Mapbox API', 'Stripe', 'AWS S3', 'Cloudinary'],
    timeframe: '5 months',
    teamSize: 6,
    testimonial: {
      quote: "RXAI delivered a platform that captures the excitement of adventure travel. The interactive features and personalized recommendations have transformed how our customers discover and book trips. Our business has grown exponentially since launch.",
      author: "Emma Torres",
      position: "Founder, TravelExplorer"
    },
    imageUrl: "https://images.unsplash.com/photo-1501885268330-7ea8861cbac8?auto=format&fit=crop&w=1600&q=80",
    liveSiteUrl: "https://travelexplorer.example.com",
    category: 'web-app'
  },
  {
    id: 'green-energy',
    title: 'Renewable Energy Company Website',
    client: 'GreenEnergy Solutions',
    industry: 'Renewable Energy',
    tags: ['Corporate Website', 'Interactive Features', 'Energy Calculator', 'Project Showcase'],
    shortDescription: 'A modern, responsive website for a renewable energy company with interactive tools and project showcases.',
    fullDescription: 'GreenEnergy Solutions needed a complete website redesign to better communicate their mission, showcase their renewable energy projects, and provide educational resources about sustainable energy solutions.',
    challenge: 'The client had an outdated website that failed to showcase their innovative renewable energy solutions effectively. They needed a modern platform that could educate potential clients, demonstrate the impact of their projects, and generate quality leads while reflecting their commitment to sustainability.',
    solution: 'We designed and developed a visually stunning website with a carbon-neutral hosting solution. The site features interactive tools including a solar savings calculator, an immersive project portfolio with 3D visualization, educational resources, and an intuitive contact system with qualified lead scoring.',
    results: [
      'Increased website traffic by 145% in three months',
      'Improved average session duration from 1:20 to 4:15 minutes',
      'Generated 3x more qualified leads per month',
      'Reduced bounce rate from 65% to 28%',
      'Featured as a case study in a major web design publication'
    ],
    technologies: ['React', 'GreenSock Animation', 'Three.js', 'Tailwind CSS', 'Strapi CMS', 'Netlify', 'Green Web Foundation'],
    timeframe: '3 months',
    teamSize: 4,
    testimonial: {
      quote: "Our new website perfectly captures our mission and has transformed how we communicate with potential clients. The interactive features keep visitors engaged, and the lead quality has improved dramatically. RXAI understood our vision perfectly.",
      author: "James Wilson",
      position: "Marketing Director, GreenEnergy Solutions"
    },
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1600&q=80",
    liveSiteUrl: "https://greenenergy.example.com",
    category: 'website'
  },
  {
    id: 'smart-retail',
    title: 'AI-Powered Retail Analytics System',
    client: 'SmartRetail',
    industry: 'Retail',
    tags: ['Computer Vision', 'Customer Analytics', 'Machine Learning', 'Retail Optimization'],
    shortDescription: 'An advanced AI system that analyzes in-store customer behavior to optimize layouts and improve conversion rates.',
    fullDescription: 'SmartRetail needed a sophisticated AI solution to help brick-and-mortar retailers understand customer behavior within their stores, similar to how e-commerce platforms track online behavior.',
    challenge: 'Physical retailers were struggling to compete with e-commerce without the data advantages of online stores. They lacked insights into how customers navigated their spaces, what products attracted attention, and how to optimize store layouts for conversion.',
    solution: 'We developed an AI-powered system using computer vision and machine learning that anonymously tracks customer movement patterns, analyzes engagement with displays, and measures conversion rates by store section. The privacy-focused solution delivers actionable insights through intuitive dashboards without storing personally identifiable information.',
    results: [
      'Increased in-store conversion rates by 23% on average',
      'Optimized staffing based on traffic patterns, reducing labor costs by 12%',
      'Improved product placement strategies resulted in 18% sales lift',
      'Reduced checkout wait times by 42% through better queue management',
      'System deployed in 28 retail locations within first year'
    ],
    technologies: ['TensorFlow', 'OpenCV', 'Python', 'React', 'Node.js', 'AWS SageMaker', 'Redis', 'PostgreSQL'],
    timeframe: '7 months',
    teamSize: 8,
    testimonial: {
      quote: "The AI retail system has given us capabilities we never thought possible in physical retail. We can now make data-driven decisions about everything from store layout to staffing. RXAI delivered a solution that has measurably improved our bottom line.",
      author: "David Park",
      position: "Chief Innovation Officer, SmartRetail"
    },
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1600&q=80",
    category: 'ai-integration'
  },
  {
    id: 'edu-connect',
    title: 'Integrated Learning Management System',
    client: 'EduConnect',
    industry: 'Education Technology',
    tags: ['LMS', 'Virtual Classrooms', 'Assessment Tools', 'Student Analytics'],
    shortDescription: 'A comprehensive learning management system with interactive virtual classrooms and detailed student progress analytics.',
    fullDescription: 'EduConnect required a modern learning management system that could support both traditional classroom teaching and distance learning with rich interactive features, comprehensive assessment tools, and detailed analytics.',
    challenge: 'The client needed to replace multiple disjointed education tools with a unified platform that could handle course creation, live virtual classes, various assessment types, and provide meaningful analytics on student progress while being accessible and easy to use for educators and students alike.',
    solution: 'We built a comprehensive LMS featuring intuitive course creation tools, real-time virtual classrooms with interactive whiteboards, diverse assessment options including AI-assisted grading, personalized learning paths, and detailed analytics dashboards for educators and administrators.',
    results: [
      'Achieved 96% adoption rate among faculty within two semesters',
      'Improved student engagement metrics by 41%',
      'Reduced administrative workload for educators by 68%',
      'Increased assignment completion rates from 76% to 94%',
      'Platform now used by 42 educational institutions'
    ],
    technologies: ['React', 'WebRTC', 'Socket.io', 'Node.js', 'MongoDB', 'AWS', 'TensorFlow for automated assessments'],
    timeframe: '9 months',
    teamSize: 7,
    testimonial: {
      quote: "The learning management system has transformed how we teach and how our students learn. It is intuitive enough for our least tech-savvy instructors while offering advanced features for innovative teaching approaches. The analytics have been invaluable for identifying students who need additional support.",
      author: "Dr. Jasmine Rodriguez",
      position: "Academic Director, EduConnect"
    },
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
    category: 'web-app'
  },
  {
    id: 'content-ai',
    title: 'AI-Powered Content Creation Platform',
    client: 'ContentAI',
    industry: 'Digital Marketing',
    tags: ['Content Generation', 'SEO Optimization', 'Machine Learning', 'Marketing Automation'],
    shortDescription: 'An intelligent content platform that generates, optimizes, and distributes high-quality content across multiple channels.',
    fullDescription: 'ContentAI needed a sophisticated platform to help marketers and content creators produce high-quality, SEO-optimized content at scale while maintaining brand voice and reducing production time and costs.',
    challenge: 'The client wanted to solve the constant challenge of producing fresh, engaging content across multiple platforms. Manual content creation was time-consuming and expensive, while existing AI tools produced generic content that lacked brand voice consistency and often required significant editing.',
    solution: 'We developed an AI-powered content platform with custom language models trained on client-specific content, intelligent SEO recommendations, multi-format content generation (blog posts, social media, email), and automated publishing workflows with performance analytics.',
    results: [
      'Reduced content production time by 73%',
      'Decreased content creation costs by 65%',
      'Increased organic search traffic by 87% through SEO-optimized content',
      'Improved engagement metrics across all content channels',
      'Platform now used by over 150 marketing teams'
    ],
    technologies: ['React', 'Node.js', 'Python', 'TensorFlow', 'GPT-4', 'OpenAI API', 'Natural Language Processing', 'AWS'],
    timeframe: '6 months',
    teamSize: 6,
    testimonial: {
      quote: "The AI content platform has revolutionized our marketing department. What used to take a team of writers weeks now happens in hours, and the quality is consistently excellent. The platform understands our brand voice perfectly and makes intelligent SEO decisions that have dramatically improved our search rankings.",
      author: "Marcus Bennett",
      position: "CMO, ContentAI"
    },
    imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=80",
    category: 'ai-integration'
  }
];

const CaseStudyCard: React.FC<{ caseStudy: CaseStudyProps; onClick: () => void }> = ({ caseStudy, onClick }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-gray-950 border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={caseStudy.imageUrl} 
            alt={caseStudy.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
              {caseStudy.industry}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">{caseStudy.title}</CardTitle>
          <CardDescription className="text-gray-400">
            Client: {caseStudy.client}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-300 mb-3">{caseStudy.shortDescription}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {caseStudy.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-gray-900 text-blue-400 border-blue-500/30">
                {tag}
              </Badge>
            ))}
            {caseStudy.tags.length > 3 && (
              <Badge variant="outline" className="bg-gray-900 text-gray-400 border-gray-700">
                +{caseStudy.tags.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            onClick={onClick} 
            variant="ghost" 
            className="w-full justify-between text-blue-400 hover:text-blue-300 hover:bg-gray-900"
          >
            View Case Study <ArrowRight size={16} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CaseStudyDetail: React.FC<{ caseStudy: CaseStudyProps; onClose: () => void }> = ({ caseStudy, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-950 border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-lg">
          <img 
            src={caseStudy.imageUrl} 
            alt={caseStudy.title}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-gray-900/80 hover:bg-gray-800"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span className="sr-only">Close</span>
          </Button>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-2xl font-bold text-white mb-1">{caseStudy.title}</h1>
            <p className="text-gray-300">Client: {caseStudy.client}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">{caseStudy.industry}</Badge>
            {caseStudy.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-gray-900 text-blue-400 border-blue-500/30">
                {tag}
              </Badge>
            ))}
            {caseStudy.tags.length > 4 && (
              <Badge variant="outline" className="bg-gray-900 text-gray-400 border-gray-700">
                +{caseStudy.tags.length - 4} more
              </Badge>
            )}
          </div>
          
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="solution">Solution Details</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <h3 className="text-lg font-bold text-white mb-2">Project Description</h3>
              <p className="mb-6 text-gray-300">{caseStudy.fullDescription}</p>
              
              <h3 className="text-lg font-bold text-white mb-2">The Challenge</h3>
              <p className="mb-6 text-gray-300">{caseStudy.challenge}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={18} className="text-blue-400" />
                    <h4 className="font-medium text-white">Project Timeline</h4>
                  </div>
                  <p className="text-gray-300">{caseStudy.timeframe}</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-blue-400" />
                    <h4 className="font-medium text-white">Team Size</h4>
                  </div>
                  <p className="text-gray-300">{caseStudy.teamSize} specialists</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={18} className="text-blue-400" />
                    <h4 className="font-medium text-white">Category</h4>
                  </div>
                  <p className="text-gray-300 capitalize">{caseStudy.category.replace('-', ' ')}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="solution" className="mt-4">
              <h3 className="text-lg font-bold text-white mb-2">Our Solution</h3>
              <p className="mb-6">{caseStudy.solution}</p>
              
              <h3 className="text-lg font-bold text-white mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {caseStudy.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-900 border-blue-500/30">
                    <Code size={14} className="mr-1 text-blue-400" /> {tech}
                  </Badge>
                ))}
              </div>
              
              {caseStudy.liveSiteUrl && (
                <div className="mt-6">
                  <Button variant="outline" className="text-blue-400 border-blue-500/30 hover:bg-blue-950/30">
                    <ExternalLink size={16} className="mr-2" />
                    Visit Live Project
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="results" className="mt-4">
              <h3 className="text-lg font-bold text-white mb-2">Project Outcomes</h3>
              <ul className="space-y-2 mb-8">
                {caseStudy.results.map((result, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle size={18} className="mt-1 text-green-500 shrink-0" />
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
              
              {caseStudy.testimonial && (
                <div className="bg-gray-900 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="italic text-gray-300 mb-3">"{caseStudy.testimonial.quote}"</p>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      {caseStudy.testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{caseStudy.testimonial.author}</p>
                      <p className="text-sm text-gray-400">{caseStudy.testimonial.position}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button onClick={onClose} variant="outline" className="mr-2">
              Close
            </Button>
            <Button>Contact Us About Similar Projects</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CaseStudies = () => {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudyProps | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const filteredCaseStudies = filter === 'all' 
    ? caseStudies 
    : caseStudies.filter(cs => cs.category === filter);
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200">
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Case Studies</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how we've helped clients solve complex challenges with innovative web solutions.
          </p>
        </div>
        
        <div className="mb-10">
          <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('all')}
              >
                All Projects
              </Button>
              <Button
                variant={filter === 'web-app' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('web-app')}
              >
                Web Applications
              </Button>
              <Button
                variant={filter === 'website' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('website')}
              >
                Websites
              </Button>
              <Button
                variant={filter === 'ecommerce' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('ecommerce')}
              >
                E-Commerce
              </Button>
              <Button
                variant={filter === 'saas' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('saas')}
              >
                SaaS Platforms
              </Button>
              <Button
                variant={filter === 'ai-integration' ? 'default' : 'ghost'}
                className="whitespace-nowrap"
                onClick={() => setFilter('ai-integration')}
              >
                AI Integration
              </Button>
            </div>
          </div>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCaseStudies.map((caseStudy) => (
            <CaseStudyCard 
              key={caseStudy.id} 
              caseStudy={caseStudy} 
              onClick={() => setSelectedCaseStudy(caseStudy)} 
            />
          ))}
        </motion.div>
        
        {filteredCaseStudies.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-xl text-gray-400">No case studies found matching the selected filter.</p>
          </div>
        )}
      </section>
      
      <section className="py-16 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Looking to Build a Similar Project?</h2>
          <p className="text-xl text-gray-400 mb-8">
            We specialize in creating bespoke solutions designed to meet your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Project
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Development Process</h2>
              <p className="text-gray-400 mb-6">
                We follow a proven methodology to ensure every project is delivered on time, on budget, and exceeds expectations.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-blue-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Discovery & Requirements</h3>
                    <p className="text-sm">Understanding your business needs and project objectives thoroughly.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-blue-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Solution Design</h3>
                    <p className="text-sm">Creating detailed architectural and UX designs tailored to your requirements.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-blue-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Development & Testing</h3>
                    <p className="text-sm">Building the solution with agile methodology and continuous feedback.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-blue-400">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Deployment & Support</h3>
                    <p className="text-sm">Launching your solution with comprehensive training and ongoing support.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Get a Free Consultation</h3>
              <p className="text-gray-400 mb-6">
                Let's discuss your project requirements and how we can help you achieve your business goals.
              </p>
              <Link href="/contact">
                <Button className="w-full">Schedule a Call</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {selectedCaseStudy && (
        <CaseStudyDetail 
          caseStudy={selectedCaseStudy} 
          onClose={() => setSelectedCaseStudy(null)} 
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-40">
        <EnhancedRXAIBot />
      </div>
    </div>
  );
};

export default CaseStudies;