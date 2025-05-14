import { db } from "../db";
import { 
  aiCourses, 
  aiCourseCategories, 
  aiCourseModules, 
  aiCourseLessons 
} from "@shared/schema";
import { logger } from "../utils/logger";

async function main() {
  try {
    logger.info("Seeding AI course data...");

    // 1. Insert course categories
    const categories = [
      {
        name: "Machine Learning",
        description: "Learn the fundamentals and advanced concepts of machine learning and neural networks.",
        slug: "machine-learning"
      },
      {
        name: "Generative AI",
        description: "Explore generative AI models, including diffusion models, GANs, and transformer architectures.",
        slug: "generative-ai"
      },
      {
        name: "AI for Business",
        description: "Apply AI to solve business problems, improve decision-making, and drive innovation.",
        slug: "ai-for-business"
      }
    ];

    logger.info("Adding course categories...");
    const insertedCategories = await db.insert(aiCourseCategories).values(categories).returning();
    
    // Map category slugs to their IDs for easier reference
    const categoryMap = Object.fromEntries(
      insertedCategories.map(cat => [cat.slug, cat.id])
    );

    // 2. Insert the requested sample courses
    const sampleCourses = [
      {
        title: "Machine Learning Basics",
        description: "A comprehensive introduction to machine learning for beginners. Learn the fundamental concepts, algorithms, and practical applications of machine learning. This course covers supervised and unsupervised learning, model evaluation, and basic neural networks.",
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        duration: "4 hours",
        difficulty: "Beginner",
        instructorName: "Dr. Sarah Johnson",
        instructorBio: "Dr. Sarah Johnson has a Ph.D. in Computer Science with a specialization in Machine Learning. She has 10+ years of experience teaching and implementing ML solutions.",
        price: "19.99",
        isPublished: true,
        categoryId: categoryMap["machine-learning"],
        enrollmentCount: 1287,
        averageRating: "4.7"
      },
      {
        title: "Generative AI Essentials",
        description: "Explore the exciting world of generative AI. This intermediate-level course covers various generative models including GANs, diffusion models, and transformer architectures. Build your own text-to-image and text generation systems.",
        thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2536&q=80",
        duration: "6 hours",
        difficulty: "Intermediate",
        instructorName: "Prof. Alex Zhang",
        instructorBio: "Prof. Alex Zhang is a leading researcher in generative AI with multiple published papers on GANs and diffusion models. He has worked at leading AI research labs.",
        price: "49.99",
        isPublished: true,
        categoryId: categoryMap["generative-ai"],
        enrollmentCount: 843,
        averageRating: "4.8"
      },
      {
        title: "AI for Business Leaders",
        description: "A strategic guide for business leaders to understand and implement AI in their organizations. Learn to identify AI opportunities, manage AI projects, address ethical considerations, and drive business transformation with AI.",
        thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        duration: "8 hours",
        difficulty: "Advanced",
        instructorName: "Emma Rodriguez, MBA",
        instructorBio: "Emma Rodriguez is a former CTO and current AI Strategy Consultant who has helped over 50 Fortune 500 companies implement successful AI strategies.",
        price: "79.99",
        isPublished: true,
        categoryId: categoryMap["ai-for-business"],
        enrollmentCount: 651,
        averageRating: "4.9"
      }
    ];

    logger.info("Adding sample courses...");
    const insertedCourses = await db.insert(aiCourses).values(sampleCourses).returning();
    
    // Map course titles to their IDs for easier reference
    const courseMap = Object.fromEntries(
      insertedCourses.map(course => [course.title, course.id])
    );

    // 3. Now add modules for each course
    // ML Basics modules
    const mlBasicsModules = [
      {
        courseId: courseMap["Machine Learning Basics"],
        title: "Introduction to Machine Learning",
        description: "Learn the fundamental concepts and terminology of machine learning.",
        position: 1
      },
      {
        courseId: courseMap["Machine Learning Basics"],
        title: "Supervised Learning Algorithms",
        description: "Explore common supervised learning algorithms including linear regression, logistic regression, and decision trees.",
        position: 2
      },
      {
        courseId: courseMap["Machine Learning Basics"],
        title: "Model Evaluation and Validation",
        description: "Learn techniques for evaluating and validating machine learning models.",
        position: 3
      }
    ];

    // Generative AI modules
    const genAiModules = [
      {
        courseId: courseMap["Generative AI Essentials"],
        title: "Introduction to Generative Models",
        description: "Overview of different types of generative models and their applications.",
        position: 1
      },
      {
        courseId: courseMap["Generative AI Essentials"],
        title: "Generative Adversarial Networks",
        description: "Deep dive into the architecture and training of GANs.",
        position: 2
      },
      {
        courseId: courseMap["Generative AI Essentials"],
        title: "Diffusion Models and Their Applications",
        description: "Understand how diffusion models work and how they're used in state-of-the-art systems.",
        position: 3
      }
    ];

    // AI for Business modules
    const aiBusinessModules = [
      {
        courseId: courseMap["AI for Business Leaders"],
        title: "AI Strategy for Organizations",
        description: "Develop a comprehensive AI strategy aligned with business goals.",
        position: 1
      },
      {
        courseId: courseMap["AI for Business Leaders"],
        title: "Managing AI Projects",
        description: "Learn how to effectively manage AI implementation projects.",
        position: 2
      },
      {
        courseId: courseMap["AI for Business Leaders"],
        title: "Ethical Considerations in AI",
        description: "Address the ethical challenges and considerations when implementing AI.",
        position: 3
      }
    ];

    logger.info("Adding course modules...");
    const allModules = [...mlBasicsModules, ...genAiModules, ...aiBusinessModules];
    const insertedModules = await db.insert(aiCourseModules).values(allModules).returning();

    // Add a few sample lessons per module
    logger.info("Adding sample lessons...");
    
    // Create an array of all modules with their IDs from the database
    const moduleData = insertedModules.map(module => ({
      id: module.id,
      title: module.title,
      courseId: module.courseId
    }));

    // For each module, create some basic lessons
    const lessons = moduleData.flatMap(module => {
      // Determine the parent course difficulty to adjust lesson content
      const parentCourse = insertedCourses.find(course => course.id === module.courseId);
      const difficulty = parentCourse?.difficulty || "Beginner";
      
      // Basic lesson structure that we'll customize for each module
      return [
        {
          moduleId: module.id,
          title: `Introduction to ${module.title}`,
          content: `This lesson introduces the core concepts of ${module.title} and sets the foundation for the module.`,
          videoUrl: "https://example.com/sample-video.mp4",
          duration: 600, // 10 minutes in seconds
          position: 1
        },
        {
          moduleId: module.id,
          title: `${module.title} - Core Concepts`,
          content: `Deep dive into the key concepts and techniques of ${module.title}.`,
          videoUrl: "https://example.com/sample-video.mp4",
          duration: 1200, // 20 minutes in seconds
          position: 2
        },
        {
          moduleId: module.id,
          title: `${module.title} - Practical Applications`,
          content: `Learn how to apply ${module.title} concepts in real-world scenarios.`,
          videoUrl: "https://example.com/sample-video.mp4",
          duration: 900, // 15 minutes in seconds
          position: 3
        }
      ];
    });

    await db.insert(aiCourseLessons).values(lessons);

    logger.info("AI course data seeding complete!");
    logger.info(`Added ${insertedCategories.length} categories, ${insertedCourses.length} courses, ${insertedModules.length} modules, and ${lessons.length} lessons.`);

  } catch (error) {
    logger.error("Error seeding AI course data:", error);
    throw error;
  }
}

// Run the script immediately
// This approach works with ES modules
main()
  .then(() => {
    logger.info("Seed script completed successfully");
    process.exit(0);
  })
  .catch(err => {
    logger.error("Seed script failed:", err);
    process.exit(1);
  });

export default main;