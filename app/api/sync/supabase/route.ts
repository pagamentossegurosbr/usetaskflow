import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log(`🔄 Iniciando sincronização - Usuário: ${session.user.id}`);

    // Buscar dados do usuário no Prisma local
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Dados do usuário obtidos: ${user.name} (${user.email})`);

    // Por enquanto, apenas retornar sucesso sem sincronizar
    // já que não temos as tabelas task e activityLog no schema ultra-minimal
    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização simplificada realizada com sucesso',
      timestamp: new Date().toISOString(),
      stats: {
        tasks: 0,
        activityLogs: 0,
        user: 1,
        totalTasks: 0,
        totalLogs: 0
      },
      note: 'Sincronização simplificada - tabelas task e activityLog não disponíveis no schema atual'
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log(`📋 Criando backup - Usuário: ${session.user.id}`);

    // Buscar dados do usuário no Prisma local
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const backup = {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      data: {
        tasks: [],
        activityLogs: [],
        user: user,
      },
    };

    return NextResponse.json({
      success: true,
      backup,
      timestamp: new Date().toISOString(),
      note: 'Backup simplificado - tabelas task e activityLog não disponíveis no schema atual'
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
