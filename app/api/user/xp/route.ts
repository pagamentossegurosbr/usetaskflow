import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimiters, checkRateLimit, getRateLimitHeaders, getIPIdentifier } from '@/lib/rateLimiter'
import { debug } from "@/lib/debug"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Rate limiting para ganho de XP
    const identifier = session.user.email || getIPIdentifier(request);
    const rateLimitResult = checkRateLimit(rateLimiters.xpGain, identifier);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message || "Rate limit excedido" },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            ...getRateLimitHeaders(rateLimiters.xpGain, identifier)
          }
        }
      );
    }

    const body = await request.json()
    const { xpGain, reason, taskId } = body

    if (!xpGain || typeof xpGain !== 'number') {
      return NextResponse.json({ error: "XP inválido" }, { status: 400 })
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Calcular novo XP e nível
    const newXP = Math.max(0, user.xp + xpGain)
    const newLevel = calculateLevel(newXP)

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: newXP,
        level: newLevel,
      }
    })

    // Log da ação para auditoria
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "user_gain_xp",
        details: {
          xpGain,
          reason: reason || "XP ganho",
          taskId: taskId || null,
          oldXP: user.xp,
          newXP,
          oldLevel: user.level,
          newLevel,
          timestamp: new Date().toISOString(),
        }
      }
    })

    debug.log(`Usuário ${session.user.email} ganhou ${xpGain} XP. Total: ${newXP} (Nível ${newLevel})`)

    return NextResponse.json({
      success: true,
      user: {
        xp: newXP,
        level: newLevel,
        xpGain,
        reason: reason || "XP ganho"
      }
    })

  } catch (error) {
    console.error("Erro ao adicionar XP:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Função para calcular nível baseado no XP (mesma lógica do frontend)
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
  ];

  // Garantir que o XP não seja negativo
  const safeXP = Math.max(0, xp);

  for (let i = levels.length - 1; i >= 0; i--) {
    if (safeXP >= levels[i].xpRequired) {
      return levels[i].level;
    }
  }
  return 1;
}