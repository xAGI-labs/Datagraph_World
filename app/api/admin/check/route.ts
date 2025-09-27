import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (adminSession?.value === 'authenticated') {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}
