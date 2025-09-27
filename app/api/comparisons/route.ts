import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUserAuth } from "@/lib/nextauth-helpers";

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

    const { user: dbUser, error, status } = await validateUserAuth(body);
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
        pointsEarned: pointsEarned,
      },
    });

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        vibePoints: { increment: pointsEarned },
        promptsSubmitted: { increment: 1 },
        comparisonsCompleted: { increment: 1 },
        lastActiveDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      comparison: {
        id: comparison.id,
        selectedNeither: comparison.selectedNeither,
        userCorrectAnswer: comparison.userCorrectAnswer,
        pointsEarned: comparison.pointsEarned,
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
