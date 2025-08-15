import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TEST DATABASE CONFIG ===')
    
    // Passo 1: Verificar se DATABASE_URL existe
    const databaseUrl = process.env.DATABASE_URL
    console.log('1. DATABASE_URL existe:', !!databaseUrl)
    
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL não configurada',
        status: 'error'
      }, { status: 500 })
    }
    
    // Passo 2: Verificar formato da URL
    try {
      const url = new URL(databaseUrl)
      console.log('2. URL válida:', {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        database: url.pathname.split('/').pop()
      })
    } catch (error) {
      console.log('❌ URL inválida:', error)
      return NextResponse.json({
        error: 'DATABASE_URL inválida',
        status: 'error'
      }, { status: 500 })
    }
    
    // Passo 3: Tentar importar Prisma
    try {
      const { prisma } = await import('@/lib/prisma')
      console.log('3. Prisma importado com sucesso')
      
      // Passo 4: Testar conexão
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('4. Conexão OK:', testResult)
      
      // Passo 5: Verificar tabela users
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      `
      console.log('5. Tabela users existe:', tables.length > 0)
      
      // Passo 6: Verificar estrutura da tabela
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      console.log('6. Colunas da tabela users:', columns)
      
      return NextResponse.json({
        status: 'success',
        message: 'Configuração do banco OK',
        database: {
          urlConfigured: true,
          urlValid: true,
          connectionWorking: true,
          tableExists: tables.length > 0,
          columns: columns
        }
      })
      
    } catch (error) {
      console.log('❌ Erro com Prisma/banco:', error)
      return NextResponse.json({
        error: 'Erro de conexão com banco',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      error: 'Erro geral',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      status: 'error'
    }, { status: 500 })
  }
}
