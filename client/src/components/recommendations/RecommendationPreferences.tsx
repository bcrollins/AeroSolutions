import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Check, 
  Trash2, 
  PlusCircle, 
  Save,
  RefreshCw,
  BrainCircuit,
  BookOpen,
  Code,
  Layers,
  BarChart
} from 'lucide-react';

// Define preference types
interface TopicPreference {
  id: string;
  name: string;
  strength: number;
}

interface PreferenceState {
  learningStyle: string;
  topicPreferences: TopicPreference[];
  timeAvailability: number;
  skillLevel: string;
  contentPreferences: {
    videos: boolean;
    interactive: boolean;
    readings: boolean;
    quizzes: boolean;
    projects: boolean;
  };
  careerGoals: string[];
  excludeCompleted: boolean;
  showTrending: boolean;
}

const RecommendationPreferences: React.FC = () => {
  // Default preferences
  const defaultPreferences: PreferenceState = {
    learningStyle: 'balanced',
    topicPreferences: [
      { id: 'ai-fundamentals', name: 'AI Fundamentals', strength: 90 },
      { id: 'machine-learning', name: 'Machine Learning', strength: 75 },
      { id: 'deep-learning', name: 'Deep Learning', strength: 80 },
      { id: 'nlp', name: 'Natural Language Processing', strength: 65 },
    ],
    timeAvailability: 8, // hours per week
    skillLevel: 'intermediate',
    contentPreferences: {
      videos: true,
      interactive: true,
      readings: true,
      quizzes: true,
      projects: true,
    },
    careerGoals: ['data-scientist'],
    excludeCompleted: true,
    showTrending: true,
  };
  
  // Load saved preferences from localStorage or use defaults
  const loadSavedPreferences = (): PreferenceState => {
    try {
      const saved = localStorage.getItem('recommendation_preferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return defaultPreferences;
    }
  };
  
  // Component state
  const [preferences, setPreferences] = useState<PreferenceState>(loadSavedPreferences);
  const [newTopic, setNewTopic] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [newCareerGoal, setNewCareerGoal] = useState<string>('');
  
  // Topic suggestions for dropdown
  const topicSuggestions = [
    'Computer Vision', 
    'Reinforcement Learning', 
    'MLOps', 
    'AI Ethics', 
    'Generative AI',
    'Large Language Models',
    'Edge AI',
    'Robotics',
    'AI for Healthcare',
    'AI for Finance'
  ];
  
  // Career goal options
  const careerGoalOptions = [
    { id: 'data-scientist', name: 'Data Scientist' },
    { id: 'ml-engineer', name: 'Machine Learning Engineer' },
    { id: 'ai-researcher', name: 'AI Researcher' },
    { id: 'ai-product-manager', name: 'AI Product Manager' },
    { id: 'computer-vision-engineer', name: 'Computer Vision Engineer' },
    { id: 'nlp-specialist', name: 'NLP Specialist' },
    { id: 'data-engineer', name: 'Data Engineer' },
    { id: 'robotics-engineer', name: 'Robotics Engineer' },
    { id: 'ai-consultant', name: 'AI Consultant' },
    { id: 'ai-ethicist', name: 'AI Ethicist' }
  ];
  
  // Handle topic preference strength change
  const handleStrengthChange = (id: string, newStrength: number) => {
    setPreferences(prev => ({
      ...prev,
      topicPreferences: prev.topicPreferences.map(topic => 
        topic.id === id ? { ...topic, strength: newStrength } : topic
      )
    }));
  };
  
  // Add new topic preference
  const handleAddTopic = () => {
    if (!newTopic) return;
    
    // Create slug-like ID
    const id = newTopic.toLowerCase().replace(/\s+/g, '-');
    
    // Check if topic already exists
    if (preferences.topicPreferences.some(topic => topic.id === id)) {
      toast({
        title: "Topic already exists",
        description: `${newTopic} is already in your preferences.`,
        variant: "destructive"
      });
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      topicPreferences: [
        ...prev.topicPreferences,
        { id, name: newTopic, strength: 50 }
      ]
    }));
    
    setNewTopic('');
    
    toast({
      title: "Topic added",
      description: `${newTopic} has been added to your preferences.`
    });
  };
  
  // Remove topic preference
  const handleRemoveTopic = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      topicPreferences: prev.topicPreferences.filter(topic => topic.id !== id)
    }));
  };
  
  // Handle toggle switches
  const handleToggle = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      contentPreferences: {
        ...prev.contentPreferences,
        [key]: value
      }
    }));
  };
  
  // Handle career goal toggle
  const handleCareerGoalToggle = (goalId: string) => {
    setPreferences(prev => {
      const isSelected = prev.careerGoals.includes(goalId);
      
      return {
        ...prev,
        careerGoals: isSelected
          ? prev.careerGoals.filter(id => id !== goalId)
          : [...prev.careerGoals, goalId]
      };
    });
  };
  
  // Save preferences
  const savePreferences = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        localStorage.setItem('recommendation_preferences', JSON.stringify(preferences));
        toast({
          title: "Preferences saved",
          description: "Your recommendation preferences have been updated.",
        });
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Failed to save",
          description: "There was an error saving your preferences. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    toast({
      title: "Preferences reset",
      description: "Your recommendation preferences have been reset to defaults.",
    });
  };
  
  // Helper function to get icon for topic
  const getTopicIcon = (topicId: string) => {
    switch (topicId) {
      case 'ai-fundamentals':
        return <BrainCircuit className="h-4 w-4" />;
      case 'machine-learning':
        return <Layers className="h-4 w-4" />;
      case 'deep-learning':
        return <BrainCircuit className="h-4 w-4" />;
      case 'nlp':
        return <BookOpen className="h-4 w-4" />;
      case 'computer-vision':
        return <BookOpen className="h-4 w-4" />;
      case 'mlops':
        return <Code className="h-4 w-4" />;
      default:
        return <BrainCircuit className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Style */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="learning-style">Learning Style</Label>
          <span className="text-sm text-gray-500">
            {preferences.learningStyle === 'theoretical' ? 'Theory-focused' : 
             preferences.learningStyle === 'practical' ? 'Practice-focused' : 'Balanced'}
          </span>
        </div>
        <Select
          value={preferences.learningStyle}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, learningStyle: value }))}
        >
          <SelectTrigger id="learning-style">
            <SelectValue placeholder="Select your learning style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theoretical">Theory-focused</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="practical">Practice-focused</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Your preferred balance between theoretical concepts and practical applications.
        </p>
      </div>
      
      <Separator />
      
      {/* Topics of Interest */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Topics of Interest</h3>
        <p className="text-sm text-gray-500 mb-4">
          Adjust the sliders to indicate your level of interest in each topic.
        </p>
        
        {preferences.topicPreferences.map((topic) => (
          <div key={topic.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getTopicIcon(topic.id)}
                <Label className="ml-2">{topic.name}</Label>
              </div>
              <div className="flex items-center">
                <Badge 
                  variant={topic.strength > 80 ? "default" : 
                         topic.strength > 50 ? "secondary" : "outline"}
                  className="mr-2"
                >
                  {topic.strength}%
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveTopic(topic.id)}
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Slider
              value={[topic.strength]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => handleStrengthChange(topic.id, value[0])}
              className="py-1"
            />
          </div>
        ))}
        
        {/* Add new topic */}
        <div className="flex gap-2 mt-4">
          <Select 
            value={newTopic} 
            onValueChange={setNewTopic}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add a topic..." />
            </SelectTrigger>
            <SelectContent>
              {topicSuggestions.map(topic => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddTopic} 
            disabled={!newTopic}
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Weekly Time Availability */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="time-availability">Weekly Time Availability</Label>
          <span className="text-sm text-gray-500">{preferences.timeAvailability} hours/week</span>
        </div>
        <Slider
          id="time-availability"
          value={[preferences.timeAvailability]}
          min={1}
          max={20}
          step={1}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, timeAvailability: value[0] }))}
        />
        <p className="text-xs text-gray-500">
          How much time you can dedicate to learning each week. This helps us recommend appropriately-sized courses.
        </p>
      </div>
      
      <Separator />
      
      {/* Skill Level */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="skill-level">Skill Level</Label>
          <span className="text-sm text-gray-500 capitalize">{preferences.skillLevel}</span>
        </div>
        <Select
          value={preferences.skillLevel}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, skillLevel: value }))}
        >
          <SelectTrigger id="skill-level">
            <SelectValue placeholder="Select your skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Your current knowledge level in AI and machine learning.
        </p>
      </div>
      
      <Separator />
      
      {/* Content Type Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Type Preferences</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select which types of learning content you prefer.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <Label htmlFor="pref-videos">Video Lessons</Label>
            </div>
            <Switch
              id="pref-videos"
              checked={preferences.contentPreferences.videos}
              onCheckedChange={(checked) => handleToggle('videos', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-gray-500" />
              <Label htmlFor="pref-interactive">Interactive Exercises</Label>
            </div>
            <Switch
              id="pref-interactive"
              checked={preferences.contentPreferences.interactive}
              onCheckedChange={(checked) => handleToggle('interactive', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <Label htmlFor="pref-readings">Reading Materials</Label>
            </div>
            <Switch
              id="pref-readings"
              checked={preferences.contentPreferences.readings}
              onCheckedChange={(checked) => handleToggle('readings', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-gray-500" />
              <Label htmlFor="pref-quizzes">Quizzes & Assessments</Label>
            </div>
            <Switch
              id="pref-quizzes"
              checked={preferences.contentPreferences.quizzes}
              onCheckedChange={(checked) => handleToggle('quizzes', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-gray-500" />
              <Label htmlFor="pref-projects">Hands-on Projects</Label>
            </div>
            <Switch
              id="pref-projects"
              checked={preferences.contentPreferences.projects}
              onCheckedChange={(checked) => handleToggle('projects', checked)}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Career Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Career Goals</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select career paths you're interested in pursuing.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {careerGoalOptions.map(goal => (
            <Badge 
              key={goal.id}
              variant={preferences.careerGoals.includes(goal.id) ? "default" : "outline"}
              className="cursor-pointer py-1.5 px-3"
              onClick={() => handleCareerGoalToggle(goal.id)}
            >
              {preferences.careerGoals.includes(goal.id) && (
                <Check className="mr-1 h-3 w-3" />
              )}
              {goal.name}
            </Badge>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Additional Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="exclude-completed" className="font-medium">Exclude completed courses</Label>
              <p className="text-xs text-gray-500">Don't recommend courses you've already completed</p>
            </div>
            <Switch
              id="exclude-completed"
              checked={preferences.excludeCompleted}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, excludeCompleted: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div>
              <Label htmlFor="show-trending" className="font-medium">Show trending courses</Label>
              <p className="text-xs text-gray-500">Include popular and trending courses in recommendations</p>
            </div>
            <Switch
              id="show-trending"
              checked={preferences.showTrending}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showTrending: checked }))}
            />
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="sm:w-auto"
        >
          Reset to Defaults
        </Button>
        
        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="sm:w-auto"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecommendationPreferences;