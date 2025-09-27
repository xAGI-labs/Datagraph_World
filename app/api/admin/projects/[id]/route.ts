import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: IParams) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        annotationProject: {
          include: {
            questions: {
              include: {
                responses: true,
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        _count: {
          select: {
            userProjects: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: IParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        difficulty: data.difficulty,
        estimatedHours: data.estimatedHours,
        pointsReward: data.pointsReward,
        requiredSkills: data.requiredSkills,
        requiredLanguages: data.requiredLanguages,
        requiredExperience: data.requiredExperience,
        maxAssignments: data.maxAssignments,
        deadline: data.deadline ? new Date(data.deadline) : null,
        instructions: data.instructions,
        datasetUrl: data.datasetUrl,
        submissionFormat: data.submissionFormat,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        isPublished:
          data.isPublished !== undefined ? data.isPublished : undefined,
      },
      include: {
        _count: {
          select: {
            userProjects: true,
          },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: IParams) {
  try {
    const { id } = await params;

    await prisma.userProject.deleteMany({
      where: { projectId: id },
    });

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
