import { Course } from '@/types/course';

export const mockCourses: Course[] = [
  {
    id: 1,
    title: "Mastering AI Prompt Engineering",
    description: "Learn the art and science of designing effective prompts for large language models (LLMs). This comprehensive course covers prompt crafting techniques, optimization strategies, and best practices for getting the most out of AI models.",
    shortDescription: "Learn advanced techniques to effectively communicate with AI systems",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 1,
      name: "Dr. Sarah Chen",
      bio: "AI Research Scientist with over 10 years of experience in natural language processing and prompt engineering.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    price: "$149",
    duration: "6 weeks",
    modules: [
      {
        id: 101,
        title: "Fundamentals of Prompt Engineering",
        description: "Master the basic concepts and principles of effective prompt design.",
        position: 1,
        lessons: [
          {
            id: 1001,
            moduleId: 101,
            title: "Introduction to Prompt Engineering",
            type: "video",
            duration: 15,
            position: 1,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 1002,
            moduleId: 101,
            title: "Understanding Language Model Behavior",
            type: "text",
            duration: 20,
            position: 2,
            isCompleted: false,
            isLocked: false
          }
        ]
      }
    ],
    progress: 0,
    createdAt: "2025-04-15T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
    level: "intermediate",
    studentsCount: 2456,
    tags: ["AI", "Prompt Engineering", "NLP"],
    featured: true
  },
  {
    id: 2,
    title: "AI for Business Intelligence",
    description: "Discover how AI can transform your business decision-making. This course explores practical applications of AI in analyzing business data, generating insights, and creating actionable intelligence to drive strategic decisions.",
    shortDescription: "Harness AI to extract powerful insights from your business data",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 2,
      name: "Michael Rodriguez",
      bio: "Former Chief Data Officer with expertise in applying AI for business optimization and strategy.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    price: "$199",
    duration: "8 weeks",
    modules: [
      {
        id: 201,
        title: "AI-Driven Business Analysis",
        description: "Learn how to leverage AI tools for comprehensive business data analysis.",
        position: 1,
        lessons: [
          {
            id: 2001,
            moduleId: 201,
            title: "Introduction to AI in Business Intelligence",
            type: "video",
            duration: 18,
            position: 1,
            isCompleted: false,
            isLocked: false
          }
        ]
      }
    ],
    progress: 0,
    createdAt: "2025-03-20T00:00:00Z",
    updatedAt: "2025-04-25T00:00:00Z",
    level: "beginner",
    studentsCount: 1892,
    tags: ["Business Intelligence", "AI Applications", "Data Analysis"],
    featured: false
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Build a strong foundation in deep learning theory and practice. This course takes you from basic neural networks to advanced architectures, with hands-on projects using PyTorch and TensorFlow.",
    shortDescription: "Master the core concepts and implementations of neural networks",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    instructor: {
      id: 3,
      name: "Prof. James Liu",
      bio: "Computer Science professor specializing in deep learning research and applications.",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg"
    },
    price: "$249",
    duration: "10 weeks",
    modules: [
      {
        id: 301,
        title: "Neural Network Basics",
        description: "Understanding the foundation of all deep learning systems.",
        position: 1,
        lessons: [
          {
            id: 3001,
            moduleId: 301,
            title: "Introduction to Neural Networks",
            type: "video",
            duration: 22,
            position: 1,
            isCompleted: false,
            isLocked: false
          }
        ]
      }
    ],
    progress: 0,
    createdAt: "2025-05-05T00:00:00Z",
    updatedAt: "2025-05-10T00:00:00Z",
    level: "advanced",
    studentsCount: 1245,
    tags: ["Deep Learning", "Neural Networks", "PyTorch", "TensorFlow"],
    featured: true
  }
];