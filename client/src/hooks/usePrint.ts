import { useRef, useCallback, useState, useEffect } from 'react';
import '../styles/print.css'; // Import print styles

interface PrintOptions {
  /**
   * Title for the printed page
   * @default current page title
   */
  title?: string;
  
  /**
   * Whether to include the ROLLINSX logo and header in the printed output
   * @default true
   */
  includeHeader?: boolean;
  
  /**
   * Whether to include the page number and footer in printed output
   * @default true
   */
  includeFooter?: boolean;
  
  /**
   * Show QR code linking to digital version
   * @default false
   */
  includeQRCode?: boolean;
  
  /**
   * URL for QR code, if undefined uses current page URL
   */
  qrCodeURL?: string;
  
  /**
   * CSS selector for the element to print
   * @default undefined (print entire page)
   */
  selector?: string;
  
  /**
   * If a page break should be inserted after each element (useful for lists)
   * @default false
   */
  breakAfterItems?: boolean;
  
  /**
   * Additional styles to append
   */
  additionalStyles?: string;
  
  /**
   * Callback before printing starts
   */
  beforePrint?: () => void;
  
  /**
   * Callback after printing is done/canceled
   */
  afterPrint?: () => void;
}

/**
 * Hook for handling print functionality with options
 */
export function usePrint(options: PrintOptions = {}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const originalTitle = useRef<string>(document.title);
  
  // Clean up iframe on unmount
  useEffect(() => {
    return () => {
      if (printFrameRef.current && printFrameRef.current.parentNode) {
        document.body.removeChild(printFrameRef.current);
        printFrameRef.current = null;
      }
    };
  }, []);
  
  // Listen for afterprint event
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
      document.title = originalTitle.current;
      if (options.afterPrint) {
        options.afterPrint();
      }
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [options]);
  
  // Function to generate QR code (as SVG)
  const generateQRCode = useCallback((data: string, size = 100): string => {
    // Simple implementation of QR code as SVG
    // In a real app, you'd use a proper QR code library
    // This is just a placeholder pattern
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="white" />
      <text x="10" y="${size/2}" font-family="monospace" font-size="10">QR Code for:</text>
      <text x="10" y="${size/2 + 15}" font-family="monospace" font-size="8">${data}</text>
    </svg>`;
  }, []);
  
  // Main print function
  const print = useCallback(() => {
    const {
      title = document.title,
      includeHeader = true,
      includeFooter = true,
      includeQRCode = false,
      qrCodeURL = window.location.href,
      selector,
      breakAfterItems = false,
      additionalStyles = '',
      beforePrint
    } = options;
    
    setIsPrinting(true);
    originalTitle.current = document.title;
    document.title = title;
    
    if (beforePrint) {
      beforePrint();
    }
    
    // Remove existing frame if it exists
    if (printFrameRef.current && printFrameRef.current.parentNode) {
      document.body.removeChild(printFrameRef.current);
    }
    
    // Create a new iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '-9999px';
    printFrame.style.bottom = '-9999px';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    
    document.body.appendChild(printFrame);
    printFrameRef.current = printFrame;
    
    const frameDocument = printFrame.contentDocument;
    if (!frameDocument) return;
    
    // Get content to print
    let contentToPrint: Element | null;
    if (selector) {
      contentToPrint = document.querySelector(selector);
      if (!contentToPrint) {
        console.error(`Element with selector "${selector}" not found`);
        return;
      }
    } else {
      contentToPrint = document.documentElement;
    }
    
    // Get all stylesheets from main document
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => link.outerHTML);
    
    // Get all styles from main document
    const styles = Array.from(document.querySelectorAll('style'))
      .map(style => style.outerHTML);
    
    // Clone content to avoid modifying the original
    const clonedContent = contentToPrint.cloneNode(true) as HTMLElement;
    
    // If breaking after items is enabled, add page breaks
    if (breakAfterItems && selector) {
      const itemsSelector = `${selector} > *`;
      const items = clonedContent.querySelectorAll('> *');
      items.forEach((item, i) => {
        if (i < items.length - 1) {
          item.classList.add('page-break-after');
        }
      });
    }
    
    // Create the print document
    frameDocument.open();
    frameDocument.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styleLinks.join('\n')}
          ${styles.join('\n')}
          <style>
            @page {
              size: A4;
              margin: 1.5cm 1cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.5;
              color: #000;
              background: #fff;
            }
            ${additionalStyles}
          </style>
        </head>
        <body>
          ${includeHeader ? `
            <div class="print-header">
              <svg class="logo" width="200" height="50" viewBox="0 0 200 50">
                <text x="10" y="30" font-family="Arial" font-size="24" font-weight="bold">ROLLINSX</text>
              </svg>
              <div class="document-info">
                <div>Printed on ${new Date().toLocaleDateString()}</div>
                <div>${title}</div>
              </div>
            </div>
          ` : ''}
          
          <div class="print-content">
            ${selector ? clonedContent.innerHTML : clonedContent.outerHTML}
          </div>
          
          ${includeFooter ? `
            <div class="print-footer"></div>
          ` : ''}
          
          ${includeQRCode ? `
            <div class="print-qr-code">
              ${generateQRCode(qrCodeURL)}
            </div>
          ` : ''}
        </body>
      </html>`);
    frameDocument.close();
    
    // Wait for styles to load before printing
    setTimeout(() => {
      if (printFrame.contentWindow) {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      }
    }, 500);
    
  }, [options, generateQRCode]);
  
  return {
    print,
    isPrinting
  };
}

export default usePrint;