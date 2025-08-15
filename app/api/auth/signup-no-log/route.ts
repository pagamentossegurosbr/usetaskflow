import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP NO LOG ===")
    
    const body = await request.json()
    console.log("Dados recebidos:", { name: body.name, email: body.email })
    
    const { name, email, password } = body
    
    if (!name || !email || !password) {
      return NextResponse.json({
        error: "Dados obrigatórios faltando",
        required: ["name", "email", "password"],
        received: { name: !!name, email: !!email, password: !!password }
      }, { status: 400 })
    }
    
    console.log("Dados básicos OK, verificando usuário existente...")
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Senha hasheada com sucesso")

    console.log("Criando usuário no banco de dados...")
    
    // Criar usuário
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

    console.log("Signup concluído com sucesso (sem log)")
    
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
    console.error("Erro no signup no log:", error)
    
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
