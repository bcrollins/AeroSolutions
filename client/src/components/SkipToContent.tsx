import React from 'react';
import { cn } from '@/lib/utils';

interface SkipToContentProps {
  /**
   * The ID of the main content element to skip to
   * @default "main-content"
   */
  contentId?: string;
  
  /**
   * Custom button text
   * @default "Skip to main content"
   */
  buttonText?: string;
  
  /**
   * Additional CSS classes for the skip link
   */
  className?: string;
}

/**
 * SkipToContent component provides a way for keyboard users to 
 * skip navigation and jump directly to the main content.
 * The link is visually hidden but becomes visible when focused.
 */
export function SkipToContent({
  contentId = 'main-content',
  buttonText = 'Skip to main content',
  className
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const mainContent = document.getElementById(contentId);
    
    if (mainContent) {
      // Set tabIndex to make the element focusable if it isn't already
      if (!mainContent.hasAttribute('tabIndex')) {
        mainContent.setAttribute('tabIndex', '-1');
      }
      
      // Focus and scroll to the content
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };
  
  return (
    <a
      href={`#${contentId}`}
      onClick={handleClick}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:rounded-md',
        className
      )}
    >
      {buttonText}
    </a>
  );
}

export default SkipToContent;