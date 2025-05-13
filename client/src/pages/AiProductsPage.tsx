import { useTranslation } from "react-i18next";
import { MainLayout } from "@/layouts/MainLayout";
import { AiProductsGrid } from "@/components/AiProductsGrid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BoxIcon, BulbIcon, ZapIcon, ArrowUpRightIcon } from "lucide-react";

export default function AiProductsPage() {
  const { t } = useTranslation();
  const [userSubscriptionPlan, setUserSubscriptionPlan] = useState("starter");

  // Fetch user's current subscription plan
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    onSuccess: (data) => {
      if (data && data.subscriptionPlan) {
        setUserSubscriptionPlan(data.subscriptionPlan.toLowerCase());
      }
    }
  });

  // Optional: Fetch featured products or other content you want to highlight
  const { data: featuredContent } = useQuery({
    queryKey: ['/api/featured-content'],
  });

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('ai_products_platform')}</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('ai_products_description')}
          </p>
        </div>

        {/* Featured Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <BoxIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('premium_ai_tools')}</h3>
                <p className="text-muted-foreground">
                  {t('premium_ai_tools_description')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <ZapIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('business_intelligence')}</h3>
                <p className="text-muted-foreground">
                  {t('business_intelligence_description')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <BulbIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">{t('strategic_insights')}</h3>
                <p className="text-muted-foreground">
                  {t('strategic_insights_description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Upgrade Banner (shown if not on Enterprise plan) */}
        {userSubscriptionPlan !== "enterprise" && (
          <div className="mb-12 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{t('unlock_premium_features')}</h2>
                <p className="mt-2">
                  {t('unlock_premium_features_description')}
                </p>
              </div>
              <Button variant="secondary" className="whitespace-nowrap" asChild>
                <a href="/subscriptions">
                  {t('upgrade_now')}
                  <ArrowUpRightIcon className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Main AI Products Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            {t('explore_ai_products')}
          </h2>
          <AiProductsGrid userSubscriptionPlan={userSubscriptionPlan} />
        </div>
      </div>
    </MainLayout>
  );
}