import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, token, description } = await req.json();

    if (!userId || !amount || !token) {
      return NextResponse.json(
        { error: "Missing required fields: userId, amount, token" },
        { status: 400 }
      );
    }

    // Verify user exists and is World ID verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { worldIdVerified: true },
    });

    if (!user || !user.worldIdVerified) {
      return NextResponse.json(
        { error: "User not found or not World ID verified" },
        { status: 403 }
      );
    }

    // Generate unique reference for payment tracking
    const reference = crypto.randomUUID().replace(/-/g, "");

    // Create payment record in database
    const payment = await prisma.worldChainPayment.create({
      data: {
        userId,
        reference,
        amount: parseFloat(amount),
        token,
        description: description || "AI Comparison Payment",
        status: "pending",
      },
    });

    return NextResponse.json({
      id: payment.reference,
      amount: payment.amount,
      token: payment.token,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
