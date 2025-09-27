import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWorldIdAuth } from "@/lib/world-auth-helpers";

// Conversion rates (1000 vibe points = 1 token)
const CONVERSION_RATES = {
  WLD: 0.001, // 1 vibe point = 0.001 WLD
  USDC: 0.001, // 1 vibe point = 0.001 USDC
} as const;

const MIN_POINTS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vibePoints, token } = body;

    // Validate authentication
    const { user: dbUser, error, status } = await validateWorldIdAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Validate inputs
    if (!vibePoints || !token || typeof vibePoints !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: vibePoints, token" },
        { status: 400 }
      );
    }

    if (vibePoints < MIN_POINTS) {
      return NextResponse.json(
        { error: `Minimum ${MIN_POINTS} vibe points required` },
        { status: 400 }
      );
    }

    if (!["WLD", "USDC"].includes(token)) {
      return NextResponse.json(
        { error: "Invalid token. Must be WLD or USDC" },
        { status: 400 }
      );
    }

    // Check if user has enough vibe points
    const user = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: { vibePoints: true, worldChainAddress: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.vibePoints < vibePoints) {
      return NextResponse.json(
        { error: "Insufficient vibe points" },
        { status: 400 }
      );
    }

    // Calculate crypto amount
    const cryptoAmount =
      vibePoints * CONVERSION_RATES[token as keyof typeof CONVERSION_RATES];

    // Generate unique reference for payment tracking
    const reference = crypto.randomUUID().replace(/-/g, "");

    // Start transaction to deduct points and create payment record
    const result = await prisma.$transaction(async (tx) => {
      // Deduct vibe points from user
      const updatedUser = await tx.user.update({
        where: { id: dbUser.id },
        data: {
          vibePoints: {
            decrement: vibePoints,
          },
        },
        select: { vibePoints: true },
      });

      // Create payment record
      const payment = await tx.worldChainPayment.create({
        data: {
          userId: dbUser.id,
          reference,
          amount: cryptoAmount,
          token,
          description: `Vibe Points Trade: ${vibePoints} points → ${cryptoAmount} ${token}`,
          status: "pending",
        },
      });

      return { updatedUser, payment };
    });

    return NextResponse.json({
      success: true,
      trade: {
        id: result.payment.reference,
        vibePointsTraded: vibePoints,
        cryptoAmount,
        token,
        remainingVibePoints: result.updatedUser.vibePoints,
      },
    });
  } catch (error) {
    console.error("Vibe points trade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
