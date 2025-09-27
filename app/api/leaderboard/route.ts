import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MODEL_MAPPING: { [key: string]: string } = {
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "anthropic/claude-3.5-sonnet": "claude-3-5-sonnet",
  "anthropic/claude-3-haiku": "claude-3-haiku",
  "meta-llama/llama-3.1-70b-instruct": "llama-3.1-70b",
  "meta-llama/llama-3.1-8b-instruct": "llama-3.1-8b",
  "google/gemini-pro-1.5": "gemini-pro-1.5",
  "google/gemini-flash-1.5": "gemini-flash-1.5",
  "mistralai/mistral-large": "mistral-large",
  "perplexity/llama-3.1-sonar-large-128k-online": "perplexity-sonar-large",
  "cohere/command-r-plus": "command-r-plus",
};

async function fetchExternalBenchmarks() {
  try {
    const arenaResponse = await fetch(
      "https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard/resolve/main/leaderboard_table_20241201.csv",
      {
        headers: {
          "User-Agent": "Datagraph/1.0",
          Accept: "text/csv",
        },
      }
    );

    if (arenaResponse.ok) {
      const csvText = await arenaResponse.text();
      return parseArenaLeaderboard(csvText);
    }

    console.log("Arena leaderboard not available, using fallback data");
    return getFallbackBenchmarks();
  } catch (error) {
    console.error("Error fetching external benchmarks:", error);
    return getFallbackBenchmarks();
  }
}

function parseArenaLeaderboard(csvText: string): { [key: string]: any } {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",");
  const benchmarks: { [key: string]: any } = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    if (values.length >= headers.length) {
      const modelName = values[0]?.replace(/"/g, "").trim();
      const eloScore = parseFloat(values[1]) || 0;
      const rank = parseInt(values[2]) || i;

      const mappedName = Object.entries(MODEL_MAPPING).find(([_, value]) =>
        modelName.toLowerCase().includes(value.toLowerCase())
      )?.[1];

      if (mappedName) {
        benchmarks[mappedName] = {
          score: eloScore,
          ranking: rank,
          arenaElo: eloScore,
        };
      }
    }
  }

  return Object.keys(benchmarks).length > 0
    ? benchmarks
    : getFallbackBenchmarks();
}

function getFallbackBenchmarks(): { [key: string]: any } {
  return {
    "gpt-4o": { score: 1287, ranking: 1, arenaElo: 1287 },
    "claude-3-5-sonnet": { score: 1266, ranking: 2, arenaElo: 1266 },
    "gpt-4o-mini": { score: 1158, ranking: 3, arenaElo: 1158 },
    "llama-3.1-70b": { score: 1146, ranking: 4, arenaElo: 1146 },
    "gemini-pro-1.5": { score: 1127, ranking: 5, arenaElo: 1127 },
    "mistral-large": { score: 1118, ranking: 6, arenaElo: 1118 },
    "claude-3-haiku": { score: 1106, ranking: 7, arenaElo: 1106 },
    "gemini-flash-1.5": { score: 1092, ranking: 8, arenaElo: 1092 },
    "llama-3.1-8b": { score: 1079, ranking: 9, arenaElo: 1079 },
    "command-r-plus": { score: 1056, ranking: 10, arenaElo: 1056 },
    "perplexity-sonar-large": { score: 1042, ranking: 11, arenaElo: 1042 },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "overview";

    const modelStats = await prisma.comparison.groupBy({
      by: ["selectedModel"],
      where: {
        selectedModel: {
          not: null,
        },
        selectedNeither: false,
      },
      _count: {
        selectedModel: true,
      },
      _avg: {
        responseTimeA: true,
        responseTimeB: true,
      },
    });

    const totalComparisons = await prisma.comparison.count({
      where: {
        selectedModel: {
          not: null,
        },
        selectedNeither: false,
      },
    });

    const modelResponseTimes = await Promise.all(
      modelStats.map(async (stat) => {
        if (!stat.selectedModel) return { modelId: "", avgResponseTime: 0 };

        const modelAResponses = await prisma.comparison.aggregate({
          where: {
            modelA: stat.selectedModel,
            responseTimeA: { not: null },
          },
          _avg: { responseTimeA: true },
          _count: { responseTimeA: true },
        });

        const modelBResponses = await prisma.comparison.aggregate({
          where: {
            modelB: stat.selectedModel,
            responseTimeB: { not: null },
          },
          _avg: { responseTimeB: true },
          _count: { responseTimeB: true },
        });

        const countA = modelAResponses._count?.responseTimeA || 0;
        const countB = modelBResponses._count?.responseTimeB || 0;
        const totalResponses = countA + countB;

        const avgResponseTime =
          totalResponses > 0
            ? ((modelAResponses._avg?.responseTimeA || 0) * countA +
                (modelBResponses._avg?.responseTimeB || 0) * countB) /
              totalResponses
            : 0;

        return {
          modelId: stat.selectedModel,
          avgResponseTime: Math.round(avgResponseTime),
        };
      })
    );

    const recentComparisons = await prisma.comparison.findMany({
      where: {
        selectedModel: { not: null },
        selectedNeither: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: {
        selectedModel: true,
        createdAt: true,
      },
    });

    // Get World Chain payment stats for each model
    const paymentStats = await prisma.worldChainPayment.groupBy({
      by: ["userId"],
      where: {
        status: "completed",
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalPayments = paymentStats.reduce(
      (sum, stat) => sum + (stat._sum.amount || 0),
      0
    );
    const totalPaymentCount = paymentStats.reduce(
      (sum, stat) => sum + stat._count.id,
      0
    );

    const externalBenchmarks = await fetchExternalBenchmarks();
    console.log("External benchmarks:", externalBenchmarks);

    const modelLabels: { [key: string]: { label: string; provider: string } } =
      {
        "openai/gpt-4o": { label: "GPT-4o", provider: "OpenAI" },
        "openai/gpt-4o-mini": { label: "GPT-4o Mini", provider: "OpenAI" },
        "anthropic/claude-3.5-sonnet": {
          label: "Claude 3.5 Sonnet",
          provider: "Anthropic",
        },
        "anthropic/claude-3-haiku": {
          label: "Claude 3 Haiku",
          provider: "Anthropic",
        },
        "meta-llama/llama-3.1-70b-instruct": {
          label: "Llama 3.1 70B",
          provider: "Meta",
        },
        "meta-llama/llama-3.1-8b-instruct": {
          label: "Llama 3.1 8B",
          provider: "Meta",
        },
        "google/gemini-pro-1.5": {
          label: "Gemini Pro 1.5",
          provider: "Google",
        },
        "google/gemini-flash-1.5": {
          label: "Gemini Flash 1.5",
          provider: "Google",
        },
        "mistralai/mistral-large": {
          label: "Mistral Large",
          provider: "Mistral",
        },
        "mistralai/mistral-small": {
          label: "Mistral Small",
          provider: "Mistral",
        },
        "perplexity/llama-3.1-sonar-large-128k-online": {
          label: "Perplexity Sonar Large",
          provider: "Perplexity",
        },
        "cohere/command-r-plus": { label: "Command R+", provider: "Cohere" },
      };

    const leaderboardData =
      modelStats.length > 0
        ? (modelStats
            .map((stat, index) => {
              if (!stat.selectedModel) return null;

              const responseTimeData = modelResponseTimes.find(
                (rt) => rt.modelId === stat.selectedModel
              );
              const modelInfo = modelLabels[stat.selectedModel] || {
                label: stat.selectedModel,
                provider: "Unknown",
              };
              const externalBenchmarkKey = MODEL_MAPPING[stat.selectedModel];
              const externalData = externalBenchmarks[externalBenchmarkKey];

              const winRate =
                totalComparisons > 0
                  ? Math.round(
                      (stat._count.selectedModel / totalComparisons) * 100
                    )
                  : 0;

              const recentActivity = recentComparisons.filter(
                (c) => c.selectedModel === stat.selectedModel
              ).length;

              let combinedScore = 1000; // Base score

              if (externalData) {
                combinedScore = externalData.arenaElo;
              } else {
                combinedScore = 1000 + (winRate - 50) * 20;
              }

              const categoryMultiplier = getCategoryMultiplier(
                stat.selectedModel,
                category
              );
              const adjustedScore = Math.round(
                combinedScore * categoryMultiplier
              );

              return {
                rank: index + 1,
                modelId: stat.selectedModel,
                modelName: modelInfo.label,
                provider: modelInfo.provider,
                score: adjustedScore,
                arenaElo: externalData?.arenaElo || 0,
                winRate: winRate,
                totalVotes: stat._count.selectedModel,
                avgResponseTime: responseTimeData?.avgResponseTime || 0,
                recentActivity: recentActivity,
                totalPoints: 0, // Now using World Chain payments instead
                worldChainPayments:
                  totalPaymentCount > 0
                    ? Math.round(
                        (stat._count.selectedModel / totalComparisons) *
                          totalPayments *
                          100
                      ) / 100
                    : 0,
                category: category,
                externalRank: externalData?.ranking || 999,
              };
            })
            .filter(Boolean) as any[])
        : Object.entries(externalBenchmarks).map(
            ([modelKey, benchmarkData], index) => {
              const fullModelId =
                Object.keys(MODEL_MAPPING).find(
                  (key) => MODEL_MAPPING[key] === modelKey
                ) || modelKey;
              const modelInfo = modelLabels[fullModelId] || {
                label: modelKey,
                provider: "Unknown",
              };

              const categoryMultiplier = getCategoryMultiplier(
                fullModelId,
                category
              );
              const baseScore = benchmarkData.arenaElo || benchmarkData.score;
              const adjustedScore = Math.round(baseScore * categoryMultiplier);

              return {
                rank: index + 1,
                modelId: fullModelId,
                modelName: modelInfo.label,
                provider: modelInfo.provider,
                score: adjustedScore,
                arenaElo: benchmarkData.arenaElo || benchmarkData.score,
                winRate: 50, // Default neutral win rate for external data
                totalVotes: 0,
                avgResponseTime: 2000 + Math.random() * 3000, // Simulated response time
                recentActivity: 0,
                totalPoints: 0,
                worldChainPayments: 0, // No payments for external-only data
                category: category,
                externalRank: benchmarkData.ranking,
              };
            }
          );

    leaderboardData.sort((a, b) => {
      switch (category) {
        case "text":
          return b.arenaElo - a.arenaElo;
        case "webdev":
          return b.winRate - a.winRate; // Using win rate instead of points
        case "vision":
          return b.score - a.score;
        case "search":
          return b.recentActivity - a.recentActivity;
        case "copilot":
          return b.avgResponseTime > 0
            ? a.avgResponseTime - b.avgResponseTime
            : b.score - a.score; // Speed priority
        default:
          return b.score - a.score;
      }
    });

    leaderboardData.forEach((item, index) => {
      item.rank = index + 1;
    });

    const globalStats = {
      totalModels: leaderboardData.length,
      totalVotes: totalComparisons,
      totalUsers: await prisma.user.count(),
      totalComparisons: await prisma.comparison.count(),
      totalWorldChainPayments: totalPayments,
      totalPaymentTransactions: totalPaymentCount,
      avgResponseTime:
        modelResponseTimes.length > 0
          ? Math.round(
              modelResponseTimes.reduce(
                (sum, rt) => sum + rt.avgResponseTime,
                0
              ) / modelResponseTimes.length
            )
          : Math.round(
              leaderboardData.reduce(
                (sum, model) => sum + model.avgResponseTime,
                0
              ) / (leaderboardData.length || 1)
            ),
      recentActivity: recentComparisons.length,
    };

    return NextResponse.json({
      leaderboard: leaderboardData,
      globalStats: globalStats,
      lastUpdated: new Date().toISOString(),
      dataSource: "combined",
    });
  } catch (error) {
    console.error("Error fetching model leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch model leaderboard data" },
      { status: 500 }
    );
  }
}

function getCategoryMultiplier(modelId: string, category: string): number {
  const categoryStrengths: { [key: string]: { [key: string]: number } } = {
    text: {
      "anthropic/claude-3.5-sonnet": 1.1,
      "openai/gpt-4o": 1.05,
      "meta-llama/llama-3.1-70b-instruct": 1.0,
    },
    webdev: {
      "anthropic/claude-3.5-sonnet": 1.15,
      "openai/gpt-4o": 1.1,
      "meta-llama/llama-3.1-70b-instruct": 1.05,
    },
    vision: {
      "openai/gpt-4o": 1.2,
      "google/gemini-pro-1.5": 1.15,
      "anthropic/claude-3.5-sonnet": 1.1,
    },
    search: {
      "perplexity/llama-3.1-sonar-large-128k-online": 1.3,
      "openai/gpt-4o": 1.1,
    },
    copilot: {
      "anthropic/claude-3.5-sonnet": 1.2,
      "openai/gpt-4o": 1.15,
      "openai/gpt-4o-mini": 1.1,
    },
  };

  return categoryStrengths[category]?.[modelId] || 1.0;
}
