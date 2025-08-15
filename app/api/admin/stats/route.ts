import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar estatísticas do sistema
    const [
      totalUsers,
      activeUsers,
      totalTasks,
      totalAchievements
    ] = await Promise.all([
      // Total de usuários
      prisma.user.count(),
      
      // Usuários ativos (últimos 30 dias)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total de tarefas
      prisma.task.count(),
      
      // Total de conquistas desbloqueadas
      prisma.userAchievement.count()
    ]);

                    // Total de posts do blog
                const totalBlogPosts = await prisma.blogPost.count();
                
                // Total de conteúdo da caverna
                const totalCaveContent = await prisma.caveContent.count();

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTasks,
      totalAchievements,
      totalBlogPosts,
      totalCaveContent
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}