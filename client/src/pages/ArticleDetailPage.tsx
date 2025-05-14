import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useRoute } from 'wouter';
import { 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Clock, 
  Calendar,
  Share2,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Link as LinkIcon,
  Twitter,
  Facebook,
  LinkedinIcon,
  Copy,
  Brain,
  CheckIcon,
  AlertCircle,
  PlayCircle,
  Mail,
  Search,
  Check,
  X,
  ThumbsDown,
  BarChart2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Progress
} from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent, trackPageView } from '@/lib/analytics';

// Define article type
type ArticleType = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
  image: string;
  readTime: number;
  date: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  relatedArticles: number[];
  isNew?: boolean;
};

// Hardcoded article data for demo
// In a real application, this would be fetched from the API
const getArticleBySlug = (slug: string): ArticleType | undefined => {
  const articles: ArticleType[] = [
    {
      id: 1,
      slug: "what-is-artificial-intelligence-beginners-guide-2025",
      title: "What Is Artificial Intelligence? A Beginner's Guide for 2025",
      description: "Learn the fundamentals of AI, how it works, and its applications in this comprehensive beginner's guide for 2025.",
      category: "Fundamentals",
      content: `
        <h2>Introduction to Artificial Intelligence</h2>
        <p>Artificial Intelligence (AI) has moved from science fiction into our everyday lives. In 2025, AI systems are more powerful and accessible than ever before, transforming industries and creating new possibilities. This beginner's guide will help you understand what AI really is, how it works, and why it matters.</p>
        
        <p>At its core, artificial intelligence refers to machines programmed to mimic human intelligence. These systems can learn from experience, adjust to new inputs, and perform human-like tasks. From voice assistants on your phone to sophisticated algorithms trading stocks, AI technology is already deeply integrated into our world.</p>
        
        <h2>Key Types of Artificial Intelligence</h2>
        <p>AI can be broadly categorized into several types:</p>
        
        <h3>Narrow or Weak AI</h3>
        <p>This is AI designed and trained for a specific task. Most AI in use today is narrow AI. Examples include voice assistants like Siri or Alexa, recommendation systems on streaming platforms, and image recognition software. While impressive within their specific domains, these systems cannot transfer their learning to other tasks.</p>
        
        <h3>General or Strong AI</h3>
        <p>This refers to AI with human-level cognitive abilities across a wide range of tasks. Strong AI would be able to understand, learn, and apply knowledge across different domains just like humans do. As of 2025, true strong AI remains theoretical, though rapid advances continue to push boundaries.</p>
        
        <h3>Superintelligent AI</h3>
        <p>This hypothetical form of AI would surpass human intelligence and capabilities. It remains in the realm of speculation and raises significant philosophical and ethical questions that researchers and policymakers are actively exploring.</p>
        
        <h2>How Artificial Intelligence Works</h2>
        <p>Modern AI systems rely on several key technologies and approaches:</p>
        
        <h3>Machine Learning</h3>
        <p>Machine learning is a subset of AI that enables computers to learn from data without explicit programming. By analyzing patterns in large datasets, machines can make predictions or decisions without being specifically programmed for each scenario.</p>
        
        <h3>Deep Learning</h3>
        <p>Deep learning uses neural networks with many layers (hence "deep") to analyze various factors of data. This approach has revolutionized AI capabilities, powering breakthroughs in image and speech recognition, language translation, and more.</p>
        
        <h3>Natural Language Processing</h3>
        <p>NLP allows machines to understand, interpret, and generate human language. This technology powers everything from translation services to chatbots and content generation tools.</p>
        
        <h2>Real-World Applications of AI in 2025</h2>
        <p>AI is transforming virtually every industry:</p>
        
        <h3>Healthcare</h3>
        <p>AI systems now assist with everything from medical image analysis to drug discovery and personalized treatment recommendations. In 2025, AI diagnostic tools have become standard in many healthcare settings, improving accuracy and providing critical decision support for medical professionals.</p>
        
        <h3>Finance</h3>
        <p>AI algorithms trade stocks, detect fraud, assess loan applications, and provide personalized financial advice. The technology has made financial services more accessible while improving security and efficiency.</p>
        
        <h3>Transportation</h3>
        <p>Self-driving vehicles are increasingly common on roads, while AI optimizes traffic flow, logistics, and public transportation systems. The technology is helping create safer, more efficient transportation networks.</p>
        
        <h3>Education</h3>
        <p>Personalized learning platforms adapt to individual student needs, while AI tutoring systems provide on-demand assistance. These tools are making quality education more accessible and tailored to diverse learning styles.</p>
        
        <h2>The Future of AI: Trends to Watch</h2>
        <p>As we move through 2025, several exciting developments are shaping the future of AI:</p>
        
        <h3>Multimodal AI</h3>
        <p>The newest AI systems can process multiple types of data simultaneously—text, images, audio, and video—creating more versatile and capable applications.</p>
        
        <h3>Edge AI</h3>
        <p>AI processing is increasingly happening on local devices rather than in the cloud, enabling faster response times and better privacy protections.</p>
        
        <h3>Explainable AI</h3>
        <p>As AI systems make more important decisions, the ability to understand and explain their reasoning is becoming crucial. Research in this area is helping create more transparent AI systems.</p>
        
        <h2>Ethical Considerations and Challenges</h2>
        <p>The rapid advancement of AI technology brings important questions:</p>
        
        <h3>Bias and Fairness</h3>
        <p>AI systems can inherit and amplify biases present in their training data. Ensuring these systems are fair and equitable remains an ongoing challenge.</p>
        
        <h3>Privacy Concerns</h3>
        <p>AI often requires large amounts of data to function effectively, raising important questions about data collection and usage.</p>
        
        <h3>Job Displacement</h3>
        <p>While AI creates new opportunities, it also automates tasks previously done by humans. Society continues to adapt to these shifts in the labor market.</p>
        
        <h2>Getting Started with AI in 2025</h2>
        <p>For those interested in exploring AI:</p>
        
        <h3>Online Courses</h3>
        <p>Numerous platforms offer accessible introductions to AI concepts and practical skills, many designed specifically for beginners.</p>
        
        <h3>No-Code AI Tools</h3>
        <p>User-friendly platforms now allow non-programmers to build and deploy AI solutions for various applications.</p>
        
        <h3>Community Resources</h3>
        <p>Open-source projects, forums, and local meetups provide valuable support for those learning about AI technology.</p>
        
        <h2>Conclusion</h2>
        <p>Artificial intelligence has evolved from a futuristic concept to an integral part of our daily lives. As we navigate the AI-enhanced world of 2025, understanding the basics of this transformative technology helps us make informed decisions about its use and development. Whether you're a curious observer or someone looking to harness AI in your work or personal projects, the journey into artificial intelligence offers exciting possibilities and important questions to consider.</p>
      `,
      image: "/images/articles/ai-beginners-guide.webp",
      readTime: 8,
      date: "2025-03-15",
      author: {
        name: "Dr. Alex Morgan",
        title: "AI Research Director",
        image: "/images/team/alex-morgan.webp"
      },
      faqs: [
        {
          question: "What's the difference between AI and machine learning?",
          answer: "Artificial Intelligence is the broader concept of machines being able to carry out tasks in a way that we would consider 'smart.' Machine learning is a specific subset of AI that focuses on training computers to learn from data without explicit programming."
        },
        {
          question: "Do I need programming skills to use AI?",
          answer: "Not necessarily. In 2025, many AI tools and platforms are designed for non-technical users with user-friendly interfaces. However, a basic understanding of programming can help you get more out of advanced AI applications and customization."
        },
        {
          question: "Is AI going to replace human jobs?",
          answer: "AI is certainly automating certain tasks, but it's also creating new job opportunities. The impact varies by industry, with AI generally handling routine, repetitive tasks while humans focus on work requiring creativity, emotional intelligence, and complex problem-solving."
        },
        {
          question: "How can small businesses benefit from AI in 2025?",
          answer: "Small businesses can leverage AI through tools for customer service (chatbots), marketing optimization, inventory management, data analysis, and streamlined operations. Many affordable, accessible AI solutions are now available specifically for small business needs."
        }
      ],
      relatedArticles: [2, 3, 5]
    }
  ];
  
  return articles.find(article => article.slug === slug);
};

// Table of Contents component
const TableOfContents = ({ content }: { content: string }) => {
  // Extract headings (h2 and h3) from content
  const headings: { id: string, title: string, level: number }[] = [];
  const regex = /<h(2|3)>(.*?)<\/h\1>/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const title = match[2];
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    headings.push({ id, title, level });
  }
  
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Table of Contents</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav>
          <ul className="space-y-1">
            {headings.map((heading, index) => (
              <li key={index} className={heading.level === 3 ? "ml-4" : ""}>
                <a 
                  href={`#${heading.id}`} 
                  className={`block text-sm py-1 hover:text-primary transition-colors ${
                    heading.level === 3 ? "text-muted-foreground" : "font-medium"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};

// Social Share buttons component
const SocialShare = ({ url, title }: { url: string, title: string }) => {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-9 w-9"
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, '_blank');
                trackEvent('share', 'article', 'twitter');
              }}
            >
              <Twitter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Twitter</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-9 w-9"
              onClick={() => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
                trackEvent('share', 'article', 'facebook');
              }}
            >
              <Facebook className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Facebook</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-9 w-9"
              onClick={() => {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
                trackEvent('share', 'article', 'linkedin');
              }}
            >
              <LinkedinIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on LinkedIn</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-9 w-9"
              onClick={() => {
                navigator.clipboard.writeText(url);
                trackEvent('share', 'article', 'copy_link');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Technical Term Tooltip Component
const TechTermTooltip = ({ term, definition, children }: { term: string, definition: string, children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dashed border-primary/60 text-primary">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-primary/90 text-primary-foreground">
          <p><strong>{term}:</strong> {definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Reading Progress Indicator
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const currentProgress = (scrollPosition / totalHeight) * 100;
      setProgress(currentProgress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full z-50 h-1">
      <Progress value={progress} className="h-1 bg-transparent" />
    </div>
  );
};

// Interactive Poll Component
const InteractivePoll = ({ question, options }: { question: string, options: string[] }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  
  const handleVote = () => {
    if (!selectedOption) return;
    
    // In a real app, this would be an API call
    // For demo, we'll generate fake results
    setHasVoted(true);
    
    const fakeResults: Record<string, number> = {};
    let total = 0;
    
    options.forEach(option => {
      // Generate random vote count between 10 and 100
      const votes = Math.floor(Math.random() * 90) + 10;
      fakeResults[option] = votes;
      total += votes;
    });
    
    // Ensure selected option has at least 20% of votes
    const minVotes = Math.ceil(total * 0.2);
    if (fakeResults[selectedOption] < minVotes) {
      const difference = minVotes - fakeResults[selectedOption];
      fakeResults[selectedOption] = minVotes;
      total += difference;
    }
    
    // Convert to percentages
    options.forEach(option => {
      fakeResults[option] = Math.round((fakeResults[option] / total) * 100);
    });
    
    setResults(fakeResults);
    trackEvent('poll_vote', 'article', selectedOption);
  };
  
  return (
    <div className="my-8 p-5 bg-primary/5 rounded-lg border border-primary/20">
      <h3 className="text-lg font-medium mb-4">{question}</h3>
      
      {!hasVoted ? (
        <>
          <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  className="border-primary text-primary"
                />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={handleVote} 
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!selectedOption}
          >
            Vote
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={selectedOption === option ? "font-medium text-primary" : ""}>
                  {option}
                </span>
                <span className="font-medium">{results[option]}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedOption === option ? 'bg-primary' : 'bg-primary/50'}`}
                  style={{ width: `${results[option]}%` }}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-4">Thank you for your vote!</p>
        </div>
      )}
    </div>
  );
};

// Newsletter Signup Component
const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    setIsSubmitted(true);
    trackEvent('newsletter_signup', 'article', email);
  };
  
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-primary/30 to-primary/5 rounded-lg">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="md:w-2/3">
          <h3 className="text-xl font-bold mb-2">Stay Updated with RXAI Insights</h3>
          <p className="text-muted-foreground mb-4">
            Get the latest AI news, tutorials, and research delivered to your inbox every week.
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-primary">
              <CheckIcon className="h-5 w-5" />
              <span>Thank you! Check your email to confirm your subscription.</span>
            </div>
          )}
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SEO Audit Tool Component
const SeoAuditTool = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | {
    score: number;
    issues: { type: string; description: string; severity: 'high' | 'medium' | 'low' }[];
  }>(null);
  
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate fake audit results
      const score = Math.floor(Math.random() * 30) + 60; // 60-90 score
      
      const possibleIssues = [
        { type: 'Meta Tags', description: 'Missing meta descriptions on multiple pages', severity: 'high' as const },
        { type: 'Headers', description: 'Improper use of H1 tags', severity: 'medium' as const },
        { type: 'Content', description: 'Low word count on key pages', severity: 'medium' as const },
        { type: 'Speed', description: 'Slow page load times on mobile', severity: 'high' as const },
        { type: 'Links', description: 'Several broken internal links found', severity: 'medium' as const },
        { type: 'Keywords', description: 'Keyword stuffing detected', severity: 'high' as const },
        { type: 'Images', description: 'Missing alt tags on images', severity: 'low' as const },
        { type: 'Mobile', description: 'Site not fully responsive', severity: 'high' as const },
      ];
      
      // Select 3-5 random issues
      const issueCount = Math.floor(Math.random() * 3) + 3;
      const shuffledIssues = [...possibleIssues].sort(() => 0.5 - Math.random());
      const selectedIssues = shuffledIssues.slice(0, issueCount);
      
      setResults({
        score,
        issues: selectedIssues,
      });
      
      setIsAnalyzing(false);
      trackEvent('seo_audit', 'article', url);
    }, 2500);
  };
  
  return (
    <div className="my-8 p-6 bg-blue-950/20 rounded-lg border border-blue-800/30">
      <h3 className="text-xl font-bold text-primary mb-4">Free SEO Audit Tool</h3>
      
      {!results ? (
        <>
          <p className="text-muted-foreground mb-4">
            Enter your website URL for a quick SEO analysis with actionable recommendations.
          </p>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="url" 
                placeholder="https://yourwebsite.com" 
                className="pl-10"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze My Site'
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">SEO Health Score</div>
              <div className="text-3xl font-bold text-primary">{results.score}/100</div>
            </div>
            
            <div className="w-full sm:w-auto">
              <div className="h-2.5 w-full sm:w-44 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    results.score >= 80 ? 'bg-green-500' : 
                    results.score >= 60 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${results.score}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {results.score >= 80 ? 'Good' : 
                 results.score >= 60 ? 'Needs Improvement' : 
                 'Poor'}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Top Issues Found:</h4>
            <ul className="space-y-2">
              {results.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className={`mt-0.5 min-w-4 min-h-4 rounded-full ${
                    issue.severity === 'high' ? 'bg-red-500' :
                    issue.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{issue.type}</div>
                    <div className="text-muted-foreground">{issue.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            onClick={() => {
              setResults(null);
              setUrl('');
            }}
            variant="outline"
            className="w-full"
          >
            Run Another Analysis
          </Button>
        </div>
      )}
    </div>
  );
};

// Video Player Component
const VideoComponent = ({ videoId, title }: { videoId: string; title: string }) => {
  const [showVideo, setShowVideo] = useState(false);
  
  return (
    <div className="my-8 overflow-hidden rounded-lg">
      {!showVideo ? (
        <div 
          className="relative h-64 md:h-96 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center cursor-pointer"
          onClick={() => {
            setShowVideo(true);
            trackEvent('video_play', 'article', title);
          }}
        >
          <div className="absolute inset-0 opacity-40 bg-[url('/images/video-thumbnail.webp')] bg-cover bg-center" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <PlayCircle className="h-8 w-8 text-white" />
            </div>
            <p className="text-white font-medium">Watch the video explainer</p>
          </div>
        </div>
      ) : (
        <div className="relative pb-[56.25%] h-0 overflow-hidden">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      )}
    </div>
  );
};

// Author Bio Component
const AuthorBio = ({ author }: { author: any }) => {
  return (
    <div className="p-5 border border-primary/20 rounded-lg bg-primary/5 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-2xl font-bold">
          {author.image ? (
            <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            author.name.charAt(0)
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{author.name}</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Author
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{author.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <LinkedinIcon className="h-4 w-4" />
            </Button>
            <Link href="/authors/alex-morgan" className="text-xs text-primary">
              View full profile →
            </Link>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <p className="text-sm text-muted-foreground">
        Expert in artificial intelligence and machine learning with over 10 years of experience. 
        Author of numerous research papers and a frequent speaker at technology conferences.
      </p>
    </div>
  );
};

// Related Articles component
const RelatedArticles = ({ ids }: { ids: number[] }) => {
  const articles = [
    {
      id: 2,
      slug: "how-to-learn-ai-from-scratch-step-by-step-guide-2025",
      title: "How to Learn AI from Scratch: Your 2025 Step-by-Step Guide",
      description: "A practical roadmap for beginners to start learning artificial intelligence from zero technical knowledge.",
      category: "Learning",
      image: "/images/articles/learn-ai-scratch.webp",
      readTime: 12,
      date: "2025-03-18"
    },
    {
      id: 3,
      slug: "best-online-ai-courses-beginners-2025",
      title: "Best Online AI Courses for Beginners in 2025: Top Picks",
      description: "Discover the most effective online courses to master artificial intelligence fundamentals in 2025.",
      category: "Learning",
      image: "/images/articles/ai-courses-2025.webp",
      readTime: 10,
      date: "2025-03-20"
    },
    {
      id: 5,
      slug: "what-is-machine-learning-how-it-works-2025",
      title: "What Is Machine Learning? How It Works in 2025",
      description: "Understand machine learning concepts, algorithms, and real-world applications in this up-to-date guide.",
      category: "Fundamentals",
      image: "/images/articles/machine-learning-basics.webp",
      readTime: 11,
      date: "2025-03-25"
    }
  ];
  
  const relatedArticles = articles.filter(article => ids.includes(article.id));
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map(article => (
          <Card key={article.id} className="overflow-hidden h-full hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-indigo-700/40 via-blue-800/40 to-indigo-900/40 flex items-center justify-center">
              <Brain className="h-10 w-10 text-white/70" />
            </div>
            <div className="p-4">
              <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                {article.category}
              </Badge>
              <Link href={`/articles/${article.slug}`}>
                <h3 className="font-bold hover:text-primary transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
              </Link>
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{new Date(article.date).toLocaleDateString()}</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {article.readTime} min read
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ArticleDetailPage: React.FC = () => {
  const [, params] = useRoute('/articles/:slug');
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  
  // Poll options for interactive poll
  const pollOptions = [
    "GPT-4o",
    "Claude 3",
    "Llama 3",
    "Grok",
    "I don't use AI tools regularly"
  ];
  
  // Definitions for technical terms
  const techTerms = {
    "NLP": "Natural Language Processing - The branch of AI that helps computers understand, interpret, and respond to human language.",
    "Machine Learning": "A subset of AI that enables computers to learn from data and improve without explicit programming.",
    "Neural Networks": "Computing systems inspired by the biological neural networks in human brains, capable of learning complex patterns.",
    "Multimodal AI": "AI systems that can process and understand multiple types of inputs such as text, images, audio, and video."
  };
  
  useEffect(() => {
    if (params?.slug) {
      const fetchedArticle = getArticleBySlug(params.slug);
      
      if (fetchedArticle) {
        // Add 'isNew' flag if article is less than 7 days old
        const now = new Date();
        const articleDate = new Date(fetchedArticle.date);
        const daysDifference = Math.ceil((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference <= 7) {
          const articleWithNew = {
            ...fetchedArticle,
            isNew: true
          };
          setArticle(articleWithNew);
        } else {
          setArticle(fetchedArticle);
        }
        
        // Track page view with more details for analytics
        trackPageView(`/articles/${fetchedArticle.slug}`);
        trackEvent('view', 'article', fetchedArticle.title);
        
        // Update meta tags dynamically
        document.title = `${fetchedArticle.title} | RXAI - Rollins X Technologies`;
        
        // Create meta description tag with keywords
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', fetchedArticle.description);
        }
      } else {
        setError('Article not found');
      }
      
      setLoading(false);
    }
  }, [params]);
  
  // Show newsletter after user scrolls 60% through the article
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      
      const { top, height } = articleRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleHeight = Math.max(0, Math.min(height, viewportHeight - top));
      const progress = (visibleHeight / height) * 100;
      setReadingProgress(progress);
      
      // Show newsletter signup when 60% through article
      if (progress > 60 && !showNewsletter) {
        setShowNewsletter(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showNewsletter]);
  
  // Process article content to add IDs for the table of contents

  // Process article content to add ids to headings for TOC navigation
  const processedContent = article?.content.replace(
    /<h(2|3)>(.*?)<\/h\1>/g, 
    (match: string, level: string, title: string) => {
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<h${level} id="${id}">${title}</h${level}>`;
    }
  );
  
  // Show loading state
  if (loading) {
    return (
      <div className="container max-w-7xl py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-[300px] bg-muted rounded-lg w-full mt-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            <div className="md:col-span-1">
              <div className="h-[300px] bg-muted rounded"></div>
            </div>
            <div className="md:col-span-3 space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container max-w-7xl py-12">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/articles">
            <Button>Browse All Articles</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!article) return null;
  
  // SEO-optimized JSON-LD schema for FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
  
  // Current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? 
    window.location.href : 
    `https://rxai.com/articles/${article.slug}`;
  
  // Function to wrap technical terms with tooltips
  const enhanceContentWithTooltips = (content: string): string => {
    let enhancedContent = content;
    
    Object.entries(techTerms).forEach(([term, definition]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      enhancedContent = enhancedContent.replace(
        regex, 
        `<span class="cursor-help border-b border-dashed border-primary/60 text-primary" data-term="${term}" data-definition="${definition}">${term}</span>`
      );
    });
    
    return enhancedContent;
  };
  
  // Process content with tooltips and heading IDs
  const enhancedContent = article?.content ? enhanceContentWithTooltips(processedContent) : '';
  
  return (
    <div className="container max-w-7xl py-12">
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      <Helmet>
        <title>{article.title} | RXAI - Rollins X Technologies</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta name="keywords" content={`AI, artificial intelligence, ${article.category.toLowerCase()}, machine learning, RXAI, Rollins X, tech, technology`} />
        {article.image && <meta property="og:image" content={article.image} />}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {/* Blue Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm text-blue-400 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/articles" className="hover:text-primary transition-colors">
          Articles
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/articles/category/${article.category.toLowerCase()}`} className="hover:text-primary transition-colors">
          {article.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary font-medium truncate max-w-[200px]">
          {article.title.split(':')[0]}
        </span>
      </div>
      
      {/* Article header */}
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {article.category}
            </Badge>
            
            {/* New badge if article is recent */}
            {article.isNew && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">
                New
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-4xl">
            {article.description}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(article.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">
                  {article.readTime} min read
                </span>
              </div>
            </div>
            
            <SocialShare url={currentUrl} title={article.title} />
          </div>
        </div>
        
        {/* Featured image */}
        <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-indigo-700/40 via-blue-800/40 to-indigo-900/40 flex items-center justify-center">
          <Brain className="h-20 w-20 text-white/70" />
        </div>
      </div>
      
      {/* Main content area with table of contents */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Table of Contents - desktop sidebar */}
        <div className="hidden md:block">
          <TableOfContents content={article.content} />
          
          {/* Cross-Device Sync Badge */}
          <div className="mt-6 p-4 bg-blue-950/30 rounded-lg text-sm border border-blue-800/30">
            <div className="flex items-center gap-2 mb-2 text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z" />
              </svg>
              <span className="font-medium">Reading Progress</span>
            </div>
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(readingProgress, 100)}%` }} />
            </div>
            <p className="text-muted-foreground text-xs">
              Your progress is synced across devices. Continue reading where you left off on any device.
            </p>
          </div>
        </div>
        
        {/* Article content */}
        <div className="md:col-span-3" ref={articleRef}>
          {/* Enhanced Author Bio */}
          <AuthorBio author={article.author} />
          
          {/* Optional video explainer */}
          <VideoComponent videoId="jAu1ZsTCA64" title={article.title} />
          
          {/* Article body with enhanced content */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline">
            <div dangerouslySetInnerHTML={{ __html: enhancedContent }} />
          </div>
          
          {/* Interactive Poll */}
          <InteractivePoll 
            question="Which AI tool do you use most frequently?"
            options={pollOptions}
          />
          
          {/* Newsletter Signup */}
          {showNewsletter && <NewsletterSignup />}
          
          {/* SEO Audit Tool */}
          <SeoAuditTool />
          
          {/* Article footer actions */}
          <div className="mt-12 flex flex-col gap-4">
            <Separator />
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  Helpful
                </Button>
                <Button variant="outline" className="gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
              </div>
              <div className="mt-4 sm:mt-0">
                <SocialShare url={currentUrl} title={article.title} />
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {article.faqs.map((faq: any, index: number) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Related Articles */}
          <RelatedArticles ids={article.relatedArticles} />
          
          {/* Feedback Button */}
          <div className="mt-12 text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-blue-400 border-blue-400/30 hover:bg-blue-950/20">
                  <MessageSquare className="h-4 w-4" />
                  Help us improve this article
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Article Feedback</DialogTitle>
                  <DialogDescription>
                    Help us make our content more useful by sharing your thoughts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-text">What could we improve?</Label>
                    <textarea 
                      id="feedback-text" 
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                      placeholder="Share your thoughts on how we can make this article better..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-primary text-primary-foreground">Submit Feedback</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;