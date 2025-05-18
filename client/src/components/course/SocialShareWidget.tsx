import React, { useState } from 'react';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  CheckCircle,
  X
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SocialShareWidgetProps {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const SocialShareWidget: React.FC<SocialShareWidgetProps> = ({
  title,
  description = '',
  url = window.location.href,
  image,
  buttonText = 'Share',
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);
  
  // Social media sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Success",
          description: "Link copied to clipboard",
          variant: "default",
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      });
  };
  
  // Open URLs in a new tab
  const openShareUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Share your achievements with your network
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Social Media</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => openShareUrl(twitterUrl)}
                className="rounded-full h-10 w-10"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => openShareUrl(facebookUrl)}
                className="rounded-full h-10 w-10"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => openShareUrl(linkedinUrl)}
                className="rounded-full h-10 w-10"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Copy Link</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-gray-100 rounded text-sm truncate">
                {url}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                className="h-10 w-10"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareWidget;