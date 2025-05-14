import { useEffect } from 'react';

/**
 * A hook to dynamically set the document title
 * @param title The title to set (will be appended with " | ROLLINSX")
 */
export const useTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | ROLLINSX`;
    
    return () => {
      // Optional: Restore previous title when component unmounts
    };
  }, [title]);
};