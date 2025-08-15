import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SIGNUP STEP BY STEP ===')
    
    // Passo 1: Verificar se o request tem dados
    console.log('1. Verificando dados do request...')
    let body
    try {
      body = await request.json()
      console.log('✅ Request body recebido:', { name: body.name, email: body.email })
    } catch (error) {
      console.log('❌ Erro ao parsear JSON:', error)
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Passo 2: Validar dados com Zod
    console.log('2. Validando dados com Zod...')
    let validatedData
    try {
      validatedData = signupSchema.parse(body)
      console.log('✅ Dados validados com sucesso')
    } catch (error) {
      console.log('❌ Erro de validação Zod:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "Dados inválidos", 
          details: error.errors 
        }, { status: 400 })
      }
      return NextResponse.json({ error: 'Erro de validação' }, { status: 400 })
    }

    const { name, email, password } = validatedData

    // Passo 3: Verificar conexão com banco
    console.log('3. Verificando conexão com banco...')
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Conexão com banco OK:', testResult)
    } catch (error) {
      console.log('❌ Erro de conexão com banco:', error)
      return NextResponse.json({ 
        error: 'Erro de conexão com banco de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Passo 4: Verificar se tabela users existe
    console.log('4. Verificando se tabela users existe...')
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
      console.log('❌ Erro ao verificar tabela users:', error)
      return NextResponse.json({ 
        error: 'Erro ao verificar tabela users',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Passo 5: Verificar estrutura da tabela
    console.log('5. Verificando estrutura da tabela...')
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

    // Passo 6: Verificar se usuário já existe
    console.log('6. Verificando se usuário já existe...')
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      console.log('✅ Verificação de usuário existente OK')
      if (existingUser) {
        console.log('❌ Usuário já existe')
        return NextResponse.json({ error: "Usuário já existe" }, { status: 409 })
      }
    } catch (error) {
      console.log('❌ Erro ao verificar usuário existente:', error)
      return NextResponse.json({ 
        error: 'Erro ao verificar usuário existente',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Passo 7: Criar hash da senha
    console.log('7. Criando hash da senha...')
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
      console.log('✅ Hash da senha criado com sucesso')
    } catch (error) {
      console.log('❌ Erro ao criar hash da senha:', error)
      return NextResponse.json({ 
        error: 'Erro ao processar senha',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Passo 8: Tentar criar usuário com Prisma
    console.log('8. Tentando criar usuário com Prisma...')
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER"
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      console.log('✅ Usuário criado com sucesso:', user.id)
      
      // Passo 9: Deletar usuário de teste
      console.log('9. Deletando usuário de teste...')
      await prisma.user.delete({ where: { id: user.id } })
      console.log('✅ Usuário de teste deletado')

      return NextResponse.json({
        message: 'Teste de signup bem-sucedido',
        user: user,
        steps: {
          requestParsed: true,
          dataValidated: true,
          databaseConnected: true,
          tableExists: true,
          userNotExists: true,
          passwordHashed: true,
          userCreated: true,
          userDeleted: true
        }
      })

    } catch (error) {
      console.log('❌ Erro ao criar usuário com Prisma:', error)
      console.log('❌ Detalhes do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
      
      // Tentar criar com SQL direto para debug
      console.log('10. Tentando criar usuário com SQL direto...')
      try {
        const testEmail = `test-${Date.now()}@example.com`
        const insertResult = await prisma.$executeRaw`
          INSERT INTO users (id, email, name, password, role)
          VALUES (gen_random_uuid()::text, ${testEmail}, ${name}, ${hashedPassword}, 'USER')
        `
        console.log('✅ Inserção SQL OK:', insertResult)
        
        // Deletar usuário de teste
        await prisma.$executeRaw`DELETE FROM users WHERE email = ${testEmail}`
        console.log('✅ Usuário de teste SQL deletado')
        
        return NextResponse.json({
          message: 'Teste de signup com SQL bem-sucedido',
          steps: {
            requestParsed: true,
            dataValidated: true,
            databaseConnected: true,
            tableExists: true,
            userNotExists: true,
            passwordHashed: true,
            prismaFailed: true,
            sqlSucceeded: true
          }
        })
        
      } catch (sqlError) {
        console.log('❌ Erro na inserção SQL:', sqlError)
        return NextResponse.json({
          error: 'Erro ao criar usuário',
          details: {
            prismaError: error instanceof Error ? error.message : 'Erro desconhecido',
            sqlError: sqlError instanceof Error ? sqlError.message : 'Erro desconhecido'
          }
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral no debug signup:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
