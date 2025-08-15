import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTE SIMPLIFICADO DE SIGNUP ===")
    
    const body = await request.json()
    console.log("Body recebido:", body)
    
    const { name, email, password } = body
    
    if (!name || !email || !password) {
      return NextResponse.json({
        error: "Dados obrigatórios faltando",
        required: ["name", "email", "password"],
        received: { name: !!name, email: !!email, password: !!password }
      }, { status: 400 })
    }
    
    console.log("Dados básicos OK, testando bcrypt...")
    
    // Teste do bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Bcrypt funcionou, senha hasheada")
    
    console.log("Testando conexão com Prisma...")
    
    // Teste simples do Prisma
    const testUser = await prisma.user.findFirst()
    console.log("Prisma funcionou, usuários encontrados:", testUser ? 1 : 0)
    
    return NextResponse.json({
      message: "Teste simplificado OK",
      bcrypt: "funcionando",
      prisma: "funcionando",
      userCount: testUser ? 1 : 0
    })
    
  } catch (error) {
    console.error("Erro no teste simplificado:", error)
    
    return NextResponse.json({
      error: "Erro no teste",
      message: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
