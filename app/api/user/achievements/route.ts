import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Buscar achievements do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar todos os achievements disponíveis
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" }
    })

    // Buscar achievements desbloqueados pelo usuário
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true
      }
    })

    // Combinar achievements disponíveis com status do usuário
    const achievementsWithStatus = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
        requirement: achievement.requirement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
        createdAt: achievement.createdAt,
        updatedAt: achievement.updatedAt
      }
    })

    return NextResponse.json(achievementsWithStatus)
  } catch (error) {
    console.error("Erro ao buscar achievements:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Desbloquear achievement para o usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { achievementId } = body

    if (!achievementId) {
      return NextResponse.json(
        { error: "ID do achievement é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o achievement existe
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    })

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o usuário já desbloqueou este achievement
    const existingUserAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId: achievementId
        }
      }
    })

    if (existingUserAchievement) {
      return NextResponse.json(
        { error: "Achievement já foi desbloqueado" },
        { status: 400 }
      )
    }

    // Criar o user achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId: session.user.id,
        achievementId: achievementId,
      },
      include: {
        achievement: true
      }
    })

    // Adicionar XP ao usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true }
    })

    if (user) {
      const newXP = user.xp + achievement.xpReward
      const newLevel = calculateLevel(newXP)

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: newXP,
          level: newLevel,
        }
      })
    }

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "achievement_unlocked",
        details: {
          achievementId: achievementId,
          achievementName: achievement.name,
          xpReward: achievement.xpReward,
        }
      }
    })

    return NextResponse.json({
      success: true,
      achievement: userAchievement,
      xpGained: achievement.xpReward
    })
  } catch (error) {
    console.error("Erro ao desbloquear achievement:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Função para calcular nível baseado no XP
function calculateLevel(xp: number): number {
  const levels = [
    { level: 1, xpRequired: 0 },
    { level: 2, xpRequired: 100 },
    { level: 3, xpRequired: 250 },
    { level: 4, xpRequired: 450 },
    { level: 5, xpRequired: 700 },
    { level: 6, xpRequired: 1000 },
    { level: 7, xpRequired: 1350 },
    { level: 8, xpRequired: 1750 },
    { level: 9, xpRequired: 2200 },
    { level: 10, xpRequired: 4200 },
  ]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) {
      return levels[i].level
    }
  }

  return 1
}
