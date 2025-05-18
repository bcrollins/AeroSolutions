import React from 'react';
import { Link } from 'wouter';
import CourseLayout from '@/components/course/CourseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Star, 
  Play, 
  Users, 
  Award, 
  Clock, 
  BookOpen, 
  Code, 
  Layers, 
  Download, 
  ChevronRight, 
  BarChart, 
  GraduationCap,
  Building,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { aiCourseStructure } from '@/data/courseStructure';
import ComprehensiveCourseView from '@/components/course/ComprehensiveCourseView';

// Feature card component
const FeatureCard = ({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
    <CardContent className="pt-6">
      <div className="bg-blue-100 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

// Technology component
const TechnologyBadge = ({ name, icon: Icon }: { name: string; icon: React.ElementType }) => (
  <div className="flex flex-col items-center">
    <div className="bg-gray-100 rounded-full p-3 mb-2">
      <Icon className="h-6 w-6 text-gray-800" />
    </div>
    <span className="text-sm">{name}</span>
  </div>
);

// Career path component
const CareerPath = ({ title, salary, growth, icon: Icon }: {
  title: string;
  salary: string;
  growth: string;
  icon: React.ElementType;
}) => (
  <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardContent className="pt-6">
      <div className="flex items-start">
        <div className="bg-green-100 rounded-full p-3 mr-4">
          <Icon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 mb-2">Avg. Salary: {salary}</p>
          <p className="text-green-600 text-sm">Growth: {growth}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Course curriculum preview
const CurriculumPreview = () => {
  // Calculate total stats
  const totalModules = aiCourseStructure.length;
  const totalLessons = aiCourseStructure.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalHours = aiCourseStructure.reduce((acc, module) => acc + module.durationHours, 0);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Comprehensive Curriculum</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our structured learning path takes you from basic concepts to advanced applications with hands-on projects
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{totalModules}</div>
            <p className="text-gray-600">Modules</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{totalLessons}</div>
            <p className="text-gray-600">Lessons</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{totalHours}</div>
            <p className="text-gray-600">Hours</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">36</div>
            <p className="text-gray-600">Projects</p>
          </div>
        </div>
      </div>
      
      <Accordion type="single" collapsible>
        {aiCourseStructure.slice(0, 3).map((module, index) => (
          <AccordionItem key={module.id} value={module.id} className="border mb-4 rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center text-left">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{module.durationHours} hours</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{module.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-gray-600 mb-3">{module.description}</p>
              
              <h4 className="font-medium mb-2">What you'll learn:</h4>
              <ul className="space-y-1 mb-4">
                {module.learningOutcomes.slice(0, 3).map((outcome, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{outcome}</span>
                  </li>
                ))}
                {module.learningOutcomes.length > 3 && (
                  <li className="text-sm text-blue-600">+ {module.learningOutcomes.length - 3} more outcomes</li>
                )}
              </ul>
              
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Preview lessons:</h4>
                <ul className="space-y-2">
                  {module.lessons.filter(lesson => lesson.isPreview).map((lesson, i) => (
                    <li key={i} className="flex items-center">
                      <Play className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">{lesson.title}</span>
                      <Badge variant="outline" className="ml-2 text-xs">Free Preview</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {aiCourseStructure.length > 3 && (
        <div className="text-center">
          <p className="text-gray-600 mb-3">+ {aiCourseStructure.length - 3} more modules covering advanced topics</p>
          <Button variant="outline">
            View Full Curriculum <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Testimonial component
const Testimonial = ({ quote, name, title, avatar }: {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}) => (
  <Card className="border-none shadow-lg">
    <CardContent className="pt-6">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
        ))}
      </div>
      <p className="text-gray-600 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CourseLandingPage = () => {
  // Course metadata
  const courseMetadata = {
    title: "Master AI: From Fundamentals to Advanced Applications",
    description: "A comprehensive program covering the full spectrum of artificial intelligence concepts, technologies, and applications. Whether you're a beginner or experienced professional, this course will elevate your AI skills to the next level.",
    price: 199.99,
    regularPrice: 499.99,
    discount: 60,
  };
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <CourseLayout
      title={courseMetadata.title}
      description={courseMetadata.description}
      showSidebar={false}
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 -mx-4 px-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <Badge className="mb-4 text-lg px-3 py-1.5">New for 2025</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                {courseMetadata.title}
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                {courseMetadata.description}
              </p>
              
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="text-lg font-semibold">4.8</span>
                <span className="text-gray-600">(2,345 ratings)</span>
              </div>
              
              <div className="flex flex-wrap items-center text-sm text-gray-600 mb-8">
                <div className="flex items-center mr-6 mb-2">
                  <Users className="h-5 w-5 mr-1" />
                  <span>12,500+ enrolled</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>71 hours of content</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Award className="h-5 w-5 mr-1" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center mb-2">
                  <BookOpen className="h-5 w-5 mr-1" />
                  <span>Last updated: May 2025</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-md px-8">
                  Enroll Now for ${courseMetadata.price}
                </Button>
                <Button size="lg" variant="outline" className="rounded-md">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Preview
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <span className="line-through">${courseMetadata.regularPrice}</span>
                <span className="text-green-600 font-medium ml-2">{courseMetadata.discount}% off</span>
                <span className="ml-2">• 30-day money-back guarantee</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
                  alt="AI Course" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 rounded-full p-5 hover:bg-opacity-100 transition-all duration-300 cursor-pointer">
                    <Play className="h-10 w-10 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-start">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Dr. Sarah Collins</p>
                    <p className="text-sm text-gray-600">AI Research Lead & Former Google AI Scientist</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* What You'll Learn Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Course Highlights</Badge>
            <h2 className="text-3xl font-bold mb-4">What You'll Learn</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master the full spectrum of AI technologies with our comprehensive curriculum
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: BrainCircuit,
                title: "AI Fundamentals",
                description: "Establish a solid understanding of core AI concepts, from rule-based systems to modern machine learning approaches."
              },
              {
                icon: Layers,
                title: "Deep Learning",
                description: "Master neural networks, convolutional and recurrent architectures through hands-on projects."
              },
              {
                icon: BookOpen,
                title: "Large Language Models",
                description: "Explore cutting-edge LLMs like GPT-4 and learn prompt engineering, fine-tuning, and responsible use."
              },
              {
                icon: Code,
                title: "Practical Implementation",
                description: "Apply your knowledge with real-world projects using Python, TensorFlow, PyTorch, and more."
              },
              {
                icon: BarChart,
                title: "MLOps & Deployment",
                description: "Learn to deploy, monitor, and maintain AI systems in production environments."
              },
              {
                icon: Building,
                title: "Business Strategy",
                description: "Develop frameworks for implementing AI solutions effectively in organizations."
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Curriculum Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <CurriculumPreview />
        </div>
      </section>
      
      {/* Technologies Covered Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Tools & Frameworks</Badge>
            <h2 className="text-3xl font-bold mb-4">Technologies You'll Master</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gain hands-on experience with today's most in-demand AI tools and frameworks
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 justify-items-center">
            {[
              { name: "TensorFlow", icon: BookOpen },
              { name: "PyTorch", icon: BookOpen },
              { name: "OpenAI API", icon: BookOpen },
              { name: "Scikit-learn", icon: BookOpen },
              { name: "Hugging Face", icon: BookOpen },
              { name: "Pandas", icon: BookOpen },
              { name: "Docker", icon: BookOpen },
              { name: "Kubernetes", icon: BookOpen },
              { name: "MLflow", icon: BookOpen },
              { name: "FastAPI", icon: BookOpen },
              { name: "Optuna", icon: BookOpen },
              { name: "Ray", icon: BookOpen },
              { name: "Streamlit", icon: BookOpen },
              { name: "ONNX", icon: BookOpen },
              { name: "LangChain", icon: BookOpen },
              { name: "Weights & Biases", icon: BookOpen },
            ].map((tech, index) => (
              <TechnologyBadge key={index} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Career Paths Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Career Opportunities</Badge>
            <h2 className="text-3xl font-bold mb-4">Where This Course Can Take You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI skills are in high demand across industries, opening doors to lucrative career paths
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Machine Learning Engineer",
                salary: "$150,000/year",
                growth: "+25% annually",
                icon: Code
              },
              {
                title: "AI Research Scientist",
                salary: "$175,000/year",
                growth: "+22% annually",
                icon: BrainCircuit
              },
              {
                title: "Data Scientist",
                salary: "$135,000/year",
                growth: "+20% annually",
                icon: BarChart
              },
              {
                title: "AI Product Manager",
                salary: "$145,000/year",
                growth: "+18% annually",
                icon: Layers
              },
              {
                title: "Computer Vision Engineer",
                salary: "$155,000/year",
                growth: "+24% annually",
                icon: BookOpen
              },
              {
                title: "NLP Specialist",
                salary: "$160,000/year",
                growth: "+28% annually",
                icon: BookOpen
              }
            ].map((career, index) => (
              <CareerPath
                key={index}
                title={career.title}
                salary={career.salary}
                growth={career.growth}
                icon={career.icon}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Student Success</Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied learners who have transformed their careers with our course
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial
              quote="This course completely transformed my career. I went from a junior developer to an AI specialist at a top tech company, with a 40% salary increase!"
              name="Michael Johnson"
              title="AI Engineer at Meta"
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <Testimonial
              quote="As someone without a technical background, I was worried this course might be too advanced. But the progression from basics to advanced topics was perfect!"
              name="Sarah Rodriguez"
              title="Data Science Manager"
              avatar="https://randomuser.me/api/portraits/women/44.jpg"
            />
            <Testimonial
              quote="The hands-on projects were invaluable. I built a portfolio that impressed interviewers and landed my dream job in AI research within 3 months of completing the course."
              name="David Chen"
              title="ML Researcher"
              avatar="https://randomuser.me/api/portraits/men/66.jpg"
            />
          </div>
        </div>
      </section>
      
      {/* Instructor Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Meet Your Instructor</Badge>
            <h2 className="text-3xl font-bold mb-4">Learn from Industry Leaders</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our instructors bring decades of practical experience from top tech companies
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <Avatar className="h-32 w-32 rounded-xl">
                <AvatarImage src="https://randomuser.me/api/portraits/women/32.jpg" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-2xl font-bold mb-1">Dr. Sarah Collins</h3>
                <p className="text-blue-600 mb-4">AI Research Lead & Former Google AI Scientist</p>
                
                <p className="text-gray-600 mb-6">
                  Dr. Collins holds a PhD in Computer Science with a specialization in Machine Learning from Stanford University. With over 15 years of experience in AI research and development at top tech companies, she brings practical insights and cutting-edge knowledge to her teaching. She has published numerous papers in top AI conferences and previously led machine learning teams at Google and OpenAI.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="px-3 py-1">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    PhD, Stanford University
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    12,500+ Students
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    4.8 Instructor Rating
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-2">Questions</Badge>
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our comprehensive AI course
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              {[
                {
                  question: "Do I need prior programming experience for this course?",
                  answer: "While some modules (especially those involving hands-on ML and deep learning) require basic programming knowledge, the course starts with fundamentals that are accessible to beginners. Python programming basics are introduced as needed, and additional resources are provided to help you get up to speed if necessary."
                },
                {
                  question: "How long do I have access to the course?",
                  answer: "Once enrolled, you have lifetime access to the course content, including all future updates and additional resources. You can learn at your own pace and revisit materials whenever you need."
                },
                {
                  question: "Is the certificate recognized by employers?",
                  answer: "Yes, our certificates are recognized by many employers in the tech industry. The certificate demonstrates your proficiency in AI concepts and applications, which is valuable for career advancement in data science, machine learning, and AI-related roles."
                },
                {
                  question: "What hardware requirements are there for the practical exercises?",
                  answer: "For most exercises, a standard laptop or desktop computer is sufficient. For the deep learning modules, we provide alternatives including Colab notebooks that use cloud GPUs, so you don't need specialized hardware. Detailed setup instructions are provided at the beginning of each module."
                },
                {
                  question: "Can I get a refund if the course doesn't meet my expectations?",
                  answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the course, you can request a full refund within 30 days of enrollment."
                },
                {
                  question: "Is there any support available if I get stuck?",
                  answer: "Absolutely! We have a dedicated Q&A forum where instructors and teaching assistants respond to questions, usually within 24-48 hours. You'll also have access to our community of learners who often help each other solve problems."
                }
              ].map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`} 
                  className="border rounded-lg mb-3 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Master AI?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning with us and transform your career
            </p>
            
            <Button size="lg" variant="secondary" className="rounded-md px-8">
              Enroll Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="mt-4 text-sm text-blue-200">
              30-day money-back guarantee • Self-paced • Lifetime access
            </p>
          </motion.div>
        </div>
      </section>
    </CourseLayout>
  );
};

export default CourseLandingPage;