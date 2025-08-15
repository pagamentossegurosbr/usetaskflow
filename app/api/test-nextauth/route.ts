import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TESTE NEXTAUTH CONFIGURAÇÃO ===')

    // Teste 1: Verificar variáveis de ambiente essenciais
    console.log('1. Verificando variáveis de ambiente...')
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ]

    const missingVars = []
    const envStatus = {}

    for (const varName of requiredEnvVars) {
      const value = process.env[varName]
      if (!value) {
        missingVars.push(varName)
        envStatus[varName] = '❌ Ausente'
      } else {
        envStatus[varName] = '✅ Presente'
      }
    }

    console.log('✅ Status das variáveis:', envStatus)

    if (missingVars.length > 0) {
      console.log('❌ Variáveis ausentes:', missingVars)
      return NextResponse.json({
        status: 'error',
        message: 'Variáveis de ambiente ausentes',
        missing: missingVars,
        envStatus
      }, { status: 500 })
    }

    // Teste 2: Verificar configuração do NextAuth
    console.log('2. Verificando configuração do NextAuth...')
    const nextAuthConfig = {
      secret: process.env.NEXTAUTH_SECRET ? '✅ Configurado' : '❌ Ausente',
      url: process.env.NEXTAUTH_URL ? '✅ Configurado' : '❌ Ausente',
      database: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Ausente'
    }

    console.log('✅ Configuração NextAuth:', nextAuthConfig)

    // Teste 3: Verificar se as URLs estão corretas
    console.log('3. Verificando URLs...')
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const isProduction = process.env.NODE_ENV === 'production'
    
    console.log('✅ NODE_ENV:', process.env.NODE_ENV)
    console.log('✅ NEXTAUTH_URL:', nextAuthUrl)
    console.log('✅ É produção:', isProduction)

    // Teste 4: Verificar se o secret tem o tamanho correto
    console.log('4. Verificando NEXTAUTH_SECRET...')
    const secret = process.env.NEXTAUTH_SECRET
    if (secret && secret.length < 32) {
      console.log('⚠️ NEXTAUTH_SECRET muito curto (mínimo 32 caracteres)')
    } else if (secret) {
      console.log('✅ NEXTAUTH_SECRET OK')
    }

    return NextResponse.json({
      status: 'success',
      message: 'Configuração NextAuth verificada',
      envStatus,
      nextAuthConfig,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: nextAuthUrl,
        isProduction: isProduction
      }
    })

  } catch (error) {
    console.error('❌ Erro no teste NextAuth:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
