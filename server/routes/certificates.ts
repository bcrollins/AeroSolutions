import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = express.Router();

// Schema for certificate creation
const createCertificateSchema = z.object({
  userId: z.string(),
  courseId: z.number(),
  completionDate: z.string().optional(),
  recipientName: z.string(),
  grade: z.string().optional(),
  courseTitle: z.string(),
  instructorName: z.string().optional()
});

// Get all certificates for a user
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await storage.getUserCertificates(userId, limit, offset);
    
    res.json(result);
  } catch (error: any) {
    logger.error("Error fetching user certificates", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch user certificates"
    });
  }
});

// Get a specific certificate by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    
    if (isNaN(certificateId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid certificate ID"
      });
    }
    
    const certificate = await storage.getCertificateById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: "Certificate not found"
      });
    }
    
    // Check that the user owns this certificate or is an admin
    const userId = req.user.claims.sub;
    if (certificate.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to view this certificate"
      });
    }
    
    res.json(certificate);
  } catch (error: any) {
    logger.error("Error fetching certificate", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to fetch certificate"
    });
  }
});

// Create a new certificate
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const validatedData = createCertificateSchema.parse(req.body);
    
    // Ensure the user can only create certificates for themselves
    const userId = req.user.claims.sub;
    if (validatedData.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only create certificates for your own account"
      });
    }
    
    // Check if the user has completed the course
    // In a real implementation, we would check for course completion status
    
    // Generate default values if not provided
    const completionDate = validatedData.completionDate || new Date().toISOString();
    const issueDate = new Date().toISOString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // Certificates valid for 2 years
    
    const certificate = await storage.createCourseCertificate({
      userId: validatedData.userId,
      courseId: validatedData.courseId,
      completionDate,
      issueDate,
      expiryDate: expiryDate.toISOString(),
      recipientName: validatedData.recipientName,
      courseTitle: validatedData.courseTitle,
      instructorName: validatedData.instructorName || "Rollins X Faculty",
      grade: validatedData.grade || "Pass",
      verificationStatus: "valid",
      sharedToLinkedIn: false,
      sharedToTwitter: false
    });
    
    res.status(201).json(certificate);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid certificate data",
        details: error.errors
      });
    }
    
    logger.error("Error creating certificate", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create certificate"
    });
  }
});

// Generate and download a PDF certificate
router.get("/:id/download", isAuthenticated, async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    
    if (isNaN(certificateId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid certificate ID"
      });
    }
    
    const certificate = await storage.getCertificateById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: "Certificate not found"
      });
    }
    
    // Check that the user owns this certificate or is an admin
    const userId = req.user.claims.sub;
    if (certificate.userId !== userId && req.user.claims.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to download this certificate"
      });
    }
    
    // Get the course information
    const course = await storage.getAiProduct(certificate.courseId);
    
    // Create a PDF document
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 50
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add styling and content to the PDF
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a1a');
    
    // Add a decorative border
    doc.strokeColor('#007bff')
      .lineWidth(3)
      .roundedRect(30, 30, doc.page.width - 60, doc.page.height - 60, 10)
      .stroke();
    
    // Add decorative elements
    doc.fillColor('#007bff')
      .circle(doc.page.width / 2, 80, 30)
      .fill();
    
    // Add the Rollins X logo or text
    doc.fillColor('#ffffff')
      .fontSize(40)
      .font('Helvetica-Bold')
      .text('ROLLINS X', doc.page.width / 2 - 100, 140, { align: 'center' });
    
    // Add certificate type
    doc.fontSize(30)
      .font('Helvetica')
      .text('CERTIFICATE OF COMPLETION', doc.page.width / 2 - 200, 200, { align: 'center' });
    
    // Add recipient name
    doc.fontSize(26)
      .font('Helvetica-Bold')
      .text(certificate.recipientName, doc.page.width / 2 - 200, 270, { align: 'center' });
    
    // Add course details
    doc.fontSize(16)
      .font('Helvetica')
      .text('has successfully completed the course', doc.page.width / 2 - 200, 310, { align: 'center' });
    
    doc.fontSize(22)
      .font('Helvetica-Bold')
      .text(certificate.courseTitle, doc.page.width / 2 - 200, 340, { align: 'center' });
    
    // Add completion date
    doc.fontSize(14)
      .font('Helvetica')
      .text(`Completed on: ${new Date(certificate.completionDate).toLocaleDateString()}`, doc.page.width / 2 - 200, 390, { align: 'center' });
    
    // Add verification details
    doc.fontSize(12)
      .text(`Certificate Number: ${certificate.certificateNumber}`, doc.page.width / 2 - 200, 440, { align: 'center' });
    
    doc.text(`Verify at: https://rollinsx.com/certificates/verify/${certificate.certificateNumber}`, doc.page.width / 2 - 200, 460, { align: 'center' });
    
    // Add signature
    doc.moveTo(doc.page.width / 2 - 100, 510)
      .lineTo(doc.page.width / 2 + 100, 510)
      .stroke();
    
    doc.fontSize(14)
      .text(certificate.instructorName || "Instructor", doc.page.width / 2 - 100, 520, { align: 'center' });
    
    // Finalize and end the document
    doc.end();
  } catch (error: any) {
    logger.error("Error generating certificate PDF", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to generate certificate PDF"
    });
  }
});

// Mark certificate as shared on a social platform
router.post("/:id/share", isAuthenticated, async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    
    if (isNaN(certificateId)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid certificate ID"
      });
    }
    
    const { platform } = req.body;
    
    if (!platform || (platform !== 'linkedin' && platform !== 'twitter')) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid platform. Must be 'linkedin' or 'twitter'"
      });
    }
    
    const certificate = await storage.getCertificateById(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        error: "Not Found",
        message: "Certificate not found"
      });
    }
    
    // Check that the user owns this certificate
    const userId = req.user.claims.sub;
    if (certificate.userId !== userId) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to share this certificate"
      });
    }
    
    // Mark as shared on the specified platform
    const updatedCertificate = await storage.markCertificateAsShared(certificateId, platform);
    
    res.json(updatedCertificate);
  } catch (error: any) {
    logger.error("Error marking certificate as shared", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to mark certificate as shared"
    });
  }
});

// Public endpoint to verify a certificate
router.get("/verify/:certificateNumber", async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    if (!certificateNumber) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Certificate number is required"
      });
    }
    
    const result = await storage.verifyCertificate(certificateNumber);
    
    res.json(result);
  } catch (error: any) {
    logger.error("Error verifying certificate", { error: error.message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify certificate"
    });
  }
});

export default router;