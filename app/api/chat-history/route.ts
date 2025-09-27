import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUserAuth } from "@/lib/nextauth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 20, offset = 0 } = body;

    const { user: dbUser, error, status } = await validateUserAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const comparisons = await prisma.comparison.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        promptRef: {
          select: {
            id: true,
            text: true,
            category: true,
            createdAt: true,
          },
        },
      },
    });

    // Transform the data to match the chat history format expected by TextVibe
    const chatHistory = comparisons.map((comparison) => ({
      id: comparison.id,
      prompt: comparison.prompt,
      timestamp: comparison.createdAt,
      models: {
        modelA: {
          id: comparison.modelA,
          label: comparison.modelALabel,
          responseTime: comparison.responseTimeA,
        },
        modelB: {
          id: comparison.modelB,
          label: comparison.modelBLabel,
          responseTime: comparison.responseTimeB,
        },
      },
      decision: {
        selectedModel: comparison.selectedModel,
        selectedNeither: comparison.selectedNeither,
        userCorrectAnswer: comparison.userCorrectAnswer,
        feedback: comparison.feedback,
      },
      pointsEarned: comparison.pointsEarned,
      promptDetails: comparison.promptRef,
    }));

    // Get total count for pagination
    const totalCount = await prisma.comparison.count({
      where: { userId: dbUser.id },
    });

    return NextResponse.json({
      chatHistory,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
