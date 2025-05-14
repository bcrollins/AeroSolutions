import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiLinkedin } from "react-icons/si";
import { FaTwitter } from "react-icons/fa";

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

interface CertificateSharingModalProps {
  certificate: Certificate;
  onClose: () => void;
  onShare: (platform: 'linkedin' | 'twitter') => void;
}

export default function CertificateSharingModal({
  certificate,
  onClose,
  onShare
}: CertificateSharingModalProps) {
  const verificationUrl = `${window.location.origin}/certificates/verify/${certificate.certificateNumber}`;
  
  const shareToLinkedIn = () => {
    // Prepare LinkedIn sharing URL
    const shareText = `I've earned a certificate in ${certificate.courseTitle} from Rollins X! Verify my credential at ${verificationUrl}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&summary=${encodeURIComponent(shareText)}`;
    
    // Open LinkedIn sharing in a new window
    window.open(url, '_blank', 'width=600,height=600');
    
    // Mark certificate as shared on LinkedIn
    onShare('linkedin');
  };
  
  const shareToTwitter = () => {
    // Prepare Twitter sharing URL
    const shareText = `I've earned a certificate in ${certificate.courseTitle} from Rollins X! Verify my credential at ${verificationUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    
    // Open Twitter sharing in a new window
    window.open(url, '_blank', 'width=600,height=600');
    
    // Mark certificate as shared on Twitter
    onShare('twitter');
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Certificate</DialogTitle>
          <DialogDescription>
            Choose a platform to share your achievement with your network.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Certificate Details</h3>
            <p className="text-sm">{certificate.courseTitle}</p>
            <p className="text-xs text-muted-foreground">Certificate #{certificate.certificateNumber}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 h-20"
              onClick={shareToLinkedIn}
              disabled={certificate.sharedToLinkedIn}
            >
              <SiLinkedin className="h-6 w-6 text-[#0077B5]" />
              <div className="flex flex-col items-start">
                <span className="text-sm">LinkedIn</span>
                {certificate.sharedToLinkedIn && (
                  <span className="text-xs text-muted-foreground">Already shared</span>
                )}
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 h-20"
              onClick={shareToTwitter}
              disabled={certificate.sharedToTwitter}
            >
              <FaTwitter className="h-6 w-6 text-[#1DA1F2]" />
              <div className="flex flex-col items-start">
                <span className="text-sm">Twitter</span>
                {certificate.sharedToTwitter && (
                  <span className="text-xs text-muted-foreground">Already shared</span>
                )}
              </div>
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}