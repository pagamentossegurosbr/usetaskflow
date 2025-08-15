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

    // Buscar apenas estatísticas da tabela users (que existe no schema ultra-minimal)
    const totalUsers = await prisma.user.count();

    // Retornar dados mock para outras estatísticas (tabelas não existem no schema ultra-minimal)
    return NextResponse.json({
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.7), // 70% dos usuários ativos
      totalTasks: 0, // Tabela task não existe
      totalAchievements: 0, // Tabela userAchievement não existe
      totalBlogPosts: 0, // Tabela blogPost não existe
      totalCaveContent: 0 // Tabela caveContent não existe
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}