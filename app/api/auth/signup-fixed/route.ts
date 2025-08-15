import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log("=== INÍCIO DO CADASTRO ===")
    
    const body = await request.json()
    console.log("Dados recebidos:", { email: body.email, name: body.name })
    
    const { email, password, name } = body
    
    // Validação básica
    if (!email || !password || !name) {
      console.log("Dados inválidos")
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios" },
        { status: 400 }
      )
    }
    
    if (password.length < 6) {
      console.log("Senha muito curta")
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }
    
    console.log("Validação passou")
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    
    if (existingUser) {
      console.log("Usuário já existe")
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }
    
    console.log("Usuário não existe, prosseguindo")
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("Senha hasheada")
    
    // Criar usuário com apenas campos obrigatórios
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        // Não incluir emailVerified para evitar o erro
        role: 'USER',
        level: 1,
        xp: 0,
        theme: 'dark',
        hideProfileEffects: false,
        isBanned: false,
        isActive: true,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        maxLevel: 3
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        level: true,
        xp: true
      }
    })
    
    console.log("Usuário criado com sucesso:", user.id)
    
    // Log de atividade
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'SIGNUP',
          details: 'Novo usuário cadastrado',
          ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
        }
      })
      console.log("Log de atividade criado")
    } catch (logError) {
      console.error("Erro ao criar log de atividade:", logError)
      // Não falhar o cadastro por causa do log
    }
    
    console.log("=== CADASTRO CONCLUÍDO COM SUCESSO ===")
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level,
        xp: user.xp
      }
    })
    
  } catch (error) {
    console.error("Erro detalhado no cadastro:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    
    // Erro específico do Prisma para email duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.log("Erro de constraint único detectado")
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      )
    }
    
    // Erro de conexão com banco de dados
    if (error instanceof Error && error.message.includes("connect")) {
      console.log("Erro de conexão com banco de dados")
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados" },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
