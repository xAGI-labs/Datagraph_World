import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateMatchScore(
  userSkills: string[],
  userLanguages: string[],
  userExperience: string | null,
  project: any
): number {
  let score = 0;
  let totalFactors = 0;

  if (project.requiredSkills.length > 0) {
    const matchingSkills = userSkills.filter((skill) =>
      project.requiredSkills.some(
        (reqSkill: string) => reqSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    score += (matchingSkills.length / project.requiredSkills.length) * 0.4;
    totalFactors += 0.4;
  }

  // Language matching (30% weight)
  if (project.requiredLanguages.length > 0) {
    const matchingLanguages = userLanguages.filter((lang) =>
      project.requiredLanguages.some(
        (reqLang: string) => reqLang.toLowerCase() === lang.toLowerCase()
      )
    );
    score +=
      (matchingLanguages.length / project.requiredLanguages.length) * 0.3;
    totalFactors += 0.3;
  }

  // Experience matching (30% weight)
  if (project.requiredExperience && userExperience) {
    const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
    const userLevel = experienceLevels.indexOf(userExperience);
    const requiredLevel = experienceLevels.indexOf(project.requiredExperience);

    if (userLevel >= requiredLevel) {
      score += 0.3; 
    } else {
      score += (userLevel / requiredLevel) * 0.3; 
    }
    totalFactors += 0.3;
  }

  return totalFactors > 0 ? score / totalFactors : 0;
}

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        userProjects: true,
      },
    });

    if (!project || !project.isPublished || !project.isActive) {
      return NextResponse.json(
        { error: "Project not available for assignment" },
        { status: 400 }
      );
    }

    if (project.userProjects.length >= project.maxAssignments) {
      return NextResponse.json(
        { error: "Project has reached maximum assignments" },
        { status: 400 }
      );
    }

    const assignedUserIds = project.userProjects.map((up) => up.userId);

    const eligibleUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: assignedUserIds,
        },
        hasOnboarded: true,
        OR: [{ skills: { isEmpty: false } }, { languages: { isEmpty: false } }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        languages: true,
        experienceLevel: true,
      },
    });

    const userMatches = eligibleUsers.map((user) => ({
      user,
      matchScore: calculateMatchScore(
        user.skills,
        user.languages,
        user.experienceLevel,
        project
      ),
    }));

    const qualifiedUsers = userMatches.filter(
      (match) => match.matchScore >= 0.3
    );

    qualifiedUsers.sort((a, b) => b.matchScore - a.matchScore);

    const remainingSlots = project.maxAssignments - project.userProjects.length;
    const usersToAssign = qualifiedUsers.slice(0, remainingSlots);

    const assignments = await Promise.all(
      usersToAssign.map(({ user, matchScore }) =>
        prisma.userProject.create({
          data: {
            userId: user.id,
            projectId: project.id,
            matchScore: matchScore,
            status: "assigned",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      message: `Assigned project to ${assignments.length} users`,
      assignments: assignments.map((assignment) => ({
        userId: assignment.userId,
        userName: assignment.user.name,
        matchScore: assignment.matchScore,
      })),
    });
  } catch (error) {
    console.error("Failed to assign project:", error);
    return NextResponse.json(
      { error: "Failed to assign project" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const publishedProjects = await prisma.project.findMany({
      where: {
        isPublished: true,
        isActive: true,
      },
      include: {
        userProjects: true,
      },
    });

    let totalAssignments = 0;

    for (const project of publishedProjects) {
      if (project.userProjects.length >= project.maxAssignments) {
        continue;
      }

      const assignedUserIds = project.userProjects.map((up) => up.userId);

      const eligibleUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: assignedUserIds,
          },
          hasOnboarded: true,
          OR: [
            { skills: { isEmpty: false } },
            { languages: { isEmpty: false } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          skills: true,
          languages: true,
          experienceLevel: true,
        },
      });

      const userMatches = eligibleUsers.map((user) => ({
        user,
        matchScore: calculateMatchScore(
          user.skills,
          user.languages,
          user.experienceLevel,
          project
        ),
      }));

      const qualifiedUsers = userMatches.filter(
        (match) => match.matchScore >= 0.3
      );

      qualifiedUsers.sort((a, b) => b.matchScore - a.matchScore);

      const remainingSlots =
        project.maxAssignments - project.userProjects.length;
      const usersToAssign = qualifiedUsers.slice(0, remainingSlots);

      const assignments = await Promise.all(
        usersToAssign.map(({ user, matchScore }) =>
          prisma.userProject.create({
            data: {
              userId: user.id,
              projectId: project.id,
              matchScore: matchScore,
              status: "assigned",
            },
          })
        )
      );

      totalAssignments += assignments.length;
    }

    return NextResponse.json({
      message: `Auto-assigned ${totalAssignments} project assignments`,
      totalAssignments,
    });
  } catch (error) {
    console.error("Failed to auto-assign projects:", error);
    return NextResponse.json(
      { error: "Failed to auto-assign projects" },
      { status: 500 }
    );
  }
}
