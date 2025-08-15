import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const signupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP FINAL ===")
    
    const body = await request.json()
    console.log("Dados recebidos:", { email: body.email, name: body.name })
    
    // Validação com Zod
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      console.log("Validação falhou:", validation.error.errors)
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validation.data
    console.log("Dados validados com sucesso")
    
    // Verificar se o usuário já existe (sem usar emailVerified)
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
    
    // Criar usuário (sem emailVerified)
    console.log("Criando usuário no banco de dados...")
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        level: 1,
        xp: 0,
        bio: "Novo usuário do TaskFlow",
        title: "Iniciante",
        theme: "dark",
        isActive: true,
        avatar: null,
        // Não incluir emailVerified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        createdAt: true,
      }
    })
    console.log("Usuário criado com sucesso:", user.id)
    
    // Log da criação
    console.log("Criando log de atividade...")
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "user_signup",
          details: {
            email: user.email,
            name: user.name,
            registrationMethod: "email"
          },
          ipAddress: request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        }
      })
      console.log("Log de atividade criado com sucesso")
    } catch (logError) {
      console.error("Erro ao criar log de atividade:", logError)
      // Não falhar o cadastro por causa do log
    }
    
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
  } finally {
    await prisma.$disconnect()
  }
}
