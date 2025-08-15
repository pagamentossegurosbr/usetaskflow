import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== DEBUG TODAS AS ROTAS ===')

    const results = {
      database: null,
      userLanguage: null,
      tasks: null,
      userSync: null,
      subscription: null
    }

    // Teste 1: Conexão com banco
    console.log('1. Testando conexão com banco...')
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      results.database = { status: 'success', data: testResult }
      console.log('✅ Conexão com banco OK')
    } catch (error) {
      results.database = { status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
      console.log('❌ Erro na conexão com banco:', error)
    }

    // Teste 2: Verificar tabela users
    console.log('2. Verificando tabela users...')
    try {
      const users = await prisma.user.findMany({ take: 1 })
      results.userSync = { status: 'success', count: users.length }
      console.log('✅ Tabela users OK, usuários encontrados:', users.length)
    } catch (error) {
      results.userSync = { status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
      console.log('❌ Erro na tabela users:', error)
    }

    // Teste 3: Verificar se há usuários
    console.log('3. Verificando usuários existentes...')
    try {
      const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
      console.log('✅ Total de usuários:', userCount)
    } catch (error) {
      console.log('❌ Erro ao contar usuários:', error)
    }

    // Teste 4: Verificar estrutura da tabela
    console.log('4. Verificando estrutura da tabela...')
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      console.log('✅ Colunas da tabela users:', columns)
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error)
    }

    // Teste 5: Verificar se há outras tabelas
    console.log('5. Verificando outras tabelas...')
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      console.log('✅ Todas as tabelas:', tables)
    } catch (error) {
      console.log('❌ Erro ao verificar tabelas:', error)
    }

    return NextResponse.json({
      status: 'success',
      message: 'Debug de todas as rotas concluído',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro geral no debug:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
