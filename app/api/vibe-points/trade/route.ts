import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VIBE_TO_ETH_RATE = 0.000001; // 1 VP = 0.000001 ETH
const MIN_TRADE_AMOUNT = 100; // Minimum 100 VP to trade

export async function POST(request: NextRequest) {
  try {
    const {
      walletAddress,
      vibePoints,
      cryptoSymbol = "ETH",
    } = await request.json();

    if (!walletAddress || !vibePoints) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, vibePoints" },
        { status: 400 }
      );
    }

    if (vibePoints < MIN_TRADE_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum trade amount is ${MIN_TRADE_AMOUNT} vibe points` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
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

    const cryptoAmount = vibePoints * VIBE_TO_ETH_RATE;

    let ethPriceUSD = 3000;
    let usdValue = cryptoAmount * ethPriceUSD;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const ethPriceResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (ethPriceResponse.ok) {
        const ethPriceData = await ethPriceResponse.json();
        if (ethPriceData.ethereum?.usd) {
          ethPriceUSD = ethPriceData.ethereum.usd;
          usdValue = cryptoAmount * ethPriceUSD;
        }
      }
    } catch (error) {
      console.log("Failed to fetch ETH price, using fallback:", ethPriceUSD);
    }

    // Generate simulated transaction hash for demo purposes
    const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update user's vibe points and create transaction records
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { vibePoints: { decrement: vibePoints } },
    });

    const transaction = await prisma.vibeTransaction.create({
      data: {
        userId: user.id,
        amount: -vibePoints,
        type: "TRADED",
        description: `Traded ${vibePoints} VP for ${cryptoAmount} ${cryptoSymbol}`,
        txHash: simulatedTxHash,
        blockchainTx: false, // Simulated transaction
        cryptoAmount: cryptoAmount,
        cryptoSymbol: cryptoSymbol,
        exchangeRate: VIBE_TO_ETH_RATE,
      },
    });

    await prisma.trading.create({
      data: {
        userId: user.id,
        vibePointsTraded: vibePoints,
        cryptoSymbol: cryptoSymbol,
        cryptoAmount: cryptoAmount,
        walletAddress: walletAddress.toLowerCase(),
        exchangeRate: VIBE_TO_ETH_RATE,
        usdValue: usdValue,
        transactionHash: simulatedTxHash,
        status: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      txHash: simulatedTxHash,
      cryptoAmount: cryptoAmount,
      cryptoSymbol: cryptoSymbol,
      vibePointsTraded: vibePoints,
      remainingVibePoints: updatedUser.vibePoints,
      usdValue: usdValue,
      transactionId: transaction.id,
      blockExplorer: `https://basescan.org/tx/${simulatedTxHash}`,
    });
  } catch (error) {
    console.error("Error trading vibe points:", error);
    return NextResponse.json(
      { error: "Failed to process trade", details: error.message },
      { status: 500 }
    );
  }
}
