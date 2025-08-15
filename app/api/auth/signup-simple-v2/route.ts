import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP SIMPLE V2 ===")
    
    // Passo 1: Verificar se conseguimos receber os dados
    let body
    try {
      body = await request.json()
      console.log("✅ Passo 1: Dados recebidos:", { name: body.name, email: body.email })
    } catch (error) {
      console.log("❌ Passo 1: Erro ao parsear JSON:", error)
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Passo 2: Verificar se temos os campos necessários
    if (!body.name || !body.email || !body.password) {
      console.log("❌ Passo 2: Campos obrigatórios ausentes")
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    console.log("✅ Passo 2: Campos obrigatórios presentes")

    // Passo 3: Testar bcrypt
    try {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(body.password, 12)
      console.log("✅ Passo 3: Hash da senha criado com sucesso")
    } catch (error) {
      console.log("❌ Passo 3: Erro com bcrypt:", error)
      return NextResponse.json(
        { error: "Erro ao processar senha" },
        { status: 500 }
      )
    }

    // Passo 4: Testar importação do Prisma
    try {
      const { prisma } = await import('@/lib/prisma')
      console.log("✅ Passo 4: Prisma importado com sucesso")
    } catch (error) {
      console.log("❌ Passo 4: Erro ao importar Prisma:", error)
      return NextResponse.json(
        { error: "Erro de configuração do banco de dados" },
        { status: 500 }
      )
    }

    // Passo 5: Testar conexão com banco
    try {
      const { prisma } = await import('@/lib/prisma')
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log("✅ Passo 5: Conexão com banco OK:", testResult)
    } catch (error) {
      console.log("❌ Passo 5: Erro de conexão com banco:", error)
      return NextResponse.json(
        { error: "Erro de conexão com banco de dados" },
        { status: 500 }
      )
    }

    // Por enquanto, retornar sucesso sem criar usuário
    console.log("✅ Todos os testes passaram - retornando sucesso simulado")
    
    return NextResponse.json({
      message: "Teste de signup bem-sucedido (usuário não criado)",
      user: {
        id: "test-id",
        name: body.name,
        email: body.email,
        role: "USER"
      }
    })

  } catch (error) {
    console.error("❌ Erro geral no signup:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
