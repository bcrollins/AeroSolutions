import { useEffect } from 'react';

/**
 * A hook to set the document title
 * @param title The title to set
 */
export function useTitle(title: string) {
  useEffect(() => {
    // Set the document title
    const prevTitle = document.title;
    document.title = title ? `${title} | Rollins X` : 'Rollins X';
    
    // Cleanup function to reset the title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}