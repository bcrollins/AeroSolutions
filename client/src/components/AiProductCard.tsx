import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

interface AiProductCardProps {
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
  isUserSubscribed: boolean;
  className?: string;
}

export function AiProductCard({
  id,
  name,
  description,
  shortDescription,
  slug,
  imageUrl,
  features = [],
  category,
  requiredPlan,
  pricing,
  isUserSubscribed,
  className,
}: AiProductCardProps) {
  const { t } = useTranslation();
  
  const isAccessible = isUserSubscribed || !requiredPlan || requiredPlan === "starter";
  
  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="relative">
        {imageUrl && (
          <div className="w-full h-40 overflow-hidden rounded-t-lg mb-4">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            {category && (
              <Badge variant="outline" className="mt-2">
                {category}
              </Badge>
            )}
          </div>
          
          {requiredPlan && requiredPlan !== "starter" && (
            <Badge variant="secondary" className="ml-2">
              {t('plan')} {requiredPlan}
            </Badge>
          )}
        </div>
        
        <CardDescription className="mt-2">
          {shortDescription || description.substring(0, 120) + (description.length > 120 ? "..." : "")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('key_features')}</h4>
            <ul className="space-y-1 list-disc pl-5 text-sm">
              {features.slice(0, 4).map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
              {features.length > 4 && (
                <li className="text-muted-foreground">
                  +{features.length - 4} {t('more')}
                </li>
              )}
            </ul>
          </div>
        )}
        
        {pricing && (
          <div className="mt-4">
            <h4 className="font-medium text-sm">{t('pricing')}</h4>
            <p className="text-sm text-muted-foreground">{pricing}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        {isAccessible ? (
          <Button asChild className="w-full">
            <Link to={`/products/${slug}`}>
              {t('launch')}
            </Link>
          </Button>
        ) : (
          <div className="w-full space-y-2">
            <Button disabled variant="outline" className="w-full">
              <Lock className="mr-2 h-4 w-4" />
              {t('locked')}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {t('requires')} {requiredPlan} {t('plan_or_higher')}
            </p>
            <Button asChild variant="secondary" className="w-full" size="sm">
              <Link to="/subscriptions">
                {t('upgrade')}
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}