import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    
    const recentPrompts = await prisma.prompt.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        text: true,
        createdAt: true
      }
    })

    const filteredPrompts = recentPrompts
      .filter(prompt => 
        prompt.text.length > 10 && 
        prompt.text.length < 80 &&
        !prompt.text.includes("http") &&
        !prompt.text.includes("<") &&
        !prompt.text.includes(">")
      )
      .slice(0, limit)

    return NextResponse.json({
      prompts: filteredPrompts
    })
  } catch (error) {
    console.error('Error fetching recent prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent prompts' },
      { status: 500 }
    )
  }
}
