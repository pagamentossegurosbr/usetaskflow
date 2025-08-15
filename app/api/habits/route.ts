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

    // Verificar se tem acesso ao Habit Tracker
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const habits = await prisma.habitTracker.findMany({
      where: { 
        userId: user.id,
        isActive: true 
      },
      include: {
        entries: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
            }
          },
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular estatísticas para cada hábito
    const habitsWithStats = habits.map(habit => {
      const entries = habit.entries || [];
      const completedEntries = entries.filter(e => e.completed);
      
      // Calcular sequência atual
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date(today);
      
      // Começar verificando de hoje para trás
      for (let i = 0; i < entries.length; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const entry = entries.find(e => {
          const entryDateStr = e.date.toISOString().split('T')[0];
          return entryDateStr === dateStr;
        });
        
        if (entry && entry.completed) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Se hoje não foi completado, não quebra a sequência ainda
          if (i === 0 && dateStr === today.toISOString().split('T')[0]) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          break;
        }
      }

      // Calcular maior sequência
      let longestStreak = 0;
      let tempStreak = 0;
      
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Taxa de conclusão
      const completionRate = entries.length > 0 
        ? (completedEntries.length / entries.length) * 100 
        : 0;

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        targetCount: habit.targetCount,
        color: habit.color,
        isActive: habit.isActive,
        createdAt: habit.createdAt,
        currentStreak,
        longestStreak,
        completionRate: Math.round(completionRate),
        entries: entries.map(entry => ({
          id: entry.id,
          habitId: entry.habitId,
          date: entry.date.toISOString().split('T')[0],
          completed: entry.completed,
          notes: entry.notes
        }))
      };
    });

    return NextResponse.json(habitsWithStats);
  } catch (error) {
    console.error('Error fetching habits:', error);
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

    // Verificar se tem acesso ao Habit Tracker
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const { name, description, frequency, targetCount, color } = await request.json();

    if (!name || !frequency) {
      return NextResponse.json({ error: 'Nome e frequência são obrigatórios' }, { status: 400 });
    }

    const habit = await prisma.habitTracker.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim(),
        frequency,
        targetCount: targetCount || 1,
        color: color || '#3b82f6',
      }
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Erro ao criar hábito' },
      { status: 500 }
    );
  }
}
