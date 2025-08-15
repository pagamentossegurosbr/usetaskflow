import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== TESTE DE SCHEMA ===")
    
    // Teste 1: Conexão básica
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Conexão OK:", result)
    
    // Teste 2: Verificar estrutura da tabela users (SQLite)
    let tableInfo = [];
    try {
      tableInfo = await prisma.$queryRaw`PRAGMA table_info(User)`
    } catch (error) {
      console.log("Erro ao verificar estrutura da tabela:", error);
    }
    console.log("✅ Estrutura da tabela users:", tableInfo)
    
    // Teste 3: Tentar buscar um usuário sem especificar campos
    try {
      const users = await prisma.user.findMany({
        take: 1,
        select: { id: true, email: true, name: true }
      })
      console.log("✅ Busca básica OK:", users.length, "usuários")
    } catch (error) {
      console.error("❌ Erro na busca básica:", error)
    }
    
    return NextResponse.json({
      success: true,
      connection: "OK",
      tableStructure: tableInfo,
      message: "Schema testado com sucesso"
    })
    
  } catch (error) {
    console.error("❌ Erro no teste de schema:", error)
    return NextResponse.json(
      { error: "Erro no teste", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
