import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST ULTRA BASIC ===')
    console.log('1. Rota funcionando')
    
    return NextResponse.json({
      status: 'success',
      message: 'API está funcionando',
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

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST ULTRA BASIC POST ===')
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
      message: 'POST funcionando',
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
