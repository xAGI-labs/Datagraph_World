import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const annotationProject = await prisma.annotationProject.create({
      data: {
        projectId: id,
        payRate: data.payRate,
        isStarter: data.isStarter || false,
        passScore: data.passScore || 80,
      },
    });

    return NextResponse.json({ annotationProject });
  } catch (error) {
    console.error("Failed to create annotation project:", error);
    return NextResponse.json(
      { error: "Failed to create annotation project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const annotationProject = await prisma.annotationProject.update({
      where: { projectId: id },
      data: {
        payRate: data.payRate,
        isStarter: data.isStarter,
        passScore: data.passScore,
      },
    });

    return NextResponse.json({ annotationProject });
  } catch (error) {
    console.error("Failed to update annotation project:", error);
    return NextResponse.json(
      { error: "Failed to update annotation project" },
      { status: 500 }
    );
  }
}
