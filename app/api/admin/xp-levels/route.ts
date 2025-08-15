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

    const xpLevels = await prisma.xPLevel.findMany({
      orderBy: { level: 'asc' }
    });

    return NextResponse.json(xpLevels);
  } catch (error) {
    console.error('Erro ao buscar XP levels:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { level, xpRequired, title, description, badge, color } = body;

    if (!level || !xpRequired || !title) {
      return NextResponse.json(
        { error: 'Level, XP Required e Title são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o level já existe
    const existingLevel = await prisma.xPLevel.findUnique({
      where: { level }
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'Level já existe' },
        { status: 400 }
      );
    }

    const xpLevel = await prisma.xPLevel.create({
      data: {
        level,
        xpRequired,
        title,
        description,
        badge,
        color
      }
    });

    return NextResponse.json(xpLevel);
  } catch (error) {
    console.error('Erro ao criar XP level:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, level, xpRequired, title, description, badge, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const xpLevel = await prisma.xPLevel.update({
      where: { id },
      data: {
        level,
        xpRequired,
        title,
        description,
        badge,
        color
      }
    });

    return NextResponse.json(xpLevel);
  } catch (error) {
    console.error('Erro ao atualizar XP level:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.xPLevel.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'XP Level deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar XP level:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

