import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { debug } from "@/lib/debug"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Resetar dados do usuário no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        level: 1,
        xp: 0,
        // Não resetar perfil básico (name, email, bio, title, badges, theme, etc.)
        // Apenas dados de progresso
      }
    })

    // Deletar todas as tarefas do usuário
    await prisma.task.deleteMany({
      where: { userId: session.user.id }
    })

    // Deletar conquistas do usuário
    await prisma.userAchievement.deleteMany({
      where: { userId: session.user.id }
    })

    // Deletar dados de cooldown
    await prisma.cooldown.deleteMany({
      where: { userId: session.user.id }
    })

    // Log da ação para auditoria
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "user_reset_data",
        details: {
          resetAt: new Date().toISOString(),
          previousLevel: updatedUser.level,
          previousXP: updatedUser.xp,
        }
      }
    })

    debug.log(`Usuário ${updatedUser.email} resetou seus dados. Nível: ${updatedUser.level}, XP: ${updatedUser.xp}`)

    return NextResponse.json({ 
      success: true, 
      message: "Dados resetados com sucesso",
      user: {
        level: updatedUser.level,
        xp: updatedUser.xp,
        email: updatedUser.email
      }
    })

  } catch (error) {
    console.error("Erro ao resetar dados do usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}