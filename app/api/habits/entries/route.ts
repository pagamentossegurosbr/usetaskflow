import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Verificar se tem acesso ao Habit Tracker
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const { habitId, date, notes } = await request.json();

    if (!habitId || !date) {
      return NextResponse.json({ error: 'HabitId e data são obrigatórios' }, { status: 400 });
    }

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

    const entryDate = new Date(date);

    // Verificar se já existe entrada para esta data
    const existingEntry = await prisma.habitEntry.findFirst({
      where: {
        habitId,
        date: {
          gte: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()),
          lt: new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate() + 1)
        }
      }
    });

    let entry;

    if (existingEntry) {
      // Toggle da entrada existente
      entry = await prisma.habitEntry.update({
        where: { id: existingEntry.id },
        data: { 
          completed: !existingEntry.completed,
          notes: notes || existingEntry.notes
        }
      });
    } else {
      // Criar nova entrada
      entry = await prisma.habitEntry.create({
        data: {
          habitId,
          date: entryDate,
          completed: true,
          notes
        }
      });
    }

    return NextResponse.json({
      completed: entry.completed,
      entry: entry,
      habitName: habit.name
    });
  } catch (error) {
    console.error('Error toggling habit entry:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar entrada do hábito' },
      { status: 500 }
    );
  }
}
