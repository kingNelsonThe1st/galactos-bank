import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // Check if user is admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { applicationId, action, rejectionReason } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: "Application ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get loan application
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Loan application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: "This application has already been processed" },
        { status: 400 }
      );
    }

    // Validate email exists
    if (!application.email) {
      console.error("No email found for application:", applicationId);
      return NextResponse.json(
        { error: "Application email is missing" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Reject application
      await prisma.loanApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || "Application did not meet approval criteria",
        },
      });

      // Send rejection email
      try {
        const emailResult = await resend.emails.send({
          from: "noreply@galactostrustbacorp.com", // Use this for testing, or your verified domain
          to: application.email,
          subject: "Loan Application Update",
          html: `
            <h2>Loan Application Status Update</h2>
            <p>Dear ${application.fullName},</p>
            <p>Thank you for applying for a loan with us. After careful review, we regret to inform you that your application has not been approved at this time.</p>
            <p><strong>Reason:</strong> ${rejectionReason || "Application did not meet approval criteria"}</p>
            <p>You may reapply after addressing the concerns mentioned above.</p>
            <p>Best regards,<br/>The Loan Team</p>
          `,
        });
        
        console.log("Rejection email sent successfully:", emailResult);
      } catch (emailError: any) {
        console.error("Failed to send rejection email:", emailError);
        console.error("Email error details:", emailError.message);
        // Return error to know email failed
        return NextResponse.json({
          success: true,
          message: "Loan application rejected",
          emailError: "Failed to send notification email",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Loan application rejected and email sent",
      });
    }

    // APPROVE APPLICATION
    const loanAmount = parseFloat(application.loanAmount.toString());
    const currentBalance = parseFloat(application.user.balance.toString());
    const newBalance = currentBalance + loanAmount;

    // Generate transaction reference
    const transactionRef = `LOAN-${Date.now()}-${application.id.slice(-6).toUpperCase()}`;

    // Use Prisma transaction to ensure atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: application.userId },
        data: { balance: newBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          reference: transactionRef,
          amount: loanAmount,
          type: "DEPOSIT",
          status: "COMPLETED",
          description: `Loan disbursement - ${application.tier} tier`,
          receiverId: application.userId,
          receiverName: application.user.name,
          receiverAccount: application.user.accountNumber,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          adminId: session.user.id,
          adminEmail: session.user.email,
        },
      });

      // Update loan application
      await tx.loanApplication.update({
        where: { id: applicationId },
        data: {
          status: "DISBURSED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          disbursedAmount: loanAmount,
          disbursedAt: new Date(),
          transactionRef: transaction.reference,
        },
      });

      // Create deposit record
      await tx.deposit.create({
        data: {
          userId: application.userId,
          amount: loanAmount,
          status: "completed",
          description: `Loan disbursement - ${transactionRef}`,
          adminEmail: session.user.email,
        },
      });

      return { transaction, transactionRef };
    });

    // Send approval email
    try {
      const emailResult = await resend.emails.send({
        from: "noreply@galactostrustbacorp.com", // Use this for testing, or your verified domain
        to: application.email,
        subject: "Loan Application Approved - Funds Disbursed",
        html: `
          <h2>Congratulations! Your Loan Has Been Approved</h2>
          <p>Dear ${application.fullName},</p>
          <p>Great news! Your loan application has been approved and the funds have been credited to your account.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Loan Amount:</strong> $${loanAmount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>APR:</strong> ${application.apr}%</p>
            <p style="margin: 5px 0;"><strong>Transaction Reference:</strong> ${result.transactionRef}</p>
            <p style="margin: 5px 0;"><strong>New Balance:</strong> $${newBalance.toLocaleString()}</p>
          </div>
          <p>The funds are now available in your account and ready to use.</p>
          <p>Thank you for choosing us!</p>
          <p>Best regards,<br/>The Loan Team</p>
        `,
      });
      
      console.log("Approval email sent successfully:", emailResult);
    } catch (emailError: any) {
      console.error("Failed to send approval email:", emailError);
      console.error("Email error details:", emailError.message);
      // Don't fail the whole operation, but notify about email issue
      return NextResponse.json({
        success: true,
        message: "Loan approved and funds disbursed",
        transactionRef: result.transactionRef,
        amount: loanAmount,
        newBalance,
        emailError: "Failed to send notification email",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Loan approved, funds disbursed, and email sent",
      transactionRef: result.transactionRef,
      amount: loanAmount,
      newBalance,
    });
  } catch (error: any) {
    console.error("Loan approval error:", error);
    return NextResponse.json(
      { error: "Failed to process loan application" },
      { status: 500 }
    );
  }
}