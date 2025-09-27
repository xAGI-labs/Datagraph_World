import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWorldIdAuth } from "@/lib/world-auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      modelA,
      modelB,
      modelALabel,
      modelBLabel,
      selectedModel,
      feedback,
      responseTimeA,
      responseTimeB,
      selectedNeither = false,
      userCorrectAnswer = null,
      isTie = false,
    } = body;

    const { user: dbUser, error, status } = await validateWorldIdAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    if (
      !prompt ||
      !modelA ||
      !modelB ||
      (!selectedModel && !selectedNeither && !isTie)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (selectedNeither && !userCorrectAnswer?.trim()) {
      return NextResponse.json(
        {
          error:
            "User correct answer is required when neither option is selected",
        },
        { status: 400 }
      );
    }

    const promptRecord = await prisma.prompt.create({
      data: {
        userId: dbUser.id,
        text: prompt,
        category: null,
      },
    });

    const pointsEarned = selectedNeither ? 150 : isTie ? 100 : 100;

    const comparison = await prisma.comparison.create({
      data: {
        userId: dbUser.id,
        promptId: promptRecord.id,
        prompt: prompt,
        modelA: modelA,
        modelB: modelB,
        modelALabel: modelALabel || modelA,
        modelBLabel: modelBLabel || modelB,
        selectedModel: selectedNeither || isTie ? null : selectedModel,
        feedback: feedback || null,
        responseTimeA: responseTimeA || null,
        responseTimeB: responseTimeB || null,
        selectedNeither: selectedNeither,
        userCorrectAnswer: selectedNeither ? userCorrectAnswer?.trim() : null,
        // Note: World Chain payment will be handled separately via payment APIs
        isPaid: false,
      },
    });

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        promptsSubmitted: { increment: 1 },
        comparisonsCompleted: { increment: 1 },
        lastActiveDate: new Date(),
        vibePoints: { increment: 100 },
      },
    });

    return NextResponse.json({
      success: true,
      comparison: {
        id: comparison.id,
        selectedNeither: comparison.selectedNeither,
        userCorrectAnswer: comparison.userCorrectAnswer,
        requiresPayment: true, // Indicates that World Chain payment should be initiated
      },
    });
  } catch (error) {
    console.error("Comparison save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
