import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ isBanned: false })
    }

    // Verificar se o usuário está banido
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        isBanned: true,
        banReason: true,
        bannedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ isBanned: false })
    }

    return NextResponse.json({
      isBanned: user.isBanned,
      banReason: user.banReason,
      bannedAt: user.bannedAt,
    })

  } catch (error) {
    console.error("Erro ao verificar banimento:", error)
    return NextResponse.json({ isBanned: false })
  }
}