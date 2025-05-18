import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  History, 
  LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecentlyViewedCourses from '@/components/recommendations/RecentlyViewedCourses';
import TrendingRecommendations from '@/components/recommendations/TrendingRecommendations';
import PersonalizedRecommendations from '@/components/recommendations/PersonalizedRecommendations';

// Hero feature card component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const FeatureCard = ({ title, description, icon: Icon, color }: FeatureCardProps) => (
  <Card className="border-none shadow-md h-full">
    <CardContent className="pt-6">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Learning Platform | Learn at Your Own Pace</title>
        <meta name="description" content="Master AI and machine learning through our adaptive learning platform with personalized courses and expert guidance." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Master AI with Personalized Learning
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Our adaptive platform tailors the learning experience to your goals and pace, with AI-powered recommendations that evolve as you learn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="px-8">
                  Explore Courses
                </Button>
                <Button size="lg" variant="outline">
                  {isAuthenticated ? 'View Dashboard' : 'Sign Up Free'}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80" 
                alt="AI Learning Platform" 
                className="w-full h-auto" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Mastery Course Feature Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-7/12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Master AI: From Fundamentals to Advanced Applications
                </h2>
                <p className="text-gray-700 mb-4">
                  Our comprehensive AI curriculum takes you from beginner to expert with interactive lessons, 
                  quizzes, and hands-on projects across 9 carefully crafted modules.
                </p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <span>9 Modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <span>70+ Lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Interactive Quizzes</span>
                  </div>
                </div>
                <Link href="/ai-mastery">
                  <Button size="lg" className="gap-2">
                    Explore the Course <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-5/12 flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
                  alt="AI Mastery Course" 
                  className="rounded-lg object-cover h-64 w-full md:h-auto shadow-lg"
                  style={{ maxWidth: '400px' }}
                />
              </div>
            </div>
          </div>
          <RecentlyViewedCourses limit={4} />
        </div>
      </section>

      {/* Personalized recommendations for logged in users */}
      {isAuthenticated && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <PersonalizedRecommendations limit={3} />
          </div>
        </section>
      )}

      {/* Trending courses section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <TrendingRecommendations limit={4} />
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Our AI-Powered Learning Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform uses advanced AI to create a personalized learning experience tailored to your goals and learning style.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <FeatureCard 
                title="Personalized Paths" 
                description="AI analyzes your goals and learning style to create a customized learning journey."
                icon={Sparkles}
                color="bg-blue-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FeatureCard 
                title="Adaptive Content" 
                description="Lessons adapt to your progress, focusing more on areas where you need extra practice."
                icon={BookOpen}
                color="bg-green-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FeatureCard 
                title="Smart Recommendations" 
                description="Get course recommendations based on your interests, history, and learning goals."
                icon={TrendingUp}
                color="bg-purple-500"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FeatureCard 
                title="Progress Tracking" 
                description="Monitor your learning journey with detailed analytics and achievement tracking."
                icon={History}
                color="bg-orange-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your AI Learning Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners already benefiting from our personalized AI courses and advance your career.
          </p>
          <Button size="lg" variant="secondary" className="px-8">
            Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </>
  );
};

export default HomePage;