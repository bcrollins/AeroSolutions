import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { 
  Search, 
  ChevronRight, 
  BookOpen,
  ArrowRight,
  Filter,
  Terminal,
  Brain,
  Code,
  Database,
  Bot,
  Clock,
  X,
  Mic
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Article data - static for now, would connect to backend API in production
const articlesData = [
  // Initial 25 articles from Prompt 1
  {
    id: 1,
    slug: "what-is-artificial-intelligence-beginners-guide-2025",
    title: "What Is Artificial Intelligence? A Beginner's Guide for 2025",
    description: "Learn the fundamentals of AI, how it works, and its applications in this comprehensive beginner's guide for 2025.",
    category: "Fundamentals",
    image: "/images/articles/ai-beginners-guide.webp",
    readTime: 8,
    date: "2025-03-15",
    isNew: false,
    tags: ["ai", "beginners", "introduction"]
  },
  {
    id: 2,
    slug: "how-to-learn-ai-from-scratch-step-by-step-guide-2025",
    title: "How to Learn AI from Scratch: Your 2025 Step-by-Step Guide",
    description: "A practical roadmap for beginners to start learning artificial intelligence from zero technical knowledge.",
    category: "Learning",
    image: "/images/articles/learn-ai-scratch.webp",
    readTime: 12,
    date: "2025-03-18",
    isNew: false,
    tags: ["learning", "beginners", "tutorials"]
  },
  {
    id: 3,
    slug: "best-online-ai-courses-beginners-2025",
    title: "Best Online AI Courses for Beginners in 2025: Top Picks",
    description: "Discover the most effective online courses to master artificial intelligence fundamentals in 2025.",
    category: "Learning",
    image: "/images/articles/ai-courses-2025.webp",
    readTime: 10,
    date: "2025-03-20",
    isNew: false,
    tags: ["courses", "education", "beginners"]
  },
  {
    id: 4,
    slug: "how-to-use-ai-web-development-tools-tips-2025",
    title: "How to Use AI for Web Development: 2025 Tools & Tips",
    description: "Practical ways to leverage artificial intelligence to enhance your web development workflow and projects.",
    category: "Development",
    image: "/images/articles/ai-web-development.webp",
    readTime: 9,
    date: "2025-03-22",
    isNew: false,
    tags: ["development", "tools", "web"]
  },
  {
    id: 5,
    slug: "what-is-machine-learning-how-it-works-2025",
    title: "What Is Machine Learning? How It Works in 2025",
    description: "Understand machine learning concepts, algorithms, and real-world applications in this up-to-date guide.",
    category: "Fundamentals",
    image: "/images/articles/machine-learning-basics.webp",
    readTime: 11,
    date: "2025-03-25",
    isNew: false,
    tags: ["machine learning", "algorithms", "data"]
  },
  {
    id: 6,
    slug: "how-to-build-ai-powered-website-ultimate-guide-2025",
    title: "How to Build an AI-Powered Website in 2025: Ultimate Guide",
    description: "Step-by-step instructions to create websites with integrated AI features for enhanced user experiences.",
    category: "Development",
    image: "/images/articles/ai-website-guide.webp",
    readTime: 15,
    date: "2025-03-28",
    isNew: false,
    tags: ["development", "websites", "integration"]
  },
  {
    id: 7,
    slug: "top-ai-tools-developers-2025",
    title: "Top AI Tools for Developers in 2025: Must-Have Software",
    description: "Discover the essential AI-powered tools that every developer should have in their toolkit in 2025.",
    category: "Tools",
    image: "/images/articles/ai-tools-developers.webp",
    readTime: 10,
    date: "2025-04-01",
    isNew: false,
    tags: ["tools", "development", "software"]
  },
  {
    id: 8,
    slug: "how-to-optimize-website-seo-2025",
    title: "How to Optimize a Website for SEO in 2025: Proven Strategies",
    description: "Learn the latest techniques for optimizing your website's search engine visibility in 2025.",
    category: "SEO",
    image: "/images/articles/seo-optimization.webp",
    readTime: 13,
    date: "2025-04-03",
    isNew: false,
    tags: ["seo", "optimization", "marketing"]
  },
  {
    id: 9,
    slug: "what-is-deep-learning-applications-2025",
    title: "What Is Deep Learning? Applications to Know in 2025",
    description: "Understand deep learning concepts and explore its most important applications across industries in 2025.",
    category: "Fundamentals",
    image: "/images/articles/deep-learning.webp",
    readTime: 11,
    date: "2025-04-05",
    isNew: false,
    tags: ["deep learning", "neural networks", "applications"]
  },
  {
    id: 10,
    slug: "how-to-integrate-ai-business-2025",
    title: "How to Integrate AI into Your Business: 2025 Guide",
    description: "A comprehensive guide for implementing artificial intelligence solutions in your business operations.",
    category: "Business",
    image: "/images/articles/ai-business-integration.webp",
    readTime: 14,
    date: "2025-04-08",
    isNew: false,
    tags: ["business", "implementation", "strategy"]
  },
  {
    id: 11,
    slug: "best-ai-programming-languages-2025",
    title: "Best AI Programming Languages to Learn in 2025",
    description: "Discover which programming languages are most valuable for artificial intelligence development in 2025.",
    category: "Programming",
    image: "/images/articles/ai-programming-languages.webp",
    readTime: 12,
    date: "2025-04-10",
    isNew: false,
    tags: ["programming", "languages", "development"]
  },
  {
    id: 12,
    slug: "how-to-use-ai-content-creation-2025",
    title: "How to Use AI for Content Creation: 2025 Best Practices",
    description: "Learn effective strategies for leveraging AI tools to enhance your content creation workflow.",
    category: "Content",
    image: "/images/articles/ai-content-creation.webp",
    readTime: 9,
    date: "2025-04-12",
    isNew: false,
    tags: ["content", "creation", "marketing"]
  },
  {
    id: 13,
    slug: "what-is-nlp-natural-language-processing-2025",
    title: "What Is NLP? Understanding Natural Language Processing in 2025",
    description: "Explore how natural language processing works and its applications in various industries in 2025.",
    category: "Fundamentals",
    image: "/images/articles/nlp-explained.webp",
    readTime: 10,
    date: "2025-04-15",
    isNew: false,
    tags: ["nlp", "language", "processing"]
  },
  {
    id: 14,
    slug: "how-to-create-ai-chatbot-website-2025",
    title: "How to Create an AI Chatbot for Your Website in 2025",
    description: "Step-by-step guide to building and implementing an AI-powered chatbot on your website.",
    category: "Development",
    image: "/images/articles/chatbot-creation.webp",
    readTime: 11,
    date: "2025-04-17",
    isNew: false,
    tags: ["chatbots", "development", "customer service"]
  },
  {
    id: 15,
    slug: "ethical-issues-ai-development-2025",
    title: "What Are the Ethical Issues in AI Development? 2025 Insights",
    description: "An examination of the key ethical considerations in artificial intelligence development and implementation.",
    category: "Ethics",
    image: "/images/articles/ai-ethics.webp",
    readTime: 13,
    date: "2025-04-20",
    isNew: false,
    tags: ["ethics", "responsibility", "governance"]
  },
  {
    id: 16,
    slug: "how-to-use-ai-data-analysis-2025",
    title: "How to Use AI for Data Analysis: 2025 Tools & Techniques",
    description: "Discover the latest AI-powered approaches to extract insights from complex datasets in 2025.",
    category: "Data",
    image: "/images/articles/ai-data-analysis.webp",
    readTime: 12,
    date: "2025-04-22",
    isNew: false,
    tags: ["data analysis", "insights", "tools"]
  },
  {
    id: 17,
    slug: "what-is-generative-ai-trends-2025",
    title: "What Is Generative AI? Uses and Trends for 2025",
    description: "Understand generative AI and how it's being used across industries, with predictions for 2025.",
    category: "Fundamentals",
    image: "/images/articles/generative-ai.webp",
    readTime: 10,
    date: "2025-04-25",
    isNew: false,
    tags: ["generative ai", "trends", "creative"]
  },
  {
    id: 18,
    slug: "how-to-optimize-ai-models-performance-2025",
    title: "How to Optimize AI Models for Performance in 2025",
    description: "Technical strategies to improve the speed, accuracy, and efficiency of AI models in 2025.",
    category: "Technical",
    image: "/images/articles/ai-performance.webp",
    readTime: 14,
    date: "2025-04-27",
    isNew: false,
    tags: ["optimization", "performance", "models"]
  },
  {
    id: 19,
    slug: "best-ai-certifications-career-2025",
    title: "Best AI Certifications to Boost Your Career in 2025",
    description: "Explore the most valuable certifications for advancing your career in artificial intelligence.",
    category: "Career",
    image: "/images/articles/ai-certifications.webp",
    readTime: 9,
    date: "2025-04-30",
    isNew: false,
    tags: ["certifications", "career", "education"]
  },
  {
    id: 20,
    slug: "how-to-use-ai-seo-keyword-research-2025",
    title: "How to Use AI for SEO Keyword Research in 2025",
    description: "Leverage artificial intelligence to discover high-value keywords and optimize your content strategy.",
    category: "SEO",
    image: "/images/articles/ai-keyword-research.webp",
    readTime: 11,
    date: "2025-05-02",
    isNew: false,
    tags: ["seo", "keywords", "research"]
  },
  {
    id: 21,
    slug: "what-is-computer-vision-uses-2025",
    title: "What Is Computer Vision? Top Uses in 2025",
    description: "Understand computer vision technology and its most impactful applications across industries in 2025.",
    category: "Fundamentals",
    image: "/images/articles/computer-vision.webp",
    readTime: 10,
    date: "2025-05-05",
    isNew: false,
    tags: ["computer vision", "image recognition", "applications"]
  },
  {
    id: 22,
    slug: "how-to-deploy-ai-models-cloud-2025",
    title: "How to Deploy AI Models on the Cloud: 2025 Guide",
    description: "Step-by-step instructions for deploying AI models on various cloud platforms in 2025.",
    category: "Technical",
    image: "/images/articles/cloud-deployment.webp",
    readTime: 13,
    date: "2025-05-07",
    isNew: false,
    tags: ["cloud", "deployment", "infrastructure"]
  },
  {
    id: 23,
    slug: "top-ai-trends-2025",
    title: "Top AI Trends to Watch in 2025: What's Next?",
    description: "Explore the emerging trends that will shape the artificial intelligence landscape in 2025 and beyond.",
    category: "Trends",
    image: "/images/articles/ai-trends-2025.webp",
    readTime: 9,
    date: "2025-05-10",
    isNew: false,
    tags: ["trends", "future", "innovation"]
  },
  {
    id: 24,
    slug: "how-to-use-ai-ecommerce-websites-2025",
    title: "How to Use AI for E-Commerce Websites in 2025",
    description: "Implement artificial intelligence to enhance customer experience and boost sales on e-commerce platforms.",
    category: "Business",
    image: "/images/articles/ai-ecommerce.webp",
    readTime: 12,
    date: "2025-05-12",
    isNew: false,
    tags: ["ecommerce", "sales", "customer experience"]
  },
  {
    id: 25,
    slug: "what-is-reinforcement-learning-basics-2025",
    title: "What Is Reinforcement Learning? AI Basics for 2025",
    description: "Learn about reinforcement learning algorithms and their applications in artificial intelligence systems.",
    category: "Fundamentals",
    image: "/images/articles/reinforcement-learning.webp",
    readTime: 11,
    date: "2025-05-14",
    isNew: false,
    tags: ["reinforcement learning", "algorithms", "training"]
  },
  
  // Additional 25 articles from Prompt 2
  {
    id: 26,
    slug: "how-to-automate-web-development-ai-2025",
    title: "How to Automate Web Development with AI in 2025",
    description: "Learn how to use artificial intelligence tools to streamline and automate your web development workflow.",
    category: "Development",
    image: "/images/articles/automate-web-dev.webp",
    readTime: 12,
    date: "2025-05-16",
    isNew: true,
    tags: ["automation", "development", "productivity"]
  },
  {
    id: 27,
    slug: "best-ai-tools-small-businesses-2025",
    title: "Best AI Tools for Small Businesses in 2025",
    description: "Discover affordable and effective AI solutions specifically designed for small business needs in 2025.",
    category: "Business",
    image: "/images/articles/small-business-ai.webp",
    readTime: 10,
    date: "2025-05-18",
    isNew: true,
    tags: ["small business", "tools", "affordable"]
  },
  {
    id: 28,
    slug: "how-to-use-ai-personalized-marketing-2025",
    title: "How to Use AI for Personalized Marketing in 2025",
    description: "Implement AI strategies to deliver highly personalized marketing campaigns that convert more effectively.",
    category: "Marketing",
    image: "/images/articles/personalized-marketing.webp",
    readTime: 11,
    date: "2025-05-20",
    isNew: true,
    tags: ["marketing", "personalization", "campaigns"]
  },
  {
    id: 29,
    slug: "what-is-ai-model-training-how-works-2025",
    title: "What Is AI Model Training? How It Works in 2025",
    description: "Understand the process of training AI models, from data preparation to fine-tuning and optimization.",
    category: "Technical",
    image: "/images/articles/model-training.webp",
    readTime: 14,
    date: "2025-05-22",
    isNew: true,
    tags: ["training", "models", "optimization"]
  },
  {
    id: 30,
    slug: "how-to-secure-ai-powered-websites-2025",
    title: "How to Secure AI-Powered Websites in 2025",
    description: "Learn essential security practices to protect AI-integrated websites from emerging cyber threats.",
    category: "Security",
    image: "/images/articles/secure-ai-websites.webp",
    readTime: 13,
    date: "2025-05-24",
    isNew: true,
    tags: ["security", "protection", "cyber threats"]
  },
  {
    id: 31,
    slug: "benefits-ai-web-development-2025",
    title: "Benefits of AI in Web Development: 2025 Insights",
    description: "Explore the key advantages of implementing artificial intelligence in modern web development projects.",
    category: "Development",
    image: "/images/articles/ai-dev-benefits.webp",
    readTime: 9,
    date: "2025-05-26",
    isNew: true,
    tags: ["benefits", "development", "innovation"]
  },
  {
    id: 32,
    slug: "how-to-use-ai-voice-search-optimization-2025",
    title: "How to Use AI for Voice Search Optimization in 2025",
    description: "Implement strategies to optimize your content for AI-powered voice search and virtual assistants.",
    category: "SEO",
    image: "/images/articles/voice-search-optimization.webp",
    readTime: 11,
    date: "2025-05-28",
    isNew: true,
    tags: ["voice search", "optimization", "virtual assistants"]
  },
  {
    id: 33,
    slug: "what-is-transfer-learning-techniques-2025",
    title: "What Is Transfer Learning? AI Techniques for 2025",
    description: "Understand how transfer learning works and its applications in building more efficient AI models.",
    category: "Fundamentals",
    image: "/images/articles/transfer-learning.webp",
    readTime: 12,
    date: "2025-05-30",
    isNew: true,
    tags: ["transfer learning", "efficiency", "techniques"]
  },
  {
    id: 34,
    slug: "how-to-test-ai-models-accuracy-2025",
    title: "How to Test AI Models for Accuracy: 2025 Guide",
    description: "Learn methodologies and best practices for evaluating and improving the accuracy of AI models.",
    category: "Technical",
    image: "/images/articles/model-testing.webp",
    readTime: 13,
    date: "2025-06-01",
    isNew: true,
    tags: ["testing", "accuracy", "evaluation"]
  },
  {
    id: 35,
    slug: "top-ai-frameworks-developers-2025",
    title: "Top AI Frameworks for Developers in 2025",
    description: "Compare the most powerful and user-friendly AI development frameworks available in 2025.",
    category: "Development",
    image: "/images/articles/ai-frameworks.webp",
    readTime: 10,
    date: "2025-06-03",
    isNew: true,
    tags: ["frameworks", "development", "tools"]
  },
  {
    id: 36,
    slug: "how-to-use-ai-website-personalization-2025",
    title: "How to Use AI for Website Personalization in 2025",
    description: "Implement AI solutions to deliver customized website experiences that boost engagement and conversions.",
    category: "UX/UI",
    image: "/images/articles/website-personalization.webp",
    readTime: 11,
    date: "2025-06-05",
    isNew: true,
    tags: ["personalization", "user experience", "conversion"]
  },
  {
    id: 37,
    slug: "what-is-ai-bias-how-avoid-2025",
    title: "What Is AI Bias? How to Avoid It in 2025",
    description: "Understand the causes of bias in artificial intelligence systems and learn strategies to prevent it.",
    category: "Ethics",
    image: "/images/articles/ai-bias.webp",
    readTime: 12,
    date: "2025-06-07",
    isNew: true,
    tags: ["bias", "ethics", "fairness"]
  },
  {
    id: 38,
    slug: "how-to-integrate-ai-wordpress-websites-2025",
    title: "How to Integrate AI with WordPress Websites in 2025",
    description: "Step-by-step guide to implementing various AI features on WordPress-based websites.",
    category: "Development",
    image: "/images/articles/wordpress-ai.webp",
    readTime: 10,
    date: "2025-06-09",
    isNew: true,
    tags: ["wordpress", "integration", "plugins"]
  },
  {
    id: 39,
    slug: "best-ai-tools-seo-audits-2025",
    title: "Best AI Tools for SEO Audits in 2025: Top Picks",
    description: "Discover the most effective AI-powered tools for conducting comprehensive SEO audits of your website.",
    category: "SEO",
    image: "/images/articles/seo-audit-tools.webp",
    readTime: 9,
    date: "2025-06-11",
    isNew: true,
    tags: ["seo", "audits", "tools"]
  },
  {
    id: 40,
    slug: "how-to-use-ai-predictive-analytics-2025",
    title: "How to Use AI for Predictive Analytics in 2025",
    description: "Implement artificial intelligence models to forecast trends and make data-driven business decisions.",
    category: "Analytics",
    image: "/images/articles/predictive-analytics.webp",
    readTime: 13,
    date: "2025-06-13",
    isNew: true,
    tags: ["predictive", "analytics", "forecasting"]
  },
  {
    id: 41,
    slug: "what-is-federated-learning-trends-2025",
    title: "What Is Federated Learning? AI Trends for 2025",
    description: "Understand federated learning and how it's revolutionizing AI model training while preserving privacy.",
    category: "Fundamentals",
    image: "/images/articles/federated-learning.webp",
    readTime: 12,
    date: "2025-06-15",
    isNew: true,
    tags: ["federated learning", "privacy", "distributed"]
  },
  {
    id: 42,
    slug: "how-to-optimize-website-speed-ai-2025",
    title: "How to Optimize Website Speed with AI in 2025",
    description: "Leverage artificial intelligence tools to identify and resolve website performance bottlenecks.",
    category: "Performance",
    image: "/images/articles/website-speed.webp",
    readTime: 10,
    date: "2025-06-17",
    isNew: true,
    tags: ["speed", "performance", "optimization"]
  },
  {
    id: 43,
    slug: "top-ai-use-cases-business-2025",
    title: "Top AI Use Cases in Business for 2025",
    description: "Explore the most impactful applications of artificial intelligence across various business functions.",
    category: "Business",
    image: "/images/articles/business-use-cases.webp",
    readTime: 11,
    date: "2025-06-19",
    isNew: true,
    tags: ["use cases", "business", "applications"]
  },
  {
    id: 44,
    slug: "how-to-use-ai-competitor-analysis-2025",
    title: "How to Use AI for Competitor Analysis in 2025",
    description: "Implement AI-powered strategies to gain deeper insights into your competitors' activities and strategies.",
    category: "Business",
    image: "/images/articles/competitor-analysis.webp",
    readTime: 12,
    date: "2025-06-21",
    isNew: true,
    tags: ["competitor", "analysis", "strategy"]
  },
  {
    id: 45,
    slug: "what-is-explainable-ai-why-matters-2025",
    title: "What Is Explainable AI? Why It Matters in 2025",
    description: "Understand the importance of transparency in AI decision-making and implementation strategies.",
    category: "Ethics",
    image: "/images/articles/explainable-ai.webp",
    readTime: 13,
    date: "2025-06-23",
    isNew: true,
    tags: ["explainable", "transparency", "trust"]
  },
  {
    id: 46,
    slug: "how-to-use-ai-ab-testing-websites-2025",
    title: "How to Use AI for A/B Testing Websites in 2025",
    description: "Apply artificial intelligence to enhance your A/B testing workflow and gain more accurate insights.",
    category: "Analytics",
    image: "/images/articles/ab-testing.webp",
    readTime: 10,
    date: "2025-06-25",
    isNew: true,
    tags: ["ab testing", "optimization", "conversion"]
  },
  {
    id: 47,
    slug: "best-ai-tools-content-optimization-2025",
    title: "Best AI Tools for Content Optimization in 2025",
    description: "Discover the top AI-powered tools for enhancing content quality, SEO, and reader engagement.",
    category: "Content",
    image: "/images/articles/content-optimization-tools.webp",
    readTime: 9,
    date: "2025-06-27",
    isNew: true,
    tags: ["content", "optimization", "tools"]
  },
  {
    id: 48,
    slug: "how-to-scale-ai-solutions-businesses-2025",
    title: "How to Scale AI Solutions for Businesses in 2025",
    description: "Learn strategies for effectively expanding AI implementations from pilot projects to enterprise-wide deployments.",
    category: "Business",
    image: "/images/articles/scale-ai-solutions.webp",
    readTime: 14,
    date: "2025-06-29",
    isNew: true,
    tags: ["scaling", "enterprise", "implementation"]
  },
  {
    id: 49,
    slug: "what-is-edge-ai-benefits-uses-2025",
    title: "What Is Edge AI? Benefits and Uses in 2025",
    description: "Understand edge computing for AI and its advantages for real-time applications with reduced latency.",
    category: "Technology",
    image: "/images/articles/edge-ai.webp",
    readTime: 11,
    date: "2025-07-01",
    isNew: true,
    tags: ["edge", "iot", "real-time"]
  },
  {
    id: 50,
    slug: "how-to-use-ai-local-seo-optimization-2025",
    title: "How to Use AI for Local SEO Optimization in 2025",
    description: "Implement AI strategies to improve your business's visibility in local search results and map listings.",
    category: "SEO",
    image: "/images/articles/local-seo.webp",
    readTime: 10,
    date: "2025-07-03",
    isNew: true,
    tags: ["local seo", "maps", "geotargeting"]
  }
];

// Categories for filtering
const categories = [
  { value: "all", label: "All Categories" },
  { value: "fundamentals", label: "Fundamentals" },
  { value: "development", label: "Development" },
  { value: "learning", label: "Learning" },
  { value: "tools", label: "Tools & Software" },
  { value: "ethics", label: "Ethics & Society" },
  { value: "business", label: "Business Applications" },
  { value: "seo", label: "SEO" },
  { value: "technical", label: "Technical" },
  { value: "analytics", label: "Analytics" },
  { value: "content", label: "Content" },
  { value: "security", label: "Security" },
  { value: "marketing", label: "Marketing" },
  { value: "performance", label: "Performance" },
  { value: "ux/ui", label: "UX/UI" }
];

// Popular authors for author filtering
const authors = [
  { id: 1, name: "Dr. Alex Morgan", title: "AI Research Director", image: "/images/team/alex-morgan.webp" },
  { id: 2, name: "Sarah Chen", title: "Web Development Lead", image: "/images/team/sarah-chen.webp" },
  { id: 3, name: "James Wilson", title: "SEO Specialist", image: "/images/team/james-wilson.webp" },
  { id: 4, name: "Dr. Maya Patel", title: "Ethics Researcher", image: "/images/team/maya-patel.webp" },
  { id: 5, name: "David Kim", title: "Data Scientist", image: "/images/team/david-kim.webp" }
];

// Trending tags for tag cloud
const trendingTags = [
  "AI Tools", "Machine Learning", "Neural Networks", "Data Science", 
  "Web Development", "GPT", "Computer Vision", "NLP", 
  "Web3", "Python", "Deep Learning", "Automation",
  "Chatbots", "SEO", "Voice Search", "Edge AI"
];

// Article placeholder image (gradient with icon)
const ArticleImage = ({ category }: { category: string }) => {
  const getIcon = () => {
    switch(category.toLowerCase()) {
      case 'fundamentals':
        return <Brain className="h-10 w-10 text-white/70" />;
      case 'development':
        return <Code className="h-10 w-10 text-white/70" />;
      case 'learning':
        return <BookOpen className="h-10 w-10 text-white/70" />;
      case 'tools':
        return <Terminal className="h-10 w-10 text-white/70" />;
      case 'business':
        return <Database className="h-10 w-10 text-white/70" />;
      default:
        return <Bot className="h-10 w-10 text-white/70" />;
    }
  };

  return (
    <div className="h-[200px] bg-gradient-to-br from-indigo-700/40 via-blue-800/40 to-indigo-900/40 w-full rounded-t-lg flex items-center justify-center">
      {getIcon()}
    </div>
  );
};

const ArticlesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [page, setPage] = useState(1);
  const articlesPerPage = 12;
  
  // Handle voice search
  const startVoiceSearch = () => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsVoiceSearchActive(true);
      
      // In a real implementation, we'd use the Web Speech API
      // For this demo, we'll simulate with a timeout
      setTimeout(() => {
        setIsVoiceSearchActive(false);
        setSearchQuery('artificial intelligence');
      }, 2000);
    } else {
      alert('Voice search is not supported in your browser');
    }
  };
  
  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !showExitPopup && !localStorage.getItem('exitPopupShown')) {
        setShowExitPopup(true);
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showExitPopup]);
  
  // Handle closing exit popup and set cookie
  const closeExitPopup = () => {
    setShowExitPopup(false);
    localStorage.setItem('exitPopupShown', 'true');
  };
  
  // Filter articles based on search query, category, author, and tag
  const filteredArticles = articlesData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesAuthor = selectedAuthor === null || article.id % 5 === selectedAuthor % 5; // Simulated author matching
    
    const matchesTag = selectedTag === null || 
                      (article.tags && article.tags.some(tag => 
                        tag.toLowerCase() === selectedTag.toLowerCase() || 
                        selectedTag.toLowerCase().includes(tag.toLowerCase())
                      ));
    
    return matchesSearch && matchesCategory && matchesAuthor && matchesTag;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const paginatedArticles = filteredArticles.slice(
    (page - 1) * articlesPerPage,
    page * articlesPerPage
  );

  return (
    <div className="container max-w-7xl py-12">
      <Helmet>
        <title>AI Articles & Tutorials | RXAI - Rollins X Technologies</title>
        <meta name="description" content="Explore our collection of in-depth articles and tutorials about artificial intelligence, machine learning, development, and ethical considerations." />
      </Helmet>

      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary font-medium">Articles</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              AI Articles & Tutorials
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Expert guides and educational content to help you understand and implement artificial intelligence in your projects.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {/* Trending Tags Cloud */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <Badge 
              key={tag} 
              variant={selectedTag === tag ? "default" : "outline"}
              className={`
                cursor-pointer hover:bg-primary/20 hover:text-primary 
                ${selectedTag === tag ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary border-primary/20'}
              `}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Voice Search Button */}
          <button 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors ${isVoiceSearchActive ? 'text-primary animate-pulse' : ''}`}
            onClick={startVoiceSearch}
            aria-label="Search by voice"
          >
            {isVoiceSearchActive ? (
              <div className="flex items-center justify-center w-4 h-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              </div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            )}
          </button>
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
          <span className="text-sm text-muted-foreground mr-2 hidden md:block">Filter by:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Author Filters */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Authors</h3>
        <div className="flex flex-wrap gap-3">
          {authors.map((author) => (
            <div 
              key={author.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all
                ${selectedAuthor === author.id 
                  ? 'bg-primary/20 border border-primary/30' 
                  : 'bg-muted/30 border border-transparent hover:bg-primary/10'}
              `}
              onClick={() => setSelectedAuthor(selectedAuthor === author.id ? null : author.id)}
            >
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden text-xs font-bold">
                {author.name.charAt(0)}
              </div>
              <span className="text-sm">{author.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">
            {filteredArticles.length === 0 ? 
              'No articles found' : 
              `Showing ${Math.min(articlesPerPage, filteredArticles.length)} of ${filteredArticles.length} articles`}
          </h2>
          
          {/* Clear filters button */}
          {(searchQuery || selectedCategory !== 'all' || selectedAuthor !== null || selectedTag !== null) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAuthor(null);
                setSelectedTag(null);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        <Separator className="mt-4" />
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map(article => (
              <Card key={article.id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg relative">
                {/* New badge for recent articles */}
                {article.isNew && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">New</Badge>
                  </div>
                )}
                
                {/* Placeholder for image - in production, would use actual images */}
                <ArticleImage category={article.category} />
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {article.category}
                    </Badge>
                    
                    {/* Display first tag if exists */}
                    {article.tags && article.tags.length > 0 && (
                      <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-muted/30">
                        {article.tags[0]}
                      </Badge>
                    )}
                  </div>
                  
                  <Link href={`/articles/${article.slug}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-muted-foreground border-t">
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.readTime} min read
                    </span>
                  </div>
                  
                  <Link href={`/articles/${article.slug}`}>
                    <Button className="w-full mt-4 gap-2">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button 
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    className="w-8 h-8 p-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 
              `We couldn't find any articles matching "${searchQuery}".` : 
              "No articles match the selected filters."
            }
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedAuthor(null);
            setSelectedTag(null);
          }}>
            Clear Filters
          </Button>
        </div>
      )}
      
      {/* Exit Intent Popup for trial signup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-0">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2" 
              onClick={closeExitPopup}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Wait! Try RXAI For Free
              </h2>
              <p className="text-muted-foreground mb-4">
                Start your free 7-day trial and unlock access to all our premium articles, AI courses, and digital tools.
              </p>
              
              <div className="flex items-center justify-center mb-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited access to all articles
                  </li>
                  <li className="flex items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Premium AI course content
                  </li>
                  <li className="flex items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-primary">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced AI productivity tools
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Link href="/subscriptions">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Button variant="ghost" onClick={closeExitPopup}>
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;