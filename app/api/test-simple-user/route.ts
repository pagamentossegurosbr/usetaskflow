import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE SIMPLES DE CRIAÇÃO DE USUÁRIO ===")
    
    // Tentar criar um usuário com apenas o campo id
    const user = await prisma.user.create({
      data: {},
      select: {
        id: true,
      }
    })
    
    console.log("✅ Usuário criado com sucesso:", user)
    
    return NextResponse.json({
      success: true,
      user: user
    })
    
  } catch (error) {
    console.error("❌ Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
