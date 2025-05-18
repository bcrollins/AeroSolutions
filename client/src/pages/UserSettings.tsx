import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  Sliders,
  Save,
  RefreshCw
} from 'lucide-react';

import RecommendationPreferences from '@/components/recommendations/RecommendationPreferences';
import useRecommendationSync from '@/hooks/useRecommendationSync';

const UserSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { syncStatus, forceSync } = useRecommendationSync();
  const [isSaving, setIsSaving] = useState(false);
  
  // Handle form submission (this is a placeholder)
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Settings saved",
        description: "Your account settings have been updated successfully.",
        duration: 3000,
      });
    }, 1000);
  };
  
  // Handle sync button click
  const handleSyncClick = () => {
    forceSync();
    toast({
      title: "Syncing recommendations",
      description: "Your recommendations will be synced across all your devices",
      duration: 3000,
    });
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/api/login';
    }
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Account Settings | AI Learning Platform</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        
        <div className="flex mt-4 md:mt-0">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - 1/4 width */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.profileImageUrl || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="hidden lg:block">
            <Tabs defaultValue="profile" orientation="vertical" className="w-full">
              <TabsList className="bg-background flex flex-col h-auto p-0 w-full">
                <TabsTrigger value="profile" className="justify-start w-full mb-1 px-3">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="justify-start w-full mb-1 px-3">
                  <Sliders className="mr-2 h-4 w-4" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start w-full mb-1 px-3">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="justify-start w-full mb-1 px-3">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="billing" className="justify-start w-full px-3">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Main content - 3/4 width */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-8">
            <div className="lg:hidden mb-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your account details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.firstName || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.lastName || ""} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="min-h-[100px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Learning Preferences</CardTitle>
                  <CardDescription>
                    Set your learning preferences and goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="learningGoal">Learning Goal</Label>
                    <Input id="learningGoal" placeholder="e.g., Become a Machine Learning Engineer" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeek">Hours per week</Label>
                    <Input id="hoursPerWeek" type="number" min="1" max="40" placeholder="10" />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="certificateGoal">Certificate Goals</Label>
                      <Switch id="certificateGoal" />
                    </div>
                    <p className="text-sm text-gray-500">Enable if you're working toward professional certifications</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recommendation Settings</CardTitle>
                      <CardDescription>
                        Customize how we recommend courses to you
                      </CardDescription>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleSyncClick} disabled={syncStatus.syncInProgress}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
                      {syncStatus.syncInProgress ? 'Syncing...' : 'Sync Devices'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    Your recommendation preferences are synced across all your devices when you're signed in.
                    Any changes you make here will affect recommendations throughout the platform.
                  </p>
                  
                  <RecommendationPreferences />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailCourseUpdates">Course updates</Label>
                        <Switch id="emailCourseUpdates" defaultChecked />
                      </div>
                      <p className="text-sm text-gray-500">Receive notifications when courses you're enrolled in are updated</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNewRecommendations">New recommendations</Label>
                        <Switch id="emailNewRecommendations" defaultChecked />
                      </div>
                      <p className="text-sm text-gray-500">Receive weekly emails with personalized course recommendations</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailPromotions">Promotions and discounts</Label>
                        <Switch id="emailPromotions" />
                      </div>
                      <p className="text-sm text-gray-500">Receive emails about special offers and discounts</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Push Notifications</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pushReminders">Learning reminders</Label>
                        <Switch id="pushReminders" defaultChecked />
                      </div>
                      <p className="text-sm text-gray-500">Receive reminders to continue your learning journey</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pushAchievements">Achievements</Label>
                        <Switch id="pushAchievements" defaultChecked />
                      </div>
                      <p className="text-sm text-gray-500">Receive notifications when you earn badges or complete milestones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password or enable two-factor authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  
                  <Button className="mt-2">Update Password</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-factor authentication</h3>
                      <p className="text-sm text-gray-500">Secure your account with two-factor authentication</p>
                    </div>
                    <Switch id="twoFactor" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>
                    Manage your active sessions and sign out from other devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Current session</h3>
                        <p className="text-sm text-gray-500">Web Browser - Last active just now</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Mobile app - iPhone</h3>
                        <p className="text-sm text-gray-500">Last active 2 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">Sign Out</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Tablet - iPad</h3>
                        <p className="text-sm text-gray-500">Last active 5 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">Sign Out</Button>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="mt-6 w-full">Sign Out From All Devices</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="bg-blue-500 text-white p-2 rounded-full mr-3">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Pro Plan</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Your subscription renews on June 15, 2025
                        </p>
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="mr-2">Change Plan</Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Cancel</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Payment Method</h3>
                    <div className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/25</p>
                      </div>
                      <div className="flex-grow"></div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Billing History</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Pro Plan - Monthly</p>
                          <p className="text-xs text-gray-500">May 15, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$29.99</p>
                          <Button variant="link" size="sm" className="h-6 p-0">Download</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Pro Plan - Monthly</p>
                          <p className="text-xs text-gray-500">April 15, 2025</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">$29.99</p>
                          <Button variant="link" size="sm" className="h-6 p-0">Download</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;