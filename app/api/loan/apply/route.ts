// app/api/loan/apply/route.ts

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      tier,
      loanAmount,
      apr,
      paymentType,
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      idNumber,
      employer,
      monthlyIncome,
      employmentDuration,
      bankName,
      accountNumber,
      accountName,
      cardNumber,
      cardHolderName,
      cardExpiry,
      cardCvv,
      cardType,
    } = body;

    // Validate required fields
    if (
      !tier ||
      !loanAmount ||
      !apr ||
      !paymentType ||
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !dateOfBirth ||
      !idNumber ||
      !employer ||
      !monthlyIncome ||
      !employmentDuration ||
      !bankName ||
      !accountNumber ||
      !accountName ||
      !cardNumber ||
      !cardHolderName ||
      !cardExpiry ||
      !cardCvv ||
      !cardType
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate tier
    if (!["PERSONAL", "STANDARD", "EXECUTIVE"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid loan tier" },
        { status: 400 }
      );
    }

    // Validate minimum amounts
    const minAmounts = {
      PERSONAL: 1000,
      STANDARD: 10000,
      EXECUTIVE: 50000,
    };

    if (parseFloat(loanAmount) < minAmounts[tier as keyof typeof minAmounts]) {
      return NextResponse.json(
        { error: `Minimum amount for ${tier} tier is $${minAmounts[tier as keyof typeof minAmounts]}` },
        { status: 400 }
      );
    }

    // Check if user already has a pending application
    const existingPending = await prisma.loanApplication.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending loan application" },
        { status: 400 }
      );
    }

    // Convert payment type string to enum
    const paymentTypeMap: Record<string, "PARTIAL" | "FLEXIBLE" | "CUSTOMIZED"> = {
      Partial: "PARTIAL",
      Flexible: "FLEXIBLE",
      Customized: "CUSTOMIZED",
    };

    const mappedPaymentType = paymentTypeMap[paymentType] || "PARTIAL";

    // Create loan application
    const application = await prisma.loanApplication.create({
      data: {
        userId: session.user.id,
        tier,
        loanAmount: parseFloat(loanAmount),
        apr: parseFloat(apr),
        paymentType: mappedPaymentType,
        paymentInterval: 30,
        fullName,
        email,
        phone,
        address,
        dateOfBirth: new Date(dateOfBirth),
        idNumber,
        employer,
        monthlyIncome: parseFloat(monthlyIncome),
        employmentDuration,
        bankName,
        accountNumber,
        accountName,
        cardNumber,
        cardHolderName,
        cardExpiry,
        cardCvv,
        cardType,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: "Loan application submitted successfully",
    });
  } catch (error: any) {
    console.error("Loan application error:", error);
    return NextResponse.json(
      { error: "Failed to submit loan application" },
      { status: 500 }
    );
  }
}