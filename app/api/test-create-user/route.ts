import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE CRIAÇÃO DE USUÁRIO ===")
    
    const body = await request.json()
    const { email, password, name } = body
    
    console.log("Dados:", { email, name })
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("Senha hasheada")
    
    // Criar usuário com dados mínimos
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
    console.error("❌ Erro na criação:", error)
    return NextResponse.json(
      { error: "Erro na criação", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
