import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Verificar se tem acesso ao Habit Tracker
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const habitId = params.id;

    // Verificar se o hábito pertence ao usuário
    const habit = await prisma.habitTracker.findFirst({
      where: { 
        id: habitId, 
        userId: user.id 
      }
    });

    if (!habit) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    // Deletar todas as entradas do hábito primeiro
    await prisma.habitEntry.deleteMany({
      where: { habitId }
    });

    // Deletar o hábito
    await prisma.habitTracker.delete({
      where: { id: habitId }
    });

    return NextResponse.json({ message: 'Hábito deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar hábito' },
      { status: 500 }
    );
  }
}

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

    // Verificar se tem acesso ao Habit Tracker
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const habitId = params.id;
    const { name, description, frequency, targetCount, color, isActive } = await request.json();

    // Verificar se o hábito pertence ao usuário
    const habit = await prisma.habitTracker.findFirst({
      where: { 
        id: habitId, 
        userId: user.id 
      }
    });

    if (!habit) {
      return NextResponse.json({ error: 'Hábito não encontrado' }, { status: 404 });
    }

    const updatedHabit = await prisma.habitTracker.update({
      where: { id: habitId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(frequency && { frequency }),
        ...(targetCount !== undefined && { targetCount }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar hábito' },
      { status: 500 }
    );
  }
}
