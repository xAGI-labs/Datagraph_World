import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST: { userId }
 *  - returns user profile
 *
 * PUT: { userId, ...profileFields, hasOnboarded: true }
 *  - updates user profile and sets hasOnboarded true when onboarding completed
 */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        hasOnboarded: true,
        age: true,
        educationLevel: true,
        country: true,
        city: true,
        occupation: true,
        gender: true,
        languages: true,
        skills: true,
        experienceLevel: true,
        interests: true,
        projectPreferences: true,
        worldIdVerified: true,
        verificationLevel: true,
        promptsSubmitted: true,
        comparisonsCompleted: true,
        dayStreak: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, ...updateData } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Filter allowed fields
    const allowedFields = [
      "name",
      "email",
      "image",
      "age",
      "educationLevel",
      "country",
      "city",
      "occupation",
      "gender",
      "languages",
      "skills",
      "experienceLevel",
      "interests",
      "projectPreferences",
      "hasOnboarded",
    ];

    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    filteredData.updatedAt = new Date();

    const user = await prisma.user.update({
      where: { id: userId },
      data: filteredData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
