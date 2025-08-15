import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST PRISMA SIMPLE ===')
    
    // Passo 1: Verificar se conseguimos importar o Prisma Client
    try {
      const { PrismaClient } = await import('@prisma/client')
      console.log('1. PrismaClient importado com sucesso')
    } catch (error) {
      console.log('❌ Erro ao importar PrismaClient:', error)
      return NextResponse.json({
        error: 'Erro ao importar PrismaClient',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
    // Passo 2: Tentar criar uma instância do Prisma
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      console.log('2. Instância do Prisma criada com sucesso')
      
      // Passo 3: Testar conexão
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('3. Conexão OK:', testResult)
      
      // Passo 4: Verificar tabela users
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      `
      console.log('4. Tabela users existe:', tables.length > 0)
      
      // Fechar conexão
      await prisma.$disconnect()
      
      return NextResponse.json({
        status: 'success',
        message: 'Prisma Simple funcionando',
        database: {
          connectionWorking: true,
          tableExists: tables.length > 0
        }
      })
      
    } catch (error) {
      console.log('❌ Erro com instância do Prisma:', error)
      return NextResponse.json({
        error: 'Erro com instância do Prisma',
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
