import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id;
    const { completed } = await request.json();

    // Verificar se a sessão pertence ao usuário
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: { 
        id: sessionId, 
        userId: user.id 
      }
    });

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const updatedSession = await prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        completed: completed ?? pomodoroSession.completed,
        completedAt: completed ? new Date() : pomodoroSession.completedAt
      }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar sessão' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id;

    // Verificar se a sessão pertence ao usuário
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: { 
        id: sessionId, 
        userId: user.id 
      }
    });

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    await prisma.pomodoroSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ message: 'Sessão removida com sucesso' });
  } catch (error) {
    console.error('Error deleting pomodoro session:', error);
    return NextResponse.json(
      { error: 'Erro ao remover sessão' },
      { status: 500 }
    );
  }
}
