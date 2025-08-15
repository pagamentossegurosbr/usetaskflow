import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP SIMPLE TEST ===")
    
    // Passo 1: Verificar se conseguimos receber dados
    console.log("1. Recebendo dados...")
    const body = await request.json()
    console.log("✅ Dados recebidos:", { name: body.name, email: body.email })
    
    // Passo 2: Verificar se temos as dependências
    console.log("2. Verificando dependências...")
    
    try {
      const { prisma } = await import('@/lib/prisma')
      console.log("✅ Prisma importado com sucesso")
      
      // Teste básico de conexão
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Conexão com banco OK:", testResult)
      
      // Teste de busca na tabela users
      const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
      console.log("✅ Tabela users acessível:", users)
      
    } catch (prismaError) {
      console.log("❌ Erro com Prisma:", prismaError)
      return NextResponse.json({
        error: "Erro de banco de dados",
        details: prismaError instanceof Error ? prismaError.message : "Erro desconhecido"
      }, { status: 500 })
    }
    
    try {
      const bcrypt = await import('bcryptjs')
      console.log("✅ bcrypt importado com sucesso")
      
      const hashedPassword = await bcrypt.hash("test123", 12)
      console.log("✅ Hash criado com sucesso")
      
    } catch (bcryptError) {
      console.log("❌ Erro com bcrypt:", bcryptError)
      return NextResponse.json({
        error: "Erro ao processar senha",
        details: bcryptError instanceof Error ? bcryptError.message : "Erro desconhecido"
      }, { status: 500 })
    }
    
    return NextResponse.json({
      message: "Teste de signup simples bem-sucedido",
      receivedData: { name: body.name, email: body.email },
      tests: {
        dataReceived: true,
        prismaWorking: true,
        bcryptWorking: true
      }
    })
    
  } catch (error) {
    console.error("❌ Erro geral no signup simples:", error)
    return NextResponse.json({
      error: "Erro interno",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
