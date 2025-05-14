import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MainLayout from '@/components/layouts/MainLayout';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  projectType: z.enum(["website", "application", "consultation", "other"]),
  subscribe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const ContactPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
      projectType: "website",
      subscribe: false,
    },
  });

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Track contact form submission
      trackEvent('form_submission', 'contact', 'contact_page');
      
      // Simulating API call - would normally post to backend
      console.log('Form Data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Show success notification
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
        variant: "default",
      });
      
      // Reset form and update state
      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Show error notification
      toast({
        title: "Something went wrong",
        description: "Please try again later or contact us directly by email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Contact Us | RXAI - Get in Touch with Our Team</title>
        <meta name="description" content="Have questions about our services or need custom solutions? Contact the RXAI team today for personalized support and expert guidance on your AI and web development projects." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rollinsx.dev/contact" />
      </Helmet>

      <section className="bg-black/30 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact RXAI
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Have questions or ready to start your project? Get in touch with our team of experts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <Card className="col-span-2 border-primary/20 bg-black/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Thank you for reaching out!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your message has been received. We'll get back to you as soon as possible.
                    </p>
                    <Button 
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What type of project are you interested in?</FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                              {[
                                { value: "website", label: "Website" },
                                { value: "application", label: "Application" },
                                { value: "consultation", label: "Consultation" },
                                { value: "other", label: "Other" },
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  type="button"
                                  variant={field.value === option.value ? "default" : "outline"}
                                  className={field.value === option.value ? "border-primary" : ""}
                                  onClick={() => form.setValue("projectType", option.value as any)}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your project or questions..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subscribe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Subscribe to newsletter</FormLabel>
                              <FormDescription>
                                Get updates on our latest AI tools and resources
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
            
            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:contact@rollinsx.dev" className="text-gray-400 hover:text-primary transition-colors">
                        contact@rollinsx.dev
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href="tel:+11234567890" className="text-gray-400 hover:text-primary transition-colors">
                        +1 (123) 456-7890
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400">
                        San Francisco, CA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-gray-400">
                        Monday - Friday: 9am - 5pm PST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 bg-black/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Live Chat Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Need immediate assistance? Start a live chat with our support team.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // This would normally trigger your chat widget
                      console.log('Live chat requested');
                      trackEvent('chat_request', 'contact', 'contact_page');
                      toast({
                        title: "Chat Support",
                        description: "Live chat will be available soon!",
                      });
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <Separator className="my-8" />
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-gray-400 mt-2">Find quick answers to common questions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2">What services does RXAI offer?</h3>
                <p className="text-gray-400">
                  RXAI offers a comprehensive suite of AI-powered services including custom web development, AI course platform, digital tools, and subscription-based access to premium features.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">How much do your services cost?</h3>
                <p className="text-gray-400">
                  Our pricing varies depending on your specific needs. We offer flexible subscription plans starting at $19/month, as well as custom pricing for enterprise solutions. Visit our <a href="/subscriptions" className="text-primary hover:underline">pricing page</a> for details.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">How long does it take to develop a project?</h3>
                <p className="text-gray-400">
                  Project timelines vary based on complexity and scope. Simple websites can be delivered in 2-4 weeks, while complex applications may take 2-3 months. We'll provide you with a detailed timeline during our initial consultation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Do you offer support after launch?</h3>
                <p className="text-gray-400">
                  Yes, we provide comprehensive post-launch support and maintenance. Our subscription plans include regular updates, security patches, and technical support to ensure your project continues to run smoothly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage;