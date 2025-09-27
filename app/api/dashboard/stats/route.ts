import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUserAuth } from "@/lib/nextauth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user: dbUser, error, status } = await validateUserAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const totalUsers = await prisma.user.count();

    const totalComparisons = await prisma.comparison.count();

    const totalVoiceSessions = await prisma.voiceSession.count();

    const totalPrompts = await prisma.prompt.count();

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

    const recentVoiceActivity = await prisma.voiceSession.findMany({
      where: {
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        startTime: "desc",
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

    const formattedVoiceActivity = recentVoiceActivity.map((session) => ({
      id: session.id,
      type: "voice" as const,
      description: `${session.user?.name || "User"} joined a voice session`,
      timestamp: session.startTime,
      user: session.user?.name,
    }));

    const allActivity = [...formattedActivity, ...formattedVoiceActivity]
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
      totalUsers,
      totalComparisons,
      totalVoiceSessions,
      totalPrompts,
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
