import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST CONNECTION ===')
    console.log('1. Testando conexão com banco...')
    
    // Testar importação do Prisma
    const { PrismaClient } = await import('@prisma/client')
    console.log('2. PrismaClient importado com sucesso')
    
    // Criar instância
    const prisma = new PrismaClient()
    console.log('3. Instância do Prisma criada')
    
    // Testar conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('4. Conexão OK:', result)
    
    // Verificar tabela users
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `
    console.log('5. Tabela users existe:', tables.length > 0)
    
    // Fechar conexão
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexão com banco funcionando!',
      database: {
        connectionWorking: true,
        tableExists: tables.length > 0,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro na conexão com banco',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
