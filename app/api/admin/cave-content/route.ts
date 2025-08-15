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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const contents = await prisma.caveContent.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Erro ao buscar conteúdo da caverna:', error);
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
    const {
      title,
      description,
      type,
      category,
      url,
      thumbnail,
      duration,
      isActive = true,
      order = 0
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Título e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const content = await prisma.caveContent.create({
      data: {
        title,
        description,
        type,
        category,
        url,
        thumbnail,
        duration,
        isActive,
        order
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Erro ao criar conteúdo da caverna:', error);
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
    const {
      id,
      title,
      description,
      type,
      category,
      url,
      thumbnail,
      duration,
      isActive,
      order
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const content = await prisma.caveContent.update({
      where: { id },
      data: {
        title,
        description,
        type,
        category,
        url,
        thumbnail,
        duration,
        isActive,
        order
      }
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Erro ao atualizar conteúdo da caverna:', error);
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

    await prisma.caveContent.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Conteúdo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conteúdo da caverna:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

