import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface UserData {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  pin?: string;
  accountNumber: string;
  accountName: string;
}

export async function sendVerificationEmail(
  userData: UserData,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${verificationToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: userData.email,
      subject: 'Verify Your Email Address - Galactos Trust Bank Corp',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background-color: #1e40af;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 5px 5px;
              }
              .info-section {
                background-color: #f0f9ff;
                padding: 20px;
                margin: 20px 0;
                border-radius: 5px;
                border-left: 4px solid #1e40af;
              }
              .info-item {
                margin: 12px 0;
                padding: 10px;
                background-color: white;
                border-radius: 3px;
              }
              .info-label {
                font-weight: bold;
                color: #1e40af;
                display: inline-block;
                width: 150px;
              }
              .account-highlight {
                background-color: #fef3c7;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                border: 2px solid #f59e0b;
                text-align: center;
              }
              .account-number {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                letter-spacing: 2px;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #1e40af;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Galacto!</h1>
              </div>
              <div class="content">
                <h2>Hello ${userData.name},</h2>
                <p>Thank you for opening an account with us! Your account has been successfully created.</p>
                
                <div class="account-highlight">
                  <p style="margin: 0; font-size: 14px; color: #666;">Your Account Number</p>
                  <p class="account-number">${userData.accountNumber}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Account Name: ${userData.accountName}</p>
                </div>

                <div class="info-section">
                  <h3 style="margin-top: 0; color: #1e40af;">Account Details</h3>
                  <div class="info-item">
                    <span class="info-label">Account Name:</span>
                    <span>${userData.accountName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Account Number:</span>
                    <span>${userData.accountNumber}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span>${userData.email}</span>
                  </div>
                  ${userData.phone ? `
                  <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span>${userData.phone}</span>
                  </div>
                  ` : ''}
                  ${userData.country ? `
                  <div class="info-item">
                    <span class="info-label">Country:</span>
                    <span>${userData.country}</span>
                  </div>
                  ` : ''}
                  ${userData.pin ? `
                  <div class="info-item">
                    <span class="info-label">PIN:</span>
                    <span>${userData.pin} (Keep this secure!)</span>
                  </div>
                  ` : ''}
                </div>

                <p><strong>Important:</strong> Please verify your email address to activate your account and start banking.</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}">${verificationUrl}</a>
                </p>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2025 GalactosTrustbaCorp. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}