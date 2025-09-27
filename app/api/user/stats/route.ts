import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWorldIdAuth } from "@/lib/world-auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user: dbUser, error, status } = await validateWorldIdAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const userStats = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        id: true,
        promptsSubmitted: true,
        comparisonsCompleted: true,
        dayStreak: true,
        worldIdVerified: true,
        verificationLevel: true,
        worldChainAddress: true,
        createdAt: true,
      },
    });

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get World Chain payment stats
    const paymentStats = await prisma.worldChainPayment.aggregate({
      where: { userId: dbUser.id },
      _count: { id: true },
      _sum: {
        amount: true,
      },
    });

    // Get payment breakdown by token
    const paymentsByToken = await prisma.worldChainPayment.groupBy({
      by: ["token"],
      where: { userId: dbUser.id, status: "completed" },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get model preferences from comparisons
    const modelPreferences = await prisma.comparison.groupBy({
      by: ["selectedModel"],
      where: { userId: dbUser.id, selectedModel: { not: null } },
      _count: { selectedModel: true },
      orderBy: {
        _count: { selectedModel: "desc" },
      },
      take: 5,
    });

    const favoriteModel =
      modelPreferences.length > 0 ? modelPreferences[0].selectedModel : null;

    // Get recent activity count (last 7 days)
    const recentActivity = await prisma.comparison.count({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Return the data in the format the component expects
    return NextResponse.json({
      // User stats from schema
      promptsSubmitted: userStats.promptsSubmitted || 0,
      comparisonsCompleted: userStats.comparisonsCompleted || 0,
      dayStreak: userStats.dayStreak || 0,
      favoriteModel: favoriteModel || undefined,

      // World ID verification status
      worldIdVerified: userStats.worldIdVerified,
      verificationLevel: userStats.verificationLevel || "device",
      worldChainAddress: userStats.worldChainAddress || undefined,

      // World Chain payment stats
      totalPayments: paymentStats._count.id || 0,
      totalEarnings: paymentStats._sum.amount || 0,
      paymentsByToken: paymentsByToken.map((payment) => ({
        token: payment.token,
        amount: payment._sum.amount || 0,
        count: payment._count.id,
      })),

      // Model preferences
      modelPreferences: modelPreferences.map((mp) => ({
        model: mp.selectedModel,
        count: mp._count.selectedModel,
      })),

      // Activity stats
      recentActivity: recentActivity,
      memberSince: userStats.createdAt,
    });
  } catch (error) {
    console.error("User stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
