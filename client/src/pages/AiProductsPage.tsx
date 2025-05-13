import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AiProductsGrid } from '@/components/AiProductsGrid';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';

export default function AiProductsPage() {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { userSubscription } = useSubscription();
  
  // Show subscription upgrade toast if accessing from a direct URL and not subscribed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromPremium = params.get('from') === 'premium';
    
    if (fromPremium && userSubscription.plan === 'starter') {
      toast({
        title: t('subscription_required'),
        description: t('premium_features_require_subscription'),
        duration: 5000,
      });
    }
  }, [t, toast, userSubscription.plan]);

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{t('ai_products')}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {t('ai_products_description')}
            </p>
          </div>
          
          {userSubscription.plan !== 'enterprise' && (
            <Button onClick={() => navigate('/subscriptions')} size="lg">
              {t('upgrade_subscription')}
            </Button>
          )}
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('subscription_status')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background rounded-md p-4 border">
              <h3 className="font-medium">{t('current_plan')}</h3>
              <p className="text-2xl font-bold mt-2 capitalize">{userSubscription.plan}</p>
            </div>
            
            <div className="bg-background rounded-md p-4 border">
              <h3 className="font-medium">{t('status')}</h3>
              <p className="text-2xl font-bold mt-2 capitalize">{userSubscription.status}</p>
            </div>
            
            {userSubscription.expiresAt && (
              <div className="bg-background rounded-md p-4 border">
                <h3 className="font-medium">{t('expires')}</h3>
                <p className="text-2xl font-bold mt-2">
                  {new Date(userSubscription.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <AiProductsGrid userSubscriptionPlan={userSubscription.plan} />
      </div>
    </MainLayout>
  );
}