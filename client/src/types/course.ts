/**
 * Course-related type definitions for the learning platform
 */

export interface Course {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  imageUrl?: string;
  instructor: {
    id: number;
    name: string;
    bio: string;
    avatar: string;
  };
  price: string;
  duration: string | number;
  modules: CourseModule[];
  progress: number;
  enrollmentDate?: string;
  lastAccessedDate?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  studentsCount?: number;
  tags?: string[];
  category?: string;
  prerequisites?: string[];
  certificateAvailable?: boolean;
  isPremium?: boolean;
  requiredSubscription?: 'basic' | 'pro' | 'enterprise';
}

export interface CourseModule {
  id: number;
  title: string;
  description: string;
  position: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  moduleId: number;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  duration: number;
  position: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface LessonProgress {
  lessonId: number;
  completed: boolean;
  score?: number;
  timeSpent: number;
  lastAccessed: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  submissionType: 'text' | 'file' | 'link';
  maxScore: number;
}

export interface InteractiveContent {
  id: number;
  type: 'simulation' | 'coding' | 'game' | 'case-study';
  title: string;
  description: string;
  content: any; // Content specific to the interactive type
}