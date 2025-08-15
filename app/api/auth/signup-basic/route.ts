import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP BASIC ===")
    
    const body = await request.json()
    console.log("Dados recebidos:", { name: body.name, email: body.email })
    
    const { name, email, password } = body
    
    if (!name || !email || !password) {
      return NextResponse.json({
        error: "Dados obrigatórios faltando"
      }, { status: 400 })
    }
    
    console.log("Dados básicos OK, importando Prisma...")
    
    // Importação dinâmica do Prisma
    const { prisma } = await import('@/lib/prisma')
    console.log("Prisma importado dinamicamente")
    
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
    
    // Importação dinâmica do bcrypt
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Senha hasheada com sucesso")

    console.log("Criando usuário no banco de dados...")
    
    // Criar usuário com apenas campos obrigatórios
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
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
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Erro no signup basic:", error)
    
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
