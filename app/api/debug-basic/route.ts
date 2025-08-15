import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== DEBUG BASIC ===')
    console.log('✅ API está funcionando')
    
    return NextResponse.json({
      status: 'success',
      message: 'API está funcionando',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('❌ Erro no debug básico:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
