import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { trackEvent } from '@/lib/analytics';

// Lazy loaded components for better performance
const PersonalizedContent = lazy(() => import('@/components/PersonalizedContent'));
const ExitIntentPopup = lazy(() => import('@/components/ExitIntentPopup'));

// Quiz questions type
interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; points: number }[];
}

// Quiz questions
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Do you have basic programming knowledge?",
    options: [
      { id: "q1-a", text: "Yes, I'm experienced with Python or another language", points: 10 },
      { id: "q1-b", text: "I know some programming basics", points: 7 },
      { id: "q1-c", text: "I've done some HTML/CSS but not much else", points: 4 },
      { id: "q1-d", text: "No programming experience at all", points: 1 }
    ]
  },
  {
    id: 2,
    question: "Are you interested in a career in AI?",
    options: [
      { id: "q2-a", text: "Yes, I'm planning to transition into AI full-time", points: 10 },
      { id: "q2-b", text: "I want to add AI skills to my current role", points: 8 },
      { id: "q2-c", text: "I'm exploring options and still deciding", points: 5 },
      { id: "q2-d", text: "I'm just curious about AI", points: 3 }
    ]
  },
  {
    id: 3,
    question: "How much time can you commit to learning each week?",
    options: [
      { id: "q3-a", text: "10+ hours per week", points: 10 },
      { id: "q3-b", text: "5-10 hours per week", points: 7 },
      { id: "q3-c", text: "2-5 hours per week", points: 4 },
      { id: "q3-d", text: "Less than 2 hours per week", points: 1 }
    ]
  },
  {
    id: 4,
    question: "Do you have experience with statistics or data analysis?",
    options: [
      { id: "q4-a", text: "Yes, advanced knowledge", points: 10 },
      { id: "q4-b", text: "Yes, intermediate knowledge", points: 7 },
      { id: "q4-c", text: "Some basic understanding", points: 4 },
      { id: "q4-d", text: "No experience", points: 1 }
    ]
  },
  {
    id: 5,
    question: "Have you used AI tools or platforms before?",
    options: [
      { id: "q5-a", text: "Yes, I've built or trained AI models", points: 10 },
      { id: "q5-b", text: "I've used AI tools like ChatGPT extensively", points: 7 },
      { id: "q5-c", text: "I've tried some AI tools casually", points: 4 },
      { id: "q5-d", text: "No experience with AI tools", points: 1 }
    ]
  }
];

// Results based on score
const getQuizResult = (score: number) => {
  if (score >= 40) {
    return {
      title: "Advanced Ready!",
      description: "You're well-prepared for our advanced AI courses. With your background, you'll be able to quickly grasp complex AI concepts and implement sophisticated models.",
      recommendation: "Consider starting with our 'Deep Learning Specialization' or 'Advanced NLP with Transformers'.",
      cta: "Enroll in Advanced Courses"
    };
  } else if (score >= 30) {
    return {
      title: "Intermediate Ready!",
      description: "You have a solid foundation to build upon. You're ready for our intermediate courses that will enhance your AI skills and knowledge.",
      recommendation: "We recommend starting with 'Machine Learning Foundations' or 'Python for AI Development'.",
      cta: "Explore Intermediate Courses"
    };
  } else if (score >= 20) {
    return {
      title: "Beginner Ready!",
      description: "You have the right attitude and some basic knowledge to start your AI journey. Our beginner courses will help you build a strong foundation.",
      recommendation: "Start with our 'Introduction to AI' and 'Programming Fundamentals for AI' courses.",
      cta: "Start with Beginner Courses"
    };
  } else {
    return {
      title: "Preparation Needed",
      description: "It looks like you might need some preparation before diving into our AI courses. Don't worry - we've got resources to help you get ready!",
      recommendation: "Try our free 'AI Readiness' prep course and 'Programming Basics' module first.",
      cta: "Get Prepared with Free Resources"
    };
  }
};

// Testimonial component
const Testimonial: React.FC<{
  name: string;
  role: string;
  text: string;
  imageUrl: string;
}> = ({ name, role, text, imageUrl }) => {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-white">{name}</h4>
          <p className="text-sm text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 italic">"{text}"</p>
    </div>
  );
};

const LearnAI: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [showTestimonials, setShowTestimonials] = useState<boolean>(false);
  const [pageLoadTime] = useState<number>(Date.now());
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);
  const [showExitIntent, setShowExitIntent] = useState<boolean>(true);
  
  // Track page view and engagement metrics
  useEffect(() => {
    // Track page view with custom dimensions
    trackEvent('page_view', 'pages', 'learn_ai_landing');
    
    // Track time spent on page when user leaves
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageLoadTime;
      trackEvent('time_on_page', 'engagement', 'learn_ai_landing', Math.floor(timeSpent / 1000));
    };
    
    // Track scroll depth
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        trackEvent('user_scrolled', 'engagement', 'learn_ai_landing');
      }
      
      // Calculate scroll depth as percentage
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      
      // Track at specific thresholds (25%, 50%, 75%, 100%)
      if (scrollPercentage >= 25 && scrollPercentage < 50) {
        trackEvent('scroll_depth_25', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 50 && scrollPercentage < 75) {
        trackEvent('scroll_depth_50', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 75 && scrollPercentage < 90) {
        trackEvent('scroll_depth_75', 'engagement', 'learn_ai_landing');
      } else if (scrollPercentage >= 90) {
        trackEvent('scroll_depth_100', 'engagement', 'learn_ai_landing');
      }
    };
    
    // Setup event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    
    // Optimization: Preload critical images for better performance
    const preloadImages = () => {
      const imageUrls = [
        '/images/ai-learning-dashboard.webp',
        '/images/ai-course-hero.jpg'
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    // Run preload after a short delay to prioritize page render
    const preloadTimeout = setTimeout(preloadImages, 1000);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(preloadTimeout);
    };
  }, [pageLoadTime, hasScrolled]);

  // Handle option selection
  const handleOptionSelect = (questionId: number, optionId: string, points: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
    
    // Update score
    const currentQuestionData = quizQuestions.find(q => q.id === questionId);
    if (currentQuestionData) {
      const previousOptionId = answers[questionId];
      let scoreChange = points;
      
      if (previousOptionId) {
        const previousOption = currentQuestionData.options.find(o => o.id === previousOptionId);
        if (previousOption) {
          scoreChange -= previousOption.points;
        }
      }
      
      setScore(prevScore => prevScore + scoreChange);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(0);
    setQuizCompleted(false);
  };

  // Calculate progress percentage
  const progressPercentage = (currentQuestion / quizQuestions.length) * 100;

  // Get current question data
  const currentQuestionData = quizQuestions[currentQuestion];

  // Get result based on score
  const result = getQuizResult(score);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Helmet>
        <title>Learn AI with RXAI - The World Leader in AI Education</title>
        <meta name="description" content="Start your AI learning journey with RXAI's comprehensive courses. From beginners to advanced practitioners, our expert-led curriculum will transform your career." />
        <meta property="og:title" content="Learn AI with RXAI" />
        <meta property="og:description" content="Master AI with our comprehensive courses. Join thousands of successful students." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rxai.com/learnai" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Learn AI with RXAI" />
        <meta name="twitter:description" content="Master AI with our comprehensive courses. Join thousands of successful students." />
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/images/ai-learning-dashboard.webp" />
        {/* Add structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "RXAI Comprehensive AI Course",
            "description": "Master artificial intelligence with our industry-leading curriculum",
            "provider": {
              "@type": "Organization",
              "name": "RXAI",
              "sameAs": "https://rxai.com"
            }
          })}
        </script>
      </Helmet>
      
      {/* Show exit intent popup */}
      {showExitIntent && (
        <Suspense fallback={null}>
          <ExitIntentPopup 
            minTimeOnPage={15000} // Show after 15 seconds on page
            delay={300}
            cookieDuration={3} // Show again after 3 days
          />
        </Suspense>
      )}
      
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-center mb-4"
          >
            Learn AI with RXAI
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-center mb-8 text-[#007bff]"
          >
            The World Leader in Artificial Intelligence Education
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-center mb-6 max-w-3xl"
          >
            Transform your career with our industry-leading AI courses. Gain practical skills through 
            hands-on projects, receive mentorship from AI experts, and join a community of innovators.
          </motion.p>
          
          {/* Personalized Content Section */}
          <div className="w-full max-w-4xl mx-auto mb-8">
            <Suspense fallback={
              <div className="w-full h-24 bg-gray-800/50 animate-pulse rounded-lg"></div>
            }>
              <PersonalizedContent />
            </Suspense>
          </div>
          
          <div className="w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#2a2a2a] rounded-lg p-6 md:p-8 mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Master AI Skills That Matter</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-[#007bff] mr-2">✓</span>
                      <span>Comprehensive curriculum from fundamental to advanced AI concepts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#007bff] mr-2">✓</span>
                      <span>Hands-on projects with real-world applications</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#007bff] mr-2">✓</span>
                      <span>Mentorship from industry experts with proven track records</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#007bff] mr-2">✓</span>
                      <span>Self-paced learning with lifetime access to course materials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#007bff] mr-2">✓</span>
                      <span>Recognized certification to showcase your expertise</span>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button 
                      className="bg-[#007bff] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                      onClick={() => window.location.href = '/ai-courses/catalog'}
                    >
                      Browse Course Catalog
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/images/ai-learning-dashboard.webp" 
                    alt="RXAI Learning Dashboard" 
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/600x400/2a2a2a/007bff?text=AI+Learning+Platform";
                    }}
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#2a2a2a] rounded-lg p-6 md:p-8 mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Is this course for you?</h2>
              <p className="text-center mb-8 text-gray-300">
                Take our quick readiness quiz to see if you're prepared for our AI courses and get personalized recommendations.
              </p>
              
              {!quizCompleted ? (
                <Card className="bg-[#333] border-none p-6">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                      <span>{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 bg-gray-700" />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-6">{currentQuestionData.question}</h3>
                  
                  <RadioGroup 
                    value={answers[currentQuestionData.id] || ""} 
                    onValueChange={(value) => {
                      const option = currentQuestionData.options.find(o => o.id === value);
                      if (option) {
                        handleOptionSelect(currentQuestionData.id, value, option.points);
                      }
                    }}
                    className="space-y-4 mb-8"
                  >
                    {currentQuestionData.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md hover:bg-[#444] transition-colors">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!answers[currentQuestionData.id]}
                      className="bg-[#007bff] hover:bg-blue-600"
                    >
                      {currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-[#333] border-none p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[#007bff]">{result.title}</h3>
                    <div className="flex justify-center my-4">
                      <div className="inline-flex items-center justify-center p-4 bg-[#2a2a2a] rounded-full">
                        <span className="text-2xl font-bold">{score}/{quizQuestions.length * 10}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{result.description}</p>
                    <p className="font-medium mb-6">{result.recommendation}</p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button 
                        className="bg-[#007bff] hover:bg-blue-600"
                        onClick={() => window.location.href = '/ai-courses/catalog'}
                      >
                        {result.cta}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleResetQuiz}
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Hear from our students</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Testimonial 
                  name="Sarah Johnson"
                  role="Data Scientist at TechCorp"
                  text="The RXAI courses completely transformed my career. I went from a data analyst to a senior data scientist within months of completing their Advanced ML specialization."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=SJ"
                />
                <Testimonial 
                  name="Michael Chen"
                  role="AI Engineer"
                  text="What sets RXAI apart is the practical, hands-on approach. I built a portfolio of real-world projects that impressed employers and landed my dream job."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=MC"
                />
                <Testimonial 
                  name="Priya Sharma"
                  role="ML Team Lead"
                  text="As someone with no prior programming experience, I was amazed at how accessible RXAI made complex AI concepts. Their beginner track gave me the foundation I needed."
                  imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=PS"
                />
              </div>
              {!showTestimonials && (
                <div className="text-center mt-6">
                  <Button 
                    variant="link"
                    onClick={() => setShowTestimonials(true)}
                    className="text-[#007bff]"
                  >
                    View more testimonials
                  </Button>
                </div>
              )}
              {showTestimonials && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Testimonial 
                    name="James Wilson"
                    role="Startup Founder"
                    text="The knowledge I gained from RXAI courses enabled me to implement AI solutions in my startup, reducing costs by 40% and improving customer satisfaction."
                    imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=JW"
                  />
                  <Testimonial 
                    name="Sophia Rodriguez"
                    role="Healthcare AI Specialist"
                    text="RXAI's specialized healthcare AI course gave me the unique skills to develop models that are now helping diagnose diseases earlier and more accurately."
                    imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=SR"
                  />
                  <Testimonial 
                    name="David Kim"
                    role="NLP Research Scientist"
                    text="The advanced NLP course contained cutting-edge information that I wasn't finding anywhere else. The instructors are clearly active practitioners in the field."
                    imageUrl="https://placehold.co/100x100/2a2a2a/007bff?text=DK"
                  />
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-[#2a2a2a] rounded-lg p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-6">Ready to start your AI learning journey?</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of students who have accelerated their careers through RXAI's comprehensive AI education platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  className="bg-[#007bff] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                  onClick={() => window.location.href = '/ai-courses/catalog'}
                >
                  Browse Course Catalog
                </Button>
                <Button 
                  variant="outline"
                  className="border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
                  onClick={() => window.location.href = '/subscriptions'}
                >
                  View Pricing Plans
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnAI;