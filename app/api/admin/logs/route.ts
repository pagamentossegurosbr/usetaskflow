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

    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'OWNER' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Buscar logs com paginação
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    // Verificar se o usuário é OWNER (apenas owner pode limpar logs)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Apenas o proprietário pode limpar logs' }, { status: 403 });
    }

    // Limpar todos os logs
    await prisma.activityLog.deleteMany({});

    // Registrar a ação de limpeza
    await prisma.activityLog.create({
      data: {
        userId: session.user.id || 'system',
        action: 'CLEAR_LOGS',
        details: {
          clearedBy: session.user.email,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    return NextResponse.json({ message: 'Logs limpos com sucesso' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}