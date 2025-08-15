import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("=== TESTE DE ESTRUTURA DA TABELA ===")
    
    // Verificar se há dados na tabela
    const userCount = await prisma.user.count()
    console.log("✅ Contagem de usuários:", userCount)
    
    // Tentar buscar um usuário para ver a estrutura
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
      }
    })
    console.log("✅ Estrutura do usuário:", users)
    
    return NextResponse.json({
      success: true,
      userCount: userCount,
      userStructure: users
    })
    
  } catch (error) {
    console.error("❌ Erro ao verificar estrutura:", error)
    return NextResponse.json(
      { error: "Erro ao verificar estrutura", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
