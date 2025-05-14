import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Check, ArrowRight, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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

interface ServicePackageProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  excludedFeatures?: string[];
  popular?: boolean;
  ctaText: string;
  timeline: string;
}

const ServicePackage: React.FC<ServicePackageProps> = ({
  title,
  price,
  description,
  features,
  excludedFeatures = [],
  popular = false,
  ctaText,
  timeline,
}) => {
  return (
    <motion.div variants={itemVariants} className="w-full">
      <Card className={`h-full flex flex-col ${popular ? 'border-blue-500 shadow-blue-200 shadow-lg' : ''}`}>
        {popular && (
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
          </div>
        )}
        <CardHeader className={`${popular ? 'pt-6' : ''}`}>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-extrabold">{price}</span>
            {price !== 'Custom' && <span className="text-sm opacity-70"> starting price</span>}
          </div>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-medium text-sm mb-2">Timeline: {timeline}</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            
            {excludedFeatures.length > 0 && (
              <>
                <li className="pt-2 border-t border-gray-200 mt-3 mb-1">
                  <span className="text-sm font-medium opacity-70">Not included:</span>
                </li>
                {excludedFeatures.map((feature, index) => (
                  <li key={`excluded-${index}`} className="flex items-start opacity-60">
                    <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </CardContent>
        <CardFooter>
          <Link href="/contact">
            <Button className="w-full group">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const ServicePackages: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);
  
  // Web Development Packages
  const webDevPackages: ServicePackageProps[] = [
    {
      title: 'Landing Page',
      price: '$1,499',
      description: 'Professional single-page website ideal for promoting a specific product, service, or event.',
      features: [
        'Custom responsive design',
        'Up to 5 content sections',
        'Contact form integration',
        'Google Analytics setup',
        'Basic SEO optimization',
        'Social media links',
        'Unlimited revisions until satisfied',
      ],
      excludedFeatures: [
        'Multiple pages',
        'Custom integrations',
        'Ongoing maintenance',
      ],
      ctaText: 'Request a quote',
      timeline: '2-3 weeks',
    },
    {
      title: 'Business Website',
      price: '$2,999',
      description: 'Complete website solution for businesses looking to establish a professional online presence.',
      features: [
        'Up to 8 custom pages',
        'Responsive design across all devices',
        'Contact form with custom fields',
        'Content management system',
        'Google Analytics and Search Console setup',
        'Comprehensive SEO setup',
        'Social media integration',
        'Performance optimization',
        'Blog/news section',
        'Unlimited revisions until satisfied',
      ],
      popular: true,
      ctaText: 'Get started now',
      timeline: '4-6 weeks',
    },
    {
      title: 'E-commerce Solution',
      price: '$4,999',
      description: 'Full-featured online store with everything you need to sell products or services online.',
      features: [
        'Up to 15 custom pages',
        'Responsive design across all devices',
        'Product catalog with unlimited products',
        'Secure payment processing',
        'Inventory management',
        'Order tracking and management',
        'Customer account creation',
        'Shopping cart and checkout optimization',
        'Email notification system',
        'Integration with shipping providers',
        'Complete SEO optimization',
        'Analytics and sales reporting',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Request a quote',
      timeline: '6-8 weeks',
    },
    {
      title: 'Enterprise Solution',
      price: 'Custom',
      description: 'Tailored solutions for large organizations with complex requirements and integrations.',
      features: [
        'Custom architecture and design',
        'Comprehensive digital strategy',
        'Advanced security protocols',
        'Custom API development',
        'Third-party system integrations',
        'Database design and optimization',
        'Performance optimization for high traffic',
        'Multi-language support',
        'Advanced analytics and reporting',
        'User training and documentation',
        'Priority support',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Schedule a consultation',
      timeline: '8-12+ weeks',
    },
  ];
  
  // Web Application Packages
  const webAppPackages: ServicePackageProps[] = [
    {
      title: 'MVP Development',
      price: '$5,999',
      description: 'Rapidly turn your idea into a functioning minimal viable product to validate your concept.',
      features: [
        'Core functionality implementation',
        'User authentication system',
        'Clean, responsive UI',
        'Basic dashboard or admin area',
        'Cloud deployment setup',
        'Bug fixes and support for 30 days',
        'Unlimited revisions until satisfied',
      ],
      excludedFeatures: [
        'Advanced integrations',
        'Extensive analytics',
        'High scalability features',
      ],
      ctaText: 'Request a quote',
      timeline: '6-8 weeks',
    },
    {
      title: 'SaaS Platform',
      price: '$14,999',
      description: 'Complete Software-as-a-Service platform with user management, billing, and core features.',
      features: [
        'User authentication and permission system',
        'Subscription billing integration',
        'Customer dashboard',
        'Admin control panel',
        'Email notification system',
        'API development',
        'Database design and optimization',
        'Performance monitoring',
        'Comprehensive testing',
        'Deployment and DevOps setup',
        '60 days of post-launch support',
        'Unlimited revisions until satisfied',
      ],
      popular: true,
      ctaText: 'Get started now',
      timeline: '10-14 weeks',
    },
    {
      title: 'Custom Web Application',
      price: '$9,999',
      description: 'Tailored web application to address your specific business needs and processes.',
      features: [
        'Custom user interface design',
        'Authentication and user management',
        'Role-based access control',
        'Database architecture and development',
        'API development',
        'Third-party integrations',
        'File upload and management',
        'Real-time notifications',
        'Comprehensive documentation',
        '45 days of post-launch support',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Request a quote',
      timeline: '8-12 weeks',
    },
    {
      title: 'Enterprise Application',
      price: 'Custom',
      description: 'Robust, scalable enterprise applications designed to handle complex business processes.',
      features: [
        'Enterprise architecture design',
        'Microservices implementation',
        'High availability and scaling architecture',
        'Advanced security implementation',
        'Single sign-on integration',
        'Data migration services',
        'Custom API development',
        'System integration with legacy systems',
        'Comprehensive testing (unit, integration, load)',
        'Performance optimization',
        'User training and documentation',
        'Dedicated support team',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Schedule a consultation',
      timeline: '12-24+ weeks',
    },
  ];
  
  // AI Integration Packages
  const aiPackages: ServicePackageProps[] = [
    {
      title: 'AI Chatbot Integration',
      price: '$3,499',
      description: 'Add an intelligent chatbot to your website to handle common customer inquiries and improve engagement.',
      features: [
        'Custom-designed chatbot interface',
        'Natural language processing',
        'Training with your business information',
        'FAQ automation',
        'Lead collection capabilities',
        'Analytics dashboard',
        '30 days of post-implementation support',
        'Unlimited revisions until satisfied',
      ],
      excludedFeatures: [
        'Complex API integrations',
        'Multi-language support',
        'Voice capabilities',
      ],
      ctaText: 'Request a quote',
      timeline: '3-4 weeks',
    },
    {
      title: 'AI Content Generator',
      price: '$4,999',
      description: 'Implement a custom content generation system for your website, blog, or marketing materials.',
      features: [
        'Custom content generation interface',
        'Content customization options',
        'Template management system',
        'Content scheduling',
        'SEO optimization features',
        'Analytics and performance tracking',
        '45 days of post-launch support',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Get started now',
      timeline: '5-7 weeks',
    },
    {
      title: 'AI-Powered Analytics',
      price: '$6,999',
      description: 'Advanced analytics platform with predictive capabilities and actionable insights for your business.',
      features: [
        'Custom dashboard development',
        'Data integration from multiple sources',
        'Advanced visualizations',
        'Predictive analytics models',
        'Automated reporting system',
        'Alert and notification system',
        'User permission management',
        'Data export capabilities',
        '60 days of post-launch support',
        'Unlimited revisions until satisfied',
      ],
      popular: true,
      ctaText: 'Request a quote',
      timeline: '6-9 weeks',
    },
    {
      title: 'Custom AI Solution',
      price: 'Custom',
      description: 'Bespoke AI solutions tailored to your specific business processes and requirements.',
      features: [
        'AI strategy consulting',
        'Custom algorithm development',
        'Data preparation and cleaning',
        'Model training and optimization',
        'System integration',
        'Backend infrastructure setup',
        'Monitoring and alerts configuration',
        'User interface development',
        'Performance testing and optimization',
        'Comprehensive documentation',
        'User training and onboarding',
        'Ongoing support and maintenance',
        'Unlimited revisions until satisfied',
      ],
      ctaText: 'Schedule a consultation',
      timeline: '10-16+ weeks',
    },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Full-Stack Development Service Packages
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Our comprehensive development packages are designed to transform your vision into 
              a powerful digital reality—with our exclusive no-payment-until-satisfied guarantee.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="group">
                  Request Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setChatOpen(true)}
              >
                Chat with an Expert
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Choose the Package That Fits Your Needs
            </h2>
            <p className="md:text-lg max-w-3xl mx-auto">
              From simple landing pages to complex enterprise solutions, we offer a range of packages 
              designed to meet your specific requirements and budget.
            </p>
          </motion.div>

          <Tabs defaultValue="web-dev" className="mb-16">
            <TabsList className="w-full justify-center mb-8">
              <TabsTrigger value="web-dev">Website Development</TabsTrigger>
              <TabsTrigger value="web-app">Web Applications</TabsTrigger>
              <TabsTrigger value="ai-integration">AI Integration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="web-dev">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {webDevPackages.map((pkg, idx) => (
                  <ServicePackage key={`web-dev-${idx}`} {...pkg} />
                ))}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="web-app">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {webAppPackages.map((pkg, idx) => (
                  <ServicePackage key={`web-app-${idx}`} {...pkg} />
                ))}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="ai-integration">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {aiPackages.map((pkg, idx) => (
                  <ServicePackage key={`ai-${idx}`} {...pkg} />
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
          
          {/* Our Process Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Development Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Discovery</h3>
                <p className="text-sm">We begin by understanding your business, goals, target audience, and specific requirements through in-depth consultation.</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Planning</h3>
                <p className="text-sm">We create detailed specifications, wireframes, and project timelines to ensure a clear development path forward.</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Development</h3>
                <p className="text-sm">Our expert team builds your solution using modern technologies, with regular updates and milestone reviews.</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Launch & Support</h3>
                <p className="text-sm">We deploy your solution, provide training, and offer ongoing support to ensure long-term success.</p>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Satisfaction Guarantee */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-8 rounded-xl border border-blue-800"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Satisfaction Guarantee</h2>
              <p className="mb-6">
                We believe in the quality of our work. That's why we offer an industry-leading satisfaction guarantee:
                you only pay when you're completely satisfied with the final product.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div variants={itemVariants} className="bg-card p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Unlimited Revisions</h3>
                  <p className="text-sm">We'll make changes until your vision is realized exactly as you want it.</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-card p-4 rounded-lg">
                  <h3 className="font-bold mb-2">No Hidden Fees</h3>
                  <p className="text-sm">The price we quote is the price you pay, with no surprise costs.</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-card p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Post-Launch Support</h3>
                  <p className="text-sm">Our relationship doesn't end at launch—we provide ongoing assistance.</p>
                </motion.div>
              </div>
              <Link href="/contact">
                <Button size="lg">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">How long does a typical project take?</h3>
                <p>Project timelines vary based on complexity. Simple websites typically take 2-4 weeks, while complex web applications may take 3-6 months. We provide detailed timelines during the planning phase.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">What technologies do you use?</h3>
                <p>We use modern technologies including React, Node.js, TypeScript, Python, and more. We select the best stack for each project based on specific requirements and performance needs.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">How does the payment process work?</h3>
                <p>We typically structure payments in milestones. For most projects, we require a 30% deposit to begin work, with remaining payments tied to project milestones. Full payment is only required when you're completely satisfied.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Do you provide hosting and maintenance?</h3>
                <p>Yes, we offer ongoing hosting, maintenance, and support packages to ensure your application runs smoothly after launch. These services can be added to any development package.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Can you work with our existing systems?</h3>
                <p>Absolutely. We specialize in integrating with existing systems and can develop custom APIs to connect with your current infrastructure, databases, and third-party services.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">What if I need changes after the project is complete?</h3>
                <p>We offer flexible support options for post-launch changes and enhancements. You can choose from hourly rates, retainer packages, or project-based pricing for future modifications.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="md:text-lg mb-8">
              Contact us today to discuss your requirements and get a custom quote tailored to your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="group">
                  Request a Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/case-studies">
                <Button variant="outline" size="lg">
                  View Our Case Studies
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced Chat Bot */}
      <EnhancedRXAIBot isOpen={chatOpen} hideFloatingButton={false} initialOption="service-packages" />
    </div>
  );
};

export default ServicePackages;