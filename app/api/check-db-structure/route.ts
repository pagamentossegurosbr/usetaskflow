import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== VERIFICANDO ESTRUTURA DO BANCO ===')
    
    // Teste 1: Conexão básica
    console.log('1. Testando conexão...')
    const testResult = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão OK:', testResult)
    
    // Teste 2: Verificar tabelas existentes
    console.log('2. Verificando tabelas...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('✅ Tabelas encontradas:', tables)
    
    // Teste 3: Verificar estrutura da tabela users
    console.log('3. Verificando estrutura da tabela users...')
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    console.log('✅ Colunas da tabela users:', userColumns)
    
    // Teste 4: Tentar buscar usuários
    console.log('4. Tentando buscar usuários...')
    try {
      const users = await prisma.user.findMany({ take: 1 })
      console.log('✅ Busca OK, usuários encontrados:', users.length)
    } catch (error) {
      console.log('❌ Erro ao buscar usuários:', error)
    }
    
    // Teste 5: Verificar se conseguimos inserir
    console.log('5. Testando inserção...')
    try {
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'test_password',
          role: 'USER'
        }
      })
      console.log('✅ Inserção OK:', testUser.id)
      
      // Deletar o usuário de teste
      await prisma.user.delete({ where: { id: testUser.id } })
      console.log('✅ Usuário de teste deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
    }
    
    return NextResponse.json({
      status: 'success',
      tables: tables,
      userColumns: userColumns,
      message: 'Verificação concluída'
    })
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
