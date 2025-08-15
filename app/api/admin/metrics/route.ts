import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calcular métricas básicas apenas da tabela users (que existe no schema ultra-minimal)
    const totalUsers = await prisma.user.count();
    const activeUsers = Math.floor(totalUsers * 0.7); // 70% dos usuários ativos (mock)
    
    // Dados mock para todas as outras métricas (tabelas não existem no schema ultra-minimal)
    const totalTasks = 0;
    const completedTasks = 0;
    const totalAchievements = 0;
    const totalBlogPosts = 0;
    const totalCaveContent = 0;

    // Calcular métricas derivadas
    const conversionRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const taskCompletionRate = 0; // Sem tarefas no schema ultra-minimal
    const avgTasksPerUser = 0; // Sem tarefas no schema ultra-minimal
    const avgAchievementsPerUser = 0; // Sem conquistas no schema ultra-minimal

    // Calcular tempo médio de sessão (simulado)
    const avgSessionTime = Math.round(Math.random() * 30 + 15); // 15-45 minutos

    // Calcular satisfação (simulado)
    const satisfactionScore = Math.min(5, Math.max(1, Math.round((conversionRate / 100) * 5 * 10) / 10));

    // Atividade recente mock
    const processedActivity = [];

    // Distribuição de usuários por plano (mock - todos gratuitos no schema ultra-minimal)
    const subscriptionDistribution = {
      'free': totalUsers,
      'pro': 0,
      'enterprise': 0
    };

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTasks,
      completedTasks,
      totalAchievements,
      totalBlogPosts,
      totalCaveContent,
      conversionRate,
      taskCompletionRate,
      avgTasksPerUser,
      avgAchievementsPerUser,
      avgSessionTime,
      satisfactionScore,
      recentActivity: processedActivity,
      subscriptionDistribution,
      dailyStats: {
        newUsers: Math.round(totalUsers * 0.1),
        newTasks: 0, // Sem tarefas no schema ultra-minimal
        completedTasks: 0 // Sem tarefas no schema ultra-minimal
      }
    });

  } catch (error) {
    console.error('Erro ao buscar métricas admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
