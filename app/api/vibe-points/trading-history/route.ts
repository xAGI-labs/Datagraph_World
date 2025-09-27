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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get trading history
    const trades = await prisma.trading.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        vibePointsTraded: true,
        cryptoSymbol: true,
        cryptoAmount: true,
        exchangeRate: true,
        usdValue: true,
        transactionHash: true,
        status: true,
        createdAt: true,
      },
    });

    // Get vibe transaction history
    const vibeTransactions = await prisma.vibeTransaction.findMany({
      where: {
        userId: session.user.id,
        type: "TRADED",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        txHash: true,
        blockchainTx: true,
        cryptoAmount: true,
        cryptoSymbol: true,
        exchangeRate: true,
        createdAt: true,
      },
    });

    // Get summary stats
    const totalTraded = await prisma.trading.aggregate({
      where: { userId: session.user.id },
      _sum: {
        vibePointsTraded: true,
        cryptoAmount: true,
        usdValue: true,
      },
      _count: {
        id: true,
      },
    });

    const totalEthTraded = await prisma.trading.aggregate({
      where: {
        userId: session.user.id,
        cryptoSymbol: "ETH",
      },
      _sum: {
        cryptoAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        trades,
        vibeTransactions,
        summary: {
          totalTrades: totalTraded._count.id || 0,
          totalVibePointsTraded: Math.abs(
            totalTraded._sum.vibePointsTraded || 0
          ),
          totalEthTraded: totalEthTraded._sum.cryptoAmount || 0,
          totalUsdValue: totalTraded._sum.usdValue || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching trading history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
