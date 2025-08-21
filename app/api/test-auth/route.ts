import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptionsFixed } from '@/lib/auth-fixed'

export async function GET() {
  try {
    console.log("🧪 TESTE DE AUTENTICAÇÃO")
    
    // Verificar variáveis de ambiente críticas
    const criticalEnvVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
      DATABASE_URL: process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
    }
    
    console.log("Variáveis críticas:", criticalEnvVars)
    
    // Testar conexão com banco
    let dbConnection = 'NÃO TESTADO'
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$connect()
      dbConnection = 'CONECTADO'
      await prisma.$disconnect()
    } catch (error) {
      dbConnection = 'ERRO: ' + (error instanceof Error ? error.message : 'Desconhecido')
    }
    
    // Tentar obter sessão
    let session = null
    try {
      session = await getServerSession(authOptionsFixed)
      console.log("Sessão obtida:", session ? 'SIM' : 'NÃO')
    } catch (error) {
      console.error("Erro ao obter sessão:", error)
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Teste de autenticação executado',
      environment: criticalEnvVars,
      database: dbConnection,
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
    console.error("❌ Erro no teste de autenticação:", error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
