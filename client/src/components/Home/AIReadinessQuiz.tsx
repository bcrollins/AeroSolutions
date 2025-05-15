import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaRobot, FaCheckCircle, FaChartLine, FaBrain, FaLaptopCode, FaGraduationCap } from 'react-icons/fa';

// Questions for the AI readiness quiz
const quizQuestions = [
  {
    id: 1,
    question: "What is your current experience level with AI?",
    options: [
      { text: "No experience", score: 1 },
      { text: "Beginner - familiar with concepts", score: 2 },
      { text: "Intermediate - some practical experience", score: 3 },
      { text: "Advanced - regular AI practitioner", score: 4 }
    ]
  },
  {
    id: 2,
    question: "What are your primary goals for learning AI?",
    options: [
      { text: "General curiosity and knowledge", score: 1 },
      { text: "Specific use case or project", score: 3 },
      { text: "Career advancement or transition", score: 4 },
      { text: "Building an AI-powered business", score: 4 }
    ]
  },
  {
    id: 3,
    question: "How familiar are you with programming concepts?",
    options: [
      { text: "No programming experience", score: 1 },
      { text: "Basic understanding of programming", score: 2 },
      { text: "Comfortable with one programming language", score: 3 },
      { text: "Proficient in multiple languages", score: 4 }
    ]
  },
  {
    id: 4,
    question: "How much time can you dedicate to learning AI each week?",
    options: [
      { text: "Less than 2 hours", score: 1 },
      { text: "2-5 hours", score: 2 },
      { text: "5-10 hours", score: 3 },
      { text: "More than 10 hours", score: 4 }
    ]
  },
  {
    id: 5,
    question: "How would you rate your mathematical background?",
    options: [
      { text: "Basic arithmetic only", score: 1 },
      { text: "High school level (algebra, statistics)", score: 2 },
      { text: "College level (calculus, linear algebra)", score: 3 },
      { text: "Advanced (probability, optimization)", score: 4 }
    ]
  }
];

// Result categories based on score
const resultCategories = [
  {
    min: 5,
    max: 8,
    title: "AI Explorer",
    description: "You're at the beginning of your AI journey. Our foundational courses will help you build a strong knowledge base.",
    recommendation: "Start with 'Introduction to AI Concepts' and 'AI in Everyday Life'",
    icon: <FaRobot className="w-12 h-12 text-blue-500" />,
    courses: ["Introduction to AI Concepts", "Understanding Machine Learning", "AI Ethics & Society"]
  },
  {
    min: 9,
    max: 13,
    title: "AI Enthusiast",
    description: "You have a basic understanding of AI and are ready to dive deeper into practical applications.",
    recommendation: "Focus on 'Practical Machine Learning' and hands-on workshops",
    icon: <FaBrain className="w-12 h-12 text-blue-500" />,
    courses: ["Practical Machine Learning", "Data Analysis for AI", "Natural Language Processing Basics"]
  },
  {
    min: 14,
    max: 17,
    title: "AI Practitioner",
    description: "You're well-equipped to apply AI techniques to real-world problems and are ready for more advanced topics.",
    recommendation: "Explore specialized tracks like 'Deep Learning' or 'NLP Applications'",
    icon: <FaLaptopCode className="w-12 h-12 text-blue-500" />,
    courses: ["Deep Learning Specialization", "Advanced NLP", "Computer Vision Applications"]
  },
  {
    min: 18,
    max: 20,
    title: "AI Professional",
    description: "You have substantial AI knowledge and are positioned to master cutting-edge techniques.",
    recommendation: "Consider our advanced specializations and professional certification programs",
    icon: <FaGraduationCap className="w-12 h-12 text-blue-500" />,
    courses: ["AI Research Methods", "MLOps & Deployment", "Advanced AI Systems Design"]
  }
];

export default function AIReadinessQuiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const toggleQuiz = () => {
    if (isOpen) {
      // Reset quiz state when closing
      setCurrentQuestion(0);
      setAnswers([]);
      setResult(null);
      setIsEmailSubmitted(false);
      setEmail("");
    }
    setIsOpen(!isOpen);
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
      const category = resultCategories.find(
        cat => totalScore >= cat.min && totalScore <= cat.max
      );
      setResult({ ...category, score: totalScore });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this to your backend
    // For now, we'll just simulate a successful submission
    setIsEmailSubmitted(true);
  };

  // Animation variants
  const overlayVariants = {
    closed: { opacity: 0, pointerEvents: "none" as const },
    open: { opacity: 1, pointerEvents: "auto" as const }
  };

  const containerVariants = {
    closed: { y: 50, opacity: 0 },
    open: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      y: 50, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const progressPercentage = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <>
      {/* Quiz trigger button */}
      <Button
        onClick={toggleQuiz}
        className="flex items-center space-x-2 bg-gradient-to-r from-[#0066cc] to-[#0055b3] text-white py-3 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <FaRobot className="w-5 h-5" />
        <span>Take AI Readiness Quiz</span>
      </Button>

      {/* Quiz modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
              variants={containerVariants}
              initial="closed"
              animate="open"
              exit="exit"
            >
              {/* Close button */}
              <button
                onClick={toggleQuiz}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                aria-label="Close quiz"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Quiz header */}
              <div className="bg-gradient-to-r from-[#0066cc] to-[#0077cc] text-white p-6 pb-10">
                <h3 className="text-2xl font-bold">AI Readiness Assessment</h3>
                <p className="text-blue-100 mt-1">Discover your ideal learning path</p>
              </div>

              {/* Progress bar */}
              {!result && (
                <div className="relative h-2 bg-blue-100 -mt-2">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-blue-600"
                    initial={{ width: `${((currentQuestion) / quizQuestions.length) * 100}%` }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              {/* Quiz content */}
              <div className="p-6">
                {/* Questions */}
                {!result ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        {quizQuestions[currentQuestion].question}
                      </h4>
                      <div className="space-y-3">
                        {quizQuestions[currentQuestion].options.map((option, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleAnswer(option.score)}
                            className="w-full text-left py-3 px-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 flex items-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-medium">
                              {index + 1}
                            </span>
                            {option.text}
                          </motion.button>
                        ))}
                      </div>
                      <div className="mt-6 text-center text-sm text-gray-500">
                        Question {currentQuestion + 1} of {quizQuestions.length}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  // Results screen
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      {!isEmailSubmitted ? (
                        <>
                          <div className="flex justify-center mb-4">
                            {result.icon}
                          </div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">{result.title}</h4>
                          <div className="flex justify-center mb-3">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">Readiness Score:</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium text-sm">{result.score}/20</span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-6">{result.description}</p>
                          
                          <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <h5 className="font-medium text-gray-900 mb-2">Recommended Learning Path:</h5>
                            <ul className="space-y-2">
                              {result.courses.map((course: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <FaCheckCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-700">{course}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-6">
                            <h5 className="font-medium text-gray-900 mb-3">Get Your Personalized Learning Plan</h5>
                            <form onSubmit={handleEmailSubmit} className="space-y-3">
                              <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              />
                              <Button
                                type="submit"
                                className="w-full bg-[#0066cc] hover:bg-[#0055b3] text-white py-2 rounded-lg transition-colors"
                              >
                                Send Me My Plan
                              </Button>
                            </form>
                          </div>
                        </>
                      ) : (
                        // Thank you message after email submission
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          className="py-6"
                        >
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="w-10 h-10 text-green-600" />
                          </div>
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h4>
                          <p className="text-gray-600 mb-6">
                            Your personalized AI learning plan has been sent to your email.
                            Our team may reach out with additional resources tailored to your needs.
                          </p>
                          <Button
                            onClick={toggleQuiz}
                            className="bg-[#0066cc] hover:bg-[#0055b3] text-white py-2 px-6 rounded-lg transition-colors"
                          >
                            Close
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}