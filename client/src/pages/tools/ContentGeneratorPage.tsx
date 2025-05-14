import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ToolLayout from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { FileText, Copy, Check, Wand2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Tutorial content for the Content Generator tool
const ContentGeneratorTutorial = (
  <div className="space-y-4">
    <p>Welcome to the AI Content Generator! This tool helps you create high-quality content in seconds.</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Select your content type (blog post, social media, product description)</li>
      <li>Enter your topic or keywords</li>
      <li>Adjust tone and style preferences</li>
      <li>Click "Generate" and review the results</li>
      <li>Edit as needed and export your content</li>
    </ol>
    <p className="text-muted-foreground">Pro tip: The more specific your topic and keywords, the better your results will be!</p>
  </div>
);

const ContentGeneratorPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('blog-post');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState([500]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    trackEvent('generate_content', 'content_generator', activeTab);

    try {
      // In a real implementation, this would call the OpenAI API
      // For this demo, we'll simulate a delay and return placeholder content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholders based on content type
      let placeholderContent = '';
      
      if (activeTab === 'blog-post') {
        placeholderContent = `# ${topic}\n\n## Introduction\nIn today's rapidly evolving digital landscape, ${topic} has become an increasingly important consideration for businesses and individuals alike. This article explores the key aspects of ${topic} and provides actionable insights for implementation.\n\n## Understanding ${topic}\n${topic} encompasses a wide range of strategies and technologies designed to enhance user experience and drive engagement. The concept gained prominence in recent years as organizations recognize its potential to transform their operations.\n\n## Key Benefits\n1. Improved efficiency and productivity\n2. Enhanced user satisfaction\n3. Competitive advantage in the marketplace\n4. Cost reduction through optimization\n5. Scalability for future growth\n\n## Best Practices\nWhen implementing ${topic}, consider these best practices:\n- Start with clear objectives and KPIs\n- Involve stakeholders early in the process\n- Leverage data-driven decision making\n- Continuously test and refine your approach\n- Stay informed about industry developments\n\n## Conclusion\nAs we've explored, ${topic} represents a significant opportunity for those willing to embrace innovation. By following the guidelines outlined in this article, you'll be well-positioned to harness its full potential and achieve meaningful results.`;
      } else if (activeTab === 'social-media') {
        placeholderContent = `✨ Excited to share our latest insights on ${topic}! 🚀\n\nWe've been working hard to bring you the most up-to-date information on this trending topic.\n\nKey takeaways:\n• Understanding the fundamentals of ${topic}\n• How to implement ${topic} in your strategy\n• Measuring the impact of ${topic}\n\nWhat's your experience with ${topic}? Share in the comments below! 👇\n\n#${topic.replace(/\s+/g, '')} #Innovation #Growth #Strategy`;
      } else if (activeTab === 'product-description') {
        placeholderContent = `**Introducing Our Premium ${topic} Solution**\n\nElevate your experience with our cutting-edge ${topic} product, designed to exceed expectations and deliver exceptional results.\n\n**Key Features:**\n\n• Seamless integration with existing systems\n• Intuitive interface for effortless navigation\n• Advanced analytics for data-driven insights\n• Customizable options to suit your specific needs\n• Dedicated support from our expert team\n\n**Why Choose Our ${topic} Solution?**\n\nOur product stands out in the market due to its unparalleled quality, innovative features, and commitment to customer satisfaction. Whether you're a seasoned professional or just getting started, our ${topic} solution adapts to your requirements and grows with your needs.\n\n**Customer Satisfaction Guaranteed**\n\nJoin thousands of satisfied customers who have transformed their approach to ${topic} with our premium solution. Experience the difference today!`;
      }
      
      setGeneratedContent(placeholderContent);
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: "An error occurred while generating content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    
    trackEvent('copy_content', 'content_generator', activeTab);
    
    toast({
      title: "Content Copied",
      description: "The generated content has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="AI Content Generator"
      description="Create high-quality content for blogs, social media, and product descriptions with AI assistance."
      tutorial={ContentGeneratorTutorial}
      tutorialTitle="Getting Started with Content Generation"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog-post">Blog Post</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="product-description">Product Description</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic or Title</Label>
                <Input 
                  id="topic" 
                  placeholder="Enter your content topic or title" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords (optional)</Label>
                <Input 
                  id="keywords" 
                  placeholder="Enter keywords separated by commas" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="length">Content Length (words)</Label>
                <div className="pt-2">
                  <Slider 
                    id="length"
                    defaultValue={[500]} 
                    max={2000}
                    step={100}
                    value={length}
                    onValueChange={setLength}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Short (~200)</span>
                    <span>Medium (~1000)</span>
                    <span>Long (~2000)</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium">{length[0]} words</span>
                  </div>
                </div>
              </div>
              
              <Button
                className="w-full mt-4"
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="generated-content">Generated Content</Label>
                {generatedContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                id="generated-content"
                className="min-h-[300px] font-mono text-sm"
                placeholder="Generated content will appear here..."
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                readOnly={isGenerating}
              />
            </div>
          </div>
        </div>
      </Tabs>
    </ToolLayout>
  );
};

export default ContentGeneratorPage;