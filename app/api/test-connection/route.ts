import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("=== TESTE DE CONEXÃO ===")
    
    // Teste 1: Conexão básica
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Conexão OK:", result)
    
    // Teste 2: Verificar se a tabela users existe (SQLite)
    let tableExists = false;
    try {
      const tableCheck = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='User'`
      tableExists = Array.isArray(tableCheck) && tableCheck.length > 0;
    } catch (error) {
      console.log("Erro ao verificar tabela:", error);
    }
    console.log("✅ Tabela users existe:", tableExists)
    
    // Teste 3: Contar usuários
    const userCount = await prisma.user.count()
    console.log("✅ Contagem de usuários:", userCount)
    
    return NextResponse.json({
      success: true,
      connection: "OK",
      tableExists: tableExists[0]?.exists || false,
      userCount: userCount
    })
    
  } catch (error) {
    console.error("❌ Erro na conexão:", error)
    return NextResponse.json(
      { error: "Erro na conexão", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
