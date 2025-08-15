import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== DEBUG PRISMA ===')
    
    // Teste 1: Verificar se o Prisma Client foi gerado
    console.log('1. Verificando Prisma Client...')
    try {
      console.log('✅ Prisma Client disponível:', typeof prisma)
      console.log('✅ Métodos disponíveis:', Object.keys(prisma))
    } catch (error) {
      console.log('❌ Erro no Prisma Client:', error)
      return NextResponse.json({ error: 'Prisma Client não disponível' }, { status: 500 })
    }
    
    // Teste 2: Verificar conexão
    console.log('2. Testando conexão...')
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Conexão OK:', result)
    } catch (error) {
      console.log('❌ Erro de conexão:', error)
      return NextResponse.json({ error: 'Erro de conexão' }, { status: 500 })
    }
    
    // Teste 3: Verificar se a tabela users existe
    console.log('3. Verificando tabela users...')
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `
      console.log('✅ Tabela users existe:', tables.length > 0)
      
      if (tables.length === 0) {
        return NextResponse.json({ error: 'Tabela users não existe' }, { status: 500 })
      }
    } catch (error) {
      console.log('❌ Erro ao verificar tabela:', error)
      return NextResponse.json({ error: 'Erro ao verificar tabela' }, { status: 500 })
    }
    
    // Teste 4: Verificar estrutura da tabela
    console.log('4. Verificando estrutura da tabela...')
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      console.log('✅ Colunas da tabela:', columns)
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error)
    }
    
    // Teste 5: Tentar buscar com Prisma
    console.log('5. Testando busca com Prisma...')
    try {
      const users = await prisma.user.findMany({ take: 1 })
      console.log('✅ Busca OK, usuários encontrados:', users.length)
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
      return NextResponse.json({ 
        error: 'Erro na busca Prisma',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
    // Teste 6: Tentar inserir com SQL direto
    console.log('6. Testando inserção com SQL...')
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const insertResult = await prisma.$executeRaw`
        INSERT INTO users (id, email, name, password, role)
        VALUES (gen_random_uuid()::text, ${testEmail}, 'Test User', 'test_password', 'USER')
      `
      console.log('✅ Inserção SQL OK:', insertResult)
      
      // Deletar o usuário de teste
      await prisma.$executeRaw`DELETE FROM users WHERE email = ${testEmail}`
      console.log('✅ Usuário de teste deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção SQL:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
    }
    
    // Teste 7: Tentar inserir com Prisma
    console.log('7. Testando inserção com Prisma...')
    try {
      const testEmail = `test-prisma-${Date.now()}@example.com`
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
          password: 'test_password',
          role: 'USER'
        }
      })
      console.log('✅ Inserção Prisma OK:', user.id)
      
      // Deletar o usuário de teste
      await prisma.user.delete({ where: { id: user.id } })
      console.log('✅ Usuário de teste Prisma deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção Prisma:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
      return NextResponse.json({ 
        error: 'Erro na inserção Prisma',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Todos os testes passaram'
    })
    
  } catch (error) {
    console.error('❌ Erro geral no debug:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
