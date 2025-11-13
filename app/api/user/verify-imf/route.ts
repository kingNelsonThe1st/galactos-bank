import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imfCode } = await request.json();

    if (!imfCode) {
      return NextResponse.json(
        { error: "IMF code is required" },
        { status: 400 }
      );
    }

    // Get user data with IMF code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        imfCode: true,
        imfCodeExpiry: true,
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

    if (!user.imfCode || !user.imfCodeExpiry) {
      return NextResponse.json(
        { error: "No IMF code found. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > user.imfCodeExpiry) {
      return NextResponse.json(
        { error: "IMF code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify the code
    if (user.imfCode !== imfCode) {
      return NextResponse.json(
        { error: "Invalid IMF code. Please try again." },
        { status: 400 }
      );
    }

    // Code is valid - clear it from database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        imfCode: null,
        imfCodeExpiry: null
      }
    });

    return NextResponse.json({
      success: true,
      message: "IMF code verified successfully"
    });

  } catch (error: unknown) {
    console.error("IMF verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify IMF code" },
      { status: 500 }
    );
  }
}