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
    console.log("Iniciando processo de signup...")
    
    const body = await request.json()
    console.log("Dados recebidos:", { name: body.name, email: body.email })

    // Validação dos dados
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      console.log("Erro de validação:", validation.error.errors)
      return NextResponse.json(
        { 
          error: "Dados inválidos", 
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data
    console.log("Dados validados com sucesso")

    // Verificar se o usuário já existe
    console.log("Verificando se usuário já existe...")
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })

    if (existingUser) {
      console.log("Usuário já existe:", existingUser.email)
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    console.log("Usuário não existe, criando hash da senha...")
    // Hash da senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log("Senha hasheada com sucesso")

    // Criar usuário
    console.log("Criando usuário no banco de dados...")
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
    console.log("Usuário criado com sucesso:", user.id)

    console.log("Signup concluído com sucesso")
    return NextResponse.json({
      message: "Conta criada com sucesso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Erro detalhado no cadastro:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    
    // Erro específico do Prisma para email duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.log("Erro de constraint único detectado")
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }

    // Erro de conexão com banco de dados
    if (error instanceof Error && error.message.includes("connect")) {
      console.log("Erro de conexão com banco de dados")
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados" },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}