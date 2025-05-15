import React from 'react';
import { DataViz } from '@/components/DataViz';
import ExampleCharts from '@/components/DataViz/ExampleCharts';
import { Button } from '@/components/ui/button';
import { StaggerChildren, FadeIn } from '@/components/UI/MicroInteractions';
import { useEnhancedToast } from '@/components/UI/EnhancedToast';
import { LoadingState, CardSkeleton, DashboardWidgetSkeleton } from '@/components/UI/LoadingState';

const DataVizDemo: React.FC = () => {
  const toast = useEnhancedToast();
  
  // Sample data for our chart
  const sampleData = [
    { month: 'Jan', revenue: 5000, expenses: 3500, profit: 1500 },
    { month: 'Feb', revenue: 6000, expenses: 4000, profit: 2000 },
    { month: 'Mar', revenue: 8000, expenses: 4500, profit: 3500 },
    { month: 'Apr', revenue: 7500, expenses: 5000, profit: 2500 },
    { month: 'May', revenue: 9000, expenses: 5500, profit: 3500 },
    { month: 'Jun', revenue: 10000, expenses: 6000, profit: 4000 },
  ];
  
  // Function to show demo toasts
  const showDemoToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Operation Completed', {
          description: 'Your data has been successfully processed.',
          action: <Button variant="outline" size="sm">View Details</Button>
        });
        break;
      case 'error':
        toast.error('Error Occurred', {
          description: 'There was a problem processing your request. Please try again.',
          action: <Button variant="outline" size="sm">Retry</Button>
        });
        break;
      case 'warning':
        toast.warning('Limited Access', {
          description: 'You have limited permissions for this feature.',
          action: <Button variant="outline" size="sm">Upgrade</Button>
        });
        break;
      case 'info':
        toast.info('New Feature Available', {
          description: 'Check out our new AI-powered analytics tools.',
          action: <Button variant="outline" size="sm">Learn More</Button>
        });
        break;
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <FadeIn>
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl font-bold">RXAI UI Components</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Interactive demonstration of advanced UI components for the RXAI platform
          </p>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 gap-10">
        {/* Toast Notifications Section */}
        <FadeIn delay={0.1}>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Enhanced Toast Notifications</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Rich, interactive toast notifications with custom styling and animations.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => showDemoToast('success')}
                className="bg-green-600 hover:bg-green-700"
              >
                Success Toast
              </Button>
              <Button 
                onClick={() => showDemoToast('error')}
                className="bg-red-600 hover:bg-red-700"
              >
                Error Toast
              </Button>
              <Button 
                onClick={() => showDemoToast('warning')}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Warning Toast
              </Button>
              <Button 
                onClick={() => showDemoToast('info')}
              >
                Info Toast
              </Button>
            </div>
          </section>
        </FadeIn>
        
        {/* Data Visualization Section */}
        <FadeIn delay={0.2}>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Interactive Data Visualization</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Powerful and customizable charts for visualizing complex datasets.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataViz
                title="Monthly Financial Performance"
                description="Revenue, expenses and profit over time"
                data={sampleData}
                type="bar"
                xKey="month"
                yKey={["revenue", "expenses", "profit"]}
                showDataLabels={true}
                animated={true}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                allowDownload={true}
                interactive={true}
              />
              
              <DataViz
                title="Monthly Financial Trends"
                description="Visualizing financial data over time"
                data={sampleData}
                type="line"
                xKey="month"
                yKey={["revenue", "expenses", "profit"]}
                animated={true}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                interactive={true}
              />
            </div>
            
            <ExampleCharts />
          </section>
        </FadeIn>
        
        {/* Loading States Section */}
        <FadeIn delay={0.3}>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Loading State Components</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Beautiful loading states with shimmer effects for improved user experience.
            </p>
            
            <StaggerChildren staggerDelay={0.1} animation="fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Text Loading</h3>
                  <LoadingState type="text" count={3} fullWidth />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Card Loading</h3>
                  <LoadingState type="card" fullWidth />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Avatar Loading</h3>
                  <div className="flex gap-4">
                    <LoadingState type="avatar" width={64} height={64} />
                    <LoadingState type="avatar" width={48} height={48} />
                    <LoadingState type="avatar" width={32} height={32} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Image Loading</h3>
                  <LoadingState type="image" width="100%" height={150} rounded />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Button Loading</h3>
                  <div className="flex gap-4">
                    <LoadingState type="button" width={120} />
                    <LoadingState type="button" width={80} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Table Loading</h3>
                  <LoadingState type="table-row" count={3} fullWidth />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dashboard Widget Loading</h3>
                  <DashboardWidgetSkeleton />
                </div>
              </div>
            </StaggerChildren>
          </section>
        </FadeIn>
      </div>
    </div>
  );
};

export default DataVizDemo;