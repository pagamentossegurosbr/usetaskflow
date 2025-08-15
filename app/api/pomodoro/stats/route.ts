import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

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

    const last30 = await prisma.pomodoroSession.groupBy({
      by: ['startedAt'],
      where: {
        userId: user.id,
        completed: true,
        startedAt: { gte: since30, lt: new Date() }
      },
      _count: { _all: true },
    }).catch(async () => {
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
      return Array.from(map.entries()).map(([key, count]) => ({ startedAt: new Date(key), _count: { _all: count } }));
    });

    const last30DaysSeries: Array<{ date: string; count: number }> = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(since30);
      d.setDate(since30.getDate() + i);
      const key = d.toISOString().slice(0,10);
      const found = Array.isArray(last30)
        ? last30.find((row: any) => {
            const rd = new Date(row.startedAt);
            rd.setHours(0,0,0,0);
            return rd.toISOString().slice(0,10) === key;
          })
        : null;
      last30DaysSeries.push({ date: key, count: found?._count?._all || 0 });
    }

    // Ranking melhores dias (top 7)
    const bestDays = [...last30DaysSeries]
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Agregado por dia da semana (últimos 90 dias)
    const since90 = new Date();
    since90.setDate(since90.getDate() - 89);
    since90.setHours(0,0,0,0);
    const rows90 = await prisma.pomodoroSession.findMany({
      where: { userId: user.id, completed: true, startedAt: { gte: since90 } },
      select: { startedAt: true }
    });
    const weekdayCountsMap = new Array(7).fill(0) as number[];
    for (const r of rows90) {
      const d = new Date(r.startedAt);
      weekdayCountsMap[d.getDay()] += 1;
    }
    const weekdayCounts = weekdayCountsMap.map((count, weekday) => ({ weekday, count }));

    // Agregado por mês (últimos 12 meses)
    const since12Month = new Date();
    since12Month.setMonth(since12Month.getMonth() - 11, 1);
    since12Month.setHours(0,0,0,0);
    const rows12 = await prisma.pomodoroSession.findMany({
      where: { userId: user.id, completed: true, startedAt: { gte: since12Month } },
      select: { startedAt: true }
    });
    const monthlyMap = new Map<string, number>();
    for (const r of rows12) {
      const d = new Date(r.startedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
    // garantir meses faltantes
    const monthlyCounts: Array<{ month: string; count: number }> = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,'0')}`;
      monthlyCounts.push({ month: key, count: monthlyMap.get(key) || 0 });
    }

    const stats = {
      todaySessions,
      totalSessions,
      totalFocusTime,
      avgSessionLength,
      charts: {
        last30Days: last30DaysSeries,
        weekdayCounts,
        monthlyCounts,
      },
      bestDays,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching pomodoro stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
