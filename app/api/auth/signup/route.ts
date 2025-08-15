import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP REQUEST START ===")
    
    // Passo 1: Verificar se conseguimos receber os dados
    let body
    try {
      body = await request.json()
      console.log("✅ Passo 1: Dados recebidos:", { name: body.name, email: body.email })
    } catch (error) {
      console.log("❌ Passo 1: Erro ao parsear JSON:", error)
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Passo 2: Validar dados
    let validatedData
    try {
      validatedData = signupSchema.parse(body)
      console.log("✅ Passo 2: Dados validados com sucesso")
    } catch (error) {
      console.log("❌ Passo 2: Erro de validação:", error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Dados inválidos", details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "Erro de validação" },
        { status: 400 }
      )
    }

    const { name, email, password } = validatedData

    // Passo 3: Verificar se conseguimos importar o Prisma
    let prisma
    try {
      const prismaModule = await import('@/lib/prisma')
      prisma = prismaModule.prisma
      console.log("✅ Passo 3: Prisma importado com sucesso")
    } catch (error) {
      console.log("❌ Passo 3: Erro ao importar Prisma:", error)
      return NextResponse.json(
        { error: "Erro de configuração do banco de dados" },
        { status: 500 }
      )
    }

    // Passo 4: Testar conexão com banco
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Passo 4: Conexão com banco OK:", testResult)
    } catch (error) {
      console.log("❌ Passo 4: Erro de conexão com banco:", error)
      return NextResponse.json(
        { error: "Erro de conexão com banco de dados" },
        { status: 500 }
      )
    }

    // Passo 5: Verificar se tabela users existe
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      `
      console.log("✅ Passo 5: Tabela users existe:", tables.length > 0)
      if (tables.length === 0) {
        return NextResponse.json(
          { error: "Tabela users não existe no banco" },
          { status: 500 }
        )
      }
    } catch (error) {
      console.log("❌ Passo 5: Erro ao verificar tabela users:", error)
      return NextResponse.json(
        { error: "Erro ao verificar estrutura do banco" },
        { status: 500 }
      )
    }

    // Passo 6: Verificar se usuário já existe
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      console.log("✅ Passo 6: Verificação de usuário existente OK")
      if (existingUser) {
        console.log("❌ Passo 6: Usuário já existe")
        return NextResponse.json(
          { error: "Usuário já existe" },
          { status: 409 }
        )
      }
    } catch (error) {
      console.log("❌ Passo 6: Erro ao verificar usuário existente:", error)
      return NextResponse.json(
        { error: "Erro ao verificar usuário existente" },
        { status: 500 }
      )
    }

    // Passo 7: Criar hash da senha
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 12)
      console.log("✅ Passo 7: Hash da senha criado com sucesso")
    } catch (error) {
      console.log("❌ Passo 7: Erro ao criar hash da senha:", error)
      return NextResponse.json(
        { error: "Erro ao processar senha" },
        { status: 500 }
      )
    }

    // Passo 8: Criar usuário
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
      console.log("✅ Passo 8: Usuário criado com sucesso:", user.id)
      
      return NextResponse.json({
        message: "Usuário criado com sucesso",
        user
      })
    } catch (error) {
      console.log("❌ Passo 8: Erro ao criar usuário:", error)
      console.log("❌ Detalhes do erro:", error instanceof Error ? error.message : 'Erro desconhecido')
      
      return NextResponse.json(
        { 
          error: "Erro ao criar usuário",
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("❌ Erro geral no signup:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}