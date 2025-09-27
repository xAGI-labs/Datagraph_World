import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { validateUserAuth } from "@/lib/nextauth-helpers";

/**
 * POST: { user }
 *  - returns { profile, hasOnboarded }
 *
 * PUT: { user, ...profileFields, hasOnboarded: true }
 *  - updates/creates user and sets hasOnboarded true when onboarding completed
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { user: existingUser, error, status } = await validateUserAuth(body);
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // return complete profile to client
    const profile = {
      id: existingUser.id,
      name: existingUser.name || "User",
      email: existingUser.email || "",
      image: existingUser.image,
      createdAt: existingUser.createdAt.toISOString(),
      vibePoints: existingUser.vibePoints || 0,
      promptsSubmitted: existingUser.promptsSubmitted || 0,
      comparisonsCompleted: existingUser.comparisonsCompleted || 0,
      dayStreak: existingUser.dayStreak || 0,
      voiceConversations: 0, // TODO: implement if needed
      voiceMessageCount: 0, // TODO: implement if needed
      totalVoiceTime: 0, // TODO: implement if needed
      favoriteVoiceRoom: null, // TODO: implement if needed
      gender: existingUser.gender,
      age: existingUser.age,
      educationLevel: existingUser.educationLevel,
      country: existingUser.country,
      city: existingUser.city,
      occupation: existingUser.occupation,
      languages: existingUser.languages || [],
      skills: existingUser.skills || [],
      experienceLevel: existingUser.experienceLevel,
      projectPreferences: existingUser.projectPreferences || [],
      walletAddress: existingUser.walletAddress,
    };

    return new Response(
      JSON.stringify({
        profile,
        hasOnboarded: Boolean(existingUser.hasOnboarded),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Profile POST error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { user: existingUser, error, status } = await validateUserAuth(body);
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allowed: Partial<Record<string, any>> = {};
    const fields = [
      "name",
      "country",
      "city",
      "occupation",
      "languages",
      "skills",
      "experienceLevel",
      "interests",
      "projectPreferences",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }

    if (body.hasOnboarded === true) {
      allowed.hasOnboarded = true;
    }

    const updateData: any = { updatedAt: new Date(), ...allowed };
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    });
    const completeProfile = {
      id: updated.id,
      name: updated.name || "User",
      email: updated.email || "",
      image: updated.image,
      createdAt: updated.createdAt.toISOString(),
      vibePoints: updated.vibePoints || 0,
      promptsSubmitted: updated.promptsSubmitted || 0,
      comparisonsCompleted: updated.comparisonsCompleted || 0,
      dayStreak: updated.dayStreak || 0,
      voiceConversations: 0,
      voiceMessageCount: 0,
      totalVoiceTime: 0,
      favoriteVoiceRoom: null,
      gender: updated.gender,
      age: updated.age,
      educationLevel: updated.educationLevel,
      country: updated.country,
      city: updated.city,
      occupation: updated.occupation,
      languages: updated.languages || [],
      skills: updated.skills || [],
      experienceLevel: updated.experienceLevel,
      projectPreferences: updated.projectPreferences || [],
      walletAddress: updated.walletAddress,
    };
    return new Response(
      JSON.stringify({
        profile: completeProfile,
        hasOnboarded: Boolean(updated.hasOnboarded),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Profile PUT error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
