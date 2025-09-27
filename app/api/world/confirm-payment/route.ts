import { NextRequest, NextResponse } from "next/server";
import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { prisma } from "@/lib/prisma";

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload;

    // Find the payment record by reference
    const payment = await prisma.worldChainPayment.findUnique({
      where: { reference: payload.reference },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment via World Developer Portal API
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.WORLD_APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.WORLD_DEV_PORTAL_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to verify payment" },
        { status: 400 }
      );
    }

    const transaction = await response.json();

    // Verify the transaction matches our payment
    if (
      transaction.reference === payment.reference &&
      transaction.status !== "failed"
    ) {
      // Update payment status
      const updatedPayment = await prisma.worldChainPayment.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          transactionId: payload.transaction_id,
          transactionHash: transaction.transaction_hash,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
