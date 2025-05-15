import React, { useState } from 'react';
import { DataViz } from './index';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScaleIn } from '@/components/UI/MicroInteractions';

// Sample data sets for our charts
const courseProgressData = [
  { name: 'Course 1: AI Fundamentals', completion: 85, modules: 12, hours: 6 },
  { name: 'Course 2: Machine Learning', completion: 65, modules: 14, hours: 8 },
  { name: 'Course 3: Neural Networks', completion: 30, modules: 10, hours: 5 },
  { name: 'Course 4: Computer Vision', completion: 10, modules: 16, hours: 10 },
  { name: 'Course 5: NLP Advanced', completion: 0, modules: 15, hours: 9 },
];

const monthlyActiveUsers = [
  { month: 'Jan', users: 2400, premiumUsers: 1398, articles: 12 },
  { month: 'Feb', users: 1398, premiumUsers: 984, articles: 15 },
  { month: 'Mar', users: 9800, premiumUsers: 3908, articles: 20 },
  { month: 'Apr', users: 3908, premiumUsers: 2500, articles: 18 },
  { month: 'May', users: 4800, premiumUsers: 3200, articles: 22 },
  { month: 'Jun', users: 3800, premiumUsers: 2800, articles: 24 },
  { month: 'Jul', users: 4300, premiumUsers: 3100, articles: 28 },
];

const skillDistribution = [
  { name: 'AI Basics', value: 74 },
  { name: 'Machine Learning', value: 56 },
  { name: 'Neural Networks', value: 45 },
  { name: 'Computer Vision', value: 32 },
  { name: 'NLP', value: 28 },
  { name: 'AI Ethics', value: 22 },
];

const timeSpentByFeature = [
  { feature: 'Interactive Lessons', time: 45 },
  { feature: 'Video Content', time: 30 },
  { feature: 'Practice Exercises', time: 20 },
  { feature: 'Article Reading', time: 15 },
  { feature: 'Community Forums', time: 10 },
  { feature: 'AI Assistant', time: 25 },
];

const learningPerformance = [
  { name: 'Lesson Completion', student: 80, average: 70 },
  { name: 'Quiz Scores', student: 85, average: 65 },
  { name: 'Project Quality', student: 90, average: 75 },
  { name: 'Engagement', student: 75, average: 60 },
  { name: 'Consistency', student: 95, average: 65 },
];

/**
 * ExampleCharts - Component to display example usage of the DataViz system
 */
export const ExampleCharts: React.FC = () => {
  const [stacked, setStacked] = useState(false);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [animated, setAnimated] = useState(true);
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>RXAI Platform Data Visualization</CardTitle>
          <CardDescription>
            Interactive charts and graphs for visualizing platform and learning data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="stacked"
                checked={stacked}
                onCheckedChange={setStacked}
              />
              <Label htmlFor="stacked">Stacked Charts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="data-labels"
                checked={showDataLabels}
                onCheckedChange={setShowDataLabels}
              />
              <Label htmlFor="data-labels">Show Data Labels</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="animated"
                checked={animated}
                onCheckedChange={setAnimated}
              />
              <Label htmlFor="animated">Animated</Label>
            </div>
          </div>
          
          <Tabs defaultValue="charts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="charts">Example Charts</TabsTrigger>
              <TabsTrigger value="usage">Code Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScaleIn delay={0.1}>
                  <DataViz
                    title="Course Progress"
                    description="Progress across different courses"
                    data={courseProgressData}
                    type="bar"
                    xKey="name"
                    yKey="completion"
                    showDataLabels={showDataLabels}
                    valueFormatter={(value) => `${value}%`}
                    animated={animated}
                    allowDownload={true}
                  />
                </ScaleIn>
                
                <ScaleIn delay={0.2}>
                  <DataViz
                    title="Monthly Active Users"
                    description="Platform user activity trends"
                    data={monthlyActiveUsers}
                    type="line"
                    xKey="month"
                    yKey={["users", "premiumUsers"]}
                    stacked={stacked}
                    showDataLabels={showDataLabels}
                    valueFormatter={(value) => `${value.toLocaleString()}`}
                    animated={animated}
                    lineType="monotone"
                  />
                </ScaleIn>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScaleIn delay={0.3}>
                  <DataViz
                    title="Skill Distribution"
                    description="User proficiency across topics"
                    data={skillDistribution}
                    type="pie"
                    xKey="name"
                    yKey="value"
                    showPercentage={showDataLabels}
                    innerRadius={30}
                    animated={animated}
                  />
                </ScaleIn>
                
                <ScaleIn delay={0.4}>
                  <DataViz
                    title="Time Spent by Feature"
                    description="Average minutes per session"
                    data={timeSpentByFeature}
                    type="bar"
                    xKey="feature"
                    yKey="time"
                    showDataLabels={showDataLabels}
                    valueFormatter={(value) => `${value} min`}
                    animated={animated}
                  />
                </ScaleIn>
                
                <ScaleIn delay={0.5}>
                  <DataViz
                    title="Learning Performance"
                    description="Your performance vs. platform average"
                    data={learningPerformance}
                    type="radar"
                    xKey="name"
                    yKey={["student", "average"]}
                    showDataLabels={showDataLabels}
                    animated={animated}
                  />
                </ScaleIn>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <ScaleIn delay={0.6}>
                  <DataViz
                    title="Monthly Users & Content"
                    description="User activity and content creation"
                    data={monthlyActiveUsers}
                    type="area"
                    xKey="month"
                    yKey={["users", "premiumUsers", "articles"]}
                    stacked={stacked}
                    showDataLabels={showDataLabels}
                    animated={animated}
                    height={350}
                  />
                </ScaleIn>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>DataViz Component Usage</CardTitle>
                  <CardDescription>Example code snippets for using the DataViz component</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
                      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-sm">
{`// Basic bar chart
<DataViz
  title="Course Progress"
  description="Progress across different courses"
  data={courseProgressData}
  type="bar"
  xKey="name"
  yKey="completion"
/>`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Multi-Series Chart</h3>
                      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-sm">
{`// Line chart with multiple series
<DataViz
  title="Monthly Active Users"
  description="Platform user activity trends"
  data={monthlyActiveUsers}
  type="line"
  xKey="month"
  yKey={["users", "premiumUsers"]}
  stacked={false}
  showDataLabels={true}
  valueFormatter={(value) => \`\${value.toLocaleString()}\`}
/>`}
                      </pre>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Advanced Customization</h3>
                      <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-sm">
{`// Radar chart with custom colors and interactive features
<DataViz
  title="Learning Performance"
  description="Your performance vs. platform average"
  data={learningPerformance}
  type="radar"
  xKey="name"
  yKey={["student", "average"]}
  colors={['#0066CC', '#34C759', '#FF9500']}
  showDataLabels={true}
  animated={true}
  interactive={true}
  allowDownload={true}
  downloadFormat="png"
  onPointClick={(data, index) => console.log('Clicked:', data, index)}
/>`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleCharts;