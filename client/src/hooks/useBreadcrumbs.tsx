import { useLocation } from 'wouter';

export interface BreadcrumbItem {
  label: string; 
  path: string;
  icon?: React.ReactNode;
}

// Map of predefined routes to breadcrumb labels
const routeMap: Record<string, BreadcrumbItem[]> = {
  '/': [],
  '/ai-services': [
    { label: 'AI Services', path: '/ai-services' }
  ],
  '/content-hub': [
    { label: 'Content Hub', path: '/content-hub' }
  ],
  '/design-tools': [
    { label: 'Design Tools', path: '/design-tools' }
  ],
  '/mockup-suggestions': [
    { label: 'Design Tools', path: '/design-tools' },
    { label: 'Mockup Suggestions', path: '/mockup-suggestions' }
  ],
  '/seo-tools': [
    { label: 'SEO Tools', path: '/seo-tools' }
  ],
  '/subscriptions': [
    { label: 'Pricing & Subscriptions', path: '/subscriptions' }
  ],
  '/login': [
    { label: 'Login', path: '/login' }
  ],
  '/signup': [
    { label: 'Sign Up', path: '/signup' }
  ],
  '/social-media': [
    { label: 'Support', path: '#' },
    { label: 'Social Media', path: '/social-media' }
  ],
  '/feedback': [
    { label: 'Support', path: '#' },
    { label: 'Feedback', path: '/feedback' }
  ],
  '/website-analytics': [
    { label: 'Support', path: '#' },
    { label: 'Analytics', path: '/website-analytics' }
  ],
  '/history': [
    { label: 'About', path: '/history' }
  ],
  '/particle-background': [
    { label: 'Design Tools', path: '/design-tools' },
    { label: 'Particle Background', path: '/particle-background' }
  ],
  '/router-debug': [
    { label: 'Debug', path: '/router-debug' }
  ],
  '/terms': [
    { label: 'Terms of Service', path: '/terms' }
  ],
  '/privacy-policy': [
    { label: 'Privacy Policy', path: '/privacy-policy' }
  ]
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const [location] = useLocation();
  
  // Get breadcrumbs for the current route
  const currentBreadcrumbs = routeMap[location] || [];
  
  // Always add home as the first item
  const homeItem: BreadcrumbItem = { label: 'Home', path: '/' };
  
  // If we're on the home page, just return the home item
  if (location === '/') {
    return [];
  }
  
  // Otherwise return home followed by the current breadcrumbs
  return [homeItem, ...currentBreadcrumbs];
}

// For dynamic routes like /marketplace/123, we need a function to get custom breadcrumbs
export function getCustomBreadcrumbs(
  currentPath: string,
  itemName?: string
): BreadcrumbItem[] {
  const homeItem: BreadcrumbItem = { label: 'Home', path: '/' };
  
  // Handle marketplace items
  if (currentPath.startsWith('/marketplace/')) {
    const itemId = currentPath.split('/').pop();
    return [
      homeItem,
      { label: 'Marketplace', path: '/marketplace' },
      { label: itemName || `Item ${itemId}`, path: currentPath }
    ];
  }
  
  // Handle account pages
  if (currentPath.startsWith('/account/')) {
    const section = currentPath.split('/').pop();
    let sectionLabel = section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Details';
    
    return [
      homeItem,
      { label: 'My Account', path: '/account' },
      { label: sectionLabel, path: currentPath }
    ];
  }
  
  // Handle user-defined pages with just one level
  const segments = currentPath.split('/').filter(segment => segment);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const lastSegmentLabel = itemName || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    
    return [
      homeItem,
      { label: lastSegmentLabel, path: currentPath }
    ];
  }
  
  return [homeItem];
}