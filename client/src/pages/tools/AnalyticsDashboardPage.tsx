import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ToolLayout from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, BarChart, LineChart, PieChart } from '@/components/ui/charts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  BarChart4, 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Download, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  RefreshCw, 
  Share2, 
  Users,
  Globe
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Sample data
const sampleVisitorData = [
  { name: 'Jan', Users: 2400, Sessions: 4000, 'New Users': 1800 },
  { name: 'Feb', Users: 1398, Sessions: 3000, 'New Users': 1100 },
  { name: 'Mar', Users: 9800, Sessions: 12000, 'New Users': 7600 },
  { name: 'Apr', Users: 3908, Sessions: 6000, 'New Users': 2800 },
  { name: 'May', Users: 4800, Sessions: 8000, 'New Users': 3200 },
  { name: 'Jun', Users: 3800, Sessions: 5800, 'New Users': 2600 },
  { name: 'Jul', Users: 4300, Sessions: 7000, 'New Users': 3200 },
];

const sampleSourceData = [
  { name: 'Direct', value: 40 },
  { name: 'Organic Search', value: 30 },
  { name: 'Social', value: 20 },
  { name: 'Referral', value: 10 },
];

const sampleEngagementData = [
  { name: 'Home', views: 4000, avgTime: 75 },
  { name: 'Products', views: 3000, avgTime: 120 },
  { name: 'Services', views: 2000, avgTime: 90 },
  { name: 'About', views: 1500, avgTime: 45 },
  { name: 'Contact', views: 1000, avgTime: 30 },
];

const sampleConversionData = [
  { name: 'Form Submissions', completed: 120, abandoned: 80 },
  { name: 'Checkouts', completed: 95, abandoned: 150 },
  { name: 'Registrations', completed: 200, abandoned: 50 },
  { name: 'Downloads', completed: 300, abandoned: 20 },
];

// Tutorial content for the Analytics Dashboard tool
const AnalyticsDashboardTutorial = (
  <div className="space-y-4">
    <p>Get started with your Analytics Dashboard in a few simple steps:</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Connect your Google Analytics account (requires GA4)</li>
      <li>Select the properties and views you want to track</li>
      <li>Choose your key metrics and KPIs</li>
      <li>Set up custom dashboards for different teams/purposes</li>
      <li>Configure automated reporting schedules</li>
    </ol>
    <p className="text-muted-foreground">The dashboard displays sample data until you connect a Google Analytics account.</p>
    
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">Advanced Features (Pro Plan):</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Custom event tracking for specific user actions</li>
        <li>Audience segmentation for targeted analysis</li>
        <li>Funnel visualization for conversion paths</li>
        <li>AI-powered insights and recommendations</li>
        <li>CRM data integration for full customer journey analysis</li>
      </ul>
    </div>
  </div>
);

const AnalyticsDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<string>('last-30-days');
  const [property, setProperty] = useState<string>('');

  // Mock connecting to Google Analytics
  const handleConnect = () => {
    setIsLoading(true);
    trackEvent('analytics_connect', 'analytics_dashboard', 'ga4');
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Connection Successful",
        description: "Your Google Analytics account has been connected.",
      });
    }, 2000);
  };

  // Mock refreshing data
  const handleRefresh = () => {
    setIsLoading(true);
    trackEvent('analytics_refresh', 'analytics_dashboard', activeTab);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Your analytics data has been updated.",
      });
    }, 1500);
  };

  // Mock exporting data
  const handleExport = () => {
    trackEvent('analytics_export', 'analytics_dashboard', activeTab);
    toast({
      title: "Export Started",
      description: "Your analytics data is being exported.",
    });
  };

  return (
    <ToolLayout
      title="Analytics Dashboard"
      description="Track website and app performance metrics with Google Analytics integration and customizable reports."
      tutorial={AnalyticsDashboardTutorial}
      tutorialTitle="Setting Up Your Analytics Dashboard"
    >
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart4 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-bold mb-2">Connect Your Analytics Account</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Connect your Google Analytics account to view real-time data and insights about your website visitors.
          </p>
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Connecting...
              </>
            ) : (
              "Connect Google Analytics"
            )}
          </Button>
          <div className="mt-8 border-t pt-8 w-full">
            <h4 className="text-lg font-medium mb-4">Sample Dashboard Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 pointer-events-none">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Visitors Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <LineChart
                    data={sampleVisitorData}
                    index="name"
                    categories={["Users", "Sessions"]}
                    colors={["blue", "violet"]}
                    valueFormatter={(value: number) => `${value.toLocaleString()}`}
                    className="h-full w-full"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <PieChart
                    data={sampleSourceData}
                    index="name"
                    category="value"
                    colors={["blue", "cyan", "indigo", "violet"]}
                    valueFormatter={(value: number) => `${value}%`}
                    className="h-full w-full"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-500 border-green-500">
                Connected to Google Analytics
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange === 'custom' && date
                      ? format(date, "PPP")
                      : dateRange === 'last-7-days'
                      ? 'Last 7 days'
                      : dateRange === 'last-30-days'
                      ? 'Last 30 days'
                      : dateRange === 'last-90-days'
                      ? 'Last 90 days'
                      : 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <Select
                        value={dateRange}
                        onValueChange={(value) => setDateRange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 days</SelectItem>
                          <SelectItem value="last-90-days">Last 90 days</SelectItem>
                          <SelectItem value="custom">Custom date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {dateRange === 'custom' && (
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  )}
                </PopoverContent>
              </Popover>
              <Select value={property} onValueChange={setProperty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Main Website</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="shop">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12,456</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className="text-green-500 mr-1">↑ 12.5%</span> vs previous period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18,927</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className="text-green-500 mr-1">↑ 8.2%</span> vs previous period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42.3%</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className="text-red-500 mr-1">↑ 3.1%</span> vs previous period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2:34</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <span className="text-green-500 mr-1">↑ 7.4%</span> vs previous period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Visitor Trends</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <LineChart
                      data={sampleVisitorData}
                      index="name"
                      categories={["Users", "Sessions", "New Users"]}
                      colors={["blue", "violet", "cyan"]}
                      valueFormatter={(value: number) => `${value.toLocaleString()}`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Traffic Sources</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <PieChart
                      data={sampleSourceData}
                      index="name"
                      category="value"
                      colors={["blue", "cyan", "indigo", "violet"]}
                      valueFormatter={(value: number) => `${value}%`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Top Pages</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sampleEngagementData.map((page, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            <span className="font-medium">{page.name}</span>
                          </div>
                          <div className="text-muted-foreground text-sm">{page.views.toLocaleString()} views</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="audience" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Age Groups</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">18-24</span>
                            <span className="text-sm font-medium">18%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">25-34</span>
                            <span className="text-sm font-medium">42%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">35-44</span>
                            <span className="text-sm font-medium">24%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Gender</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm">Male</span>
                            <span className="text-xl font-bold">56%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">Female</span>
                            <span className="text-xl font-bold">44%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      Geography
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Countries</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm">United States</span>
                            </div>
                            <span className="text-sm font-medium">42%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                              <span className="text-sm">United Kingdom</span>
                            </div>
                            <span className="text-sm font-medium">18%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-violet-500 mr-2"></div>
                              <span className="text-sm">Canada</span>
                            </div>
                            <span className="text-sm font-medium">12%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                              <span className="text-sm">Australia</span>
                            </div>
                            <span className="text-sm font-medium">8%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-slate-500 mr-2"></div>
                              <span className="text-sm">Germany</span>
                            </div>
                            <span className="text-sm font-medium">6%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <LineChartIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      Technology
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Devices</h4>
                        <div className="h-[150px]">
                          <PieChart
                            data={[
                              { name: 'Mobile', value: 52 },
                              { name: 'Desktop', value: 38 },
                              { name: 'Tablet', value: 10 },
                            ]}
                            index="name"
                            category="value"
                            colors={["blue", "indigo", "cyan"]}
                            valueFormatter={(value: number) => `${value}%`}
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Browsers</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Chrome</span>
                            <span className="text-sm font-medium">64%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Safari</span>
                            <span className="text-sm font-medium">22%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Firefox</span>
                            <span className="text-sm font-medium">8%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="behavior" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Page Views by Path</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <BarChart
                      data={sampleEngagementData}
                      index="name"
                      categories={["views"]}
                      colors={["blue"]}
                      valueFormatter={(value: number) => `${value.toLocaleString()}`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Average Time on Page (seconds)</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <BarChart
                      data={sampleEngagementData}
                      index="name"
                      categories={["avgTime"]}
                      colors={["violet"]}
                      valueFormatter={(value: number) => `${value}s`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>User Flow</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Visualization of how users navigate through your site</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>User flow visualization requires Pro plan</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Upgrade Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="conversions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Conversion Rates</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <BarChart
                      data={sampleConversionData.map(item => ({
                        name: item.name,
                        rate: Math.round((item.completed / (item.completed + item.abandoned)) * 100)
                      }))}
                      index="name"
                      categories={["rate"]}
                      colors={["blue"]}
                      valueFormatter={(value: number) => `${value}%`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Completed vs Abandoned</CardTitle>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <BarChart
                      data={sampleConversionData}
                      index="name"
                      categories={["completed", "abandoned"]}
                      colors={["green", "red"]}
                      valueFormatter={(value: number) => `${value}`}
                      className="h-full w-full"
                    />
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Funnel Analysis</CardTitle>
                      <Badge variant="outline">Pro Feature</Badge>
                    </div>
                    <CardDescription>Track user conversion through defined paths</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Funnel analysis is available on Pro plan</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Upgrade Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  );
};

export default AnalyticsDashboardPage;

// Chart components are now imported from @/components/ui/charts