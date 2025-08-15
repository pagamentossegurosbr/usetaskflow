import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE MINIMALISTA ===")
    
    const body = await request.json()
    const { email, password, name } = body
    
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Dados obrigatórios" }, { status: 400 })
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Criar usuário com apenas campos essenciais
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        level: 1,
        xp: 0
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    console.log("✅ Usuário criado:", user.id)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
    
  } catch (error) {
    console.error("❌ Erro:", error)
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
