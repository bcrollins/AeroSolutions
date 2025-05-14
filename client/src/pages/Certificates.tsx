import { Helmet } from "react-helmet";
import { 
  Award, 
  ChevronRight, 
  Shield, 
  Download,
  Share2
} from "lucide-react";
import CertificateList from "@/components/certificates/CertificateList";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Certificates() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Helmet>
          <title>Certificates | Rollins X</title>
        </Helmet>
        
        <div className="max-w-2xl mx-auto text-center">
          <Award className="w-16 h-16 mx-auto mb-6 text-blue-500" />
          <h1 className="text-4xl font-bold mb-4">Certificates</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Please log in to view and manage your certificates
          </p>
          <Link href="/api/login">
            <Button size="lg">
              Log In to View Certificates
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>My Certificates | Rollins X</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Certificates</h1>
          <p className="text-muted-foreground">
            View, download, and share your earned certificates
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/certificates/verify">
            <Button variant="outline" size="sm">
              Verify Certificate
              <Shield className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <CertificateList />
      
      <div className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-semibold mb-6">About Your Certificates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <Download className="h-10 w-10 mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Download &amp; Print</h3>
            <p className="text-sm text-muted-foreground">
              Download your certificates as PDF files that you can print and display.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <Share2 className="h-10 w-10 mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Share Your Achievements</h3>
            <p className="text-sm text-muted-foreground">
              Share your certificates directly to LinkedIn and Twitter to showcase your skills.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <Shield className="h-10 w-10 mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Secure Verification</h3>
            <p className="text-sm text-muted-foreground">
              Each certificate has a unique verification number that can be used to confirm its authenticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}