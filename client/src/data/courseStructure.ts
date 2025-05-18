// Comprehensive AI course structure

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  lessons: Lesson[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  contentType: 'video' | 'text' | 'interactive' | 'quiz' | 'project';
  resources?: Resource[];
  isPreview?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'link' | 'dataset' | 'notebook';
  url: string;
  isRequired: boolean;
}

export const aiCourseStructure: CourseModule[] = [
  {
    id: "module-1",
    title: "Foundations of Artificial Intelligence",
    description: "Establish a solid understanding of AI fundamentals, including the history, key concepts, and modern applications that are transforming industries.",
    durationHours: 8,
    skillLevel: "beginner",
    learningOutcomes: [
      "Understand the historical development of AI and its major paradigms",
      "Identify the differences between AI, machine learning, and deep learning",
      "Recognize various types of AI systems and their appropriate applications",
      "Evaluate ethical considerations in AI system development and deployment"
    ],
    lessons: [
      {
        id: "lesson-1-1",
        title: "The Evolution of Artificial Intelligence",
        description: "From the Dartmouth Conference to modern systems, examine how AI has evolved and the key breakthroughs that shaped the field.",
        durationMinutes: 45,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-1-1-1",
            title: "AI Timeline Infographic",
            type: "pdf",
            url: "/resources/ai-timeline.pdf",
            isRequired: false
          },
          {
            id: "resource-1-1-2",
            title: "Early AI Systems Overview",
            type: "pdf",
            url: "/resources/early-ai-systems.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-1-2",
        title: "Key Concepts and Terminology",
        description: "Master the essential vocabulary and concepts that form the foundation of AI discourse and understanding.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-1-2-1",
            title: "AI Glossary",
            type: "pdf",
            url: "/resources/ai-glossary.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-1-3",
        title: "Types of AI Systems",
        description: "Explore the spectrum from narrow to general AI, and understand the capabilities and limitations of each type.",
        durationMinutes: 50,
        contentType: "video",
        resources: [
          {
            id: "resource-1-3-1",
            title: "AI Systems Comparison Chart",
            type: "pdf",
            url: "/resources/ai-systems-comparison.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-1-4",
        title: "Modern AI Applications",
        description: "Discover how AI is transforming various industries today, from healthcare to finance to transportation.",
        durationMinutes: 55,
        contentType: "video",
        resources: [
          {
            id: "resource-1-4-1",
            title: "Case Studies Collection",
            type: "pdf",
            url: "/resources/ai-case-studies.pdf",
            isRequired: false
          }
        ]
      },
      {
        id: "lesson-1-5",
        title: "Ethical Considerations in AI",
        description: "Examine the ethical challenges posed by AI development and use, including bias, privacy, and job displacement.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-1-5-1",
            title: "AI Ethics Framework",
            type: "pdf",
            url: "/resources/ai-ethics-framework.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-1-6",
        title: "Foundation Module Assessment",
        description: "Demonstrate your understanding of AI fundamentals with this comprehensive quiz.",
        durationMinutes: 30,
        contentType: "quiz"
      }
    ]
  },
  {
    id: "module-2",
    title: "Machine Learning Essentials",
    description: "Dive into the core of modern AI by mastering the principles of machine learning, from basic algorithms to evaluation methods.",
    durationHours: 12,
    skillLevel: "beginner",
    prerequisites: ["Completion of Module 1"],
    learningOutcomes: [
      "Differentiate between supervised, unsupervised, and reinforcement learning",
      "Implement basic machine learning algorithms for classification and regression tasks",
      "Evaluate model performance using appropriate metrics and validation techniques",
      "Prepare and preprocess data for machine learning applications"
    ],
    lessons: [
      {
        id: "lesson-2-1",
        title: "Introduction to Machine Learning",
        description: "Understand what makes machine learning distinct from traditional programming and the key paradigms in the field.",
        durationMinutes: 50,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-2-1-1",
            title: "ML Paradigms Comparison",
            type: "pdf",
            url: "/resources/ml-paradigms.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-2",
        title: "Supervised Learning Fundamentals",
        description: "Explore classification and regression tasks and the algorithms that solve them.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-2-2-1",
            title: "Common Supervised Algorithms",
            type: "pdf",
            url: "/resources/supervised-algorithms.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-3",
        title: "Hands-on: Building a Simple Classifier",
        description: "Apply supervised learning to create a practical classification model from scratch.",
        durationMinutes: 90,
        contentType: "interactive",
        resources: [
          {
            id: "resource-2-3-1",
            title: "Classifier Starter Code",
            type: "code",
            url: "/resources/classifier-starter.py",
            isRequired: true
          },
          {
            id: "resource-2-3-2",
            title: "Sample Dataset",
            type: "dataset",
            url: "/resources/classification-dataset.csv",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-4",
        title: "Unsupervised Learning Techniques",
        description: "Learn how algorithms can find patterns in data without labeled examples.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-2-4-1",
            title: "Clustering Algorithms Overview",
            type: "pdf",
            url: "/resources/clustering-algorithms.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-5",
        title: "Introduction to Reinforcement Learning",
        description: "Discover how agents learn through interaction with environments and feedback loops.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-2-5-1",
            title: "RL Framework Diagram",
            type: "pdf",
            url: "/resources/rl-framework.pdf",
            isRequired: false
          }
        ]
      },
      {
        id: "lesson-2-6",
        title: "Data Preparation and Feature Engineering",
        description: "Master the critical steps of preparing data for machine learning to improve model performance.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-2-6-1",
            title: "Feature Engineering Techniques",
            type: "pdf",
            url: "/resources/feature-engineering.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-7",
        title: "Model Evaluation and Validation",
        description: "Learn to properly evaluate machine learning models to ensure they generalize well to new data.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-2-7-1",
            title: "Evaluation Metrics Cheat Sheet",
            type: "pdf",
            url: "/resources/evaluation-metrics.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-8",
        title: "Machine Learning Project",
        description: "Apply your knowledge to a real-world problem in this guided project.",
        durationMinutes: 120,
        contentType: "project",
        resources: [
          {
            id: "resource-2-8-1",
            title: "Project Specification",
            type: "pdf",
            url: "/resources/ml-project-spec.pdf",
            isRequired: true
          },
          {
            id: "resource-2-8-2",
            title: "Project Dataset",
            type: "dataset",
            url: "/resources/project-dataset.csv",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-2-9",
        title: "Machine Learning Module Assessment",
        description: "Test your understanding of machine learning concepts and techniques.",
        durationMinutes: 45,
        contentType: "quiz"
      }
    ]
  },
  {
    id: "module-3",
    title: "Deep Learning and Neural Networks",
    description: "Master the technology powering the most significant AI breakthroughs, from image recognition to natural language processing.",
    durationHours: 15,
    skillLevel: "intermediate",
    prerequisites: ["Completion of Module 2", "Basic Python programming knowledge"],
    learningOutcomes: [
      "Understand the architecture and function of neural networks",
      "Build and train deep learning models using modern frameworks",
      "Apply deep learning to various domains including computer vision and NLP",
      "Optimize neural networks for improved performance and efficiency"
    ],
    lessons: [
      {
        id: "lesson-3-1",
        title: "Neural Network Fundamentals",
        description: "Learn the basic components and principles behind neural networks.",
        durationMinutes: 60,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-3-1-1",
            title: "Neural Network Architecture Diagrams",
            type: "pdf",
            url: "/resources/nn-architectures.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-2",
        title: "Forward and Backward Propagation",
        description: "Understand how neural networks learn through backpropagation and gradient descent.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-3-2-1",
            title: "Backpropagation Explained",
            type: "pdf",
            url: "/resources/backpropagation.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-3",
        title: "Deep Learning Frameworks",
        description: "Explore popular frameworks like TensorFlow and PyTorch that simplify deep learning development.",
        durationMinutes: 55,
        contentType: "video",
        resources: [
          {
            id: "resource-3-3-1",
            title: "Frameworks Comparison",
            type: "pdf",
            url: "/resources/dl-frameworks.pdf",
            isRequired: false
          }
        ]
      },
      {
        id: "lesson-3-4",
        title: "Convolutional Neural Networks",
        description: "Discover the architecture that revolutionized computer vision and image processing.",
        durationMinutes: 80,
        contentType: "video",
        resources: [
          {
            id: "resource-3-4-1",
            title: "CNN Architecture Guide",
            type: "pdf",
            url: "/resources/cnn-architecture.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-5",
        title: "Hands-on: Image Classification with CNNs",
        description: "Build an image classifier using convolutional neural networks.",
        durationMinutes: 100,
        contentType: "interactive",
        resources: [
          {
            id: "resource-3-5-1",
            title: "CNN Project Notebook",
            type: "notebook",
            url: "/resources/cnn-notebook.ipynb",
            isRequired: true
          },
          {
            id: "resource-3-5-2",
            title: "Image Dataset",
            type: "dataset",
            url: "/resources/image-classification-dataset.zip",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-6",
        title: "Recurrent Neural Networks",
        description: "Learn about networks designed to process sequential data like text and time series.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-3-6-1",
            title: "RNN and LSTM Guide",
            type: "pdf",
            url: "/resources/rnn-lstm-guide.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-7",
        title: "Natural Language Processing with Deep Learning",
        description: "Explore how deep learning has transformed our ability to work with human language.",
        durationMinutes: 85,
        contentType: "video",
        resources: [
          {
            id: "resource-3-7-1",
            title: "NLP Techniques Overview",
            type: "pdf",
            url: "/resources/nlp-techniques.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-8",
        title: "Hands-on: Text Classification with RNNs",
        description: "Build a text classification model using recurrent neural networks.",
        durationMinutes: 90,
        contentType: "interactive",
        resources: [
          {
            id: "resource-3-8-1",
            title: "RNN Project Notebook",
            type: "notebook",
            url: "/resources/rnn-notebook.ipynb",
            isRequired: true
          },
          {
            id: "resource-3-8-2",
            title: "Text Dataset",
            type: "dataset",
            url: "/resources/text-classification-dataset.csv",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-9",
        title: "Generative Adversarial Networks",
        description: "Understand how networks can generate new content through adversarial training.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-3-9-1",
            title: "GAN Architecture and Applications",
            type: "pdf",
            url: "/resources/gan-guide.pdf",
            isRequired: false
          }
        ]
      },
      {
        id: "lesson-3-10",
        title: "Deep Learning Optimization Techniques",
        description: "Learn strategies to improve neural network performance, from regularization to advanced optimizers.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-3-10-1",
            title: "Optimization Techniques Cheat Sheet",
            type: "pdf",
            url: "/resources/dl-optimization.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-11",
        title: "Deep Learning Capstone Project",
        description: "Apply your deep learning knowledge to solve a complex problem of your choice.",
        durationMinutes: 150,
        contentType: "project",
        resources: [
          {
            id: "resource-3-11-1",
            title: "Project Guidelines",
            type: "pdf",
            url: "/resources/dl-project-guidelines.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-3-12",
        title: "Deep Learning Module Assessment",
        description: "Demonstrate your understanding of deep learning concepts and applications.",
        durationMinutes: 60,
        contentType: "quiz"
      }
    ]
  },
  {
    id: "module-4",
    title: "Large Language Models and Generative AI",
    description: "Explore the cutting-edge technology behind ChatGPT, DALL-E, and other generative AI systems revolutionizing creative and analytical tasks.",
    durationHours: 14,
    skillLevel: "intermediate",
    prerequisites: ["Completion of Module 3"],
    learningOutcomes: [
      "Understand how large language models work and their capabilities",
      "Learn techniques for prompt engineering and fine-tuning",
      "Implement LLM-powered applications with modern APIs",
      "Evaluate and address the limitations and ethical considerations of generative AI"
    ],
    lessons: [
      {
        id: "lesson-4-1",
        title: "Evolution of Language Models",
        description: "Trace the development from early NLP to modern large language models.",
        durationMinutes: 60,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-4-1-1",
            title: "Language Model Evolution Timeline",
            type: "pdf",
            url: "/resources/lm-evolution.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-2",
        title: "Transformer Architecture Explained",
        description: "Understand the architecture that powers modern LLMs and its key innovations.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-4-2-1",
            title: "Transformer Architecture Deep Dive",
            type: "pdf",
            url: "/resources/transformer-architecture.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-3",
        title: "Pre-training and Fine-tuning",
        description: "Learn how LLMs are trained on vast datasets and then specialized for specific tasks.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-4-3-1",
            title: "Pre-training and Fine-tuning Guide",
            type: "pdf",
            url: "/resources/pretraining-finetuning.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-4",
        title: "The Art of Prompt Engineering",
        description: "Master techniques to effectively communicate with and guide language models.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-4-4-1",
            title: "Prompt Engineering Techniques",
            type: "pdf",
            url: "/resources/prompt-engineering.pdf",
            isRequired: true
          },
          {
            id: "resource-4-4-2",
            title: "Prompt Examples Collection",
            type: "pdf",
            url: "/resources/prompt-examples.pdf",
            isRequired: false
          }
        ]
      },
      {
        id: "lesson-4-5",
        title: "Hands-on: Building with OpenAI's API",
        description: "Learn to integrate powerful language models into your applications.",
        durationMinutes: 90,
        contentType: "interactive",
        resources: [
          {
            id: "resource-4-5-1",
            title: "OpenAI API Tutorial Notebook",
            type: "notebook",
            url: "/resources/openai-api-tutorial.ipynb",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-6",
        title: "Multimodal Models: From Text to Images and Beyond",
        description: "Explore models that can work across different modes of data, from DALL-E to GPT-4V.",
        durationMinutes: 80,
        contentType: "video",
        resources: [
          {
            id: "resource-4-6-1",
            title: "Multimodal Models Overview",
            type: "pdf",
            url: "/resources/multimodal-models.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-7",
        title: "Building AI-Powered Tools and Agents",
        description: "Learn to create specialized AI tools and autonomous agents that can perform complex tasks.",
        durationMinutes: 85,
        contentType: "video",
        resources: [
          {
            id: "resource-4-7-1",
            title: "AI Agents Design Patterns",
            type: "pdf",
            url: "/resources/ai-agents-design.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-8",
        title: "Hands-on: Creating a Custom AI Assistant",
        description: "Build your own specialized AI assistant for a specific domain or task.",
        durationMinutes: 120,
        contentType: "interactive",
        resources: [
          {
            id: "resource-4-8-1",
            title: "AI Assistant Project Notebook",
            type: "notebook",
            url: "/resources/ai-assistant-project.ipynb",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-9",
        title: "Limitations and Challenges of LLMs",
        description: "Understand the current limitations of large language models, from hallucinations to reasoning flaws.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-4-9-1",
            title: "LLM Limitations Analysis",
            type: "pdf",
            url: "/resources/llm-limitations.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-10",
        title: "Responsible AI and Safety Measures",
        description: "Explore approaches to ensure AI systems are safe, aligned with human values, and used responsibly.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-4-10-1",
            title: "AI Safety Framework",
            type: "pdf",
            url: "/resources/ai-safety-framework.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-11",
        title: "Generative AI Capstone Project",
        description: "Apply your knowledge to build an advanced LLM-powered application.",
        durationMinutes: 180,
        contentType: "project",
        resources: [
          {
            id: "resource-4-11-1",
            title: "Capstone Project Requirements",
            type: "pdf",
            url: "/resources/generative-ai-capstone.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-4-12",
        title: "Generative AI Module Assessment",
        description: "Test your understanding of large language models and their applications.",
        durationMinutes: 60,
        contentType: "quiz"
      }
    ]
  },
  {
    id: "module-5",
    title: "AI in Production: From Prototype to Deployment",
    description: "Master the practical aspects of deploying AI solutions in real-world environments, from scalability to monitoring.",
    durationHours: 12,
    skillLevel: "advanced",
    prerequisites: ["Completion of Module 3", "Basic cloud computing knowledge"],
    learningOutcomes: [
      "Design scalable AI systems for production environments",
      "Implement best practices for model deployment and monitoring",
      "Understand MLOps principles and tools for continuous delivery of ML systems",
      "Ensure AI systems are reliable, secure, and maintainable"
    ],
    lessons: [
      {
        id: "lesson-5-1",
        title: "Introduction to MLOps",
        description: "Learn the principles and practices of Machine Learning Operations.",
        durationMinutes: 65,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-5-1-1",
            title: "MLOps Overview",
            type: "pdf",
            url: "/resources/mlops-overview.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-2",
        title: "Data Pipeline Design and Management",
        description: "Design robust data pipelines to support AI systems in production.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-5-2-1",
            title: "Data Pipeline Architectures",
            type: "pdf",
            url: "/resources/data-pipelines.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-3",
        title: "Model Versioning and Experiment Tracking",
        description: "Learn to track experiments and manage model versions effectively.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-5-3-1",
            title: "Tools for Experiment Tracking",
            type: "pdf",
            url: "/resources/experiment-tracking.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-4",
        title: "Containerization and Orchestration",
        description: "Package and deploy AI models using containers and orchestration platforms.",
        durationMinutes: 80,
        contentType: "video",
        resources: [
          {
            id: "resource-5-4-1",
            title: "Docker and Kubernetes for AI",
            type: "pdf",
            url: "/resources/containerization.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-5",
        title: "Hands-on: Containerizing an ML Model",
        description: "Build and deploy a containerized machine learning service.",
        durationMinutes: 100,
        contentType: "interactive",
        resources: [
          {
            id: "resource-5-5-1",
            title: "Containerization Tutorial",
            type: "notebook",
            url: "/resources/containerization-tutorial.ipynb",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-6",
        title: "Model Serving and API Design",
        description: "Create APIs that serve machine learning models efficiently and reliably.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-5-6-1",
            title: "Model Serving Best Practices",
            type: "pdf",
            url: "/resources/model-serving.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-7",
        title: "Monitoring and Observability",
        description: "Implement systems to monitor model performance and health in production.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-5-7-1",
            title: "ML Monitoring Framework",
            type: "pdf",
            url: "/resources/ml-monitoring.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-8",
        title: "Continuous Integration and Deployment for ML",
        description: "Set up CI/CD pipelines specifically tailored for machine learning projects.",
        durationMinutes: 85,
        contentType: "video",
        resources: [
          {
            id: "resource-5-8-1",
            title: "CI/CD for ML Guide",
            type: "pdf",
            url: "/resources/cicd-ml.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-9",
        title: "Scaling AI Systems",
        description: "Design systems that can handle increasing loads and data volumes effectively.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-5-9-1",
            title: "Scaling Strategies",
            type: "pdf",
            url: "/resources/scaling-ai.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-10",
        title: "Production MLOps Project",
        description: "Build an end-to-end ML system with proper MLOps practices.",
        durationMinutes: 150,
        contentType: "project",
        resources: [
          {
            id: "resource-5-10-1",
            title: "MLOps Project Specification",
            type: "pdf",
            url: "/resources/mlops-project.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-5-11",
        title: "Production AI Module Assessment",
        description: "Test your understanding of deploying and managing AI systems in production.",
        durationMinutes: 60,
        contentType: "quiz"
      }
    ]
  },
  {
    id: "module-6",
    title: "AI Strategy and Business Implementation",
    description: "Learn to implement AI strategically in organizations, from identifying opportunities to measuring ROI and managing change.",
    durationHours: 10,
    skillLevel: "advanced",
    prerequisites: ["Completion of Module 1", "Business or management experience recommended"],
    learningOutcomes: [
      "Identify strategic opportunities for AI implementation in organizations",
      "Develop frameworks for AI project selection and prioritization",
      "Create effective change management strategies for AI adoption",
      "Measure and communicate the business impact of AI initiatives"
    ],
    lessons: [
      {
        id: "lesson-6-1",
        title: "AI Strategy Framework",
        description: "Learn a comprehensive framework for developing AI strategy in organizations.",
        durationMinutes: 65,
        contentType: "video",
        isPreview: true,
        resources: [
          {
            id: "resource-6-1-1",
            title: "AI Strategy Canvas",
            type: "pdf",
            url: "/resources/ai-strategy-canvas.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-2",
        title: "Identifying AI Opportunities",
        description: "Develop methods to identify high-value AI use cases in any business context.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-6-2-1",
            title: "AI Opportunity Assessment Template",
            type: "pdf",
            url: "/resources/ai-opportunity-assessment.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-3",
        title: "Building AI Teams",
        description: "Learn how to structure, hire, and manage effective AI teams.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-6-3-1",
            title: "AI Team Structures Guide",
            type: "pdf",
            url: "/resources/ai-team-structures.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-4",
        title: "AI Project Management",
        description: "Adapt project management practices for the unique challenges of AI initiatives.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-6-4-1",
            title: "AI Project Management Framework",
            type: "pdf",
            url: "/resources/ai-project-management.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-5",
        title: "Data Strategy and Governance",
        description: "Develop strategies for data collection, management, and governance to support AI.",
        durationMinutes: 65,
        contentType: "video",
        resources: [
          {
            id: "resource-6-5-1",
            title: "Data Governance Playbook",
            type: "pdf",
            url: "/resources/data-governance.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-6",
        title: "AI ROI and Value Measurement",
        description: "Learn frameworks for measuring and communicating the business impact of AI.",
        durationMinutes: 70,
        contentType: "video",
        resources: [
          {
            id: "resource-6-6-1",
            title: "AI ROI Calculator Template",
            type: "pdf",
            url: "/resources/ai-roi-calculator.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-7",
        title: "Change Management for AI",
        description: "Develop strategies to manage organizational change during AI adoption.",
        durationMinutes: 60,
        contentType: "video",
        resources: [
          {
            id: "resource-6-7-1",
            title: "AI Change Management Toolkit",
            type: "pdf",
            url: "/resources/ai-change-management.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-8",
        title: "Responsible AI Governance",
        description: "Establish frameworks for ethical AI deployment and governance.",
        durationMinutes: 75,
        contentType: "video",
        resources: [
          {
            id: "resource-6-8-1",
            title: "AI Governance Framework",
            type: "pdf",
            url: "/resources/ai-governance.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-9",
        title: "AI Strategy Capstone: Building an AI Transformation Roadmap",
        description: "Develop a comprehensive AI transformation roadmap for an organization.",
        durationMinutes: 120,
        contentType: "project",
        resources: [
          {
            id: "resource-6-9-1",
            title: "AI Roadmap Template",
            type: "pdf",
            url: "/resources/ai-roadmap-template.pdf",
            isRequired: true
          }
        ]
      },
      {
        id: "lesson-6-10",
        title: "AI Strategy Module Assessment",
        description: "Demonstrate your understanding of strategic AI implementation in organizations.",
        durationMinutes: 60,
        contentType: "quiz"
      }
    ]
  }
];

export default aiCourseStructure;