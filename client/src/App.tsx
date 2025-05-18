import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, useLocation, Link, Redirect } from "wouter";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import ContentProtection from "@/components/ContentProtection";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CommandPaletteProvider } from "@/hooks/use-command-palette";
import CommandPaletteWrapper from "@/components/UI/CommandPaletteWrapper";
import EnhancedCommandPalette from "@/components/UI/EnhancedCommandPalette";
import ABTestClient from "@/components/ABTestClient";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/useAuth";
import WebSocketListener from "@/components/forum/WebSocketListener";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
// Import Apple-inspired effects
import { initAppleEffects } from "@/utils/appleEffects";
import { initSoundEffects } from "@/utils/soundEffectsUtils";
// Import OnboardingTour component
import OnboardingTour from "@/components/Onboarding/OnboardingTour";
// Import Apple-inspired keyboard shortcuts guide
import KeyboardShortcutsGuide from "@/components/UI/KeyboardShortcutsGuide";

// Popup Components
import ClientInputPopup from "@/components/popups/ClientInputPopup";
import PreviewPopup from "@/components/popups/PreviewPopup";
import DialogPopup from "@/components/popups/DialogPopup";
import LightboxPopup from "@/components/popups/LightboxPopup";

import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/not-found";
import ClientLandingPage from "@/components/ClientLandingPage";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsOfService from "@/components/TermsOfService";
import SecurityPolicy from "@/components/SecurityPolicy";
import PrivacyConsentBanner from "@/components/PrivacyConsentBanner";
import LanguageMetaTags from "@/components/LanguageMetaTags";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import MarketplacePage from "@/pages/MarketplacePage";
import CreateMarketplaceItemPage from "@/pages/CreateMarketplaceItemPage";
import SubscriptionCheckoutPage from "@/pages/SubscriptionCheckoutPage";
import MarketplaceCheckoutPage from "@/pages/MarketplaceCheckoutPage";
import PremiumPage from "@/pages/PremiumPage";
import HistoryPage from "@/pages/HistoryPage";
import LoginPage from "@/pages/LoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminClientPreviewsPage from "@/pages/AdminClientPreviewsPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import ContentHubPage from "@/pages/ContentHubPage";
import AIServices from "@/pages/AIServices";
import FeedbackPage from "@/pages/FeedbackPage";
import BlogPostPage from "@/pages/BlogPostPage";
import MockupSuggestionPage from "@/pages/MockupSuggestionPage";
import SeoTools from "@/pages/SeoTools";
import MarketplaceAnalyticsPage from "@/pages/MarketplaceAnalyticsPage";
import ContentAnalyticsPage from "@/pages/ContentAnalyticsPage";
import AchievementsPage from "@/pages/achievements-page";
import MockupAnalyticsPage from "@/pages/MockupAnalyticsPage";
import SocialMediaSuggestionsPage from "@/pages/SocialMediaSuggestionsPage";
import EmailCampaignsPage from "@/pages/EmailCampaignsPage";
import DesignTools from "@/pages/DesignTools";
import WebsiteAnalyticsPage from "@/pages/WebsiteAnalyticsPage";
import MarketplaceAdGeneratorPage from "@/pages/MarketplaceAdGeneratorPage";
import SocialMediaPage from "@/pages/SocialMediaPage";
import MarketingCampaignsPage from "@/pages/MarketingCampaignsPage";
import UIAnalyticsDashboard from "@/pages/UIAnalyticsDashboard";
import OptimizedLandingPage from "@/pages/OptimizedLandingPage";
import CheckoutOptimizationPage from "@/pages/CheckoutOptimizationPage";
import PriceOptimizationPage from "@/pages/PriceOptimizationPage";
import BugMonitoringPage from "@/pages/BugMonitoringPage";
import BrandConsistencyPage from "@/pages/BrandConsistencyPage";
import TestRXAIBot from "@/pages/TestRXAIBot";
import ParticleBackgroundDemo from "@/pages/ParticleBackgroundDemo";
import AiProductsPage from "@/pages/AiProductsPage";
import AiProductDetailPage from "@/pages/AiProductDetailPage";
import AiCoursePlatform from "@/pages/AiCoursePlatform";
import AiCourseDetail from "@/pages/AiCourseDetail";
import CourseListPage from "@/pages/CourseListPage";
import CourseProgressPage from "@/pages/CourseProgressPage";
import MemberDashboard from "@/pages/MemberDashboard";
import PricingPage from "@/pages/PricingPage";
import SubscriptionAnalyticsPage from "@/pages/SubscriptionAnalyticsPage";
import Dashboard from "@/pages/Dashboard";
import Forum from "@/pages/Forum";
import ForumThreadDetail from "@/pages/ForumThreadDetail";
import Certificates from "@/pages/Certificates";
import VerifyCertificate from "@/pages/VerifyCertificate";
import ContentCalendar from "@/pages/ContentCalendar";
import DigitalToolsPage from "@/pages/DigitalToolsPage";
import ContentGeneratorPage from "@/pages/tools/ContentGeneratorPage";
import CodeAssistantPage from "@/pages/tools/CodeAssistantPage";
import AnalyticsDashboardPage from "@/pages/tools/AnalyticsDashboardPage";
import DesignPrototypingPage from "@/pages/tools/DesignPrototypingPage";
import ChatbotBuilderPage from "@/pages/tools/ChatbotBuilderPage";
import ServicePackages from "@/pages/ServicePackages";
import CaseStudies from "@/pages/CaseStudies";
import ArticlesPage from "@/pages/ArticlesPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import NewsHubPage from "@/pages/NewsHubPage";
import EnhancedNewsHub from "@/pages/EnhancedNewsHub";
import ContactPage from "@/pages/ContactPage";
import LearnAI from "@/pages/LearnAI";
import CoursesDashboard from "@/pages/CoursesDashboard";
import CourseLearningPage from "@/pages/CourseLearningPage";
import MicroInteractionsDemo from "@/pages/MicroInteractionsDemo";
import CourseLandingPage from "@/pages/CourseLandingPage";
import UserSettings from "@/pages/UserSettings";
import ComprehensiveCourseView from "@/components/course/ComprehensiveCourseView";
import AIMasteryCourse from "@/pages/AIMasteryCourse";
import AICourseLessonPage from "@/pages/AICourseLessonPage";
import UserAchievementsPage from "@/pages/UserAchievementsPage";
import ComponentShowcase from "@/pages/ComponentShowcase";
import DataVizDemo from "@/pages/DataVizDemo";
import ThemePreferencesDemo from "@/pages/ThemePreferencesDemo";

export default function App() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  
  // Use authentication hook
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Use analytics hook for page tracking
  useAnalytics();
  
  // Check for privacy consent in local storage
  useEffect(() => {
    const storedConsent = localStorage.getItem('privacy-consent');
    if (storedConsent === 'accepted' || storedConsent === 'declined') {
      setConsentAccepted(true);
    }
  }, []);

  // Listen for messages from the ClientPreviewModal
  useEffect(() => {
    const handleClientAccess = (event: CustomEvent) => {
      if (event.detail && event.detail.accessCode) {
        setAccessCode(event.detail.accessCode);
        setLocation(`/client-preview/${event.detail.accessCode}`);
      }
    };

    // @ts-ignore - Custom event
    window.addEventListener('client-access-granted', handleClientAccess);
    
    return () => {
      // @ts-ignore - Custom event
      window.removeEventListener('client-access-granted', handleClientAccess);
    };
  }, [setLocation]);

  // Track current path for analytics and SEO purposes
  useEffect(() => {
    const updateCurrentPath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Initial path
    updateCurrentPath();

    // Listen for route changes
    window.addEventListener('popstate', updateCurrentPath);
    
    return () => {
      window.removeEventListener('popstate', updateCurrentPath);
    };
  }, []);
  
  // Initialize Analytics and Apple-inspired UI effects
  useEffect(() => {
    // Always initialize our custom analytics implementation
    initGA();
    console.log('RXAI Analytics initialized');
    
    // Initialize Apple-inspired UI effects
    initAppleEffects();
    console.log('Apple-inspired UI effects initialized');
    
    // Add click event listener to the document to enable sound effects
    // (must be triggered by user interaction due to browser autoplay policies)
    const enableSounds = () => {
      initSoundEffects();
      console.log('Apple-inspired sound effects enabled');
      document.removeEventListener('click', enableSounds);
    };
    document.addEventListener('click', enableSounds, { once: true });
  }, []);

  // Add structured data for SPA navigation
  useEffect(() => {
    // Mark the page as ready for indexing after hydration
    const readyForIndexing = () => {
      if (document.querySelector('meta[name="fragment"]')) {
        const metaFragment = document.querySelector('meta[name="fragment"]');
        if (metaFragment) {
          metaFragment.setAttribute('content', 'ready');
        }
      }
    };

    readyForIndexing();
  }, [currentPath]);

  return (
    <ThemeProvider>
      <CommandPaletteProvider>
        <NotificationProvider>
          {/* A/B Testing Client - applied to all routes */}
          <ABTestClient />
          
          {/* Apple-inspired keyboard shortcuts guide */}
          <KeyboardShortcutsGuide />
          
          {/* WebSocket Listener for forum notifications - only for authenticated users */}
          {isAuthenticated && <WebSocketListener />}
          
          {/* Global App Metadata - applied to all routes */}
          <Helmet>
            {/* Languages support */}
            <html lang="en" />
            <meta httpEquiv="Content-Language" content="en" />
            
            {/* Essential for SPAs and search engine crawling */}
            <meta name="fragment" content="!" />
            
            {/* Mobile optimization */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5" />
            <meta name="format-detection" content="telephone=no" />
            
            {/* Google verification - replace with actual code when available */}
            <meta name="google-site-verification" content="verification_token" />
            
            {/* Apple specific */}
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black" />
            <meta name="apple-mobile-web-app-title" content="ROLLINSX" />
            
            {/* Microsoft specific */}
            <meta name="msapplication-TileColor" content="#3B5B9D" />
            <meta name="msapplication-config" content="/browserconfig.xml" />
            <meta name="theme-color" content="#3B5B9D" />
            
            {/* Application manifest */}
            <link rel="manifest" href="/manifest.json" />
            
            {/* Links for SEO */}
            <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
          </Helmet>
          
          {/* Add language meta tags for the current path */}
          <LanguageMetaTags currentPath={currentPath} />
          
          <Switch>
        <Route path="/">
          {() => (
            <>
              <Helmet>
                <title>{t('seo_title')}</title>
                <meta name="description" content={t('seo_description')} />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <HomePage />
            </>
          )}
        </Route>
        
        {/* New routes for full-stack development services */}
        <Route path="/service-packages">
          {() => (
            <>
              <Helmet>
                <title>Full-Stack Development Service Packages | RXAI</title>
                <meta name="description" content="Explore our comprehensive web development service packages, from responsive websites to custom web applications, all with our no-payment-until-satisfied guarantee." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/service-packages" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <ServicePackages />
            </>
          )}
        </Route>
        
        <Route path="/case-studies">
          {() => (
            <>
              <Helmet>
                <title>Case Studies | Full-Stack Development Success Stories | RXAI</title>
                <meta name="description" content="Explore our portfolio of successful full-stack development projects across various industries. See how we've helped clients solve complex challenges with innovative web solutions." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/case-studies" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <CaseStudies />
            </>
          )}
        </Route>

        {/* Articles Routes - Redirect to News */}
        <Route path="/articles">
          {() => {
            // Redirect to /news
            useEffect(() => {
              setLocation('/news');
            }, []);
            return null;
          }}
        </Route>

        <Route path="/articles/:slug">
          {(params) => {
            // Redirect to /news/:slug
            const slug = params.slug;
            useEffect(() => {
              setLocation(`/news/${slug}`);
            }, [slug]);
            return null;
          }}
        </Route>
        
        <Route path="/privacy-policy">
          {() => (
            <>
              <Helmet>
                <title>Privacy Policy | ROLLINSX Web Development</title>
                <meta name="description" content="Learn about how ROLLINSX handles your data, our privacy practices, and your rights under GDPR and other privacy regulations." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/privacy-policy" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <PrivacyPolicy />
            </>
          )}
        </Route>
        
        {/* News Hub Routes */}
        <Route path="/news">
          {() => (
            <>
              <Helmet>
                <title>News Hub | RXAI - Latest AI Innovations and Updates</title>
                <meta name="description" content="Stay up-to-date with the latest AI news, innovations, and industry updates from RXAI. Discover automotive events, AI trends, and expert insights." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/news" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <NewsHubPage />
            </>
          )}
        </Route>

        {/* Enhanced News Hub with Apple-inspired Design */}
        <Route path="/enhanced-news">
          {() => (
            <>
              <Helmet>
                <title>Enhanced News Hub | RXAI - AI Innovations with Advanced Design</title>
                <meta name="description" content="Experience our enhanced news hub with Apple-inspired design, featuring optimized performance, improved visual hierarchy, and interactive elements." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/enhanced-news" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <EnhancedNewsHub />
            </>
          )}
        </Route>
        
        <Route path="/news/:slug">
          {() => (
            <>
              <Helmet>
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <ArticleDetailPage />
            </>
          )}
        </Route>
        
        {/* Contact Page Route */}
        <Route path="/contact">
          {() => (
            <>
              <Helmet>
                <title>Contact Us | RXAI - Get in Touch with Our Team</title>
                <meta name="description" content="Have questions about our services or need custom solutions? Contact the RXAI team today for personalized support and expert guidance on your AI and web development projects." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/contact" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <ContactPage />
            </>
          )}
        </Route>
        
        {/* Subscriptions Page Route */}
        <Route path="/subscriptions">
          {() => (
            <>
              <Helmet>
                <title>Subscription Plans | RXAI - Choose Your Plan</title>
                <meta name="description" content="Explore RXAI subscription plans and choose the perfect one for your needs. From free access to enterprise solutions, find the right AI-powered tools and courses for your growth." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/subscriptions" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <PricingPage />
            </>
          )}
        </Route>

        {/* LearnAI Landing Page - Public access with no authentication required */}
        <Route path="/learnai">
          {() => (
            <>
              <Helmet>
                <title>Learn AI with RXAI - The World Leader in AI Education</title>
                <meta name="description" content="Start your AI learning journey with RXAI's comprehensive courses. From beginners to advanced practitioners, our expert-led curriculum will transform your career." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/learnai" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <LearnAI />
            </>
          )}
        </Route>
        
        {/* Redirect from learn-ai to learnai */}
        <Route path="/learn-ai">
          {() => {
            useEffect(() => {
              setLocation('/learnai');
            }, []);
            return null;
          }}
        </Route>
        
        {/* AI Mastery Course - Main AI learning path */}
        <Route path="/ai-mastery">
          {() => (
            <>
              <Helmet>
                <title>AI Mastery Course | Complete AI Learning Path</title>
                <meta name="description" content="Master AI from fundamentals to advanced applications with our comprehensive learning path covering machine learning, deep learning, NLP, and more." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/ai-mastery" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <AIMasteryCourse />
            </>
          )}
        </Route>
        
        {/* AI Course Module Page */}
        <Route path="/ai-mastery/modules/:moduleId">
          {() => (
            <>
              <Helmet>
                <title>AI Course Module | RXAI Learning Platform</title>
                <meta name="description" content="Study a specific AI learning module with our comprehensive curriculum, interactive lessons, and hands-on exercises." />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <AIMasteryCourse />
            </>
          )}
        </Route>
        
        {/* AI Course Lesson Page */}
        <Route path="/ai-mastery/modules/:moduleId/lessons/:lessonId">
          {() => (
            <>
              <Helmet>
                <title>AI Course Lesson | RXAI Learning Platform</title>
                <meta name="description" content="Access interactive AI course lessons with videos, quizzes, and hands-on projects to master artificial intelligence concepts." />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <AICourseLessonPage />
            </>
          )}
        </Route>
        
        {/* User Achievements Page */}
        <Route path="/achievements">
          {() => (
            <>
              <Helmet>
                <title>Your Achievements | RXAI Learning Platform</title>
                <meta name="description" content="Track your learning progress, earned badges, and achievements on your AI learning journey." />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <UserAchievementsPage />
            </>
          )}
        </Route>
        
        {/* Course Catalog */}
        <Route path="/courses">
          {() => (
            <>
              <Helmet>
                <title>Course Catalog | RXAI Learning Platform</title>
                <meta name="description" content="Browse our selection of courses and start your learning journey today on the RXAI comprehensive educational platform." />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <CourseListPage />
            </>
          )}
        </Route>
        
        {/* Course Dashboard for subscribers */}
        <Route path="/courses/dashboard">
          {() => (
            <>
              <Helmet>
                <title>Course Dashboard | RXAI Learning Platform</title>
                <meta name="description" content="Track your progress, access course materials, and interact with the AI learning community on the RXAI platform." />
                <meta name="robots" content="noindex, nofollow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <CoursesDashboard />
            </>
          )}
        </Route>
        
        {/* Course progress tracking page */}
        <Route path="/courses/:courseId">
          {(params) => (
            <>
              <Helmet>
                <title>Course Progress | RXAI Learning Platform</title>
                <meta name="description" content="Track your progress, view achievements, and continue learning with our AI and technology courses." />
                <meta name="robots" content="index, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <CourseProgressPage />
            </>
          )}
        </Route>
        
        {/* Course learning experience */}
        <Route path="/courses/:courseId/learn/:lessonId?">
          {(params) => (
            <>
              <Helmet>
                <title>Learning Experience | RXAI Learning Platform</title>
                <meta name="description" content="Interactive learning experience with videos, quizzes, and hands-on exercises to master AI and technology skills." />
                <meta name="robots" content="noindex, follow" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <CourseLearningPage />
            </>
          )}
        </Route>
        
        {/* Micro-interactions Demo Page */}
        <Route path="/micro-interactions">
          {() => (
            <>
              <Helmet>
                <title>UI Micro-Interactions | RXAI - Advanced UX Design</title>
                <meta name="description" content="Explore RXAI's library of elegant micro-interactions designed to enhance user experiences with subtle motion and feedback. See how we create engaging digital experiences." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/micro-interactions" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <MicroInteractionsDemo />
            </>
          )}
        </Route>
        
        <Route path="/components">
          {() => (
            <>
              <Helmet>
                <title>UI Component Showcase | RXAI Design System</title>
                <meta name="description" content="Explore RXAI's comprehensive UI component library featuring Apple-inspired design elements, animations, and interactive controls." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/components" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <ComponentShowcase />
            </>
          )}
        </Route>

        <Route path="/data-viz-demo">
          {() => (
            <>
              <Helmet>
                <title>Data Visualization Demo | RXAI Design System</title>
                <meta name="description" content="Experience RXAI's advanced data visualization capabilities featuring interactive charts, customizable displays, and real-time data rendering." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/data-viz-demo" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <DataVizDemo />
            </>
          )}
        </Route>
        
        <Route path="/theme-preferences-demo">
          {() => (
            <>
              <Helmet>
                <title>Theme Preferences | RXAI Design System</title>
                <meta name="description" content="Explore RXAI's comprehensive theme customization system featuring accessibility options, color themes, font sizing, and motion preferences." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://rollinsx.dev/theme-preferences-demo" />
                <html lang={i18n.language.split('-')[0]} />
                <meta httpEquiv="Content-Language" content={i18n.language} />
              </Helmet>
              <ThemePreferencesDemo />
            </>
          )}
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin">
          {() => {
            const { isAuthenticated, isAdmin, isLoading } = useAuth();
            
            if (isLoading) {
              return (
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              );
            }
            
            if (!isAuthenticated) {
              return <Redirect to="/login" />;
            }
            
            if (!isAdmin) {
              return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 p-4">
                  <Shield className="h-12 w-12 text-red-500 mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                  <p className="text-muted-foreground mb-4">You don't have permission to access the admin area.</p>
                  <Button onClick={() => window.location.href = '/'}>Return to Homepage</Button>
                </div>
              );
            }
            
            return (
              <>
                <Helmet>
                  <title>Admin Dashboard | RXAI</title>
                  <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <AdminDashboardPage />
              </>
            );
          }}
        </Route>
        
        {/* Admin User Management */}
        <Route path="/admin/users">
          {() => {
            const { isAuthenticated, isAdmin, isLoading } = useAuth();
            
            if (isLoading) {
              return (
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              );
            }
            
            if (!isAuthenticated || !isAdmin) {
              return <Redirect to="/admin" />;
            }
            
            return (
              <>
                <Helmet>
                  <title>User Management | RXAI Admin</title>
                  <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <AdminUsersPage />
              </>
            );
          }}
        </Route>
        
        {/* Continue with rest of existing routes */}
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Privacy consent banner */}
      {!consentAccepted && (
        <PrivacyConsentBanner 
          onAccept={() => setConsentAccepted(true)} 
          onDecline={() => setConsentAccepted(true)} 
        />
      )}
      
      {/* Interactive Onboarding Tour */}
      {/* Temporarily disabled until sound effects issue is resolved */}
      {/* <OnboardingTour /> */}
      
      {/* Apple-inspired keyboard shortcuts guide */}
      <KeyboardShortcutsGuide />
      
      {/* Global toast notifications */}
      <Toaster />
      
      {/* Enhanced command palette with sound effects */}
      <EnhancedCommandPalette />
      </NotificationProvider>
        <CommandPaletteWrapper />
      </CommandPaletteProvider>
    </ThemeProvider>
  );
}