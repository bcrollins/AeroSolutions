import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { getAllAiProducts } from '@/utils/productData';
import type { AiProduct } from '@/types';
import AiProductCard from './AiProductCard';

interface AiProductsGridProps {
  userSubscriptionPlan?: string;
  defaultCategory?: string;
}

export function AiProductsGrid({ 
  userSubscriptionPlan = 'starter',
  defaultCategory
}: AiProductsGridProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(defaultCategory || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { canAccessProduct } = useSubscription();
  
  // Get all products
  const allProducts = useMemo(() => {
    try {
      const products = getAllAiProducts();
      setIsLoading(false);
      return products;
    } catch (error) {
      setError(error);
      setIsLoading(false);
      return [];
    }
  }, []);
  
  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    
    return allProducts.filter(product => {
      // Filter by search query
      const matchesSearch = searchQuery 
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.tags && product.tags.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        : true;
      
      // Filter by category
      const matchesCategory = selectedCategory 
        ? product.category === selectedCategory 
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);
  
  // Extract all unique categories
  const categories = useMemo(() => {
    if (!allProducts.length) return [];
    
    return Array.from(new Set(allProducts.map(product => product.category)))
      .filter(Boolean)
      .sort();
  }, [allProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_ai_products')}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            {t('all')}
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t('loading_products')}</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{t('error_loading_products')}</p>
          <p className="text-sm text-muted-foreground mt-2">{String(error)}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl font-medium">{t('no_products_found')}</p>
          <p className="text-muted-foreground mt-2">
            {selectedCategory
              ? t('no_products_in_category', { category: selectedCategory })
              : t('no_products_matching_search', { query: searchQuery })}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          >
            {t('clear_filters')}
          </Button>
        </div>
      ) : (
        <ProductsGrid 
          products={filteredProducts} 
          isLoading={isLoading}
          error={error}
          userSubscriptionPlan={userSubscriptionPlan}
          canAccessProduct={canAccessProduct}
        />
      )}
      
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('showing_products', { count: filteredProducts.length, total: allProducts.length })}
            </span>
            
            <div className="flex space-x-2">
              <Badge variant="outline">
                {t('premium')}: {allProducts.filter(p => p.requiredPlan === 'professional').length}
              </Badge>
              <Badge variant="outline">
                {t('enterprise')}: {allProducts.filter(p => p.requiredPlan === 'enterprise').length}
              </Badge>
            </div>
          </div>
        </div>
      )}
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
  canAccessProduct
}: ProductsGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <AiProductCard 
          key={product.id}
          product={product}
          hasAccess={canAccessProduct(product.requiredPlan)}
        />
      ))}
    </div>
  );
}