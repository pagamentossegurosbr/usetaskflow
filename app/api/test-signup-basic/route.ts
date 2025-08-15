import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST SIGNUP BASIC ===')
    
    // Passo 1: Testar se a rota está funcionando
    console.log('1. Rota funcionando')
    
    // Passo 2: Testar se conseguimos receber dados
    let body
    try {
      body = await request.json()
      console.log('2. Dados recebidos:', { name: body.name, email: body.email })
    } catch (error) {
      console.log('❌ Erro ao receber dados:', error)
      return NextResponse.json({ error: 'Erro ao receber dados' }, { status: 400 })
    }
    
    // Passo 3: Testar se conseguimos importar bcrypt
    try {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('test123', 12)
      console.log('3. bcrypt funcionando, hash criado')
    } catch (error) {
      console.log('❌ Erro com bcrypt:', error)
      return NextResponse.json({ error: 'Erro com bcrypt' }, { status: 500 })
    }
    
    // Passo 4: Testar se conseguimos importar Prisma
    try {
      const { prisma } = await import('@/lib/prisma')
      console.log('4. Prisma importado')
      
      // Passo 5: Testar conexão com banco
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('5. Conexão com banco OK:', testResult)
      
      // Passo 6: Testar se tabela users existe
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      `
      console.log('6. Tabela users existe:', tables.length > 0)
      
      if (tables.length === 0) {
        return NextResponse.json({ error: 'Tabela users não existe' }, { status: 500 })
      }
      
      // Passo 7: Testar busca na tabela users
      const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
      console.log('7. Busca na tabela users OK:', users)
      
      return NextResponse.json({
        message: 'Todos os testes passaram',
        steps: {
          routeWorking: true,
          dataReceived: true,
          bcryptWorking: true,
          prismaImported: true,
          databaseConnected: true,
          tableExists: true,
          tableQueryWorking: true
        }
      })
      
    } catch (error) {
      console.log('❌ Erro com Prisma/banco:', error)
      return NextResponse.json({ 
        error: 'Erro com Prisma/banco',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({ 
      error: 'Erro geral',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
