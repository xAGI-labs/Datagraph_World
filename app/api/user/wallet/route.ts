import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        walletAddress: true,
        vibePoints: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Wallet API called with session:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { walletAddress } = body;

    console.log("Received wallet address:", walletAddress);

    // Allow null/undefined for disconnection
    if (walletAddress !== null && walletAddress !== undefined) {
      if (typeof walletAddress !== "string" || walletAddress.trim() === "") {
        console.log("Invalid wallet address provided");
        return NextResponse.json(
          { error: "Valid wallet address is required" },
          { status: 400 }
        );
      }

      // Check if wallet is already connected to another user
      const existingUser = await prisma.user.findFirst({
        where: {
          walletAddress: walletAddress,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        console.log("Wallet already connected to another user");
        return NextResponse.json(
          { error: "Wallet already connected to another account" },
          { status: 400 }
        );
      }
    }

    // Update user's wallet address in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        walletAddress: walletAddress,
        updatedAt: new Date(), // Force update timestamp
      },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        name: true,
      },
    });

    console.log(
      `Successfully updated wallet address for user ${session.user.id}: ${walletAddress}`
    );

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Wallet address updated successfully",
    });
  } catch (error) {
    console.error("Error updating wallet address:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
