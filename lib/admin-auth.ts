import { cookies } from 'next/headers'

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    return adminSession?.value === 'authenticated'
  } catch (error) {
    console.error('Error checking admin authentication:', error)
    return false
  }
}
