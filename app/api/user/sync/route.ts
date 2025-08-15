import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar se o usuário está autenticado
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    // Verificar se o email da query é o mesmo da sessão (segurança)
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar dados atualizados do usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        xp: true,
        level: true,
        name: true,
        bio: true,
        title: true,
        avatar: true,
        theme: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      xp: user.xp,
      level: user.level,
      name: user.name,
      bio: user.bio,
      title: user.title,
      avatar: user.avatar,
      theme: user.theme,
      lastUpdated: user.updatedAt,
    })

  } catch (error) {
    console.error("Erro na sincronização:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}