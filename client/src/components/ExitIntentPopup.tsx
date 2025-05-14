import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

interface ExitIntentPopupProps {
  minTimeOnPage?: number; // Minimum time in ms the user should be on the page before showing popup
  delay?: number; // Delay in ms after exit intent is detected
  cookieDuration?: number; // Duration in days to remember user's dismissal
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  minTimeOnPage = 10000, // 10 seconds default
  delay = 100,
  cookieDuration = 7, // 7 days default
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [pageEntryTime] = useState(Date.now());

  // Check if the popup has been dismissed before (stored in cookie)
  const checkCookie = () => {
    const dismissed = localStorage.getItem('exitIntentDismissed');
    if (dismissed) {
      const dismissedDate = new Date(JSON.parse(dismissed));
      const now = new Date();
      // If the cookie is older than the specified duration, allow showing again
      if ((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24) > cookieDuration) {
        return false;
      }
      return true;
    }
    return false;
  };

  // Handle exit intent (mouse leaving the viewport from the top)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if the mouse leaves from the top of the viewport
      if (e.clientY <= 0) {
        const timeOnPage = Date.now() - pageEntryTime;
        
        // Only show if minimum time on page is met and popup hasn't been shown yet
        // and it wasn't dismissed recently (checked via cookie)
        if (timeOnPage > minTimeOnPage && !hasShown && !checkCookie()) {
          setTimeout(() => {
            setIsOpen(true);
            setHasShown(true);
            // Track the event
            trackEvent('exit_intent_popup_shown', 'engagement', 'exit_intent');
          }, delay);
        }
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pageEntryTime, minTimeOnPage, delay, hasShown]);

  // Handle closing the popup
  const handleClose = () => {
    setIsOpen(false);
    // Set cookie to remember dismissal
    localStorage.setItem('exitIntentDismissed', JSON.stringify(new Date()));
    // Track the event
    trackEvent('exit_intent_popup_dismissed', 'engagement', 'exit_intent');
  };

  // Handle accepting the offer
  const handleAcceptOffer = () => {
    // Track the event
    trackEvent('exit_intent_offer_accepted', 'conversion', 'exit_intent');
    // Redirect to the course signup with discount applied
    window.location.href = '/subscriptions?discount=LASTCHANCE25';
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-electric-cyan-400">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Wait! Don't Miss This Opportunity</DialogTitle>
          <DialogDescription className="text-gray-300">
            Get a <span className="text-electric-cyan-400 font-bold">25% discount</span> on our AI courses if you enroll now!
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-[#2a2a2a] rounded-md my-4">
          <h3 className="font-bold text-white text-center mb-2">Limited Time Offer</h3>
          <p className="text-gray-300 text-center">
            This special discount is only available right now. Join thousands of successful students mastering AI with RXAI.
          </p>
          <div className="flex justify-center mt-4">
            <div className="inline-block bg-electric-cyan-400/20 text-electric-cyan-400 font-bold px-3 py-1 rounded-full text-sm">
              Use code: LASTCHANCE25
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-4 mt-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="text-gray-300 border-gray-700 hover:bg-[#2a2a2a]"
          >
            No Thanks
          </Button>
          <Button 
            onClick={handleAcceptOffer}
            className="bg-electric-cyan-600 hover:bg-electric-cyan-700 text-white"
          >
            Get 25% Off Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;