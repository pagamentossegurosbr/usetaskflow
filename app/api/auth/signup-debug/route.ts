import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG SIGNUP ===")
    
    // Teste 1: Receber dados
    console.log("1. Recebendo dados...")
    const body = await request.json()
    console.log("Dados recebidos:", body)
    
    // Teste 2: Importar bcrypt
    console.log("2. Testando import do bcrypt...")
    let bcrypt
    try {
      bcrypt = await import('bcryptjs')
      console.log("✅ bcrypt importado com sucesso")
    } catch (error) {
      console.log("❌ Erro ao importar bcrypt:", error)
      return NextResponse.json({ error: "Erro ao importar bcrypt", details: error }, { status: 500 })
    }
    
    // Teste 3: Testar hash
    console.log("3. Testando hash...")
    try {
      const hashedPassword = await bcrypt.hash("teste123", 10)
      console.log("✅ Hash criado com sucesso")
    } catch (error) {
      console.log("❌ Erro ao criar hash:", error)
      return NextResponse.json({ error: "Erro ao criar hash", details: error }, { status: 500 })
    }
    
    // Teste 4: Importar Prisma
    console.log("4. Testando import do Prisma...")
    let prisma
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma')
      prisma = prismaClient
      console.log("✅ Prisma importado com sucesso")
    } catch (error) {
      console.log("❌ Erro ao importar Prisma:", error)
      return NextResponse.json({ error: "Erro ao importar Prisma", details: error }, { status: 500 })
    }
    
    // Teste 5: Testar conexão com banco
    console.log("5. Testando conexão com banco...")
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Conexão com banco OK:", result)
    } catch (error) {
      console.log("❌ Erro na conexão com banco:", error)
      return NextResponse.json({ error: "Erro na conexão com banco", details: error }, { status: 500 })
    }
    
    console.log("=== TODOS OS TESTES PASSARAM ===")
    
    return NextResponse.json({
      message: "Debug concluído com sucesso",
      tests: ["dados", "bcrypt", "hash", "prisma", "banco"],
      status: "OK"
    })
    
  } catch (error) {
    console.error("Erro no debug:", error)
    return NextResponse.json({
      error: "Erro no debug",
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
