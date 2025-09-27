import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        annotationProject: {
          include: {
            _count: {
              select: {
                questions: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const project = await prisma.project.create({
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
        isActive: true,
        isPublished: false,
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
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
