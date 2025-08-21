import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar conquistas do banco de dados
    const achievements = await prisma.achievement.findMany({
      include: {
        _count: {
          select: {
            userAchievements: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(achievements);

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, xpReward, requirement } = body;

    if (!name || !description || !xpReward) {
      return NextResponse.json(
        { error: 'Nome, descrição e XP são obrigatórios' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        name,
        description,
        icon: icon || 'trophy',
        xpReward: parseInt(xpReward),
        requirement: requirement || { type: 'tasks_completed', value: 1 }
      }
    });

    return NextResponse.json(achievement);

  } catch (error) {
    console.error('Erro ao criar conquista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID da conquista é obrigatório" },
        { status: 400 }
      )
    }

    const achievement = await prisma.achievement.update({
      where: { id },
      data: updateData
    })

    // Log da atividade administrativa
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "admin_update_achievement",
        details: {
          achievementId: id,
          changes: updateData,
        }
      }
    })

    return NextResponse.json(achievement)
  } catch (error) {
    console.error("Erro ao atualizar conquista:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get("id")

    if (!achievementId) {
      return NextResponse.json(
        { error: "ID da conquista é obrigatório" },
        { status: 400 }
      )
    }

    await prisma.achievement.delete({
      where: { id: achievementId }
    })

    // Log da atividade administrativa
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "admin_delete_achievement",
        details: {
          achievementId,
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar conquista:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}