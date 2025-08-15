import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE CRIAÇÃO SIMPLES ===")
    
    // Criar usuário com dados fixos
    const user = await prisma.user.create({
      data: {
        email: "teste" + Date.now() + "@teste.com",
        password: "hashed_password",
        name: "Usuário Teste",
        role: "USER",
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
