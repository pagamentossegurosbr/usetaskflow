import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== CHECK TABLE STRUCTURE ===')
    
    // Importar Prisma
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Verificar estrutura da tabela users
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `
    console.log('1. Estrutura da tabela users:', columns)
    
    // Verificar constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `
    console.log('2. Constraints da tabela users:', constraints)
    
    // Verificar se há dados na tabela
    const sampleData = await prisma.$queryRaw`
      SELECT * FROM users LIMIT 1
    `
    console.log('3. Dados de exemplo:', sampleData)
    
    // Fechar conexão
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      columns: columns,
      constraints: constraints,
      sampleData: sampleData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar estrutura da tabela',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
