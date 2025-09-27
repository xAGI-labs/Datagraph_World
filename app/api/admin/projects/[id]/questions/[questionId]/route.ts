import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const data = await request.json();

    if (data.responses && data.responses.length > 0) {
      await prisma.annotationResponse.deleteMany({
        where: { questionId: questionId },
      });
    }

    const question = await prisma.annotationQuestion.update({
      where: { id: questionId },
      data: {
        title: data.title,
        description: data.description,
        userQuery: data.userQuery,
        context: data.context,
        questionType: data.questionType,
        orderIndex: data.orderIndex,
        timeLimit: data.timeLimit,
        pointsWorth: data.pointsWorth,
        responses:
          data.responses && data.responses.length > 0
            ? {
                create: data.responses.map((response: any, index: number) => ({
                  responseLabel: `Response ${String.fromCharCode(65 + index)}`, // "Response A", "Response B", etc.
                  responseText: response.responseText,
                  isCorrect: response.isCorrect,
                })),
              }
            : undefined,
      },
      include: {
        responses: true,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;

    await prisma.annotationQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
