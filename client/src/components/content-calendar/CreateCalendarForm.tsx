import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Hash, Info, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Form schema with validation
const FormSchema = z.object({
  name: z.string().min(3, "Calendar name must be at least 3 characters"),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  industry: z.string().min(2, "Industry must be at least 2 characters"),
  companyGoals: z.string().min(10, "Please provide more detailed company goals"),
  targetAudience: z.string().min(10, "Please describe your target audience in more detail"),
  toneOfVoice: z.string().min(3, "Please specify the tone of voice"),
  includeImages: z.boolean().default(true),
  startDate: z.date(),
  endDate: z.date(),
  frequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  keyHashtags: z.array(z.string()).optional(),
  brandColors: z.array(z.string()).optional(),
  competitorUrls: z.array(z.string()).optional(),
  campaignThemes: z.array(z.string()).optional(),
  productHighlights: z.array(z.string()).optional(),
  keyMessages: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
  urlsToInclude: z.array(z.string()).optional(),
  preferredContentTypes: z.array(z.string()).optional(),
  exclusions: z.string().optional(),
  userId: z.string().optional(), // Will be set by the backend
});

// Create a type for our form values
type FormValues = z.infer<typeof FormSchema>;

// Available platforms options
const platformOptions = [
  { value: "X", label: "X (Twitter)" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Threads", label: "Threads" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Pinterest", label: "Pinterest" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
];

// Content type options
const contentTypeOptions = [
  { value: "text", label: "Text Posts" },
  { value: "image", label: "Image Posts" },
  { value: "video", label: "Video Posts" },
  { value: "carousel", label: "Carousel Posts" },
  { value: "story", label: "Stories" },
  { value: "reel", label: "Reels/Short Videos" },
  { value: "link", label: "Link Posts" },
  { value: "poll", label: "Polls/Questions" },
  { value: "announcement", label: "Announcements" },
  { value: "testimonial", label: "Testimonials" },
  { value: "behindTheScenes", label: "Behind the Scenes" },
  { value: "tutorial", label: "Tutorials/How-tos" },
];

// Tone options
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "informative", label: "Informative" },
  { value: "inspirational", label: "Inspirational" },
  { value: "humorous", label: "Humorous" },
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

// Industry options
const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "retail", label: "Retail" },
  { value: "travel", label: "Travel" },
  { value: "hospitality", label: "Hospitality" },
  { value: "food", label: "Food & Beverage" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "real-estate", label: "Real Estate" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "legal", label: "Legal" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

interface CreateCalendarFormProps {
  onSuccess: () => void;
}

export default function CreateCalendarForm({ onSuccess }: CreateCalendarFormProps) {
  const { toast } = useToast();
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');
  const [currentHighlight, setCurrentHighlight] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentColor, setCurrentColor] = useState('');

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      brandName: '',
      industry: '',
      companyGoals: '',
      targetAudience: '',
      toneOfVoice: 'professional',
      includeImages: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from today
      frequency: 'weekly',
      platforms: ['X', 'Facebook'],
      keyHashtags: [],
      brandColors: [],
      competitorUrls: [],
      campaignThemes: [],
      productHighlights: [],
      keyMessages: [],
      callToAction: '',
      urlsToInclude: [],
      preferredContentTypes: ['text', 'image'],
      exclusions: '',
    },
  });

  // Create mutation for form submission
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest('POST', '/api/content-calendar', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Calendar created successfully',
        description: 'Your new content calendar has been created.',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/content-calendar'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error creating calendar',
        description: 'Failed to create the content calendar. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating calendar:', error);
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  // Helper functions for array fields
  const addItem = (
    field: "keyHashtags" | "competitorUrls" | "campaignThemes" | "productHighlights" | "keyMessages" | "urlsToInclude" | "brandColors",
    value: string,
    setValue: (value: string) => void
  ) => {
    if (!value.trim()) return;

    const currentValues = form.getValues(field) || [];
    if (!currentValues.includes(value)) {
      form.setValue(field, [...currentValues, value]);
      setValue('');
    }
  };

  const removeItem = (
    field: "keyHashtags" | "competitorUrls" | "campaignThemes" | "productHighlights" | "keyMessages" | "urlsToInclude" | "brandColors",
    value: string
  ) => {
    const currentValues = form.getValues(field) || [];
    form.setValue(
      field,
      currentValues.filter((item) => item !== value)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="preferences">Content Preferences</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Q4 Marketing Campaign" {...field} />
                    </FormControl>
                    <FormDescription>A name for your content calendar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormDescription>The name of your brand or company</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Your business industry</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toneOfVoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone of Voice</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {toneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The tone for your social content</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Increase brand awareness, drive website traffic, generate leads..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>What are you trying to achieve?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your target audience (age, interests, demographics)..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Who are you trying to reach?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When to start publishing content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return date < startDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When to end the content calendar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posting Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to post content</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeImages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include Images</FormLabel>
                      <FormDescription>
                        Generate AI images for your posts
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Platforms</FormLabel>
                    <FormDescription>
                      Select the social media platforms for your content
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {platformOptions.map((platform) => (
                      <FormField
                        key={platform.value}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform.value}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== platform.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {platform.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Content Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Hashtags</CardTitle>
                  <CardDescription>
                    Add hashtags to include in your posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentHashtag}
                      onChange={(e) => setCurrentHashtag(e.target.value)}
                      placeholder="Add a hashtag (without #)"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("keyHashtags", currentHashtag, setCurrentHashtag);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.watch("keyHashtags")?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("keyHashtags", tag)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {(!form.watch("keyHashtags") || form.watch("keyHashtags").length === 0) && (
                      <div className="text-sm text-muted-foreground">No hashtags added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Themes</CardTitle>
                  <CardDescription>
                    Add themes for your content calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentTheme}
                      onChange={(e) => setCurrentTheme(e.target.value)}
                      placeholder="Add a theme (e.g. 'Summer Sale')"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("campaignThemes", currentTheme, setCurrentTheme);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.watch("campaignThemes")?.map((theme) => (
                      <Badge key={theme} variant="outline" className="gap-1">
                        {theme}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("campaignThemes", theme)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {(!form.watch("campaignThemes") || form.watch("campaignThemes").length === 0) && (
                      <div className="text-sm text-muted-foreground">No themes added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Highlights</CardTitle>
                  <CardDescription>
                    Key products or services to feature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentHighlight}
                      onChange={(e) => setCurrentHighlight(e.target.value)}
                      placeholder="Add a product or service"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("productHighlights", currentHighlight, setCurrentHighlight);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.watch("productHighlights")?.map((item) => (
                      <Badge key={item} variant="secondary" className="gap-1">
                        {item}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("productHighlights", item)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {(!form.watch("productHighlights") || form.watch("productHighlights").length === 0) && (
                      <div className="text-sm text-muted-foreground">No product highlights added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Messages</CardTitle>
                  <CardDescription>
                    Important messages to communicate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Add a key message"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("keyMessages", currentMessage, setCurrentMessage);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.watch("keyMessages")?.map((message) => (
                      <Badge key={message} variant="outline" className="gap-1">
                        {message}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("keyMessages", message)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {(!form.watch("keyMessages") || form.watch("keyMessages").length === 0) && (
                      <div className="text-sm text-muted-foreground">No key messages added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <FormField
              control={form.control}
              name="callToAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call to Action</FormLabel>
                  <FormControl>
                    <Input placeholder="Visit our website to learn more" {...field} />
                  </FormControl>
                  <FormDescription>Primary call to action for posts</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredContentTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Content Types</FormLabel>
                    <FormDescription>
                      Select the types of content to create
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {contentTypeOptions.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="preferredContentTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Add your brand colors (hex codes)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      placeholder="#000000"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("brandColors", currentColor, setCurrentColor);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.watch("brandColors")?.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-2 border rounded-md p-2"
                      >
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("brandColors", color)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                    {(!form.watch("brandColors") || form.watch("brandColors").length === 0) && (
                      <div className="text-sm text-muted-foreground">No brand colors added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>URLs to Include</CardTitle>
                  <CardDescription>
                    Add URLs to include in posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-2">
                    <Input 
                      value={currentUrl}
                      onChange={(e) => setCurrentUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mr-2"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => {
                        addItem("urlsToInclude", currentUrl, setCurrentUrl);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {form.watch("urlsToInclude")?.map((url) => (
                      <div key={url} className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-sm truncate max-w-[200px]">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => removeItem("urlsToInclude", url)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                    {(!form.watch("urlsToInclude") || form.watch("urlsToInclude").length === 0) && (
                      <div className="text-sm text-muted-foreground">No URLs added yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competitor URLs</CardTitle>
                <CardDescription>
                  Add your competitors' social media URLs for reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-2">
                  <Input 
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="https://x.com/competitor"
                    className="mr-2"
                  />
                  <Button 
                    type="button"
                    size="sm"
                    onClick={() => {
                      addItem("competitorUrls", currentUrl, setCurrentUrl);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {form.watch("competitorUrls")?.map((url) => (
                    <div key={url} className="flex items-center justify-between rounded-md border p-2">
                      <span className="text-sm truncate max-w-[300px]">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => removeItem("competitorUrls", url)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  {(!form.watch("competitorUrls") || form.watch("competitorUrls").length === 0) && (
                    <div className="text-sm text-muted-foreground">No competitor URLs added yet</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="exclusions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exclusions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Topics, phrases, or approaches to avoid..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Content to avoid in generated posts</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={mutation.isPending}
          >
            Reset
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Calendar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}