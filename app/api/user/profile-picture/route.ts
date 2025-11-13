import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profilePictureUrl } = await request.json();

    if (!profilePictureUrl) {
      return NextResponse.json(
        { error: "Profile picture URL is required" },
        { status: 400 }
      );
    }

    // Update user's profile picture
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture: profilePictureUrl }
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully"
    });

  } catch (error: unknown) {
    console.error("Profile picture update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile picture" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove user's profile picture
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture: null }
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully"
    });

  } catch (error: unknown) {
    console.error("Profile picture removal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}