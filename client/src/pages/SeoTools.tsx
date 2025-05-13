import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, ArrowRight, Star } from 'lucide-react';
import SeoStrategySuggestions from '@/components/SeoStrategySuggestions';
import PaywallGuard from '@/components/PaywallGuard';
import { Helmet } from 'react-helmet';

export default function SeoTools() {
  return (
    <MainLayout>
      <Helmet>
        <title>SEO Tools - AI-Powered SEO Optimization | ROLLINSX</title>
        <meta 
          name="description" 
          content="ROLLINSX's AI-powered SEO tools help small businesses optimize their websites for better search rankings. Get personalized recommendations and strategies."
        />
      </Helmet>

      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <PageHeader className="pb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-blue-100 text-slate-blue-700 text-sm font-medium mb-4">
            AI-Powered SEO Tools
          </div>
          <PageHeaderHeading className="mb-4 text-center">Optimize Your Online Visibility</PageHeaderHeading>
          <PageHeaderDescription className="max-w-3xl mx-auto">
            Leverage our AI-powered tools to analyze your website content and get actionable recommendations
            to improve your search engine rankings and attract more visitors.
          </PageHeaderDescription>
        </PageHeader>

        <Separator className="my-8" />

        <section className="py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">SEO Strategy Suggestions</h2>
            <p className="text-slate-600 mb-8 text-center max-w-3xl mx-auto">
              Paste your website content below to receive AI-generated SEO recommendations tailored to your business.
              Our advanced analysis will help you identify opportunities to improve your search engine rankings.
            </p>
            
            <PaywallGuard 
              requiredSubscriptionLevel="basic"
              title="Premium SEO Analysis Tool"
              description="Access our advanced AI-powered SEO analysis tool with a subscription."
              featuresList={[
                "Get tailored keyword recommendations based on your content",
                "Receive content structure optimization suggestions",
                "Generate technical SEO advice for meta tags and schema markup",
                "Get actionable link building strategies"
              ]}
            >
              <SeoStrategySuggestions />
            </PaywallGuard>
          </div>
        </section>

        <section className="py-12 mt-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Why SEO Matters for Your Business</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-electric-cyan-100 text-electric-cyan-700 flex items-center justify-center mb-5 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">Increased Visibility</h3>
              <p className="text-slate-600 text-center">
                Higher search rankings mean more visibility for your business. 93% of online experiences begin with a search engine.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-slate-blue-100 text-slate-blue-700 flex items-center justify-center mb-5 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">Cost-Effective Marketing</h3>
              <p className="text-slate-600 text-center">
                SEO provides one of the best ROIs in marketing. Organic search drives 53% of all website traffic.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-sunset-orange-100 text-sunset-orange-700 flex items-center justify-center mb-5 mx-auto">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">Targeted Traffic</h3>
              <p className="text-slate-600 text-center">
                SEO brings highly relevant visitors who are actively searching for your products or services.
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-10 mt-10 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Elevate Your SEO Strategy with AI</h2>
          <p className="text-slate-600 mb-8 text-center max-w-3xl mx-auto">
            Our AI-powered tools don't just identify issues—they provide actionable insights tailored to your business.
            Get expert recommendations without the high cost of hiring an SEO consultant.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-electric-cyan-600 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Tailored Keyword Recommendations</h3>
                  <p className="text-slate-600 text-sm">
                    Get keyword suggestions specifically chosen for your industry and content focus
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-electric-cyan-600 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Content Structure Improvements</h3>
                  <p className="text-slate-600 text-sm">
                    Optimize your content's structure to improve readability and engagement
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-electric-cyan-600 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Technical SEO Advice</h3>
                  <p className="text-slate-600 text-sm">
                    Get specific recommendations for meta tags, URLs, and schema markup
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-electric-cyan-600 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">Link Building Strategies</h3>
                  <p className="text-slate-600 text-sm">
                    Learn how to build a strong backlink profile to boost your domain authority
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Button asChild className="bg-gradient-to-r from-slate-blue-600 to-electric-cyan-500 hover:from-slate-blue-700 hover:to-electric-cyan-600 px-6 py-2 text-base">
              <Link href="/subscriptions">
                Unlock All SEO Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}