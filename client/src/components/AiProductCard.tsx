import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { ArrowRight, Lock, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AiProduct } from '@/types';

interface AiProductCardProps {
  product: AiProduct;
  hasAccess: boolean;
}

export function AiProductCard({ product, hasAccess }: AiProductCardProps) {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    navigate(`/products/${product.slug}`);
  };
  
  return (
    <Card 
      className={`h-full overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-lg' : 'shadow-sm'
      } ${hasAccess ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={hasAccess ? handleClick : undefined}
    >
      {product.imageUrl && (
        <div className="relative overflow-hidden h-48">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
          />
          
          {!hasAccess && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
              <Lock className="h-8 w-8 mb-2" />
              <p className="text-center font-medium">
                {t('premium_upgrade_required')}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-white border-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/subscriptions?from=products');
                }}
              >
                {t('upgrade')}
              </Button>
            </div>
          )}
          
          {product.isNew && (
            <Badge className="absolute top-2 right-2 bg-primary">
              {t('new')}
            </Badge>
          )}
          
          {product.isPopular && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500 text-yellow-950 py-1 px-2 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-yellow-950" />
              {t('popular')}
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          {product.requiredPlan && (
            <Badge variant={hasAccess ? 'default' : 'outline'} className="capitalize">
              {product.requiredPlan}
            </Badge>
          )}
        </div>
        {product.category && (
          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
        )}
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="line-clamp-3 text-muted-foreground">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="text-sm font-medium">
          {product.pricing?.includes('$') ? product.pricing : t('included_in_plan')}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products/${product.slug}`);
          }}
        >
          {t('details')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AiProductCard;