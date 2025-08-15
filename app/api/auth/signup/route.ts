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
    console.log("=== SIGNUP REQUEST ===")
    const body = await request.json()
    console.log("Dados recebidos:", { name: body.name, email: body.email })

    const { name, email, password } = signupSchema.parse(body)

    // Verificar se o usuário já existe
    console.log("Verificando usuário existente...")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("❌ Usuário já existe")
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      )
    }

    // Hash da senha
    console.log("Criando hash da senha...")
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    console.log("Criando usuário...")
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

    console.log("✅ Usuário criado com sucesso:", user.id)
    return NextResponse.json({
      message: "Usuário criado com sucesso",
      user
    })

  } catch (error) {
    console.error("❌ Erro no signup:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}