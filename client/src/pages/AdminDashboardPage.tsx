import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  Users,
  BookOpen,
  MessageSquare,
  BarChart4,
  ShoppingCart,
  BadgeCheck,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Award,
  GraduationCap,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { apiRequest } from '@/lib/queryClient';

const AdminDashboardPage: React.FC = () => {
  // Fetch dashboard stats
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/dashboard-stats');
      return response.json();
    },
  });

  const stats = data?.data || {
    users: { total: 0, newToday: 0, percentChange: 0 },
    courses: { total: 0, active: 0, percentChange: 0 },
    articles: { total: 0, views: 0, percentChange: 0 },
    forum: { threads: 0, posts: 0, percentChange: 0 },
    subscriptions: { total: 0, active: 0, percentChange: 0 },
    certificates: { issued: 0, percentChange: 0 },
    revenue: { monthly: '$0', annual: '$0', percentChange: 0 },
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderTrend = (percentChange: number) => {
    if (percentChange > 0) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>+{percentChange}%</span>
        </div>
      );
    } else if (percentChange < 0) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span>{percentChange}%</span>
        </div>
      );
    }
    return <span className="text-muted-foreground">0%</span>;
  };

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to RXAI Admin</h1>
        <p className="text-muted-foreground">
          Monitor your platform's performance, manage users, and ensure everything is running smoothly.
        </p>
      </div>

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>Error loading dashboard data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats.users.newToday)} new today {renderTrend(stats.users.percentChange)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.courses.active)}</div>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats.courses.total)} total courses {renderTrend(stats.courses.percentChange)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Forum Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.forum.posts)}</div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats.forum.threads)} threads {renderTrend(stats.forum.percentChange)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.revenue.monthly}</div>
                  <BarChart4 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.revenue.annual} annual {renderTrend(stats.revenue.percentChange)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Second Row Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.subscriptions.active)}</div>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats.subscriptions.total)} total subscriptions
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/subscriptions">
                    <div className="flex items-center justify-center">
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Certificates Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.certificates.issued)}</div>
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {renderTrend(stats.certificates.percentChange)} from last month
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/certificates">
                    <div className="flex items-center justify-center">
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Article Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatNumber(stats.articles.views)}</div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(stats.articles.total)} total articles {renderTrend(stats.articles.percentChange)}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/admin/content">
                    <div className="flex items-center justify-center">
                      View Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/users">
                <Users className="h-5 w-5 mb-2" />
                <span>Manage Users</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/content">
                <FileText className="h-5 w-5 mb-2" />
                <span>Edit Content</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/courses">
                <GraduationCap className="h-5 w-5 mb-2" />
                <span>Manage Courses</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/analytics">
                <BarChart4 className="h-5 w-5 mb-2" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>

          {/* Recent Activity */}
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Recent user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">New user registration</p>
                    <p className="text-sm text-muted-foreground">John Smith has created an account</p>
                    <p className="text-xs text-muted-foreground">10 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">New subscription</p>
                    <p className="text-sm text-muted-foreground">Anna Johnson purchased the Pro plan</p>
                    <p className="text-xs text-muted-foreground">35 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                    <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium">New forum thread</p>
                    <p className="text-sm text-muted-foreground">Michael Brown started a discussion "AI Ethics in 2025"</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Certificate earned</p>
                    <p className="text-sm text-muted-foreground">Emily Wilson completed the AI Fundamentals course</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;