import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sliders, Save, Star, Tags, Briefcase, Brain, Sparkles, RotateCcw, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const DEFAULT_PREFERENCES = {
  difficultyLevels: ['beginner', 'intermediate'],
  topicPreferences: ['machine-learning', 'deep-learning', 'nlp', 'computer-vision'],
  learningStyle: 'visual',
  maxDuration: 8, // weeks
  showPremiumContent: true,
  showRecommendationReasons: true,
};

const RecommendationPreferences = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch existing preferences
  const { data, isLoading } = useQuery({
    queryKey: ['/api/user/recommendation-preferences'],
    queryFn: async () => {
      const response = await fetch('/api/user/recommendation-preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: isAuthenticated,
    onError: () => {
      // If there's an error fetching, use default preferences
      setPreferences(DEFAULT_PREFERENCES);
    }
  });
  
  // Set initial preferences (from API or defaults)
  const [preferences, setPreferences] = useState(data?.preferences || DEFAULT_PREFERENCES);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update the state when data is loaded
  React.useEffect(() => {
    if (data?.preferences) {
      setPreferences(data.preferences);
    }
  }, [data]);
  
  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: any) => {
      const response = await fetch('/api/user/recommendation-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: newPreferences }),
      });
      
      if (!response.ok) throw new Error('Failed to save preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/recommendation-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/personalized'] });
      
      toast({
        title: "Preferences saved",
        description: "Your recommendation preferences have been updated.",
        duration: 3000,
      });
      
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save preferences",
        description: error.message || "Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });
  
  // Local storage for non-authenticated users
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('recommendation_preferences', JSON.stringify(preferences));
      
      toast({
        title: "Preferences saved locally",
        description: "Sign in to sync your preferences across devices.",
        duration: 3000,
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Failed to save preferences",
        description: "Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleSave = () => {
    if (isAuthenticated) {
      savePreferencesMutation.mutate(preferences);
    } else {
      saveToLocalStorage();
    }
  };
  
  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    
    toast({
      title: "Preferences reset",
      description: "Recommendation preferences have been reset to default values.",
      duration: 3000,
    });
  };
  
  const handleCheckboxChange = (category: 'difficultyLevels' | 'topicPreferences', value: string) => {
    setPreferences(prev => {
      const current = [...prev[category]];
      
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };
  
  // If not editing and not loading, just show a summary
  if (!isEditing && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sliders className="mr-2 h-5 w-5 text-blue-500" />
            Recommendation Preferences
          </CardTitle>
          <CardDescription>
            Customize how courses are recommended to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Tags className="h-4 w-4 mr-1.5 text-gray-400" />
                Topics of Interest
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {preferences.topicPreferences.map(topic => (
                  <Badge key={topic} variant="outline">{topic}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Brain className="h-4 w-4 mr-1.5 text-gray-400" />
                Difficulty Levels
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {preferences.difficultyLevels.map(level => (
                  <Badge key={level} variant="outline">{level}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Briefcase className="h-4 w-4 mr-1.5 text-gray-400" />
                Learning Style
              </h3>
              <p className="text-sm text-gray-500">{preferences.learningStyle}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1 flex items-center">
                <Star className="h-4 w-4 mr-1.5 text-gray-400" />
                Premium Content
              </h3>
              <p className="text-sm text-gray-500">{preferences.showPremiumContent ? 'Show premium courses' : 'Hide premium courses'}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit Preferences
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Full edit mode
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sliders className="mr-2 h-5 w-5 text-blue-500" />
          Customize Your Recommendations
        </CardTitle>
        <CardDescription>
          Tailor your learning experience by setting your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="learning">Learning Style</TabsTrigger>
            <TabsTrigger value="display">Display Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topics" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Topics of Interest</h3>
              <div className="grid grid-cols-2 gap-2">
                {['machine-learning', 'deep-learning', 'nlp', 'computer-vision', 'reinforcement-learning', 'data-science', 'generative-ai', 'neural-networks'].map(topic => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`topic-${topic}`}
                      checked={preferences.topicPreferences.includes(topic)}
                      onCheckedChange={() => handleCheckboxChange('topicPreferences', topic)}
                    />
                    <label htmlFor={`topic-${topic}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {topic}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium">Add Custom Topic</label>
                <div className="flex mt-1">
                  <Input placeholder="e.g., quantum computing" className="mr-2" />
                  <Button variant="outline" size="sm">Add</Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Difficulty Levels</h3>
              <div className="flex flex-col space-y-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`level-${level}`}
                      checked={preferences.difficultyLevels.includes(level)}
                      onCheckedChange={() => handleCheckboxChange('difficultyLevels', level)}
                    />
                    <label htmlFor={`level-${level}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="learning" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Preferred Learning Style</h3>
              <div className="grid grid-cols-2 gap-y-2">
                {['visual', 'auditory', 'reading', 'hands-on'].map(style => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`style-${style}`}
                      checked={preferences.learningStyle === style}
                      onCheckedChange={() => setPreferences(prev => ({ ...prev, learningStyle: style }))}
                    />
                    <label htmlFor={`style-${style}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-3">Maximum Course Duration</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>2 weeks</span>
                  <span>4 weeks</span>
                  <span>8 weeks</span>
                  <span>12+ weeks</span>
                </div>
                <Slider
                  defaultValue={[preferences.maxDuration]}
                  max={12}
                  min={2}
                  step={2}
                  onValueChange={(values) => setPreferences(prev => ({ ...prev, maxDuration: values[0] }))}
                />
                <div className="text-center mt-2">
                  <span className="text-sm font-medium">{preferences.maxDuration} weeks</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Content Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-premium"
                    checked={preferences.showPremiumContent}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showPremiumContent: !!checked }))}
                  />
                  <label htmlFor="show-premium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show premium content
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-reasons"
                    checked={preferences.showRecommendationReasons}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showRecommendationReasons: !!checked }))}
                  />
                  <label htmlFor="show-reasons" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show recommendation reasons
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md flex items-start mt-2">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Your preferences help us personalize course recommendations. We'll use this information to suggest courses that match your interests and learning style.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={savePreferencesMutation.isPending}>
            {savePreferencesMutation.isPending ? (
              <motion.div
                className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecommendationPreferences;