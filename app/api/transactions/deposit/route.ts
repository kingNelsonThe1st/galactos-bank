import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateTransactionRef } from "@/lib/account-generator";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method, paymentDetails } = await request.json();

    // Validate inputs
    if (!amount || !method) {
      return NextResponse.json(
        { error: "Amount and payment method required" },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        balance: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create pending deposit transaction
    const txnRef = generateTransactionRef();
    const transaction = await prisma.transaction.create({
      data: {
        reference: txnRef,
        amount: new Decimal(depositAmount),
        type: "DEPOSIT",
        status: "PENDING",
        description: `${method} deposit - ${paymentDetails || 'No details provided'}`,
        senderId: user.id,
        senderName: user.name,
        senderAccount: user.accountNumber,
        balanceBefore: user.balance,
        balanceAfter: user.balance, // Balance unchanged until approved
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit request submitted for approval",
      transaction: {
        reference: transaction.reference,
        date: transaction.createdAt.toISOString(),
        amount: depositAmount.toString(),
        method: method,
        balanceAfter: parseFloat(user.balance.toString()).toString(),
        status: "PENDING",
      }
    });
  } catch (error: unknown) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deposit failed" },
      { status: 400 }
    );
  }
}