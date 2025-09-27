import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUserAuth } from "@/lib/nextauth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { user: dbUser, error, status } = await validateUserAuth(body);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const userStats = await prisma.user.findUnique({
      where: { id: dbUser.id },
      select: {
        id: true,
        vibePoints: true,
        promptsSubmitted: true,
        comparisonsCompleted: true,
        dayStreak: true,
        voiceConversations: true,
        voiceMessageCount: true,
        totalVoiceTime: true,
        favoriteVoiceRoom: true,
      },
    });

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const voiceStats = await prisma.voiceSession.aggregate({
      where: { userId: dbUser.id },
      _count: { id: true },
      _sum: {
        messageCount: true,
        totalPoints: true,
        sessionDuration: true,
      },
    });

    const voiceFeedback = await prisma.voiceFeedback.findMany({
      where: { userId: dbUser.id },
      select: {
        enjoyedConversation: true,
        hostRating: true,
        conversationRating: true,
      },
    });

    const positiveVoiceFeedback = voiceFeedback.filter(
      (f) =>
        f.enjoyedConversation === true ||
        (f.hostRating && f.hostRating >= 4) ||
        (f.conversationRating && f.conversationRating >= 4)
    ).length;

    // Get model preferences from comparisons
    const modelPreferences = await prisma.comparison.groupBy({
      by: ["selectedModel"],
      where: { userId: dbUser.id },
      _count: { selectedModel: true },
      orderBy: {
        _count: { selectedModel: "desc" },
      },
      take: 5,
    });

    const favoriteModel =
      modelPreferences.length > 0 ? modelPreferences[0].selectedModel : null;

    // Return the data in the format the component expects
    return NextResponse.json({
      vibePoints: userStats.vibePoints || 0,
      promptsSubmitted: userStats.promptsSubmitted || 0,
      comparisonsCompleted: userStats.comparisonsCompleted || 0,
      dayStreak: userStats.dayStreak || 0,
      favoriteModel: favoriteModel || undefined,

      // Voice stats
      voiceConversations: userStats.voiceConversations || 0,
      voiceMessages: userStats.voiceMessageCount || 0,
      positiveVoiceFeedback: positiveVoiceFeedback || 0,
      totalVoiceFeedback: voiceFeedback.length || 0,
      favoriteVoiceRoom: userStats.favoriteVoiceRoom || undefined,

      // Model preferences
      modelPreferences: modelPreferences.map((mp) => ({
        model: mp.selectedModel,
        count: mp._count.selectedModel,
      })),

      // Additional stats
      recentActivity: voiceStats._sum.messageCount || 0,
    });
  } catch (error) {
    console.error("User stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
