import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST IMPORT ===")
    
    // Teste 1: Importar Prisma
    console.log("1. Importando Prisma...")
    let prisma
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log("✅ Prisma importado com sucesso")
    } catch (error) {
      console.log("❌ Erro ao importar Prisma:", error)
      return NextResponse.json({ error: "Erro ao importar Prisma", details: error }, { status: 500 })
    }
    
    // Teste 2: Testar conexão
    console.log("2. Testando conexão...")
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Conexão OK:", result)
    } catch (error) {
      console.log("❌ Erro na conexão:", error)
      return NextResponse.json({ error: "Erro na conexão", details: error }, { status: 500 })
    }
    
    // Teste 3: Testar operação simples
    console.log("3. Testando operação simples...")
    try {
      const userCount = await prisma.user.count()
      console.log("✅ Contagem OK:", userCount)
    } catch (error) {
      console.log("❌ Erro na operação:", error)
      return NextResponse.json({ error: "Erro na operação", details: error }, { status: 500 })
    }
    
    return NextResponse.json({
      message: "Importação e conexão OK",
      tests: ["import", "conexão", "operação"],
      userCount: await prisma.user.count()
    })

  } catch (error) {
    console.error("Erro no teste de importação:", error)
    
    return NextResponse.json(
      { error: "Erro no teste de importação", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
