import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation schema
const replySchema = z.object({
  content: z
    .string()
    .min(5, "Reply must be at least 5 characters")
    .max(5000, "Reply must be less than 5000 characters"),
  parentReplyId: z.number().optional(),
});

type ReplyFormValues = z.infer<typeof replySchema>;

interface ForumReplyFormProps {
  threadId: number;
  parentReplyId?: number;
  onReplyAdded?: () => void;
  onCancel?: () => void;
  isNested?: boolean;
}

export default function ForumReplyForm({
  threadId,
  parentReplyId,
  onReplyAdded,
  onCancel,
  isNested = false,
}: ForumReplyFormProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
      parentReplyId: parentReplyId,
    },
  });

  const onSubmit = async (values: ReplyFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to reply to threads",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/forum/threads/${threadId}/replies`, values);
      
      toast({
        title: "Reply Submitted",
        description: parentReplyId 
          ? "Your reply has been submitted and will be visible after moderation" 
          : "Your reply has been added to the thread",
      });
      
      // Reset form
      form.reset({
        content: "",
        parentReplyId: parentReplyId,
      });
      
      // Callback to parent
      if (onReplyAdded) {
        onReplyAdded();
      }
      
      // Close nested reply form if applicable
      if (onCancel && isNested) {
        onCancel();
      }
    } catch (error: any) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Alert variant="default" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          You need to be logged in to reply to this thread.
        </AlertDescription>
      </Alert>
    );
  }

  // For nested replies (replying to another reply)
  if (isNested) {
    return (
      <div className="mb-6 ml-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write your reply..."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Reply
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Main reply form (replying to the thread)
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Post a Reply</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Reply</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your reply..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your reply will be visible to all users after moderation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Reply
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}