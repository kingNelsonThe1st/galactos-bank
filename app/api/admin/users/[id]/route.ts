import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - Fetch user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        accountNumber: true,
        balance: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH - Update user details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const { name, email, phone, country, role } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(role && { role }),
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (with cascade delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true,
        role: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting admin accounts
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete admin accounts" },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    // Delete user - cascade will automatically delete:
    // - Sessions
    // - VerificationTokens
    // - Transactions (sent & received)
    // - Deposits
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error: unknown) {
    console.error("Delete user error:", error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}