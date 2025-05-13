import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AiProductCard } from "./AiProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

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
}

interface AiProductsGridProps {
  userSubscriptionPlan?: string;
  defaultCategory?: string;
}

export function AiProductsGrid({ 
  userSubscriptionPlan = "", 
  defaultCategory 
}: AiProductsGridProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultCategory ? [defaultCategory] : []
  );
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Fetch AI products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["/api/ai-products/active"],
  });

  // Extract unique categories
  const categories = [
    ...new Set(
      (products as AiProduct[]).map((product) => product.category).filter(Boolean)
    ),
  ];

  // Calculate if user can access a product based on their subscription
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

  // Filter products based on search, categories, and selected tab
  const filteredProducts = (products as AiProduct[]).filter((product) => {
    // Filter by search term
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.shortDescription && 
        product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by selected categories
    const matchesCategory =
      selectedCategories.length === 0 ||
      (product.category && selectedCategories.includes(product.category));

    // Filter by selected tab
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "accessible" && canAccessProduct(product.requiredPlan)) ||
      (selectedTab === "premium" && !canAccessProduct(product.requiredPlan));

    return matchesSearch && matchesCategory && matchesTab;
  });

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('search_ai_products')}
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {t('filter')}
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('filter_by_category')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              >
                {category}
                {selectedCategories.includes(category) && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedCategories.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={clearFilters}
                >
                  {t('clear_filters')}
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{t('all_products')}</TabsTrigger>
          <TabsTrigger value="accessible">{t('accessible')}</TabsTrigger>
          <TabsTrigger value="premium">{t('premium')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProductsGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            userSubscriptionPlan={userSubscriptionPlan}
            canAccessProduct={canAccessProduct}
          />
        </TabsContent>
        
        <TabsContent value="accessible" className="mt-6">
          <ProductsGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            userSubscriptionPlan={userSubscriptionPlan}
            canAccessProduct={canAccessProduct}
          />
        </TabsContent>
        
        <TabsContent value="premium" className="mt-6">
          <ProductsGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
            userSubscriptionPlan={userSubscriptionPlan}
            canAccessProduct={canAccessProduct}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProductsGridProps {
  products: AiProduct[];
  isLoading: boolean;
  error: unknown;
  userSubscriptionPlan: string;
  canAccessProduct: (requiredPlan?: string) => boolean;
}

function ProductsGrid({
  products,
  isLoading,
  error,
  userSubscriptionPlan,
  canAccessProduct,
}: ProductsGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p>{t('error_loading_products')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          {t('try_again')}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">{t('no_products_found')}</h3>
        <p className="text-muted-foreground mt-2">
          {t('try_different_search')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <AiProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          description={product.description}
          shortDescription={product.shortDescription}
          slug={product.slug}
          imageUrl={product.imageUrl}
          features={product.features}
          category={product.category}
          requiredPlan={product.requiredPlan}
          pricing={product.pricing}
          isUserSubscribed={canAccessProduct(product.requiredPlan)}
        />
      ))}
    </div>
  );
}