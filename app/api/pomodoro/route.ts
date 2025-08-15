import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Erro de conexão com banco de dados' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem acesso ao Pomodoro Focus
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 100 // Aumentado para 100 sessões mais recentes
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem acesso ao Pomodoro Focus
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const { taskName, duration, completed, startedAt, completedAt } = await request.json();

    if (!duration || duration < 60) {
      return NextResponse.json({ error: 'Duração deve ser pelo menos 1 minuto' }, { status: 400 });
    }

    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId: user.id,
        taskName: taskName?.trim(),
        duration,
        completed: completed ?? true, // Padrão como true para sessões completas
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        completedAt: completedAt ? new Date(completedAt) : (completed ? new Date() : null)
      }
    });

    return NextResponse.json(pomodoroSession);
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem acesso ao Pomodoro Focus
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    // Deletar todas as sessões do usuário
    const deletedSessions = await prisma.pomodoroSession.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ 
      message: 'Todas as sessões foram removidas',
      deletedCount: deletedSessions.count 
    });
  } catch (error) {
    console.error('Error deleting all pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Erro ao remover sessões' },
      { status: 500 }
    );
  }
}
