import { useParams, useLocation, Link as WouterLink } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Share2Icon, 
  ArrowUpRightIcon, 
  PlayCircleIcon, 
  ClockIcon, 
  StarIcon, 
  ArrowRightIcon, 
  LockIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  CheckIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiProduct {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  slug: string;
  imageUrl?: string;
  features?: string[];
  category?: string;
  requiredPlan?: string;
  pricing?: string;
  isActive: boolean;
  apiCredits?: number;
  usageLimit?: number;
  detailedDescription?: string;
  useCases?: string[];
  technicalSpecs?: Record<string, string>;
  relatedProducts?: {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
  }[];
}

export default function AiProductDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [userSubscriptionPlan, setUserSubscriptionPlan] = useState("starter");

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/ai-products/slug/${slug}`],
    onError: () => {
      toast({
        title: t('error'),
        description: t('product_not_found'),
        variant: "destructive",
      });
      setLocation("/products");
    }
  });

  // Fetch user's current subscription plan
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    onSuccess: (data) => {
      if (data && data.subscriptionPlan) {
        setUserSubscriptionPlan(data.subscriptionPlan.toLowerCase());
      }
    }
  });

  // Calculate if user can access this product
  const canAccessProduct = (requiredPlan?: string) => {
    if (!requiredPlan || requiredPlan === "starter") return true;
    
    const planLevels: Record<string, number> = {
      "starter": 1,
      "professional": 2,
      "enterprise": 3
    };
    
    const userPlanLevel = planLevels[userSubscriptionPlan.toLowerCase()] || 0;
    const requiredPlanLevel = planLevels[requiredPlan.toLowerCase()] || 0;
    
    return userPlanLevel >= requiredPlanLevel;
  };

  // Handle product usage/launch
  const handleLaunchProduct = async () => {
    if (!product) return;

    try {
      // Log product usage
      await apiRequest("POST", "/api/ai-products/usage", {
        userId: user?.id,
        productId: product.id,
        actionPerformed: "launch"
      });

      // Redirect to the actual product tool
      setLocation(`/tools/${product.slug}`);
    } catch (error) {
      console.error("Error launching product:", error);
      toast({
        title: t('error'),
        description: t('launch_failed'),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex flex-col gap-4">
            <div className="h-8 w-1/3 rounded-lg bg-muted animate-pulse mb-2" />
            <div className="h-64 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-1/4 rounded-lg bg-muted animate-pulse mt-4" />
            <div className="h-40 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('product_not_found')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('product_not_found_message')}
          </p>
          <Button asChild>
            <WouterLink to="/products">
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              {t('back_to_products')}
            </WouterLink>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isAccessible = canAccessProduct(product.requiredPlan);

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumbs and navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <WouterLink to="/products" className="hover:text-foreground">
              {t('products')}
            </WouterLink>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">
              {product.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <WouterLink to="/products">
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              {t('back_to_products')}
            </WouterLink>
          </Button>
        </div>

        {/* Product header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {product.category && (
                <Badge variant="secondary">
                  {product.category}
                </Badge>
              )}
              {product.requiredPlan && product.requiredPlan !== "starter" && (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {product.requiredPlan} {t('plan')}
                </Badge>
              )}
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              {product.shortDescription || product.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {isAccessible ? (
                <Button size="lg" onClick={handleLaunchProduct}>
                  <PlayCircleIcon className="mr-2 h-5 w-5" />
                  {t('launch_tool')}
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <WouterLink to="/subscriptions">
                    <ArrowUpRightIcon className="mr-2 h-5 w-5" />
                    {t('upgrade_to_access')}
                  </WouterLink>
                </Button>
              )}
              
              <Button variant="outline" size="lg">
                <Share2Icon className="mr-2 h-5 w-5" />
                {t('share')}
              </Button>
            </div>
          </div>
          
          <div>
            {product.imageUrl ? (
              <div className="rounded-lg overflow-hidden h-64 mb-6">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-muted h-64 mb-6 flex items-center justify-center">
                <span className="text-muted-foreground">
                  {t('no_image_available')}
                </span>
              </div>
            )}
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">{t('product_info')}</h3>
                
                <div className="space-y-4">
                  {product.apiCredits && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('api_credits')}:
                      </span>
                      <span className="font-medium">
                        {product.apiCredits} {t('per_month')}
                      </span>
                    </div>
                  )}
                  
                  {product.usageLimit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('usage_limit')}:
                      </span>
                      <span className="font-medium">
                        {product.usageLimit} {t('uses_per_month')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('required_plan')}:
                    </span>
                    <span className="font-medium">
                      {product.requiredPlan || t('starter')}
                    </span>
                  </div>
                  
                  {product.pricing && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t('pricing')}:
                      </span>
                      <span className="font-medium">
                        {product.pricing}
                      </span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                {!isAccessible && (
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <LockIcon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-sm mb-3">
                      {t('locked_description')}
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <WouterLink to="/subscriptions">
                        {t('upgrade_now')}
                      </WouterLink>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Product Content Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-10">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="features">{t('features')}</TabsTrigger>
            <TabsTrigger value="use-cases">{t('use_cases')}</TabsTrigger>
            <TabsTrigger value="technical">{t('technical')}</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="prose max-w-none">
              <p className="lead">
                {product.description}
              </p>
              
              {product.detailedDescription && (
                <div dangerouslySetInnerHTML={{ __html: product.detailedDescription }} />
              )}
              
              {/* Use case highlights */}
              {product.useCases && product.useCases.length > 0 && (
                <div className="mt-8">
                  <h3>{t('key_use_cases')}</h3>
                  <ul>
                    {product.useCases.slice(0, 3).map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                  
                  {product.useCases.length > 3 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setActiveTab("use-cases")}
                    >
                      {t('see_all_use_cases')}
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Feature highlights */}
              {product.features && product.features.length > 0 && (
                <div className="mt-8">
                  <h3>{t('key_features')}</h3>
                  <ul>
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  
                  {product.features.length > 3 && (
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setActiveTab("features")}
                    >
                      {t('see_all_features')}
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Features Tab */}
          <TabsContent value="features" className="mt-6">
            <div className="prose max-w-none">
              <h2>{t('all_features')}</h2>
              
              {product.features && product.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-6">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-1 mr-3 rounded-full bg-primary/10 p-1 text-primary">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('no_features_available')}
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Use Cases Tab */}
          <TabsContent value="use-cases" className="mt-6">
            <div className="prose max-w-none">
              <h2>{t('use_cases')}</h2>
              
              {product.useCases && product.useCases.length > 0 ? (
                <div className="space-y-6 mt-6">
                  {product.useCases.map((useCase, index) => (
                    <div key={index} className="rounded-lg border p-6">
                      <h3 className="text-lg font-medium mb-2">
                        {t('use_case')} {index + 1}
                      </h3>
                      <p>{useCase}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('no_use_cases_available')}
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-6">
            <div className="prose max-w-none">
              <h2>{t('technical_specs')}</h2>
              
              {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 ? (
                <div className="mt-6 not-prose">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('specification')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t('value')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y">
                        {Object.entries(product.technicalSpecs).map(([key, value], index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {key}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {t('no_technical_specs_available')}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              {t('related_products')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden">
                  {relatedProduct.imageUrl && (
                    <div className="h-40 w-full">
                      <img
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-medium text-lg mb-2">
                      {relatedProduct.name}
                    </h3>
                    <Button
                      variant="link"
                      className="px-0"
                      asChild
                    >
                      <WouterLink to={`/products/${relatedProduct.slug}`}>
                        {t('view_details')}
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </WouterLink>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Call to action */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {isAccessible
              ? t('ready_to_get_started')
              : t('unlock_full_potential')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {isAccessible
              ? t('ready_to_get_started_description')
              : t('unlock_full_potential_description')}
          </p>
          
          {isAccessible ? (
            <Button size="lg" onClick={handleLaunchProduct}>
              <PlayCircleIcon className="mr-2 h-5 w-5" />
              {t('launch_tool')}
            </Button>
          ) : (
            <Button size="lg" asChild>
              <WouterLink to="/subscriptions">
                <ArrowUpRightIcon className="mr-2 h-5 w-5" />
                {t('upgrade_to_access')}
              </WouterLink>
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}