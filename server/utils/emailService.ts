import formData from 'form-data';
import Mailgun, { type IMailgunClient, type MessagesSendResult } from 'mailgun.js';
import { logger } from './logger';

// Local type alias preserved for call-site stability after the
// mailgun-js (deprecated, vulnerable) → mailgun.js v10 migration.
export type SendResponse = MessagesSendResult;

interface EmailAttachment {
  data: Buffer | string | NodeJS.ReadableStream;
  filename?: string;
  contentType?: string;
  knownLength?: number;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  'v:templateData'?: Record<string, any>;
  attachment?: EmailAttachment | EmailAttachment[];
  cc?: string | string[];
  bcc?: string | string[];
  tags?: string[];
  campaign?: string;
  'o:tracking'?: boolean;
  'o:tracking-clicks'?: boolean | string;
  'o:tracking-opens'?: boolean;
  'o:dkim'?: boolean;
  'o:deliverytime'?: string;
  'h:Reply-To'?: string;
  'h:X-Mailgun-Variables'?: string;
}

class EmailService {
  private mailgunClient: IMailgunClient | null = null;
  private domain: string = '';
  private isInitialized: boolean = false;
  private defaultSender: string = 'ROLLINSX <notifications@rollinsx.dev>';

  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      logger.warn('Mailgun configuration missing. Email functionality will be limited.');
      return;
    }

    try {
      const mailgun = new Mailgun(formData);
      this.mailgunClient = mailgun.client({
        username: 'api',
        key: apiKey,
      });
      this.domain = domain;
      this.isInitialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send an email using Mailgun
   * 
   * @param options Email options including recipient, subject, and content
   * @returns Promise that resolves with Mailgun's response or rejects with an error
   */
  async sendEmail(options: EmailOptions): Promise<SendResponse> {
    if (!this.isInitialized || !this.mailgunClient) {
      throw new Error('Email service not initialized. Check Mailgun configuration.');
    }

    // mailgun.js v10 expects array form for to/cc/bcc and stringly-typed `o:tracking`.
    const toMessageData = (opts: EmailOptions) => {
      const data: Record<string, any> = {
        from: this.defaultSender,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
      };
      if (opts.text) data.text = opts.text;
      if (opts.html) data.html = opts.html;
      if (opts.template) data.template = opts.template;
      if (opts['v:templateData']) {
        data['h:X-Mailgun-Variables'] = JSON.stringify(opts['v:templateData']);
      }
      if (opts.cc) data.cc = Array.isArray(opts.cc) ? opts.cc : [opts.cc];
      if (opts.bcc) data.bcc = Array.isArray(opts.bcc) ? opts.bcc : [opts.bcc];
      if (opts.attachment) data.attachment = opts.attachment;
      if (opts.tags) data['o:tag'] = opts.tags;
      if (opts.campaign) data['o:campaign'] = opts.campaign;
      if (opts['o:tracking'] !== undefined) {
        data['o:tracking'] = opts['o:tracking'] ? 'yes' : 'no';
      }
      if (opts['o:tracking-clicks'] !== undefined) {
        data['o:tracking-clicks'] =
          typeof opts['o:tracking-clicks'] === 'boolean'
            ? opts['o:tracking-clicks']
              ? 'yes'
              : 'no'
            : opts['o:tracking-clicks'];
      }
      if (opts['o:tracking-opens'] !== undefined) {
        data['o:tracking-opens'] = opts['o:tracking-opens'] ? 'yes' : 'no';
      }
      if (opts['o:dkim'] !== undefined) {
        data['o:dkim'] = opts['o:dkim'] ? 'yes' : 'no';
      }
      if (opts['o:deliverytime']) data['o:deliverytime'] = opts['o:deliverytime'];
      if (opts['h:Reply-To']) data['h:Reply-To'] = opts['h:Reply-To'];
      if (opts['h:X-Mailgun-Variables']) {
        data['h:X-Mailgun-Variables'] = opts['h:X-Mailgun-Variables'];
      }
      return data;
    };

    try {
      const response = await this.mailgunClient.messages.create(
        this.domain,
        toMessageData(options),
      );

      logger.info(`Email sent successfully to ${options.to}`);
      return response;
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Send a welcome email to a new user
   * 
   * @param to Recipient email address
   * @param username Username of the new user
   * @returns Promise that resolves with Mailgun's response
   */
  async sendWelcomeEmail(to: string, username: string): Promise<SendResponse> {
    const subject = 'Welcome to ROLLINSX!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rollinsx.dev/logo.png" alt="ROLLINSX Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #3B5B9D; text-align: center;">Welcome to ROLLINSX!</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hello ${username},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Thank you for joining ROLLINSX! We're excited to help you create amazing digital experiences for your business.
        </p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #3B5B9D; margin-top: 0;">Getting Started</h3>
          <ul style="color: #555; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Explore our <a href="https://rollinsx.dev/marketplace" style="color: #00D1D1; text-decoration: none;">marketplace</a> for digital tools and services</li>
            <li style="margin-bottom: 10px;">Try our free AI-powered mockup generator</li>
            <li style="margin-bottom: 10px;">Check out our premium features to take your business to the next level</li>
          </ul>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          If you have any questions or need assistance, don't hesitate to contact our support team.
        </p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://rollinsx.dev/dashboard" style="display: inline-block; background-color: #3B5B9D; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Go to Your Dashboard</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          © ${new Date().getFullYear()} ROLLINSX. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send a verification email with a verification link
   * 
   * @param to Recipient email address
   * @param username Username of the user
   * @param verificationToken Token to verify the email address
   * @returns Promise that resolves with Mailgun's response
   */
  async sendVerificationEmail(
    to: string, 
    username: string, 
    verificationToken: string
  ): Promise<SendResponse> {
    const verificationLink = `https://rollinsx.dev/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email Address';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rollinsx.dev/logo.png" alt="ROLLINSX Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #3B5B9D; text-align: center;">Verify Your Email Address</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hello ${username},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Thank you for creating an account with ROLLINSX. To complete your registration and access all features, please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; background-color: #3B5B9D; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          If you did not create an account with ROLLINSX, please ignore this email or contact our support team.
        </p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          © ${new Date().getFullYear()} ROLLINSX. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send a password reset email with a reset link
   * 
   * @param to Recipient email address
   * @param username Username of the user
   * @param resetToken Token to reset the password
   * @returns Promise that resolves with Mailgun's response
   */
  async sendPasswordResetEmail(
    to: string, 
    username: string, 
    resetToken: string
  ): Promise<SendResponse> {
    const resetLink = `https://rollinsx.dev/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rollinsx.dev/logo.png" alt="ROLLINSX Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #3B5B9D; text-align: center;">Reset Your Password</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hello ${username},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          We received a request to reset your password for your ROLLINSX account. Please click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #3B5B9D; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          This link will expire in 30 minutes. If you did not request a password reset, please ignore this email or contact our support team.
        </p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          © ${new Date().getFullYear()} ROLLINSX. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send a notification email for marketplace activity
   * 
   * @param to Recipient email address
   * @param username Username of the user
   * @param itemName Name of the marketplace item
   * @param action Action performed on the item (e.g., "published", "purchased")
   * @param itemId ID of the marketplace item
   * @returns Promise that resolves with Mailgun's response
   */
  async sendMarketplaceNotification(
    to: string,
    username: string,
    itemName: string,
    action: 'published' | 'purchased' | 'updated' | 'sold',
    itemId: string
  ): Promise<SendResponse> {
    const itemLink = `https://rollinsx.dev/marketplace/item/${itemId}`;
    let subject = '';
    let actionText = '';
    let actionDescription = '';

    switch (action) {
      case 'published':
        subject = `Your Item "${itemName}" Has Been Published`;
        actionText = 'has been published';
        actionDescription = 'Your item is now visible to all ROLLINSX users in the marketplace.';
        break;
      case 'purchased':
        subject = `You Purchased "${itemName}"`;
        actionText = 'has been purchased';
        actionDescription = 'Thank you for your purchase! You can now access this item in your dashboard.';
        break;
      case 'updated':
        subject = `Your Item "${itemName}" Has Been Updated`;
        actionText = 'has been updated';
        actionDescription = 'The changes you made to your item are now live in the marketplace.';
        break;
      case 'sold':
        subject = `Your Item "${itemName}" Has Been Sold`;
        actionText = 'has been sold';
        actionDescription = 'Congratulations! Someone has purchased your item.';
        break;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rollinsx.dev/logo.png" alt="ROLLINSX Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #3B5B9D; text-align: center;">${subject}</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hello ${username},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Your marketplace item <strong>${itemName}</strong> ${actionText}.
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          ${actionDescription}
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${itemLink}" style="display: inline-block; background-color: #3B5B9D; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">View Item</a>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          © ${new Date().getFullYear()} ROLLINSX. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send a weekly newsletter with personalized content
   * 
   * @param to Recipient email address
   * @param username Username of the user
   * @param recommendations Array of recommended items or articles
   * @returns Promise that resolves with Mailgun's response
   */
  async sendWeeklyNewsletter(
    to: string,
    username: string,
    recommendations: Array<{ title: string; description: string; link: string; imageUrl?: string }>
  ): Promise<SendResponse> {
    const subject = 'Your Weekly ROLLINSX Update';

    // Generate HTML for recommendations
    const recommendationsHtml = recommendations.map(item => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px;">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">` : ''}
        <h3 style="color: #3B5B9D; margin: 0 0 10px 0;">${item.title}</h3>
        <p style="color: #555; margin: 0 0 10px 0;">${item.description}</p>
        <a href="${item.link}" style="color: #00D1D1; text-decoration: none; font-weight: bold;">Learn More →</a>
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://rollinsx.dev/logo.png" alt="ROLLINSX Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #3B5B9D; text-align: center;">Your Weekly Update</h1>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Hello ${username},
        </p>
        <p style="font-size: 16px; line-height: 1.5; color: #555;">
          Here's your personalized weekly update with recommendations and the latest from ROLLINSX:
        </p>
        
        <h2 style="color: #3B5B9D; margin-top: 30px;">Recommended for You</h2>
        ${recommendationsHtml}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://rollinsx.dev/dashboard" style="display: inline-block; background-color: #3B5B9D; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
          © ${new Date().getFullYear()} ROLLINSX. All rights reserved.<br>
          <a href="https://rollinsx.dev/unsubscribe?email=${encodeURIComponent(to)}" style="color: #999; text-decoration: none;">Unsubscribe</a> from these emails.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      'o:tracking': true,
      tags: ['newsletter', 'weekly'],
      campaign: 'weekly-newsletter'
    });
  }
}

// Create and export a singleton instance of the email service
export const emailService = new EmailService();