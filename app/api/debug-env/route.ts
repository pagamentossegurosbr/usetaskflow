import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== DEBUG ENVIRONMENT VARIABLES ===')
    
    // Verificar variáveis essenciais
    const essentialVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ]
    
    const envStatus = {}
    const missingVars = []
    
    for (const varName of essentialVars) {
      const value = process.env[varName]
      if (!value) {
        missingVars.push(varName)
        envStatus[varName] = '❌ Ausente'
      } else {
        // Mostrar apenas os primeiros caracteres para segurança
        const maskedValue = value.length > 10 ? 
          value.substring(0, 10) + '...' : 
          value
        envStatus[varName] = `✅ Presente (${maskedValue})`
      }
    }
    
    console.log('Status das variáveis de ambiente:', envStatus)
    
    // Verificar configurações do banco
    const databaseUrl = process.env.DATABASE_URL
    let dbConfig = '❌ Não configurado'
    
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl)
        dbConfig = `✅ Configurado (${url.protocol}//${url.hostname}:${url.port}/${url.pathname.split('/').pop()})`
      } catch (error) {
        dbConfig = '❌ URL inválida'
      }
    }
    
    // Verificar NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'development'
    
    return NextResponse.json({
      status: 'success',
      message: 'Debug de variáveis de ambiente',
      environment: {
        nodeEnv,
        isProduction: nodeEnv === 'production',
        isDevelopment: nodeEnv === 'development'
      },
      variables: envStatus,
      database: {
        url: dbConfig,
        hasUrl: !!databaseUrl
      },
      missing: missingVars,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro no debug de ambiente:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
