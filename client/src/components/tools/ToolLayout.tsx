import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  tutorial: ReactNode;
  tutorialTitle: string;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({
  children,
  title,
  description,
  tutorial,
  tutorialTitle
}) => {
  return (
    <div className="container py-8">
      <Helmet>
        <title>{title} | RXAI Digital Tools</title>
        <meta name="description" content={description} />
      </Helmet>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/ai-tools">
            <Button variant="ghost" size="sm" className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Tools
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
        
        <Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Tutorial</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{tutorialTitle}</DialogTitle>
              <DialogDescription>
                Learn how to use this tool effectively
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {tutorial}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="p-6">
        <p className="text-muted-foreground mb-6">{description}</p>
        {children}
      </Card>
    </div>
  );
};

export default ToolLayout;