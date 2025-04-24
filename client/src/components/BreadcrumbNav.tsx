import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbHome,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs, BreadcrumbItem as BreadcrumbItemType } from '@/hooks/useBreadcrumbs';

interface BreadcrumbNavProps {
  items?: BreadcrumbItemType[];
  className?: string;
}

export default function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  // Use custom items if provided, otherwise use the hook
  const breadcrumbItems = items || useBreadcrumbs();
  
  // If there are no items, don't render the breadcrumb
  if (!breadcrumbItems.length) {
    return null;
  }
  
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          if (index === 0) {
            return (
              <BreadcrumbItem key={item.path}>
                <BreadcrumbHome href={item.path} />
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            );
          }
          
          return (
            <BreadcrumbItem key={item.path}>
              {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}