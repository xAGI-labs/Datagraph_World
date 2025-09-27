import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    console.log(
      "API Debug - Searching for user with address:",
      address.toLowerCase()
    );

    const user = await prisma.user.findUnique({
      where: { walletAddress: address.toLowerCase() },
      select: {
        id: true,
        vibePoints: true,
        walletAddress: true,
      },
    });

    console.log("API Debug - Found user:", user);

    if (!user) {
      console.log(
        "API Debug - No user found, checking all users with vibe points..."
      );

      const usersWithVibePoints = await prisma.user.findMany({
        where: { vibePoints: { gt: 0 } },
        select: {
          id: true,
          walletAddress: true,
          vibePoints: true,
        },
        take: 5,
      });

      console.log("API Debug - Users with vibe points:", usersWithVibePoints);

      return NextResponse.json({
        points: 0,
        userId: null,
        message: "User not found",
        debug: {
          searchedAddress: address.toLowerCase(),
          usersWithVibePoints,
        },
      });
    }

    const recentTransactions = await prisma.vibeTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        txHash: true,
        blockchainTx: true,
        cryptoAmount: true,
        cryptoSymbol: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      points: user.vibePoints,
      userId: user.id,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching vibe points:", error);
    return NextResponse.json(
      { error: "Failed to fetch vibe points" },
      { status: 500 }
    );
  }
}
