import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Award, CheckCircle, AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Link } from "wouter";

interface VerificationResult {
  isValid: boolean;
  certificate?: {
    id: number;
    courseId: number;
    userId: string;
    courseTitle: string;
    recipientName: string;
    certificateNumber: string;
    completionDate: string;
    issueDate: string;
    expiryDate: string;
    verificationStatus: 'valid' | 'revoked' | 'expired';
    grade?: string;
  };
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  course?: {
    id: number;
    title: string;
    description: string;
  };
}

export default function CertificateVerifier() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificate, setCertificate] = useState<string | null>(null);
  
  // Extract certificate number from the URL if present
  const [location] = useLocation();
  const urlCertificateNumber = location.split('/').pop();
  
  // If there's a certificate number in the URL, use it for verification
  const queryParam = urlCertificateNumber && urlCertificateNumber !== 'verify' 
    ? urlCertificateNumber 
    : certificate;
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/certificates/verify', queryParam],
    queryFn: async () => {
      if (!queryParam) return null;
      
      const response = await fetch(`/api/certificates/verify/${queryParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify certificate');
      }
      
      return response.json() as Promise<VerificationResult>;
    },
    enabled: !!queryParam
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateNumber.trim()) {
      setCertificate(certificateNumber.trim());
    }
  };
  
  const handleReset = () => {
    setCertificate(null);
    setCertificateNumber("");
  };
  
  // If no certificate is provided, show the verification form
  if (!queryParam) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-400" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter a certificate number to verify its authenticity
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Enter certificate number (e.g., RLX-12345-ABCDE)"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="font-mono"
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Verify Certificate
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-muted-foreground text-center">
              All certificates issued by Rollins X have a unique verification number that can be used to confirm their authenticity.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Verifying Certificate</CardTitle>
            <CardDescription>
              Please wait while we verify the certificate...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show error state
  if (isError || !data) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Verification Failed
            </CardTitle>
            <CardDescription>
              We encountered an error while verifying this certificate
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm mb-4">
              {error ? (error as Error).message : "The certificate could not be verified. Please check the certificate number and try again."}
            </p>
            
            <Button variant="default" onClick={handleReset} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show invalid certificate
  if (!data.isValid) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Invalid Certificate
            </CardTitle>
            <CardDescription>
              This certificate is not valid
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm mb-4">
              The certificate number <span className="font-mono">{queryParam}</span> is not recognized as a valid certificate.
              This may be because:
            </p>
            
            <ul className="list-disc pl-5 text-sm space-y-1 mb-6">
              <li>The certificate number was entered incorrectly</li>
              <li>The certificate has been revoked</li>
              <li>The certificate has expired</li>
            </ul>
            
            <Button variant="default" onClick={handleReset} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show valid certificate details
  return (
    <div className="max-w-md mx-auto">
      <Card className="border-green-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                Valid Certificate
              </CardTitle>
              <CardDescription>
                This certificate has been verified as authentic
              </CardDescription>
            </div>
            <div className="bg-green-600 text-white rounded-full p-2">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-medium mb-2">{data.certificate?.courseTitle}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {data.course?.description}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Recipient:</span>
                  <span className="font-medium">{data.certificate?.recipientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Completed:</span>
                  <span className="font-medium">
                    {data.certificate?.completionDate 
                      ? format(new Date(data.certificate.completionDate), 'PPP')
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Issued:</span>
                  <span className="font-medium">
                    {data.certificate?.issueDate 
                      ? format(new Date(data.certificate.issueDate), 'PPP')
                      : 'N/A'}
                  </span>
                </div>
                {data.certificate?.grade && (
                  <div>
                    <span className="text-muted-foreground block">Grade:</span>
                    <span className="font-medium">{data.certificate.grade}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded p-3 font-mono text-sm flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Certificate ID:</span>
              <span>{data.certificate?.certificateNumber}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Link href="/certificates/verify">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Verify Another
            </Button>
          </Link>
          
          <p className="text-xs text-muted-foreground text-center">
            This verification page confirms the authenticity of a certificate issued by Rollins X.
            If you have any questions about this certificate, please contact <a href="mailto:support@rollinsx.com" className="text-blue-500 hover:underline">support@rollinsx.com</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}