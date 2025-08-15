import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SIGNUP STEP BY STEP ===')
    
    const body = await request.json()
    console.log('1. Dados recebidos:', { name: body.name, email: body.email })
    
    // Teste 1: Conexão com banco
    console.log('2. Testando conexão com banco...')
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Conexão OK:', testResult)
    } catch (error) {
      console.log('❌ Erro de conexão:', error)
      return NextResponse.json({ error: 'Erro de conexão com banco' }, { status: 500 })
    }
    
    // Teste 2: Verificar se tabela users existe
    console.log('3. Verificando tabela users...')
    try {
      const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
      console.log('✅ Tabela users existe, total:', users)
    } catch (error) {
      console.log('❌ Erro ao acessar tabela users:', error)
      return NextResponse.json({ error: 'Tabela users não existe' }, { status: 500 })
    }
    
    // Teste 3: Verificar estrutura da tabela
    console.log('4. Verificando estrutura da tabela...')
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `
      console.log('✅ Colunas da tabela:', columns)
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura:', error)
    }
    
    // Teste 4: Verificar se usuário já existe
    console.log('5. Verificando usuário existente...')
    try {
      const existingUser = await prisma.$queryRaw`
        SELECT id, email FROM users WHERE email = ${body.email}
      `
      console.log('✅ Verificação OK, usuário existe:', existingUser.length > 0)
      
      if (existingUser.length > 0) {
        return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 })
      }
    } catch (error) {
      console.log('❌ Erro ao verificar usuário:', error)
      return NextResponse.json({ error: 'Erro ao verificar usuário' }, { status: 500 })
    }
    
    // Teste 5: Hash da senha
    console.log('6. Criando hash da senha...')
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12)
      console.log('✅ Hash criado com sucesso')
    } catch (error) {
      console.log('❌ Erro ao criar hash:', error)
      return NextResponse.json({ error: 'Erro ao processar senha' }, { status: 500 })
    }
    
    // Teste 6: Tentar inserir com SQL direto
    console.log('7. Tentando inserir com SQL direto...')
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12)
      const testEmail = `test-${Date.now()}@example.com`
      
      const insertResult = await prisma.$executeRaw`
        INSERT INTO users (id, email, name, password, role)
        VALUES (gen_random_uuid()::text, ${testEmail}, ${body.name}, ${hashedPassword}, 'USER')
      `
      console.log('✅ Inserção SQL OK:', insertResult)
      
      // Deletar o usuário de teste
      await prisma.$executeRaw`DELETE FROM users WHERE email = ${testEmail}`
      console.log('✅ Usuário de teste deletado')
      
    } catch (error) {
      console.log('❌ Erro na inserção SQL:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
      return NextResponse.json({ 
        error: 'Erro na inserção SQL',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
    // Teste 7: Tentar inserir com Prisma
    console.log('8. Tentando inserir com Prisma...')
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12)
      const testEmail = `test-prisma-${Date.now()}@example.com`
      
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: testEmail,
          password: hashedPassword,
          role: 'USER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      console.log('✅ Inserção Prisma OK:', user.id)
      
      // Deletar o usuário de teste
      await prisma.user.delete({ where: { id: user.id } })
      console.log('✅ Usuário de teste Prisma deletado')
      
      return NextResponse.json({
        message: 'Teste de inserção bem-sucedido',
        user: user
      })
      
    } catch (error) {
      console.log('❌ Erro na inserção Prisma:', error)
      console.log('❌ Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido')
      return NextResponse.json({ 
        error: 'Erro na inserção Prisma',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erro geral no debug:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
