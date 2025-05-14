import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import ContentProtection from "@/components/ContentProtection";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ABTestClient from "@/components/ABTestClient";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/hooks/useAuth";
import WebSocketListener from "@/components/forum/WebSocketListener";

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
import CourseCatalog from "@/pages/CourseCatalog";
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
  
  // Initialize Google Analytics
  useEffect(() => {
    // Only initialize if VITE_GA_MEASUREMENT_ID exists
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
      console.log('Google Analytics initialized');
    } else {
      console.warn('Google Analytics Measurement ID missing');
    }
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
      <NotificationProvider>
        {/* A/B Testing Client - applied to all routes */}
        <ABTestClient />
        
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
        
        {/* Continue with rest of existing routes */}
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Privacy consent banner */}
      {!consentAccepted && (
        <PrivacyConsentBanner onAccept={() => setConsentAccepted(true)} />
      )}
      
      {/* Global toast notifications */}
      <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  );
}