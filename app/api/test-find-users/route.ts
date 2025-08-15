import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== TESTE BUSCA DE USUÁRIOS ===")
    
    // Buscar usuários existentes
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log("✅ Usuários encontrados:", users.length)
    console.log("Usuários:", users)
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    })
    
  } catch (error) {
    console.error("❌ Erro na busca:", error)
    return NextResponse.json(
      { error: "Erro na busca", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
