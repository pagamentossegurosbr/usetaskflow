import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST DB CREATION ===")
    
    // Teste 1: Conexão básica
    console.log("1. Testando conexão básica...")
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Conexão OK:", result)
    
    // Teste 2: Contar usuários existentes
    console.log("2. Contando usuários existentes...")
    const userCount = await prisma.user.count()
    console.log("✅ Usuários existentes:", userCount)
    
    // Teste 3: Buscar usuário específico
    console.log("3. Buscando usuário específico...")
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, name: true }
    })
    console.log("✅ Usuário encontrado:", testUser)
    
    // Teste 4: Tentar criar usuário
    console.log("4. Tentando criar usuário...")
    const newUser = await prisma.user.create({
      data: {
        name: "Teste DB",
        email: `teste-db-${Date.now()}@teste.com`,
        password: "teste123",
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })
    console.log("✅ Usuário criado:", newUser)
    
    // Teste 5: Deletar usuário de teste
    console.log("5. Deletando usuário de teste...")
    await prisma.user.delete({
      where: { id: newUser.id }
    })
    console.log("✅ Usuário deletado")
    
    return NextResponse.json({
      message: "Todos os testes passaram",
      tests: ["conexão", "contagem", "busca", "criação", "deleção"],
      userCount,
      testUser: testUser ? testUser.email : null
    })

  } catch (error) {
    console.error("Erro no teste de banco:", error)
    
    return NextResponse.json(
      { error: "Erro no teste de banco", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  }
}
