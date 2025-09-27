import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { VOICE_ROOMS, VoiceRoom } from '@/lib/voice-rooms'

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalSessions = await prisma.voiceSession.count()
    const totalMessages = await prisma.voiceMessage.count()
    
    const sessions = await prisma.voiceSession.findMany({
      where: {
        endTime: { not: null },
        sessionDuration: { not: null }
      },
      select: {
        sessionDuration: true
      }
    })

    const averageSessionDuration = sessions.length > 0 
      ? sessions.reduce((acc, session) => acc + (session.sessionDuration || 0), 0) / sessions.length / 60 
      : 0

    const feedbackData = await prisma.voiceFeedback.findMany({
      select: {
        enjoyedConversation: true,
        hostRating: true,
        conversationRating: true,
        wouldReturnToRoom: true
      }
    })

    const positiveFeedback = feedbackData.filter(f => 
      f.enjoyedConversation === true || 
      (f.hostRating && f.hostRating >= 4) || 
      (f.conversationRating && f.conversationRating >= 4)
    ).length

    const negativeFeedback = feedbackData.filter(f => 
      f.enjoyedConversation === false || 
      (f.hostRating && f.hostRating <= 2) || 
      (f.conversationRating && f.conversationRating <= 2)
    ).length

    const feedbackRate = totalSessions > 0 ? (feedbackData.length / totalSessions) * 100 : 0

    const roomStats = await prisma.roomUsageStats.groupBy({
      by: ['roomId'],
      _sum: {
        totalSessions: true,
        totalMessages: true,
        totalTimeSpent: true
      },
      _avg: {
        averageRating: true
      },
      orderBy: {
        _sum: {
          totalSessions: 'desc'
        }
      },
      take: 5
    })

    const popularRooms = roomStats.map(stat => {
      const room = VOICE_ROOMS.find((r: VoiceRoom) => r.id === stat.roomId)
      return {
        roomId: stat.roomId,
        roomName: room?.name || 'Unknown Room',
        sessionCount: stat._sum.totalSessions || 0,
        totalMessages: stat._sum.totalMessages || 0,
        totalTimeSpent: Math.round((stat._sum.totalTimeSpent || 0) / 60),
        averageRating: stat._avg.averageRating || null
      }
    })

    const recentSessions = await prisma.voiceSession.findMany({
      take: 10,
      orderBy: {
        startTime: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        feedback: {
          select: {
            enjoyedConversation: true,
            hostRating: true,
            conversationRating: true,
            wouldReturnToRoom: true
          }
        }
      }
    })

    const formattedRecentSessions = recentSessions.map(session => {
      const room = VOICE_ROOMS.find((r: VoiceRoom) => r.id === session.roomId)
      
      let feedbackSentiment: 'positive' | 'negative' | 'neutral' | null = null
      if (session.feedback) {
        const { enjoyedConversation, hostRating, conversationRating } = session.feedback
        
        if (enjoyedConversation === true || 
            (hostRating && hostRating >= 4) || 
            (conversationRating && conversationRating >= 4)) {
          feedbackSentiment = 'positive'
        } else if (enjoyedConversation === false || 
                  (hostRating && hostRating <= 2) || 
                  (conversationRating && conversationRating <= 2)) {
          feedbackSentiment = 'negative'
        } else {
          feedbackSentiment = 'neutral'
        }
      }

      return {
        id: session.id,
        userName: session.user.name || 'Anonymous',
        roomId: session.roomId,
        roomName: room?.name || 'Unknown Room',
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString() || null,
        messageCount: session.messageCount,
        sessionDuration: session.sessionDuration ? Math.round(session.sessionDuration / 60) : null, 
        totalPoints: session.totalPoints,
        feedbackSentiment,
        hostRating: session.feedback?.hostRating || null,
        conversationRating: session.feedback?.conversationRating || null
      }
    })

    const totalUsers = await prisma.user.count({
      where: {
        voiceMessageCount: { gt: 0 }
      }
    })

    const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0

    const averageRating = feedbackData.length > 0 
      ? feedbackData.reduce((acc, f) => {
          const ratings = [f.hostRating, f.conversationRating].filter(r => r !== null)
          return acc + (ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length : 0)
        }, 0) / feedbackData.length
      : null

    const roomPerformance = await Promise.all(
      VOICE_ROOMS.map(async (room: VoiceRoom) => {
        const roomFeedback = await prisma.voiceFeedback.findMany({
          where: { roomId: room.id },
          select: {
            hostRating: true,
            conversationRating: true,
            enjoyedConversation: true
          }
        })

        const roomSessions = await prisma.voiceSession.count({
          where: { roomId: room.id }
        })

        const roomMessages = await prisma.voiceMessage.count({
          where: { roomId: room.id }
        })

        return {
          roomId: room.id,
          roomName: room.name,
          totalSessions: roomSessions,
          totalMessages: roomMessages,
          totalFeedback: roomFeedback.length,
          averageRating: roomFeedback.length > 0 
            ? roomFeedback.reduce((acc, f) => {
                const ratings = [f.hostRating, f.conversationRating].filter(r => r !== null)
                return acc + (ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r || 0), 0) / ratings.length : 0)
              }, 0) / roomFeedback.length
            : null,
          satisfactionRate: roomFeedback.length > 0 
            ? (roomFeedback.filter(f => f.enjoyedConversation === true).length / roomFeedback.length) * 100
            : null
        }
      })
    )

    return NextResponse.json({
      totalSessions,
      totalMessages,
      totalUsers,
      averageSessionDuration: Math.round(averageSessionDuration * 100) / 100, 
      averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
      
      positiveFeedback,
      negativeFeedback,
      feedbackRate: Math.round(feedbackRate * 100) / 100,
      averageRating: averageRating ? Math.round(averageRating * 100) / 100 : null,
      
      popularRooms,
      roomPerformance,
      
      recentSessions: formattedRecentSessions
    })

  } catch (error) {
    console.error('Voice analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
