import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { generateAccountNumber } from "@/lib/account-generator";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirm, phone, country, pin } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate PIN
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN must be 4-6 digits" },
        { status: 400 }
      );
    }

    console.log("📝 Starting signup for:", email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password and PIN
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // Generate unique account number
    const accountNumber = await generateAccountNumber();
    const accountName = name.toUpperCase(); // Format account name

    // Determine role based on email
    const adminEmail = process.env.ADMIN_EMAIL || "nelsonokonkwo218@gmail.com";
    const role = email === adminEmail ? "ADMIN" : "USER";

    console.log("👤 Creating user with role:", role);
    console.log("🔢 Generated account number:", accountNumber);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        confirm,
        phone: phone || null,
        country: country || null,
        pin: hashedPin,
        accountNumber,
        accountName,
        balance: 0, // Initial balance
        role,
        emailVerified: false,
      },
    });

    console.log("✅ User created:", user.id);

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log("🔑 Generated verification token");

    // Save verification token
    try {
      await prisma.verificationToken.create({
        data: {
          token,
          userId: user.id,
          expires: expiresAt,
        },
      });
      console.log("✅ Token saved to database");
    } catch (tokenError) {
      console.error("❌ Failed to save verification token:", tokenError);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      return NextResponse.json(
        { error: "Failed to create verification token. Please try again." },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      console.log("📧 Sending verification email...");
      await sendVerificationEmail(
        {
          name: user.name,
          email: user.email,
          phone: user.phone || undefined,
          country: user.country || undefined,
          pin: pin, // Send unhashed PIN for user reference
          accountNumber: user.accountNumber,
          accountName: user.accountName,
        },
        token
      );
      console.log("✅ Verification email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
      accountNumber: user.accountNumber, // Return for immediate display
    });
  } catch (error: unknown) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create account" },
      { status: 500 }
    );
  }
}