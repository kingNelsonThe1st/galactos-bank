import {  NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit IMF code
function generateIMFCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isRestricted: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isRestricted) {
      return NextResponse.json(
        { error: "Account is not restricted" },
        { status: 400 }
      );
    }

    // Generate IMF code
    const imfCode = generateIMFCode();
    
    // Set expiry to 15 minutes from now
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15);

    // Save IMF code to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        imfCode,
        imfCodeExpiry: expiryDate
      }
    });

    // Send email with IMF code
    try {
      await resend.emails.send({
        from:process.env.EMAIL_FROM!,
        to: user.email,
        subject: "Your IMF Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">IMF Verification Code</h2>
            <p>Hi ${user.name},</p>
            <p>Your account requires IMF verification to complete this transaction.</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">
                ${imfCode}
              </h1>
            </div>
            <p>This code will expire in <strong>15 minutes</strong>.</p>
            <p>If you didn't request this code, please contact our support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              GalactosTrust Inc. - Secure Banking Solutions<br>
              This is an automated message, please do not reply.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Even if email fails, return success since code is saved in DB
    }

    return NextResponse.json({
      success: true,
      message: "IMF code sent to your email",
      expiresAt: expiryDate.toISOString()
    });

  } catch (error: unknown) {
    console.error("IMF generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate IMF code" },
      { status: 500 }
    );
  }
}