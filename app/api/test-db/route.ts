import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("Testando conexão com banco de dados...")
    
    // Teste simples de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("Conexão bem-sucedida:", result)
    
    // Converter BigInt para Number para serialização JSON
    const serializedResult = Array.isArray(result) 
      ? result.map(row => {
          const newRow: any = {};
          Object.keys(row).forEach(key => {
            const value = (row as any)[key];
            newRow[key] = typeof value === 'bigint' ? Number(value) : value;
          });
          return newRow;
        })
      : result;
    
    return NextResponse.json({
      message: "Conexão com banco de dados OK",
      result: serializedResult
    })
    
  } catch (error) {
    console.error("Erro na conexão com banco de dados:", error)
    
    return NextResponse.json({
      error: "Erro na conexão com banco de dados",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
