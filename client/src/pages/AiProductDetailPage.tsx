import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams, Link } from 'wouter';
import { Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { getAiProductBySlug } from '@/utils/productData';
import type { AiProduct } from '@/types';
import MainLayout from '@/layouts/MainLayout';

export default function AiProductDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { userSubscription, canAccessProduct } = useSubscription();
  const [product, setProduct] = useState<AiProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Load product data by slug
  useEffect(() => {
    try {
      if (!slug) return;
      
      const productData = getAiProductBySlug(slug);
      if (productData) {
        setProduct(productData);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      setIsLoading(false);
    }
  }, [slug]);

  // Handle access to premium product
  const hasAccess = product ? canAccessProduct(product.requiredPlan) : false;

  // Handle upgrade button click
  const handleUpgradeClick = () => {
    navigate('/subscriptions?from=products');
    toast({
      title: t('subscription_required'),
      description: t('premium_features_require_subscription'),
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10 px-4 md:px-6 space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-10 px-4 md:px-6">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">{t('product_not_found')}</h1>
            <p className="text-muted-foreground mb-6">{t('product_not_found_description')}</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back_to_products')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back_to_products')}
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                <Badge className="capitalize">{product.category}</Badge>
                {product.requiredPlan && (
                  <Badge variant={hasAccess ? "default" : "outline"} className="capitalize">
                    {product.requiredPlan}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-2 text-lg">
                {product.shortDescription || product.description}
              </p>
            </div>
            
            {!hasAccess && (
              <Button onClick={handleUpgradeClick} size="lg">
                {t('upgrade_to_access')}
              </Button>
            )}
            
            {hasAccess && (
              <Button size="lg">
                {t('launch_product')}
              </Button>
            )}
          </div>
        </div>
        
        {!hasAccess && (
          <div className="bg-muted/50 border border-muted rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p>
              {t('product_access_restricted', {
                plan: product.requiredPlan,
                currentPlan: userSubscription.plan
              })}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="features">{t('features')}</TabsTrigger>
                <TabsTrigger value="specifications">{t('specifications')}</TabsTrigger>
                <TabsTrigger value="use_cases">{t('use_cases')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div>
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="rounded-lg w-full object-cover max-h-[400px] mb-6"
                    />
                  )}
                  <div className="prose max-w-none">
                    <p className="text-lg">{product.detailedDescription}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                  {product.technicalSpecs && Object.entries(product.technicalSpecs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 py-3 border-b">
                      <div className="font-medium">{key}</div>
                      <div className="md:col-span-2">{value}</div>
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b">
                    <div className="font-medium">{t('api_credits')}</div>
                    <div className="md:col-span-2">{product.apiCredits?.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b">
                    <div className="font-medium">{t('usage_limit')}</div>
                    <div className="md:col-span-2">{product.usageLimit?.toLocaleString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b">
                    <div className="font-medium">{t('required_plan')}</div>
                    <div className="md:col-span-2 capitalize">{product.requiredPlan}</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="use_cases" className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {product.useCases?.map((useCase, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <p>{useCase}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('subscription_plan')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('pricing')}</p>
                    <p className="font-medium">{product.pricing}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">{t('required_plan')}</p>
                    <p className="font-medium capitalize">{product.requiredPlan}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">{t('your_plan')}</p>
                    <p className="font-medium capitalize">{userSubscription.plan}</p>
                  </div>
                  
                  <div className="pt-4">
                    {!hasAccess ? (
                      <Button onClick={handleUpgradeClick} className="w-full">
                        {t('upgrade_to_access')}
                      </Button>
                    ) : (
                      <Button className="w-full">
                        {t('launch_product')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {product.relatedProducts && product.relatedProducts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{t('related_products')}</h3>
                  <div className="space-y-4">
                    {product.relatedProducts.map((related) => (
                      <Link key={related.id} href={`/products/${related.slug}`}>
                        <div className="flex items-center gap-3 group cursor-pointer">
                          {related.imageUrl && (
                            <img 
                              src={related.imageUrl} 
                              alt={related.name} 
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="group-hover:text-primary transition-colors">
                            {related.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}