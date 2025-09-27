import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      walletAddress,
      points,
      description = "Annotation reward",
    } = await request.json();

    if (!walletAddress || !points) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, points" },
        { status: 400 }
      );
    }

    if (points <= 0) {
      return NextResponse.json(
        { error: "Points must be greater than 0" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: walletAddress.toLowerCase() },
      update: {
        vibePoints: { increment: points },
      },
      create: {
        walletAddress: walletAddress.toLowerCase(),
        vibePoints: points,
      },
    });

    // Record the transaction
    const transaction = await prisma.vibeTransaction.create({
      data: {
        userId: user.id,
        amount: points,
        type: "EARNED",
        description,
        blockchainTx: false,
      },
    });

    return NextResponse.json({
      success: true,
      totalPoints: user.vibePoints,
      awarded: points,
      transactionId: transaction.id,
      message: `Successfully awarded ${points} vibe points!`,
    });
  } catch (error) {
    console.error("Error awarding vibe points:", error);
    return NextResponse.json(
      { error: "Failed to award points" },
      { status: 500 }
    );
  }
}
