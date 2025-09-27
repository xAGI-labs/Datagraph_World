import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  isAddress,
} from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http(
    `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  ),
});

// Exchange rates
const ETH_TO_VP_RATE = 1000000; // 1 ETH = 1,000,000 VP
const VP_TO_ETH_RATE = 0.000001; // 1 VP = 0.000001 ETH
const MIN_ETH_AMOUNT = 0.001; // Minimum 0.001 ETH to buy VP
const MIN_VP_AMOUNT = 100; // Minimum 100 VP to sell

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      action, // 'buy' or 'sell'
      amount, // ETH amount for buy, VP amount for sell
      transactionHash, // Transaction hash for verification
    } = await request.json();

    if (!action || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: action, amount" },
        { status: 400 }
      );
    }

    // Get user with wallet address
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

    if (!user.walletAddress || !isAddress(user.walletAddress)) {
      return NextResponse.json(
        {
          error:
            "Valid wallet address required. Please connect your wallet first.",
        },
        { status: 400 }
      );
    }

    if (action === "buy") {
      // Buy VP with ETH
      return await handleBuyVibePoints(user, amount, transactionHash);
    } else if (action === "sell") {
      // Sell VP for ETH
      return await handleSellVibePoints(user, amount, transactionHash);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'buy' or 'sell'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Trading API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleBuyVibePoints(
  user: any,
  ethAmount: number,
  transactionHash?: string
) {
  if (ethAmount < MIN_ETH_AMOUNT) {
    return NextResponse.json(
      { error: `Minimum purchase amount is ${MIN_ETH_AMOUNT} ETH` },
      { status: 400 }
    );
  }

  // Calculate VP amount
  const vpAmount = Math.floor(ethAmount * ETH_TO_VP_RATE);
  const currentEthPrice = 2400; // You could fetch this from an API
  const usdValue = ethAmount * currentEthPrice;

  try {
    // Verify transaction if hash provided
    if (transactionHash) {
      const receipt = await publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });

      if (!receipt || receipt.status !== "success") {
        return NextResponse.json(
          { error: "Transaction verification failed" },
          { status: 400 }
        );
      }
    }

    // Create transaction records
    const result = await prisma.$transaction(async (tx) => {
      // Update user vibe points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          vibePoints: { increment: vpAmount },
          updatedAt: new Date(),
        },
      });

      // Create trading record
      const tradeRecord = await tx.trading.create({
        data: {
          userId: user.id,
          vibePointsTraded: -vpAmount, // Negative because user is buying VP
          cryptoSymbol: "ETH",
          cryptoAmount: ethAmount,
          walletAddress: user.walletAddress,
          exchangeRate: VP_TO_ETH_RATE,
          usdValue: usdValue,
          transactionHash: transactionHash || null,
          status: "completed",
        },
      });

      // Create vibe transaction record
      const vibeTransaction = await tx.vibeTransaction.create({
        data: {
          userId: user.id,
          amount: vpAmount,
          type: "TRADED",
          description: `Purchased ${vpAmount.toLocaleString()} VP with ${ethAmount} ETH`,
          txHash: transactionHash || null,
          blockchainTx: !!transactionHash,
          cryptoAmount: ethAmount,
          cryptoSymbol: "ETH",
          exchangeRate: ETH_TO_VP_RATE,
        },
      });

      return { updatedUser, tradeRecord, vibeTransaction };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${vpAmount.toLocaleString()} Vibe Points`,
      transaction: {
        type: "buy",
        vpAmount,
        ethAmount,
        newBalance: result.updatedUser.vibePoints,
        transactionId: result.tradeRecord.id,
        usdValue,
      },
    });
  } catch (error) {
    console.error("Buy transaction failed:", error);
    return NextResponse.json(
      { error: "Transaction failed. Please try again." },
      { status: 500 }
    );
  }
}

async function handleSellVibePoints(
  user: any,
  vpAmount: number,
  transactionHash?: string
) {
  if (vpAmount < MIN_VP_AMOUNT) {
    return NextResponse.json(
      { error: `Minimum sell amount is ${MIN_VP_AMOUNT} VP` },
      { status: 400 }
    );
  }

  if (user.vibePoints < vpAmount) {
    return NextResponse.json(
      { error: "Insufficient vibe points" },
      { status: 400 }
    );
  }

  // Calculate ETH amount
  const ethAmount = vpAmount * VP_TO_ETH_RATE;
  const currentEthPrice = 2400; // You could fetch this from an API
  const usdValue = ethAmount * currentEthPrice;

  try {
    // Create transaction records
    const result = await prisma.$transaction(async (tx) => {
      // Update user vibe points
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          vibePoints: { decrement: vpAmount },
          updatedAt: new Date(),
        },
      });

      // Create trading record
      const tradeRecord = await tx.trading.create({
        data: {
          userId: user.id,
          vibePointsTraded: vpAmount,
          cryptoSymbol: "ETH",
          cryptoAmount: ethAmount,
          walletAddress: user.walletAddress,
          exchangeRate: VP_TO_ETH_RATE,
          usdValue: usdValue,
          transactionHash: transactionHash || null,
          status: transactionHash ? "completed" : "pending",
        },
      });

      // Create vibe transaction record
      const vibeTransaction = await tx.vibeTransaction.create({
        data: {
          userId: user.id,
          amount: -vpAmount,
          type: "TRADED",
          description: `Sold ${vpAmount.toLocaleString()} VP for ${ethAmount.toFixed(
            6
          )} ETH`,
          txHash: transactionHash || null,
          blockchainTx: !!transactionHash,
          cryptoAmount: ethAmount,
          cryptoSymbol: "ETH",
          exchangeRate: VP_TO_ETH_RATE,
        },
      });

      return { updatedUser, tradeRecord, vibeTransaction };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully sold ${vpAmount.toLocaleString()} Vibe Points`,
      transaction: {
        type: "sell",
        vpAmount,
        ethAmount,
        newBalance: result.updatedUser.vibePoints,
        transactionId: result.tradeRecord.id,
        usdValue,
      },
    });
  } catch (error) {
    console.error("Sell transaction failed:", error);
    return NextResponse.json(
      { error: "Transaction failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get exchange rates and trading info
    const rates = {
      ethToVp: ETH_TO_VP_RATE,
      vpToEth: VP_TO_ETH_RATE,
      minEthAmount: MIN_ETH_AMOUNT,
      minVpAmount: MIN_VP_AMOUNT,
    };

    return NextResponse.json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error("Error fetching trading info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
