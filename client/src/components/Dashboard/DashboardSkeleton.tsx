import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * DashboardSkeleton - Loading state for the dashboard
 */
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Medium widget */}
        <Card className="col-span-1 row-span-2">
          <CardHeader className="p-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medium widget */}
        <Card className="col-span-1 row-span-2">
          <CardHeader className="p-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Small widget */}
        <Card className="col-span-1 row-span-1">
          <CardHeader className="p-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>

        {/* Small widget */}
        <Card className="col-span-1 row-span-1">
          <CardHeader className="p-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>

        {/* Large widget */}
        <Card className="col-span-2 row-span-2">
          <CardHeader className="p-3">
            <Skeleton className="h-5 w-56" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;