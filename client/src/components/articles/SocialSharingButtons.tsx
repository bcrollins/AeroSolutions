import React from 'react';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';

interface SocialSharingButtonsProps {
  title: string;
  url: string;
  summary?: string;
  className?: string;
}

const SocialSharingButtons: React.FC<SocialSharingButtonsProps> = ({
  title,
  url,
  summary = '',
  className = '',
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    trackEvent('share', 'social', 'twitter');
  };

  const shareOnLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank');
    trackEvent('share', 'social', 'linkedin');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
    trackEvent('share', 'social', 'facebook');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "The article link has been copied to your clipboard.",
    });
    trackEvent('share', 'copy', 'link');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={shareOnTwitter}
        className="bg-transparent border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        <Twitter className="h-4 w-4 text-blue-600 group-hover:text-white" />
        <span className="sr-only">Share on Twitter/X</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={shareOnLinkedin}
        className="bg-transparent border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        <Linkedin className="h-4 w-4 text-blue-600 group-hover:text-white" />
        <span className="sr-only">Share on LinkedIn</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={shareOnFacebook}
        className="bg-transparent border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        <Facebook className="h-4 w-4 text-blue-600 group-hover:text-white" />
        <span className="sr-only">Share on Facebook</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={copyToClipboard}
        className="bg-transparent border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        {copied ? (
          <Check className="h-4 w-4 text-blue-600 group-hover:text-white" />
        ) : (
          <Copy className="h-4 w-4 text-blue-600 group-hover:text-white" />
        )}
        <span className="sr-only">Copy link</span>
      </Button>
    </div>
  );
};

export default SocialSharingButtons;