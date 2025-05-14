import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Award, Download, Share2, ExternalLink, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import CertificateSharingModal from "./CertificateSharingModal";
import { apiRequest } from "@/lib/queryClient";

interface Certificate {
  id: number;
  userId: string;
  courseId: number;
  courseName?: string;
  courseTitle: string;
  completionDate: string;
  issueDate: string;
  expiryDate: string;
  recipientName: string;
  certificateNumber: string;
  verificationStatus: 'valid' | 'revoked' | 'expired';
  grade?: string;
  instructorName?: string;
  sharedToLinkedIn: boolean;
  sharedToTwitter: boolean;
}

const CertificateCard = ({ certificate, onRefresh }: { 
  certificate: Certificate;
  onRefresh: () => void;
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      // Create a download link and click it
      const response = await fetch(`/api/certificates/${certificate.id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificate.certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your certificate is being downloaded.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your certificate. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenSharingModal = () => {
    setIsSharing(true);
  };
  
  const handleCloseSharingModal = () => {
    setIsSharing(false);
  };
  
  const handleShare = async (platform: 'linkedin' | 'twitter') => {
    try {
      const response = await apiRequest('POST', `/api/certificates/${certificate.id}/share`, { platform });
      
      if (response.ok) {
        toast({
          title: "Certificate Shared",
          description: `Your certificate has been marked as shared on ${platform === 'linkedin' ? 'LinkedIn' : 'Twitter'}.`,
        });
        onRefresh();
      } else {
        throw new Error(`Failed to mark certificate as shared on ${platform}`);
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      toast({
        title: "Sharing Failed",
        description: "There was an error marking your certificate as shared. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-400" />
              {certificate.courseTitle}
            </CardTitle>
            <CardDescription>
              Completed on {format(new Date(certificate.completionDate), 'PPP')}
            </CardDescription>
          </div>
          {certificate.verificationStatus === 'valid' ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" /> Valid
            </Badge>
          ) : (
            <Badge variant="destructive">
              {certificate.verificationStatus.charAt(0).toUpperCase() + certificate.verificationStatus.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Certificate Number:</span>
            <span className="font-mono">{certificate.certificateNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Issued:</span>
            <span>{format(new Date(certificate.issueDate), 'PP')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient:</span>
            <span>{certificate.recipientName}</span>
          </div>
          {certificate.grade && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span>{certificate.grade}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex w-full justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenSharingModal}
            className="flex-1 mr-2"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
        <Link href={`/certificates/verify/${certificate.certificateNumber}`}>
          <Button variant="ghost" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-1" />
            Verify Certificate
          </Button>
        </Link>
      </CardFooter>
      
      {isSharing && (
        <CertificateSharingModal 
          certificate={certificate}
          onClose={handleCloseSharingModal}
          onShare={handleShare}
        />
      )}
    </Card>
  );
};

export default function CertificateList() {
  const [page, setPage] = useState(1);
  const limit = 6; // Number of certificates per page
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/certificates/user', page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/certificates/user?limit=${limit}&offset=${(page - 1) * limit}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      
      return response.json();
    }
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  const totalPages = data?.total ? Math.ceil(data.total / limit) : 0;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="flex w-full justify-between">
                <Skeleton className="h-9 w-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="border p-6 rounded-lg bg-card text-center">
        <h3 className="text-xl font-medium mb-2">Error Loading Certificates</h3>
        <p className="text-muted-foreground mb-4">We couldn't load your certificates. Please try again later.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  if (data?.certificates?.length === 0) {
    return (
      <div className="border p-6 rounded-lg bg-card text-center">
        <h3 className="text-xl font-medium mb-2">No Certificates Yet</h3>
        <p className="text-muted-foreground mb-4">
          Complete a course to earn your first certificate. Certificates will appear here once you've completed a course.
        </p>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="recent">Recently Earned</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.certificates.map((certificate: Certificate) => (
              <CertificateCard 
                key={certificate.id} 
                certificate={certificate} 
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.certificates
              .slice()
              .sort((a: Certificate, b: Certificate) => 
                new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
              )
              .slice(0, 3)
              .map((certificate: Certificate) => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate} 
                  onRefresh={handleRefresh}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="shared" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.certificates
              .filter((cert: Certificate) => cert.sharedToLinkedIn || cert.sharedToTwitter)
              .map((certificate: Certificate) => (
                <CertificateCard 
                  key={certificate.id} 
                  certificate={certificate} 
                  onRefresh={handleRefresh}
                />
              ))}
          </div>
          
          {data.certificates.filter((cert: Certificate) => cert.sharedToLinkedIn || cert.sharedToTwitter).length === 0 && (
            <div className="border p-6 rounded-lg bg-card text-center">
              <h3 className="text-xl font-medium mb-2">No Shared Certificates</h3>
              <p className="text-muted-foreground mb-4">
                You haven't shared any certificates yet. Share your achievements on LinkedIn or Twitter.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <Button
              variant="outline"
              className="join-item"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                className="join-item"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              className="join-item"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}