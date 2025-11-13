import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, action } = await request.json();

    if (!transactionId || !action) {
      return NextResponse.json(
        { error: "Transaction ID and action required" },
        { status: 400 }
      );
    }

    if (action !== "APPROVE" && action !== "FAILED") {
      return NextResponse.json(
        { error: "Invalid action. Use APPROVE or REJECT" },
        { status: 400 }
      );
    }

    // Get the pending transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sender: {
          select: { id: true, balance: true, name: true }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: "Transaction is not pending" },
        { status: 400 }
      );
    }

    if (action === "FAILED") {
      // Simply update transaction status to REJECTED
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { 
          status: "FAILED"
        }
      });

      return NextResponse.json({
        success: true,
        message: "Transaction rejected successfully"
      });
    }

    if (!transaction.sender || !transaction.senderId) {
      return NextResponse.json(
        { error: "Transaction sender not found" },
        { status: 404 }
      );
    }

    // APPROVE - Update balance and transaction status
    const transactionAmount = parseFloat(transaction.amount.toString());
    const senderBalance = parseFloat(transaction.sender.balance.toString());

    if (transaction.type === "TRANSFER") {
      // Check if sender still has sufficient balance for transfers
      if (senderBalance < transactionAmount) {
        // Auto-reject if insufficient balance
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { 
            status: "FAILED",
            description: transaction.description + " (Rejected: Insufficient balance)"
          }
        });

        return NextResponse.json(
          { error: "Insufficient balance. Transaction auto-rejected." },
          { status: 400 }
        );
      }

      // Execute transfer approval in transaction
      await prisma.$transaction(async (tx) => {
        // Calculate new balance (deduct for transfer)
        const newSenderBalance = senderBalance - transactionAmount;

        // Update sender balance
        await tx.user.update({
          where: { id: transaction.senderId as string },
          data: { balance: new Decimal(newSenderBalance) }
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "COMPLETED",
            balanceAfter: new Decimal(newSenderBalance)
          }
        });
      }, {
        maxWait: 5000,
        timeout: 10000
      });
    } else if (transaction.type === "DEPOSIT") {
      // Execute deposit approval in transaction
      await prisma.$transaction(async (tx) => {
        // Calculate new balance (add for deposit)
        const newSenderBalance = senderBalance + transactionAmount;

        // Update user balance
        await tx.user.update({
          where: { id: transaction.senderId as string },
          data: { balance: new Decimal(newSenderBalance) }
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "COMPLETED",
            balanceAfter: new Decimal(newSenderBalance)
          }
        });
      }, {
        maxWait: 5000,
        timeout: 10000
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported transaction type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction approved successfully"
    });

  } catch (error: unknown) {
    console.error("Approval error:", error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed" },
      { status: 500 }
    );
  }
}