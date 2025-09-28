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

    // Get user-specific stats
    const userStats = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        vibePoints: true,
        comparisonsCompleted: true,
        promptsSubmitted: true,
      },
    });

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's weekly comparisons
    const weeklyComparisons = await prisma.comparison.count({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Get user's rank based on comparisons completed
    const usersWithMoreComparisons = await prisma.user.count({
      where: {
        comparisonsCompleted: {
          gt: userStats.comparisonsCompleted || 0,
        },
      },
    });
    const userRank = usersWithMoreComparisons + 1;

    const totalUsers = await prisma.user.count();

    const totalComparisons = await prisma.comparison.count();

    const totalPrompts = await prisma.prompt.count();

    const totalWorldChainPayments = await prisma.worldChainPayment.count();

    const recentActivity = await prisma.comparison.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const topModels = await prisma.comparison.groupBy({
      by: ["selectedModel"],
      where: {
        selectedModel: { not: null },
        selectedNeither: false,
      },
      _count: {
        selectedModel: true,
      },
      orderBy: {
        _count: {
          selectedModel: "desc",
        },
      },
      take: 10,
    });

    const formattedActivity = recentActivity.map((activity) => ({
      id: activity.id,
      type: "comparison" as const,
      description: `${
        activity.user?.name || "User"
      } completed a model comparison`,
      timestamp: activity.createdAt,
      user: activity.user?.name,
    }));

    // Get recent World Chain payments
    const recentPayments = await prisma.worldChainPayment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedPaymentActivity = recentPayments.map((payment) => ({
      id: payment.id,
      type: "payment" as const,
      description: `${payment.user?.name || "User"} received ${
        payment.amount
      } ${payment.token}`,
      timestamp: payment.createdAt,
      user: payment.user?.name,
    }));

    const allActivity = [...formattedActivity, ...formattedPaymentActivity]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const modelLabels: { [key: string]: { name: string; provider: string } } = {
      "openai/gpt-4o": { name: "GPT-4o", provider: "OpenAI" },
      "openai/gpt-4o-mini": { name: "GPT-4o Mini", provider: "OpenAI" },
      "anthropic/claude-3.5-sonnet": {
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
      },
      "anthropic/claude-3-haiku": {
        name: "Claude 3 Haiku",
        provider: "Anthropic",
      },
      "meta-llama/llama-3.1-70b-instruct": {
        name: "Llama 3.1 70B",
        provider: "Meta",
      },
      "meta-llama/llama-3.1-8b-instruct": {
        name: "Llama 3.1 8B",
        provider: "Meta",
      },
      "google/gemini-pro-1.5": { name: "Gemini Pro 1.5", provider: "Google" },
      "mistralai/mistral-large": { name: "Mistral Large", provider: "Mistral" },
      "cohere/command-r-plus": { name: "Command R+", provider: "Cohere" },
    };

    const formattedTopModels = topModels.map((model, index) => {
      const modelInfo = modelLabels[model.selectedModel || ""] || {
        name: model.selectedModel || "Unknown Model",
        provider: "Unknown",
      };

      return {
        name: modelInfo.name,
        provider: modelInfo.provider,
        score: model._count.selectedModel,
        trend:
          Math.random() > 0.5 ? "up" : ("down" as "up" | "down" | "stable"),
      };
    });

    const platformStats = {
      dailyActiveUsers: await prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      //inaccurate for now, need to fix after we run bot
      weeklyGrowth: Math.floor(Math.random() * 20) + 5,
      avgSessionTime: Math.floor(Math.random() * 30) + 15,
      satisfactionScore: 4.2 + Math.random() * 0.6,
    };

    return NextResponse.json({
      // User-specific stats for dashboard cards
      vibePoints: userStats.vibePoints || 0,
      totalComparisons: userStats.comparisonsCompleted || 0,
      weeklyComparisons: weeklyComparisons,
      rank: userRank,

      // Global platform stats
      totalUsers,
      totalPrompts,
      totalWorldChainPayments,
      recentActivity: allActivity,
      topModels: formattedTopModels,
      platformStats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
