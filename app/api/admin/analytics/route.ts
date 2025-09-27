import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin analytics API called')
    
    console.log('Skipping auth check for debugging...')
    
    const [
      totalUsers,
      totalComparisons,
      totalPrompts,
      totalVibePoints,
      totalVoiceSessions,
      totalVoiceMessages,
      voiceFeedbackData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.comparison.count(),
      prisma.prompt.count(),
      prisma.user.aggregate({
        _sum: {
          vibePoints: true
        }
      }),
      prisma.voiceSession.count(),
      prisma.voiceMessage.count(),
      prisma.voiceFeedback.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    const [activeUsersToday, activeUsersWeek] = await Promise.all([
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: today
          }
        }
      }),
      prisma.user.count({
        where: {
          lastActiveDate: {
            gte: weekAgo
          }
        }
      })
    ])

    const voiceSessionsWithDuration = await prisma.voiceSession.findMany({
      where: {
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    const averageSessionDuration = voiceSessionsWithDuration.length > 0
      ? voiceSessionsWithDuration.reduce((total: number, session: { startTime: Date; endTime: Date | null }) => {
          if (session.endTime) {
            const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60) 
            return total + duration
          }
          return total
        }, 0) / voiceSessionsWithDuration.length
      : 0

    const roomStats = await prisma.voiceSession.groupBy({
      by: ['roomId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    const popularRooms = await Promise.all(roomStats.map(async (room: { roomId: string; _count: { id: number } }) => {
      const messagesCount = await prisma.voiceMessage.count({
        where: {
          roomId: room.roomId
        }
      })

      const roomUsageStats = await prisma.roomUsageStats.findFirst({
        where: {
          roomId: room.roomId
        }
      })

      return {
        roomId: room.roomId,
        roomName: room.roomId,
        totalSessions: room._count.id,
        totalMessages: messagesCount,
        averageRating: roomUsageStats?.averageRating || 0
      }
    }))

    const totalFeedback = await prisma.voiceFeedback.count()
    const positiveFeedback = await prisma.voiceFeedback.count({
      where: {
        enjoyedConversation: true
      }
    })
    const voiceSatisfactionRate = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0

    const recentVoiceSessions = await prisma.voiceSession.findMany({
      take: 5,
      orderBy: {
        startTime: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const averageComparisonsPerUser = totalUsers > 0 ? totalComparisons / totalUsers : 0

    const modelPreferences = await prisma.comparison.groupBy({
      by: ['selectedModel'],
      where: {
        selectedModel: {
          not: null
        },
        selectedNeither: false
      },
      _count: {
        selectedModel: true
      },
      orderBy: {
        _count: {
          selectedModel: 'desc'
        }
      },
      take: 5
    })

    const topModels = await Promise.all(modelPreferences.map(async pref => {
      const nonNullComparisons = totalComparisons - (await prisma.comparison.count({
        where: {
          OR: [
            { selectedModel: null },
            { selectedNeither: true }
          ]
        }
      }))
      
      const percentage = nonNullComparisons > 0 
        ? Math.round((pref._count.selectedModel / nonNullComparisons) * 100)
        : 0
      
      const modelLabels: { [key: string]: string } = {
        'openai/gpt-4o': 'GPT-4o',
        'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
        'anthropic/claude-3-haiku': 'Claude 3 Haiku',
        'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
        'meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B',
        'google/gemini-pro-1.5': 'Gemini Pro 1.5',
        'google/gemini-flash-1.5': 'Gemini Flash 1.5',
        'perplexity/llama-3.1-sonar-large-128k-online': 'Perplexity Sonar Large'
      }

      return {
        model: modelLabels[pref.selectedModel!] || pref.selectedModel!,
        count: pref._count.selectedModel,
        percentage
      }
    }))

    const userCorrectAnswers = await prisma.comparison.findMany({
      where: {
        selectedNeither: true,
        userCorrectAnswer: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        prompt: true,
        userCorrectAnswer: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const recentComparisons = await prisma.comparison.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // Enhanced recent activity with voice sessions
    const recentActivity = [
      ...recentComparisons.map(comp => ({
        id: comp.id,
        type: 'comparison' as const,
        user: comp.user.name || comp.user.email || 'Anonymous',
        timestamp: formatTimeAgo(comp.createdAt),
        details: comp.selectedNeither 
          ? 'Provided correct answer for prompt'
          : `Compared ${comp.modelALabel} vs ${comp.modelBLabel}`
      })),
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'signup' as const,
        user: user.name || user.email || 'Anonymous',
        timestamp: formatTimeAgo(user.createdAt),
        details: 'New user joined'
      })),
      ...recentVoiceSessions.map(session => ({
        id: session.id,
        type: 'voice_session' as const,
        user: session.user.name || session.user.email || 'Anonymous',
        timestamp: formatTimeAgo(session.startTime),
        details: `Started voice session in ${session.roomId}`
      }))
    ].sort((a, b) => {
      const timeA = recentComparisons.find(c => c.id === a.id)?.createdAt || 
                   recentUsers.find(u => u.id === a.id)?.createdAt ||
                   recentVoiceSessions.find(s => s.id === a.id)?.startTime || new Date(0)
      const timeB = recentComparisons.find(c => c.id === b.id)?.createdAt || 
                   recentUsers.find(u => u.id === b.id)?.createdAt ||
                   recentVoiceSessions.find(s => s.id === b.id)?.startTime || new Date(0)
      return timeB.getTime() - timeA.getTime()
    }).slice(0, 10)

    const neitherResponsesCount = await prisma.comparison.count({
      where: {
        selectedNeither: true
      }
    })

    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [dayComparisons, dayNewUsers] = await Promise.all([
        prisma.comparison.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ])

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        comparisons: dayComparisons,
        newUsers: dayNewUsers
      })
    }

    // Updated analytics object with voice data
    const analytics = {
      totalUsers,
      totalComparisons,
      totalPrompts,
      totalVibePoints: totalVibePoints._sum.vibePoints || 0,
      activeUsersToday,
      activeUsersWeek,
      averageComparisonsPerUser: Math.round(averageComparisonsPerUser * 10) / 10,
      topModels,
      recentActivity,
      dailyStats,
      userCorrectAnswers: userCorrectAnswers.map(answer => ({
        id: answer.id,
        prompt: answer.prompt.length > 80 ? answer.prompt.substring(0, 80) + '...' : answer.prompt,
        userCorrectAnswer: answer.userCorrectAnswer,
        timestamp: formatTimeAgo(answer.createdAt),
        user: answer.user.name || answer.user.email || 'Anonymous'
      })),
      neitherResponsesCount,
      totalVoiceSessions,
      totalVoiceMessages,
      averageSessionDuration: Math.round(averageSessionDuration),
      popularRooms,
      voiceFeedback: voiceFeedbackData.map(feedback => ({
        id: feedback.id,
        user: feedback.user.name || feedback.user.email || 'Anonymous',
        enjoyedConversation: feedback.enjoyedConversation,
        hostRating: feedback.hostRating,
        conversationRating: feedback.conversationRating,
        timestamp: formatTimeAgo(feedback.createdAt),
        roomId: feedback.roomId,
        hostPersonality: feedback.hostPersonality
      })),
      voiceSatisfactionRate
    }

    console.log('Analytics data:', {
      totalUsers,
      totalComparisons,
      totalPrompts,
      totalVibePoints: totalVibePoints._sum.vibePoints || 0,
      totalVoiceSessions,
      totalVoiceMessages,
      averageSessionDuration: Math.round(averageSessionDuration),
      voiceSatisfactionRate,
      modelPreferencesCount: modelPreferences.length,
      recentComparisonsCount: recentComparisons.length,
      userCorrectAnswersCount: userCorrectAnswers.length,
      neitherResponsesCount
    })

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}
