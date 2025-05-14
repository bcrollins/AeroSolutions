import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, CheckCircle2, Trophy } from "lucide-react";

// Skeleton for loading state
function ContributorsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ForumTopContributors() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/forum/top-contributors"],
    queryFn: async () => {
      const response = await fetch("/api/forum/top-contributors?limit=5");
      if (!response.ok) {
        throw new Error("Failed to fetch top contributors");
      }
      return response.json();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Contributors
        </CardTitle>
        <CardDescription>
          Members with the most valuable contributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ContributorsSkeleton />
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Failed to load top contributors
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No contributors data available yet
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((contributor: any, index: number) => (
              <Link key={contributor.userId} to={`/community/profile/${contributor.userId}`}>
                <div className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-colors">
                      <AvatarImage src={contributor.profileImageUrl} alt={contributor.username} />
                      <AvatarFallback>{contributor.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <Badge 
                        className={`absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center
                          ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}
                      >
                        {index + 1}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {contributor.username || 'Anonymous User'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        <span>{contributor.threadCount + contributor.replyCount}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        <span>{contributor.acceptedAnswers}</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        <span>{contributor.likesReceived}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}