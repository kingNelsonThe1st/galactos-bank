import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
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
    const body = await request.json();
    const { isBlocked, isRestricted } = body;

    // Validate that at least one field is provided
    if (isBlocked === undefined && isRestricted === undefined) {
      return NextResponse.json(
        { error: "Please provide isBlocked or isRestricted field" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked;
    }
    if (isRestricted !== undefined) {
      updateData.isRestricted = isRestricted;
    }

    // Update user status
    await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "User status updated successfully"
    });

  } catch (error: unknown) {
    console.error("Toggle status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update status" },
      { status: 500 }
    );
  }
}