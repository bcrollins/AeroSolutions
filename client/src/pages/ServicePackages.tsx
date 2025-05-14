import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCode, FaServer, FaShieldAlt, FaDatabase, FaDesktop, FaMobileAlt, FaRocket, FaBolt, FaArrowRight } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';

interface PackageFeature {
  name: string;
  included: boolean;
}

interface ServicePackage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  features: PackageFeature[];
  popular?: boolean;
}

export default function ServicePackages() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  const servicePackages: ServicePackage[] = [
    {
      id: 'basic-website',
      title: 'Basic Website',
      subtitle: 'Professional & Responsive',
      description: 'Perfect for small businesses looking to establish an online presence with a professional and responsive website.',
      icon: <FaDesktop className="text-3xl text-blue-500" />,
      price: 'Starting at $2,990',
      features: [
        { name: 'Responsive Design', included: true },
        { name: 'Up to 5 Pages', included: true },
        { name: 'Contact Form', included: true },
        { name: 'SEO Optimization', included: true },
        { name: 'Content Management System', included: true },
        { name: 'Custom Domain Setup', included: true },
        { name: 'Google Analytics Integration', included: true },
        { name: 'Social Media Integration', included: true },
        { name: 'E-commerce Functionality', included: false },
        { name: 'User Authentication', included: false },
        { name: 'Custom API Integration', included: false },
        { name: 'Advanced Security Features', included: false },
      ]
    },
    {
      id: 'e-commerce',
      title: 'E-commerce Platform',
      subtitle: 'Sell Products Online',
      description: 'Complete e-commerce solution with product management, secure payments, and order processing functionality.',
      icon: <FaDatabase className="text-3xl text-blue-500" />,
      price: 'Starting at $5,990',
      popular: true,
      features: [
        { name: 'Responsive Design', included: true },
        { name: 'Up to 10 Pages', included: true },
        { name: 'Contact Form', included: true },
        { name: 'SEO Optimization', included: true },
        { name: 'Content Management System', included: true },
        { name: 'Custom Domain Setup', included: true },
        { name: 'Google Analytics Integration', included: true },
        { name: 'Social Media Integration', included: true },
        { name: 'E-commerce Functionality', included: true },
        { name: 'User Authentication', included: true },
        { name: 'Custom API Integration', included: true },
        { name: 'Advanced Security Features', included: true },
      ]
    },
    {
      id: 'custom-app',
      title: 'Custom Web Application',
      subtitle: 'Tailored Solutions',
      description: 'Fully customized web application designed to your specific business needs and workflow requirements.',
      icon: <FaCode className="text-3xl text-blue-500" />,
      price: 'Starting at $9,990',
      features: [
        { name: 'Responsive Design', included: true },
        { name: 'Unlimited Pages', included: true },
        { name: 'Contact Form', included: true },
        { name: 'SEO Optimization', included: true },
        { name: 'Content Management System', included: true },
        { name: 'Custom Domain Setup', included: true },
        { name: 'Google Analytics Integration', included: true },
        { name: 'Social Media Integration', included: true },
        { name: 'E-commerce Functionality', included: true },
        { name: 'User Authentication', included: true },
        { name: 'Custom API Integration', included: true },
        { name: 'Advanced Security Features', included: true },
      ]
    }
  ];
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 }
    })
  };
  
  const handlePackageClick = (id: string) => {
    setSelectedPackage(id);
    
    // Scroll to contact form
    setTimeout(() => {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <SEOHead
        title="Full-Stack Development Service Packages | RXAI"
        description="Explore our comprehensive web development service packages, from responsive websites to custom web applications, all with our no-payment-until-satisfied guarantee."
        keywords="web development packages, full-stack development services, custom web application, e-commerce platform, responsive website design, development pricing"
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
                Full-Stack Development Service Packages
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                From simple websites to complex web applications, our full-stack development services are designed to meet your specific business needs.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a 
                  href="#packages" 
                  className="px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  View Packages
                </a>
                <Link href="/case-studies">
                  <a className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                    See Our Work
                  </a>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Our Process Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              custom={0}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Our Development Process</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Our structured approach ensures we deliver high-quality solutions that meet your business objectives.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <FaRocket className="text-3xl text-blue-500" />,
                  title: "Discovery & Planning",
                  description: "We start by understanding your business needs, target audience, and project goals to create a comprehensive roadmap."
                },
                {
                  icon: <FaDesktop className="text-3xl text-blue-500" />,
                  title: "Design & Prototyping",
                  description: "Our team creates wireframes and interactive prototypes to visualize the user experience before development begins."
                },
                {
                  icon: <FaCode className="text-3xl text-blue-500" />,
                  title: "Development & Testing",
                  description: "We build your solution using the latest technologies and perform rigorous testing to ensure quality and reliability."
                },
                {
                  icon: <FaBolt className="text-3xl text-blue-500" />,
                  title: "Deployment & Support",
                  description: "After launch, we provide ongoing support and maintenance to keep your solution running smoothly."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-800"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={fadeIn}
                  custom={index * 0.2 + 1}
                >
                  <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Packages Section */}
        <section id="packages" className="py-20 bg-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              custom={0}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Choose Your Service Package</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Select the package that best fits your project requirements and business objectives.
                All packages include our unique no-payment-until-satisfied guarantee.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {servicePackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg border ${
                    pkg.popular ? 'border-blue-500' : 'border-gray-700'
                  } relative h-full flex flex-col`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={fadeIn}
                  custom={index * 0.2 + 1}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 border-b border-gray-700">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                      {pkg.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{pkg.title}</h3>
                    <p className="text-blue-400 font-medium mb-4">{pkg.subtitle}</p>
                    <p className="text-gray-300 mb-4">{pkg.description}</p>
                    <div className="text-2xl font-bold text-white mb-4">{pkg.price}</div>
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <h4 className="text-lg font-semibold text-white mb-4">What's Included:</h4>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <FaCheckCircle className={`mt-1 mr-2 ${feature.included ? 'text-blue-500' : 'text-gray-600'}`} />
                          <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="px-6 pb-6 mt-auto">
                    <button
                      onClick={() => handlePackageClick(pkg.id)}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        pkg.popular 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      Request a Quote
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Custom Enterprise Solution */}
            <motion.div
              className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 shadow-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              custom={4}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Need a Custom Enterprise Solution?</h3>
                  <p className="text-blue-100">
                    Our team can build a tailor-made solution for your complex business requirements.
                    Contact us for a personalized consultation.
                  </p>
                </div>
                <a
                  href="#contact-section"
                  className="px-6 py-3 bg-white text-blue-900 hover:bg-gray-100 font-bold rounded-lg transition-colors whitespace-nowrap flex items-center"
                >
                  Schedule a Consultation <FaArrowRight className="ml-2" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Technologies Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
              custom={0}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Our Technology Stack</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                We use the latest technologies to build robust, scalable, and high-performance web applications.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Frontend Development",
                  icon: <FaDesktop className="text-3xl text-blue-500" />,
                  technologies: "React, Vue.js, Angular, Next.js, TypeScript, Tailwind CSS"
                },
                {
                  title: "Backend Development",
                  icon: <FaServer className="text-3xl text-blue-500" />,
                  technologies: "Node.js, Express, Django, Laravel, Spring Boot, GraphQL"
                },
                {
                  title: "Database Solutions",
                  icon: <FaDatabase className="text-3xl text-blue-500" />,
                  technologies: "MongoDB, PostgreSQL, MySQL, Redis, Firebase, Amazon DynamoDB"
                },
                {
                  title: "DevOps & Security",
                  icon: <FaShieldAlt className="text-3xl text-blue-500" />,
                  technologies: "Docker, Kubernetes, AWS, Google Cloud, Azure, CI/CD Pipelines"
                }
              ].map((stack, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900 p-6 rounded-lg border border-gray-800"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={fadeIn}
                  custom={index * 0.2 + 1}
                >
                  <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    {stack.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{stack.title}</h3>
                  <p className="text-gray-300">{stack.technologies}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact/Quote Form Section */}
        <section id="contact-section" className="py-20 bg-gray-900 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeIn}
                custom={0}
              >
                <h2 className="text-3xl font-bold text-white mb-4">Request a Quote</h2>
                <p className="text-gray-300">
                  Fill out the form below to get a quote for your project. Our team will contact you within 24 hours.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
                custom={1}
              >
                <div className="p-8">
                  {selectedPackage && (
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                      <p className="text-blue-300 font-medium">
                        You've selected the <span className="text-white font-bold">
                          {servicePackages.find(pkg => pkg.id === selectedPackage)?.title}
                        </span> package. Please provide additional details about your project.
                      </p>
                    </div>
                  )}
                  
                  <form>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Email Address</label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Company Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="Your Company"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2 font-medium">Service Package</label>
                      <select
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        value={selectedPackage || ''}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                      >
                        <option value="">Select a package</option>
                        {servicePackages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.title} - {pkg.price}
                          </option>
                        ))}
                        <option value="custom">Custom Enterprise Solution</option>
                      </select>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Budget Range</label>
                        <select
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select budget range</option>
                          <option value="< $5,000">Less than $5,000</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                          <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                          <option value="$25,000+">$25,000+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Timeline</label>
                        <select
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select timeline</option>
                          <option value="< 1 month">Less than 1 month</option>
                          <option value="1-2 months">1-2 months</option>
                          <option value="2-3 months">2-3 months</option>
                          <option value="3+ months">3+ months</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2 font-medium">Project Details</label>
                      <textarea
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        rows={5}
                        placeholder="Please describe your project requirements, goals, and any specific features you need..."
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                      Submit Quote Request
                    </button>
                    
                    <p className="text-gray-400 text-sm mt-4 text-center">
                      By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}