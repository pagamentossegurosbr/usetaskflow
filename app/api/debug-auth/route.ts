import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log("=== DEBUG AUTH ROUTE ===")
    
    // Verificar variáveis de ambiente
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GITHUB_ID: process.env.GITHUB_ID ? 'SET' : 'NOT SET',
    }
    
    console.log("Environment variables:", envCheck)
    
    // Tentar obter sessão
    const session = await getServerSession(authOptions)
    console.log("Session:", session)
    
    return NextResponse.json({
      status: 'success',
      message: 'Auth debug route working',
      envCheck,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role
        }
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("❌ Debug auth error:", error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
