import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PlusCircle, ShieldAlert } from "lucide-react";
import ForumThreadList from "@/components/forum/ForumThreadList";
import ForumTopContributors from "@/components/forum/ForumTopContributors";
import CreateThreadForm from "@/components/forum/CreateThreadForm";
import WebSocketListener from "@/components/forum/WebSocketListener";

export default function Forum() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      {/* WebSocket listener for real-time notifications */}
      {isAuthenticated && <WebSocketListener />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground mt-1">
            Join discussions, ask questions, and share knowledge with the community
          </p>
        </div>
        
        {isAuthenticated && !showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Thread
          </Button>
        )}
      </div>
      
      {/* Create Thread Form */}
      {showCreateForm && (
        <CreateThreadForm onCancel={() => setShowCreateForm(false)} onSuccess={() => setShowCreateForm(false)} />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                All Threads
              </TabsTrigger>
              
              {isAdmin && (
                <TabsTrigger value="moderation" className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Moderation Queue
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="all">
              <ForumThreadList />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="moderation">
                <ForumThreadList isModerationView={true} />
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Forum Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Forum Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>Be respectful and helpful to other members</li>
                <li>Stay on topic and provide relevant answers</li>
                <li>Avoid duplicate threads - search before posting</li>
                <li>Format code using code blocks for readability</li>
                <li>All posts are moderated for quality</li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Top Contributors */}
          <ForumTopContributors />
          
          {/* Course Forums Shortcut */}
          <Card>
            <CardHeader>
              <CardTitle>Course Forums</CardTitle>
              <CardDescription>
                Course-specific discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => setLocation('/courses')}
                  >
                    Browse All Courses
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}