import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE CRIAÇÃO APENAS ID ===")
    
    // Criar usuário apenas com id (deve ser gerado automaticamente)
    const user = await prisma.user.create({
      data: {},
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
