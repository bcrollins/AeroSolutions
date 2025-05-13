import type { AiProduct } from '@/types';

// Mock AI Products for development
const aiProductsData: AiProduct[] = [
  {
    id: 1,
    slug: 'prompt-engineering-toolkit',
    name: 'Prompt Engineering Toolkit',
    category: 'content-creation',
    description: 'Powerful prompt engineering tools to craft the perfect AI prompts for any use case. Includes templates, analyzers, and optimization tools.',
    shortDescription: 'Master the art of prompt engineering with our comprehensive toolkit',
    detailedDescription: 'Our Prompt Engineering Toolkit provides everything you need to create effective prompts for AI systems. It includes a prompt analyzer, template library, optimization tools, and performance metrics to help you get the most out of generative AI models. Perfect for content creators, marketers, and AI practitioners looking to improve their results.',
    features: [
      'Prompt analyzer with readability metrics',
      'Template library with 200+ proven templates',
      'A/B testing for prompt optimization',
      'Prompt history and version control',
      'Export and share capabilities',
      'Integration with popular AI models'
    ],
    useCases: [
      'Content generation for marketing teams',
      'Instructional design and educational prompts',
      'Customer service AI training',
      'Product descriptions and e-commerce',
      'Creative writing assistance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1526378800651-c5b56580487e',
    pricing: 'Included in Professional & Enterprise',
    requiredPlan: 'professional',
    apiCredits: 5000,
    usageLimit: 100,
    isPopular: true,
    tags: ['prompt-engineering', 'content', 'optimization', 'ai-tools'],
    technicalSpecs: {
      'Supported Models': 'GPT-4o, Claude, Mistral, Grok-2',
      'Input Format': 'Text, JSON, CSV',
      'Output Format': 'Text, JSON, Markdown',
      'API Integrations': 'OpenAI, Anthropic, X.AI, HuggingFace',
      'Response Time': '<500ms'
    }
  },
  {
    id: 2,
    slug: 'content-optimization-suite',
    name: 'Content Optimization Suite',
    category: 'marketing',
    description: 'AI-powered content analysis and optimization for SEO, readability, and engagement. Perfect for content marketers and digital strategists.',
    shortDescription: 'Optimize your content for maximum impact and reach',
    detailedDescription: 'The Content Optimization Suite uses advanced AI algorithms to analyze and enhance your content across multiple dimensions. From SEO optimization to readability improvements and engagement boosting, this suite provides actionable insights and automated enhancements to make your content perform better. Includes keyword analysis, competitor content benchmarking, and real-time recommendations.',
    features: [
      'SEO analysis with keyword recommendations',
      'Readability scoring and improvement suggestions',
      'Sentiment analysis and emotional impact assessment',
      'Engagement prediction based on AI models',
      'Competitor content benchmarking',
      'Automated content enhancement'
    ],
    useCases: [
      'Blog post optimization for higher search rankings',
      'Marketing material improvement for better conversion',
      'Social media content optimization for engagement',
      'Product description enhancement for e-commerce',
      'Email marketing content optimization'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
    pricing: 'Included in Professional & Enterprise',
    requiredPlan: 'professional',
    apiCredits: 10000,
    usageLimit: 250,
    tags: ['seo', 'content-marketing', 'optimization', 'engagement'],
    technicalSpecs: {
      'Analysis Algorithms': 'NLP, TF-IDF, BERT',
      'Data Sources': 'Google Search, Social Media APIs, Industry Benchmarks',
      'Optimization Targets': 'Search Engines, Social Platforms, Email Clients',
      'Processing Capacity': '100,000 words per analysis',
      'Update Frequency': 'Weekly algorithm updates'
    }
  },
  {
    id: 3,
    slug: 'ai-business-intelligence-dashboard',
    name: 'AI Business Intelligence Dashboard',
    category: 'analytics',
    description: 'Comprehensive business analytics platform powered by AI. Transforms your data into actionable insights with automated reporting and predictive analytics.',
    shortDescription: 'Turn your business data into strategic insights',
    detailedDescription: 'The AI Business Intelligence Dashboard is a sophisticated analytics platform that leverages artificial intelligence to transform raw business data into strategic insights. The dashboard automatically processes data from multiple sources, identifies patterns and trends, and presents actionable recommendations through an intuitive interface. Features include predictive analytics, anomaly detection, custom reporting, and integration with your existing business systems.',
    features: [
      'Automated data processing and cleaning',
      'AI-powered predictive analytics',
      'Anomaly detection and alerts',
      'Custom report generation',
      'Multi-source data integration',
      'Interactive visualization tools',
      'Recommendation engine for business decisions'
    ],
    useCases: [
      'Sales forecasting and pipeline analysis',
      'Financial performance monitoring',
      'Customer behavior analysis',
      'Operational efficiency optimization',
      'Market trend identification',
      'Risk assessment and management'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    pricing: 'Included in Enterprise Plan',
    requiredPlan: 'enterprise',
    apiCredits: 25000,
    usageLimit: 500,
    tags: ['business-intelligence', 'analytics', 'dashboard', 'predictive'],
    technicalSpecs: {
      'Data Processing Capacity': '100GB per day',
      'Supported Data Sources': 'CRM, ERP, CSV, SQL, NoSQL, APIs',
      'Prediction Models': 'ARIMA, Prophet, XGBoost, Neural Networks',
      'Accuracy Range': '85-95% for predictive models',
      'Security': 'SOC 2 Type II, GDPR Compliant',
      'API Integration': 'REST API, GraphQL'
    }
  },
  {
    id: 4,
    slug: 'ai-strategy-accelerator',
    name: 'AI Strategy Accelerator',
    category: 'strategy',
    description: 'Develop and implement your AI strategy with our comprehensive planning, implementation, and measurement toolkit. From assessment to deployment.',
    shortDescription: 'Accelerate your organization\'s AI transformation',
    detailedDescription: 'The AI Strategy Accelerator is a comprehensive solution designed to help organizations develop and implement effective AI strategies. Built by experts in artificial intelligence and business transformation, this tool guides you through every stage of AI adoption: from initial assessment and opportunity identification to strategy formulation, implementation planning, and ROI measurement. It provides customized roadmaps, implementation frameworks, and readiness assessments tailored to your industry and organization size.',
    features: [
      'AI Readiness Assessment Tools',
      'Opportunity Identification Framework',
      'Strategy Blueprint Generator',
      'Implementation Roadmap Builder',
      'ROI Calculator and Measurement Framework',
      'Risk Assessment and Mitigation Planning',
      'Technology Stack Recommendation Engine',
      'Change Management Toolkit'
    ],
    useCases: [
      'Digital transformation planning for enterprises',
      'AI adoption strategy for mid-sized businesses',
      'Technology investment planning for C-suite',
      'Data strategy development for organizations',
      'Innovation roadmap creation for product teams',
      'Competitive advantage analysis for strategy teams'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5',
    pricing: 'Included in Enterprise Plan',
    requiredPlan: 'enterprise',
    apiCredits: 15000,
    usageLimit: 100,
    isPopular: true,
    isNew: true,
    tags: ['strategy', 'ai-planning', 'implementation', 'transformation'],
    technicalSpecs: {
      'Assessment Frameworks': 'Custom AI Maturity Models, Industry Benchmarks',
      'Strategy Models': 'Proprietary AI Strategy Canvas, Transformation Roadmap',
      'Resource Calculator': 'Budget, Timeline, Team Size Estimators',
      'Industries Covered': '27 industries with specialized assessments',
      'Compliance': 'Addresses regulatory requirements for AI implementation'
    },
    relatedProducts: [
      {
        id: 3,
        slug: 'ai-business-intelligence-dashboard',
        name: 'AI Business Intelligence Dashboard',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
      },
      {
        id: 10,
        slug: 'ai-governance-framework',
        name: 'AI Governance Framework',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40'
      }
    ]
  },
  {
    id: 5,
    slug: 'market-analysis-engine',
    name: 'Market Analysis Engine',
    category: 'marketing',
    description: 'AI-powered market analysis tool that provides real-time insights into market trends, competitor strategies, and consumer behavior.',
    shortDescription: 'Gain competitive advantage with real-time market insights',
    detailedDescription: 'The Market Analysis Engine is a sophisticated tool that leverages artificial intelligence to analyze market data from multiple sources in real-time. It offers comprehensive insights into market trends, competitor activities, consumer behavior patterns, and emerging opportunities. This powerful engine processes data from social media, news sources, financial reports, consumer reviews, and proprietary databases to provide a holistic view of your market landscape, helping you make data-driven strategic decisions.',
    features: [
      'Real-time market trend analysis',
      'Competitor strategy mapping',
      'Consumer sentiment tracking',
      'Opportunity identification algorithms',
      'Customizable alert system',
      'Interactive visualization dashboards',
      'Industry benchmark comparisons'
    ],
    useCases: [
      'Competitive intelligence gathering',
      'Product launch planning',
      'Market entry strategy development',
      'Brand positioning optimization',
      'Investment opportunity analysis',
      'Risk assessment for market shifts'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    pricing: 'Included in Professional & Enterprise',
    requiredPlan: 'professional',
    apiCredits: 12000,
    usageLimit: 300,
    tags: ['market-analysis', 'competitive-intelligence', 'trends', 'strategy'],
    technicalSpecs: {
      'Data Sources': '50+ global data sources, 200K+ publications monitored',
      'Analysis Frequency': 'Real-time to daily updates',
      'Historical Data': '10 years of historical market data',
      'Industries Covered': 'All major industries with specialized focus available',
      'Data Visualization': 'Interactive charts, heatmaps, networks, and custom views'
    }
  },
  {
    id: 6,
    slug: 'ai-content-generator',
    name: 'AI Content Generator',
    category: 'content-creation',
    description: 'Advanced AI content generation platform with industry-specific templates, brand voice customization, and multi-format output capabilities.',
    shortDescription: 'Create professional content at scale with AI assistance',
    detailedDescription: 'The AI Content Generator is a sophisticated platform that creates high-quality content across multiple formats and industries. Powered by the latest large language models, it goes beyond basic text generation by incorporating your brand voice, industry context, and specific goals. Whether you need blog posts, product descriptions, social media content, or marketing copy, this tool delivers professional-grade content that resonates with your audience while maintaining your brand identity.',
    features: [
      'Industry-specific content templates',
      'Brand voice customization and learning',
      'Multi-format output (blog, social, email, ad copy)',
      'SEO-optimized content generation',
      'Fact-checking and citation capabilities',
      'Content performance prediction',
      'Multilingual support (40+ languages)'
    ],
    useCases: [
      'Marketing content creation at scale',
      'Product description generation for e-commerce',
      'Social media content calendar fulfillment',
      'Blog and article creation for publishers',
      'Email marketing campaign content',
      'Technical documentation generation'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32',
    pricing: 'Included in Starter+ Plans',
    requiredPlan: 'starter',
    apiCredits: 3000,
    usageLimit: 200,
    isPopular: true,
    tags: ['content-generation', 'writing', 'marketing', 'copy'],
    technicalSpecs: {
      'AI Models': 'GPT-4o, Claude Opus, proprietary fine-tuned models',
      'Maximum Output': '10,000 words per generation',
      'Response Time': '<5 seconds for most content types',
      'Training Data': 'Current to 2024 with domain-specific knowledge',
      'Format Support': 'Text, HTML, Markdown, Word, PDF output'
    }
  },
  {
    id: 7,
    slug: 'ai-customer-insights-platform',
    name: 'AI Customer Insights Platform',
    category: 'analytics',
    description: 'Comprehensive customer analytics platform that combines AI-powered sentiment analysis, behavior tracking, and predictive modeling to understand customers deeply.',
    shortDescription: 'Understand your customers like never before',
    detailedDescription: 'The AI Customer Insights Platform is a powerful analytics solution that provides unprecedented understanding of your customers by analyzing data across multiple touchpoints. Using advanced AI algorithms, it processes customer interactions, feedback, purchasing behavior, and demographic information to create comprehensive customer profiles. The platform identifies patterns, predicts future behaviors, and segments your audience in meaningful ways, enabling truly personalized experiences and informed business strategies.',
    features: [
      'Unified customer data profiles',
      'Sentiment analysis across all channels',
      'Behavioral pattern recognition',
      'Predictive customer lifetime value modeling',
      'Automated segmentation and persona generation',
      'Churn prediction and prevention',
      'Customer journey mapping',
      'Voice of customer analysis'
    ],
    useCases: [
      'Customer experience optimization',
      'Personalization strategy development',
      'Product development based on customer insights',
      'Marketing campaign targeting and optimization',
      'Customer service improvement',
      'Loyalty program enhancement'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093',
    pricing: 'Included in Professional & Enterprise',
    requiredPlan: 'professional',
    apiCredits: 20000,
    usageLimit: 400,
    tags: ['customer-analytics', 'insights', 'behavior', 'segmentation'],
    technicalSpecs: {
      'Data Processing': 'Handles millions of customer interactions',
      'Integration Capability': 'CRM, eCommerce, support systems, survey tools',
      'Analysis Models': 'Sentiment, behavioral, predictive, segmentation',
      'Compliance': 'GDPR, CCPA, SOC 2 compliant',
      'Reporting': 'Real-time dashboards, scheduled reports, alerts'
    }
  },
  {
    id: 8,
    slug: 'automated-marketing-assistant',
    name: 'Automated Marketing Assistant',
    category: 'marketing',
    description: 'AI marketing assistant that automates campaign planning, execution, and optimization across multiple channels and platforms.',
    shortDescription: 'Your AI marketing department in one platform',
    detailedDescription: 'The Automated Marketing Assistant is a comprehensive AI-powered platform that streamlines and enhances your marketing operations. It functions as a virtual marketing department, handling tasks from campaign planning and content creation to execution, analysis, and optimization. Using machine learning algorithms trained on successful marketing strategies, it provides data-driven recommendations, automates routine tasks, and continuously optimizes your marketing efforts based on performance data.',
    features: [
      'Cross-channel campaign planning',
      'AI-generated marketing content',
      'Automated campaign execution',
      'Real-time performance monitoring',
      'A/B testing automation',
      'Budget optimization algorithms',
      'Competitor campaign analysis',
      'Predictive marketing analytics'
    ],
    useCases: [
      'Digital marketing campaign management',
      'Social media marketing automation',
      'Email marketing optimization',
      'Paid advertising management',
      'Content marketing coordination',
      'Integrated marketing campaigns'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07',
    pricing: 'Included in Professional & Enterprise',
    requiredPlan: 'professional',
    apiCredits: 15000,
    usageLimit: 350,
    tags: ['marketing-automation', 'campaigns', 'optimization', 'multi-channel'],
    technicalSpecs: {
      'Supported Platforms': 'Social media, email, PPC, content, web, mobile',
      'Automation Capability': 'Planning, execution, monitoring, optimization',
      'Integration Options': 'Marketing tools, CRM, analytics platforms',
      'Learning Rate': 'Improves 30% month-over-month with active use',
      'Analysis Speed': 'Real-time to daily updates'
    }
  },
  {
    id: 9,
    slug: 'product-development-ai',
    name: 'Product Development AI',
    category: 'product',
    description: 'AI-assisted product development platform that accelerates ideation, prototyping, testing, and launch processes with predictive analytics and automation.',
    shortDescription: 'Accelerate your product innovation cycle',
    detailedDescription: 'The Product Development AI is a sophisticated platform designed to revolutionize the product development process. It combines artificial intelligence, data analytics, and automation to accelerate every phase from ideation to market launch. By analyzing market trends, consumer preferences, and competitive landscapes, it helps identify high-potential product opportunities. The platform then assists with concept development, prototype design, testing methodologies, and launch strategies, significantly reducing development time and increasing success rates.',
    features: [
      'AI-powered market opportunity identification',
      'Concept evaluation and refinement tools',
      'Virtual prototyping and simulation',
      'Automated user testing and feedback analysis',
      'Feature prioritization algorithms',
      'Go-to-market strategy development',
      'Success prediction modeling',
      'Product lifecycle management'
    ],
    useCases: [
      'New product development acceleration',
      'Product improvement and iteration',
      'Market fit validation',
      'Feature prioritization for development teams',
      'Product portfolio optimization',
      'Competitive product differentiation'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e',
    pricing: 'Included in Enterprise Plan',
    requiredPlan: 'enterprise',
    apiCredits: 30000,
    usageLimit: 200,
    isNew: true,
    tags: ['product-development', 'innovation', 'prototyping', 'market-fit'],
    technicalSpecs: {
      'Development Frameworks': 'Agile, Design Thinking, Lean Product Development',
      'Simulation Capabilities': '3D modeling, user interaction, market reception',
      'Testing Tools': 'A/B, multivariate, user acceptance, market validation',
      'Data Sources': 'Market research, customer feedback, sales data, trends',
      'Integration Options': 'PLM, design tools, project management systems'
    }
  },
  {
    id: 10,
    slug: 'ai-governance-framework',
    name: 'AI Governance Framework',
    category: 'compliance',
    description: 'Comprehensive AI governance solution that ensures ethical AI use, regulatory compliance, and risk management for enterprise AI implementations.',
    shortDescription: 'Ensure responsible and compliant AI deployment',
    detailedDescription: 'The AI Governance Framework is a robust solution designed to help organizations implement and manage artificial intelligence responsibly. As AI becomes increasingly integrated into business operations, this framework addresses the critical challenges of ethics, transparency, compliance, and risk management. It provides structured processes, policies, and tools to govern AI systems throughout their lifecycle, from development and deployment to monitoring and retirement, ensuring alignment with regulatory requirements and organizational values.',
    features: [
      'AI ethics policy development tools',
      'Regulatory compliance monitoring',
      'Automated AI risk assessment',
      'Bias detection and mitigation',
      'Explainability and transparency frameworks',
      'AI documentation and auditability',
      'Ethical review workflow management',
      'Ongoing monitoring and reporting'
    ],
    useCases: [
      'Enterprise AI governance implementation',
      'Regulatory compliance management',
      'Ethical AI deployment',
      'AI risk mitigation for sensitive applications',
      'Building stakeholder trust in AI systems',
      'Preparation for AI audits and certification'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    pricing: 'Included in Enterprise Plan',
    requiredPlan: 'enterprise',
    apiCredits: 10000,
    usageLimit: 150,
    tags: ['governance', 'compliance', 'ethics', 'risk-management'],
    technicalSpecs: {
      'Compliance Coverage': 'EU AI Act, GDPR, NIST, ISO, industry-specific',
      'Assessment Methods': 'OECD principles, IEEE standards, proprietary frameworks',
      'Documentation': 'Model cards, data sheets, impact assessments',
      'Monitoring': 'Drift detection, performance variance, usage patterns',
      'Security': 'Enterprise-grade encryption, access controls, audit logs'
    },
    relatedProducts: [
      {
        id: 4,
        slug: 'ai-strategy-accelerator',
        name: 'AI Strategy Accelerator',
        imageUrl: 'https://images.unsplash.com/photo-1507608158173-1dcec673a2e5'
      }
    ]
  }
];

/**
 * Get all AI products
 * @returns Array of AI products
 */
export function getAllAiProducts(): AiProduct[] {
  return aiProductsData;
}

/**
 * Get a specific AI product by slug
 * @param slug The product slug
 * @returns The product or undefined if not found
 */
export function getAiProductBySlug(slug: string): AiProduct | undefined {
  return aiProductsData.find(product => product.slug === slug);
}

/**
 * Get AI products by category
 * @param category The category to filter by
 * @returns Array of filtered products
 */
export function getAiProductsByCategory(category: string): AiProduct[] {
  return aiProductsData.filter(product => product.category === category);
}

/**
 * Get AI products by required subscription plan level
 * @param plan The plan level to filter by
 * @returns Array of filtered products
 */
export function getAiProductsByPlan(plan: string): AiProduct[] {
  return aiProductsData.filter(product => product.requiredPlan === plan);
}

/**
 * Check if a user can access a product based on their subscription level
 * @param requiredPlan The plan level required by the product
 * @param userPlan The user's current subscription plan
 * @returns Boolean indicating if the user has access
 */
export function canAccessProduct(requiredPlan: string, userPlan: string): boolean {
  // Plan hierarchy: starter < professional < enterprise
  if (requiredPlan === 'starter') {
    // Starter products are accessible to all plan levels
    return ['starter', 'professional', 'enterprise'].includes(userPlan);
  } else if (requiredPlan === 'professional') {
    // Professional products are accessible to professional and enterprise plans
    return ['professional', 'enterprise'].includes(userPlan);
  } else if (requiredPlan === 'enterprise') {
    // Enterprise products are only accessible to enterprise plans
    return userPlan === 'enterprise';
  }
  
  // Default to false for unknown plan types
  return false;
}

export default aiProductsData;