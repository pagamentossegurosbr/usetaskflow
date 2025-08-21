import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsFixed } from '@/lib/auth-fixed';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    
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

    // Verificar se tem acesso ao Pomodoro Focus - tornar mais flexível
    if (user.subscriptionPlan && user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ 
        error: 'Recurso disponível apenas no plano Executor',
        currentPlan: user.subscriptionPlan,
        stats: {
          todaySessions: 0,
          totalSessions: 0,
          totalFocusTime: 0,
          avgSessionLength: 0,
          last30Days: []
        }
      }, { status: 403 });
    }

    // Buscar estatísticas de pomodoro
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Sessões de hoje
      const todaySessions = await prisma.pomodoroSession.count({
        where: {
          userId: user.id,
          completed: true,
          startedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Total de sessões
      const totalSessions = await prisma.pomodoroSession.count({
        where: {
          userId: user.id,
          completed: true
        }
      });

      // Tempo total de foco (apenas sessões completas)
      const completedSessions = await prisma.pomodoroSession.findMany({
        where: {
          userId: user.id,
          completed: true
        },
        select: {
          duration: true
        }
      });

      const totalFocusTime = completedSessions.reduce((acc, session) => acc + session.duration, 0);
      const avgSessionLength = totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;

      // Construir séries para gráficos (últimos 30 dias)
      const since30 = new Date();
      since30.setDate(since30.getDate() - 29);
      since30.setHours(0,0,0,0);

      let last30 = [];
      try {
        last30 = await prisma.pomodoroSession.groupBy({
          by: ['startedAt'],
          where: {
            userId: user.id,
            completed: true,
            startedAt: { gte: since30, lt: new Date() }
          },
          _count: { _all: true },
        });
      } catch (groupByError) {
        // Fallback quando groupBy por Date não é suportado: buscar e agregar em memória
        const rows = await prisma.pomodoroSession.findMany({
          where: { userId: user.id, completed: true, startedAt: { gte: since30 } },
          select: { startedAt: true }
        });
        const map = new Map<string, number>();
        rows.forEach(r => {
          const d = new Date(r.startedAt);
          d.setHours(0,0,0,0);
          const key = d.toISOString().slice(0,10);
          map.set(key, (map.get(key) || 0) + 1);
        });
        last30 = Array.from(map.entries()).map(([key, count]) => ({ 
          startedAt: new Date(key), 
          _count: { _all: count } 
        }));
      }

      return NextResponse.json({
        todaySessions,
        totalSessions,
        totalFocusTime,
        avgSessionLength,
        last30Days: last30.map(item => ({
          date: item.startedAt.toISOString().slice(0, 10),
          sessions: item._count._all
        }))
      });
    } catch (dbError) {
      console.error('Error accessing pomodoro stats:', dbError);
      // Retornar dados vazios em vez de erro 503 para não quebrar a UI
      return NextResponse.json({
        todaySessions: 0,
        totalSessions: 0,
        totalFocusTime: 0,
        avgSessionLength: 0,
        last30Days: []
      });
    }
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        stats: {
          todaySessions: 0,
          totalSessions: 0,
          totalFocusTime: 0,
          avgSessionLength: 0,
          last30Days: []
        }
      },
      { status: 500 }
    );
  }
}
