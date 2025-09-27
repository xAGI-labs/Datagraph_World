import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const data = await request.json();

    // First, find or create the AnnotationProject
    let annotationProject = await prisma.annotationProject.findUnique({
      where: { projectId: projectId },
    });

    if (!annotationProject) {
      // Create annotation project if it doesn't exist
      annotationProject = await prisma.annotationProject.create({
        data: {
          projectId: projectId,
          payRate: "$10+ / hr",
          isStarter: false,
          passScore: 80,
        },
      });
    }

    const question = await prisma.annotationQuestion.create({
      data: {
        annotationProjectId: annotationProject.id,
        title: data.title,
        description: data.description,
        userQuery: data.userQuery,
        context: data.context,
        questionType: data.questionType,
        orderIndex: data.orderIndex,
        timeLimit: data.timeLimit,
        pointsWorth: data.pointsWorth || 10,
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
    console.error("Failed to create question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Find the annotation project
    const annotationProject = await prisma.annotationProject.findUnique({
      where: { projectId: projectId },
    });

    if (!annotationProject) {
      return NextResponse.json({ questions: [] });
    }

    const questions = await prisma.annotationQuestion.findMany({
      where: { annotationProjectId: annotationProject.id },
      include: {
        responses: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
