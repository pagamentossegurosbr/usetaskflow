import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== DEBUG BANCO DE DADOS ===')
    
    // Teste 1: Conexão básica
    console.log('1. Testando conexão...')
    const testResult = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão OK:', testResult)
    
    // Teste 2: Verificar todas as tabelas
    console.log('2. Verificando todas as tabelas...')
    const allTables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('✅ Todas as tabelas:', allTables)
    
    // Teste 3: Verificar se tabela users existe
    console.log('3. Verificando tabela users...')
    const usersTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `
    console.log('✅ Tabela users existe:', usersTable.length > 0)
    
    if (usersTable.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Tabela users não existe',
        allTables: allTables
      })
    }
    
    // Teste 4: Verificar estrutura da tabela users
    console.log('4. Verificando estrutura da tabela users...')
    const userColumns = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    console.log('✅ Colunas da tabela users:', userColumns)
    
    // Teste 5: Verificar se há dados na tabela
    console.log('5. Verificando dados na tabela...')
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
    console.log('✅ Total de usuários:', userCount)
    
    // Teste 6: Tentar buscar com Prisma
    console.log('6. Testando busca com Prisma...')
    try {
      const users = await prisma.user.findMany({ take: 1 })
      console.log('✅ Busca Prisma OK, usuários encontrados:', users.length)
      if (users.length > 0) {
        console.log('✅ Exemplo de usuário:', {
          id: users[0].id,
          email: users[0].email,
          name: users[0].name,
          role: users[0].role
        })
      }
    } catch (error) {
      console.log('❌ Erro na busca Prisma:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
    }
    
    // Teste 7: Tentar inserir com SQL direto
    console.log('7. Testando inserção com SQL...')
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const insertResult = await prisma.$executeRaw`
        INSERT INTO users (id, email, name, password, role, level, xp, is_active, created_at, updated_at)
        VALUES (gen_random_uuid()::text, ${testEmail}, 'Test User', 'test_password', 'USER', 1, 0, true, NOW(), NOW())
      `
      console.log('✅ Inserção SQL OK:', insertResult)
      
      // Deletar o usuário de teste
      await prisma.$executeRaw`DELETE FROM users WHERE email = ${testEmail}`
      console.log('✅ Usuário de teste deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção SQL:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
    }
    
    // Teste 8: Tentar inserir com Prisma
    console.log('8. Testando inserção com Prisma...')
    try {
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User Prisma',
          email: `test-prisma-${Date.now()}@example.com`,
          password: 'test_password',
          role: 'USER',
          level: 1,
          xp: 0,
          isActive: true
        }
      })
      console.log('✅ Inserção Prisma OK:', testUser.id)
      
      // Deletar o usuário de teste
      await prisma.user.delete({ where: { id: testUser.id } })
      console.log('✅ Usuário de teste Prisma deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção Prisma:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
    }
    
    return NextResponse.json({
      status: 'success',
      allTables: allTables,
      userColumns: userColumns,
      userCount: userCount,
      message: 'Debug concluído'
    })
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
