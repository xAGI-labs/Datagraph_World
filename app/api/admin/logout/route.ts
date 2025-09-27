import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Clear admin session cookie
    const cookieStore = await cookies()
    cookieStore.delete('admin-session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
