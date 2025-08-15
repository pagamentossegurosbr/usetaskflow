import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST TABLE ===')
    
    // Importar Prisma
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    // Listar todas as tabelas
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('1. Todas as tabelas:', allTables)
    
    // Verificar especificamente a tabela users
    const usersTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `
    console.log('2. Tabela users existe:', usersTable.length > 0)
    
    // Verificar se existe tabela User (maiúsculo)
    const userTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    `
    console.log('3. Tabela User (maiúsculo) existe:', userTable.length > 0)
    
    // Testar query direta na tabela users
    let userCount = 0
    try {
      const countResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
      userCount = Number(countResult[0]?.count || 0)
      console.log('4. Contagem de usuários na tabela users:', userCount)
    } catch (error) {
      console.log('❌ Erro ao contar usuários:', error)
    }
    
    // Fechar conexão
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      tables: allTables,
      usersTableExists: usersTable.length > 0,
      userTableExists: userTable.length > 0,
      userCount: userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar tabelas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
