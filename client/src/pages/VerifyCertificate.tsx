import { Helmet } from "react-helmet";
import CertificateVerifier from "@/components/certificates/CertificateVerifier";
import { Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function VerifyCertificate() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Verify Certificate | Rollins X</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Verify Certificate</h1>
          <p className="text-muted-foreground">
            Confirm the authenticity of a Rollins X certificate
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Link href="/certificates">
            <Button variant="outline" size="sm">
              My Certificates
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <CertificateVerifier />
        
        <div className="mt-16 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-400" />
            About Certificate Verification
          </h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Rollins X certificates are designed with security in mind. Each certificate contains a unique verification number that can be used to confirm its authenticity.
            </p>
            
            <h3>How to verify a certificate:</h3>
            <ol>
              <li>Enter the certificate number in the verification form above</li>
              <li>The system will check our secure database to confirm the certificate's validity</li>
              <li>If valid, you'll see details about the certificate, including who earned it and when</li>
            </ol>
            
            <h3>Security features:</h3>
            <ul>
              <li>Unique verification numbers for each certificate</li>
              <li>Tamper-proof digital signatures</li>
              <li>Secure blockchain verification (coming soon)</li>
            </ul>
            
            <p>
              If you have any questions about the verification process or need assistance, please contact our support team at <a href="mailto:support@rollinsx.com" className="text-blue-500 hover:underline">support@rollinsx.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}