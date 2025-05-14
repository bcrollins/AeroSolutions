import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { 
  Search, 
  ChevronRight, 
  BookOpen,
  ArrowRight,
  Filter,
  Terminal,
  Brain,
  Code,
  Database,
  Bot
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Article data - static for now, would connect to backend API in production
const articlesData = [
  {
    id: 1,
    slug: "what-is-artificial-intelligence-beginners-guide-2025",
    title: "What Is Artificial Intelligence? A Beginner's Guide for 2025",
    description: "Learn the fundamentals of AI, how it works, and its applications in this comprehensive beginner's guide for 2025.",
    category: "Fundamentals",
    image: "/images/articles/ai-beginners-guide.webp",
    readTime: 8,
    date: "2025-03-15"
  },
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
    id: 4,
    slug: "how-to-use-ai-web-development-tools-tips-2025",
    title: "How to Use AI for Web Development: 2025 Tools & Tips",
    description: "Practical ways to leverage artificial intelligence to enhance your web development workflow and projects.",
    category: "Development",
    image: "/images/articles/ai-web-development.webp",
    readTime: 9,
    date: "2025-03-22"
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
  },
  {
    id: 6,
    slug: "how-to-build-ai-powered-website-ultimate-guide-2025",
    title: "How to Build an AI-Powered Website in 2025: Ultimate Guide",
    description: "Step-by-step instructions to create websites with integrated AI features for enhanced user experiences.",
    category: "Development",
    image: "/images/articles/ai-website-guide.webp",
    readTime: 15,
    date: "2025-03-28"
  }
];

// Categories for filtering
const categories = [
  { value: "all", label: "All Categories" },
  { value: "fundamentals", label: "Fundamentals" },
  { value: "development", label: "Development" },
  { value: "learning", label: "Learning" },
  { value: "tools", label: "Tools & Software" },
  { value: "ethics", label: "Ethics & Society" },
  { value: "business", label: "Business Applications" }
];

// Article placeholder image (gradient with icon)
const ArticleImage = ({ category }: { category: string }) => {
  const getIcon = () => {
    switch(category.toLowerCase()) {
      case 'fundamentals':
        return <Brain className="h-10 w-10 text-white/70" />;
      case 'development':
        return <Code className="h-10 w-10 text-white/70" />;
      case 'learning':
        return <BookOpen className="h-10 w-10 text-white/70" />;
      case 'tools':
        return <Terminal className="h-10 w-10 text-white/70" />;
      case 'business':
        return <Database className="h-10 w-10 text-white/70" />;
      default:
        return <Bot className="h-10 w-10 text-white/70" />;
    }
  };

  return (
    <div className="h-[200px] bg-gradient-to-br from-indigo-700/40 via-blue-800/40 to-indigo-900/40 w-full rounded-t-lg flex items-center justify-center">
      {getIcon()}
    </div>
  );
};

const ArticlesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter articles based on search query and category
  const filteredArticles = articlesData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container max-w-7xl py-12">
      <Helmet>
        <title>AI Articles & Tutorials | RXAI - Rollins X Technologies</title>
        <meta name="description" content="Explore our collection of in-depth articles and tutorials about artificial intelligence, machine learning, development, and ethical considerations." />
      </Helmet>

      {/* Header with breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary font-medium">Articles</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
              AI Articles & Tutorials
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Expert guides and educational content to help you understand and implement artificial intelligence in your projects.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden md:block" />
          <span className="text-sm text-muted-foreground mr-2 hidden md:block">Filter by:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">
          {filteredArticles.length === 0 ? 
            'No articles found' : 
            `Showing ${filteredArticles.length} articles`}
        </h2>
        <Separator className="mt-4" />
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <Card key={article.id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Placeholder for image - in production, would use actual images */}
              <ArticleImage category={article.category} />
              
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {article.category}
                  </Badge>
                </div>
                
                <Link href={`/articles/${article.slug}`}>
                  <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="mt-auto pt-4 flex items-center justify-between text-sm text-muted-foreground border-t">
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                  <span>{article.readTime} min read</span>
                </div>
                
                <Link href={`/articles/${article.slug}`}>
                  <Button className="w-full mt-4 gap-2">
                    Read Article <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 
              `We couldn't find any articles matching "${searchQuery}".` : 
              "No articles match the selected category."
            }
          </p>
          <Button onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;