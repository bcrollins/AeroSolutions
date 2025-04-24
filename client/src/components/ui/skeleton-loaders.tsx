import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * SkeletonCard - Skeleton loader for card components
 */
export function SkeletonCard({
  className,
  imageHeight = "200px",
  hasImage = true,
  hasFooter = true,
  hasAction = true,
}: {
  className?: string;
  imageHeight?: string;
  hasImage?: boolean;
  hasFooter?: boolean;
  hasAction?: boolean;
}) {
  return (
    <div 
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
        className
      )}
    >
      {hasImage && (
        <Skeleton
          className="w-full"
          style={{ height: imageHeight }}
        />
      )}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {hasFooter && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Skeleton className="h-4 w-20" />
            {hasAction && <Skeleton className="h-9 w-20" />}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Skeleton loader for table components
 */
export function SkeletonTable({
  className,
  rowCount = 5,
  columnCount = 4,
  hasHeader = true,
  hasFooter = false,
}: {
  className?: string;
  rowCount?: number;
  columnCount?: number;
  hasHeader?: boolean;
  hasFooter?: boolean;
}) {
  const columns = Array.from({ length: columnCount }, (_, i) => i);
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Table actions/search */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-72" />
      </div>

      {/* Table skeleton */}
      <div className="w-full border rounded-md overflow-hidden">
        {/* Table header */}
        {hasHeader && (
          <div className="flex border-b bg-muted/50 p-2">
            {columns.map((column) => (
              <div 
                key={`header-${column}`} 
                className="flex-1 p-2"
              >
                <Skeleton className="h-5 w-full max-w-[150px]" />
              </div>
            ))}
          </div>
        )}

        {/* Table rows */}
        <div className="divide-y">
          {rows.map((row) => (
            <div 
              key={`row-${row}`} 
              className="flex p-2"
            >
              {columns.map((column) => (
                <div 
                  key={`cell-${row}-${column}`} 
                  className="flex-1 p-2"
                >
                  <Skeleton 
                    className={cn(
                      "h-4 w-full", 
                      // Vary widths slightly to make it look more natural
                      column === 0 ? "max-w-[180px]" : 
                      column === 1 ? "max-w-[150px]" : 
                      column === 2 ? "max-w-[180px]" : "max-w-[120px]"
                    )} 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Table footer */}
        {hasFooter && (
          <div className="flex justify-between p-4 border-t">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-64" />
          </div>
        )}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-48" />
        <div className="flex space-x-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonDashboard - Skeleton loader for dashboard layouts
 */
export function SkeletonDashboard({
  className,
  cardCount = 4,
  hasCharts = true,
  hasTable = true,
}: {
  className?: string;
  cardCount?: number;
  hasCharts?: boolean;
  hasTable?: boolean;
}) {
  const cards = Array.from({ length: cardCount }, (_, i) => i);

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header and info */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div 
            key={`card-${card}`} 
            className="p-4 border rounded-lg bg-card"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ))}
      </div>

      {/* Charts */}
      {hasCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
          <div className="p-4 border rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Table */}
      {hasTable && (
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-48 mb-4" />
          <SkeletonTable rowCount={4} hasFooter={true} />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonForm - Skeleton loader for form components
 */
export function SkeletonForm({
  className,
  fieldCount = 6,
  hasTitle = true,
  hasSubmit = true,
}: {
  className?: string;
  fieldCount?: number;
  hasTitle?: boolean;
  hasSubmit?: boolean;
}) {
  const fields = Array.from({ length: fieldCount }, (_, i) => i);

  return (
    <div className={cn("space-y-6 max-w-2xl", className)}>
      {hasTitle && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full" />
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={`field-${field}`} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            {/* Add error message placeholder for some fields to make it more realistic */}
            {field === 2 && <Skeleton className="h-4 w-64 mt-1" />}
          </div>
        ))}
      </div>

      {hasSubmit && (
        <div className="pt-4 flex justify-end space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonProfile - Skeleton loader for profile pages
 */
export function SkeletonProfile({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard hasFooter={false} imageHeight="120px" />
            <SkeletonCard hasFooter={false} imageHeight="120px" />
            <SkeletonCard hasFooter={false} imageHeight="120px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonList - Skeleton loader for list components
 */
export function SkeletonList({
  className,
  itemCount = 5,
  itemHeight = "h-16",
  hasActions = true,
  hasImage = true,
}: {
  className?: string;
  itemCount?: number;
  itemHeight?: string;
  hasActions?: boolean;
  hasImage?: boolean;
}) {
  const items = Array.from({ length: itemCount }, (_, i) => i);

  return (
    <div className={cn("space-y-4", className)}>
      {/* List header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* List items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div 
            key={`item-${item}`} 
            className={cn(
              "flex items-center border rounded-lg p-3 gap-3", 
              itemHeight
            )}
          >
            {hasImage && (
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            {hasActions && (
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonArticle - Skeleton loader for article/blog content
 */
export function SkeletonArticle({
  className,
  hasImage = true,
  hasAuthor = true,
  paragraphCount = 6,
}: {
  className?: string;
  hasImage?: boolean;
  hasAuthor?: boolean;
  paragraphCount?: number;
}) {
  const paragraphs = Array.from({ length: paragraphCount }, (_, i) => i);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Title */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        
        {/* Meta */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Featured image */}
      {hasImage && (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      )}

      {/* Author info */}
      {hasAuthor && (
        <div className="flex items-center gap-3 py-4 border-y">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}

      {/* Article body */}
      <div className="space-y-6">
        {/* First paragraph is usually an intro */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        {/* Subheading */}
        <Skeleton className="h-6 w-1/2" />

        {paragraphs.map((p) => (
          <div key={`p-${p}`} className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}

        {/* Pull quote for some visual variety */}
        <div className="py-2 pl-4 border-l-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        {/* Final paragraphs */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </div>
    </div>
  );
}