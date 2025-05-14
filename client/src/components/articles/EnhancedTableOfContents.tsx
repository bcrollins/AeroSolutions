import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { List, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface TableOfContentsHeading {
  id: string;
  text: string;
  level: number;
  isActive?: boolean;
}

interface EnhancedTableOfContentsProps {
  content: string;
  className?: string;
  onHeadingClick?: (id: string) => void;
}

const EnhancedTableOfContents: React.FC<EnhancedTableOfContentsProps> = ({
  content,
  className = '',
  onHeadingClick,
}) => {
  const [headings, setHeadings] = useState<TableOfContentsHeading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update collapsed state on resize based on viewport width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCollapsed(window.innerWidth < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Extract headings from markdown content
  useEffect(() => {
    const extractedHeadings: TableOfContentsHeading[] = [];
    
    // Simple regex to find markdown headings (## and ###)
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      
      extractedHeadings.push({ id, text, level });
    }
    
    setHeadings(extractedHeadings);
  }, [content]);
  
  // Track active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;
    
    const handleScroll = () => {
      // Get all headings with IDs from the document
      const headingElements = headings.map(heading => 
        document.getElementById(heading.id)
      ).filter(Boolean) as HTMLElement[];
      
      // Check which heading is currently in view
      if (headingElements.length) {
        const scrollPosition = window.scrollY + 150; // Offset to trigger earlier
        
        // Find the last heading that's above the current scroll position
        for (let i = headingElements.length - 1; i >= 0; i--) {
          const element = headingElements[i];
          if (element.offsetTop <= scrollPosition) {
            setActiveId(element.id);
            return;
          }
        }
        
        // If no heading is found, default to the first one
        setActiveId(headingElements[0]?.id || null);
      }
    };
    
    handleScroll(); // Check initially
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);
  
  // Handle heading click
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Adjust for header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      trackEvent('toc_navigation', 'engagement', id);
      
      if (onHeadingClick) {
        onHeadingClick(id);
      }
      
      // Auto-collapse on mobile after clicking
      if (isMobile) {
        setCollapsed(true);
      }
    }
  };
  
  if (headings.length === 0) return null;
  
  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <List className="h-5 w-5 mr-2 text-blue-600" />
          <span>Table of Contents</span>
        </CardTitle>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)}
          className="md:hidden h-7 w-7 p-0"
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent className={`pt-0 ${collapsed && isMobile ? 'hidden' : 'block'}`}>
        <ul className="space-y-1 mt-2">
          {headings.map((heading, index) => (
            <li 
              key={index} 
              className={`
                ${heading.level === 2 ? 'font-medium' : 'pl-4 text-muted-foreground'} 
                ${activeId === heading.id ? 'text-blue-600 border-l-2 border-blue-600 pl-3' : 'pl-4'}
                hover:text-blue-600 transition-colors cursor-pointer py-1
              `}
              onClick={() => handleClick(heading.id)}
            >
              {heading.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default EnhancedTableOfContents;