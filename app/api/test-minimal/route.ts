import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST MINIMAL ===')
    console.log('1. Rota funcionando')
    console.log('2. NODE_ENV:', process.env.NODE_ENV)
    console.log('3. DATABASE_URL existe:', !!process.env.DATABASE_URL)
    
    return NextResponse.json({
      status: 'success',
      message: 'API mínima funcionando',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST MINIMAL POST ===')
    console.log('1. Rota POST funcionando')
    
    // Tentar receber dados
    try {
      const body = await request.json()
      console.log('2. Dados recebidos:', body)
    } catch (error) {
      console.log('❌ Erro ao receber dados:', error)
      return NextResponse.json({ error: 'Erro ao receber dados' }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'POST mínima funcionando',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
