import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCode, FaMobileAlt, FaShoppingCart, FaUserCog, FaLaptopCode, FaCreditCard, FaCalendarAlt, FaLightbulb } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface QuoteFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
}

export default function EnhancedQuoteForm() {
  const [formData, setFormData] = useState<QuoteFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    budget: "",
    timeline: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStepChange = (step: number) => {
    // Simple validation for current step
    if (step > currentStep) {
      if (currentStep === 1) {
        if (!formData.name.trim() || !formData.email.trim() || !validateEmail(formData.email)) {
          toast({
            title: "Required Fields",
            description: "Please fill out all required fields with valid information.",
            variant: "destructive"
          });
          return;
        }
      } else if (currentStep === 2) {
        if (!formData.projectType || !formData.budget || !formData.timeline) {
          toast({
            title: "Required Fields",
            description: "Please select a project type, budget range, and timeline.",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    setCurrentStep(step);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const errors = [];
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (formData.email && !validateEmail(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    if (!formData.projectType) errors.push("Project type is required");
    if (!formData.budget) errors.push("Budget range is required");
    if (!formData.timeline) errors.push("Timeline is required");
    if (!formData.description.trim()) errors.push("Project description is required");
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(". "),
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/quote-request", formData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send quote request");
      }
      
      toast({
        title: "Quote Request Received",
        description: "Thank you for your request! Our team will contact you within 24 hours to discuss your project.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        projectType: "",
        budget: "",
        timeline: "",
        description: ""
      });
      
      // Reset to first step
      setCurrentStep(1);
    } catch (error) {
      console.error("Quote form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send quote request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const projectTypes = [
    { id: "website", label: "Website Design & Development", icon: <FaLaptopCode /> },
    { id: "ecommerce", label: "E-commerce Platform", icon: <FaShoppingCart /> },
    { id: "webapp", label: "Custom Web Application", icon: <FaCode /> },
    { id: "mobile", label: "Mobile App Development", icon: <FaMobileAlt /> },
    { id: "cms", label: "Content Management System", icon: <FaUserCog /> },
    { id: "other", label: "Other / Not Sure", icon: <FaLightbulb /> }
  ];
  
  const budgetRanges = [
    "Less than $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "$50,000+"
  ];
  
  const timelineOptions = [
    "Less than 1 month",
    "1-2 months",
    "2-3 months",
    "3-6 months",
    "6+ months"
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const stepContent = [
    // Step 1: Contact Information
    <motion.div 
      key="step1" 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeIn}
    >
      <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name <span className="text-blue-500">*</span>
          </label>
          <input 
            type="text" 
            id="name" 
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Your name" 
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address <span className="text-blue-500">*</span>
          </label>
          <input 
            type="email" 
            id="email" 
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="your.email@example.com" 
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
            Company Name
          </label>
          <input 
            type="text" 
            id="company" 
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="Your company name" 
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <input 
            type="tel" 
            id="phone" 
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
            placeholder="(123) 456-7890" 
          />
        </div>
      </div>
    </motion.div>,
    
    // Step 2: Project Requirements
    <motion.div 
      key="step2"
      className="space-y-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeIn}
    >
      <h3 className="text-xl font-bold text-white mb-4">Project Requirements</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Project Type <span className="text-blue-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projectTypes.map((type) => (
            <label 
              key={type.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.projectType === type.id 
                  ? 'bg-blue-900/40 border-blue-500' 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="projectType"
                id="projectType"
                value={type.id}
                checked={formData.projectType === type.id}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                formData.projectType === type.id ? 'bg-blue-700' : 'bg-gray-700'
              }`}>
                <span className={formData.projectType === type.id ? 'text-white' : 'text-gray-400'}>
                  {type.icon}
                </span>
              </div>
              <span className="text-white">{type.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
            Budget Range <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              id="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
              required
            >
              <option value="">Select budget range</option>
              {budgetRanges.map((range, index) => (
                <option key={index} value={range}>{range}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
            Expected Timeline <span className="text-blue-500">*</span>
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              id="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
              required
            >
              <option value="">Select timeline</option>
              {timelineOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
    
    // Step 3: Project Description
    <motion.div 
      key="step3" 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeIn}
    >
      <h3 className="text-xl font-bold text-white mb-4">Project Description</h3>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
          Tell us about your project <span className="text-blue-500">*</span>
        </label>
        <textarea 
          id="description" 
          rows={6} 
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
          placeholder="Please describe your project requirements, goals, and any specific features you need..."
          required
        ></textarea>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">Your Quote Request Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-gray-400">Name:</span>
            <span className="text-white ml-2">{formData.name || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{formData.email || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Company:</span>
            <span className="text-white ml-2">{formData.company || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Phone:</span>
            <span className="text-white ml-2">{formData.phone || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-400">Project Type:</span>
            <span className="text-white ml-2">
              {projectTypes.find(type => type.id === formData.projectType)?.label || 'Not selected'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Budget:</span>
            <span className="text-white ml-2">{formData.budget || 'Not selected'}</span>
          </div>
          <div>
            <span className="text-gray-400">Timeline:</span>
            <span className="text-white ml-2">{formData.timeline || 'Not selected'}</span>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        <p className="flex items-start">
          <span className="text-blue-500 mr-2">⚡</span>
          Our team will review your request and provide a detailed quote within 24 hours.
        </p>
        <p className="flex items-start mt-1">
          <span className="text-blue-500 mr-2">⚡</span>
          Remember our unique no-payment-until-satisfied guarantee: you only pay when you're 100% satisfied with our work.
        </p>
      </div>
    </motion.div>
  ];

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Progress Steps */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center relative">
              <button 
                onClick={() => step < currentStep && handleStepChange(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : currentStep > step
                      ? 'bg-green-600 text-white cursor-pointer'
                      : 'bg-gray-700 text-gray-400'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </button>
              <span className={`text-xs mt-1 ${currentStep >= step ? 'text-white' : 'text-gray-500'}`}>
                {step === 1 ? 'Contact' : step === 2 ? 'Requirements' : 'Description'}
              </span>
              
              {/* Connector line between steps */}
              {step < 3 && (
                <div className={`absolute top-4 left-8 w-[calc(100%-32px)] h-0.5 ${
                  currentStep > step ? 'bg-green-600' : 'bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="min-h-[300px]">
          {stepContent[currentStep - 1]}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => handleStepChange(currentStep - 1)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'opacity-0 cursor-default'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => handleStepChange(currentStep + 1)}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center disabled:opacity-70 disabled:hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Quote Request"} {!isSubmitting && <FaArrowRight className="ml-2" />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}