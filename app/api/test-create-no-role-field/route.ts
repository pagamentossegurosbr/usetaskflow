import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE CRIAÇÃO SEM ROLE FIELD ===")
    
    // Criar usuário sem especificar role (deve usar o default)
    const user = await prisma.user.create({
      data: {
        email: "teste" + Date.now() + "@teste.com"
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log("✅ Usuário criado:", user.id, "Role:", user.role)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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
