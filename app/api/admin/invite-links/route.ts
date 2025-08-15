import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Retornar array vazio (tabela invite_links não existe no schema ultra-minimal)
    return NextResponse.json({
      links: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar links de convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Retornar erro (tabela invite_links não existe no schema ultra-minimal)
    return NextResponse.json(
      { error: 'Funcionalidade de links de convite não disponível no schema atual' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Erro ao criar link de convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do link é obrigatório' },
        { status: 400 }
      );
    }

    // Se estiver atualizando maxUses, converter para número
    if (updateData.maxUses !== undefined) {
      updateData.maxUses = updateData.maxUses ? parseInt(updateData.maxUses) : null;
    }

    // Se estiver atualizando expiresAt, converter para Date
    if (updateData.expiresAt !== undefined) {
      updateData.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : null;
    }

    const link = await prisma.inviteLink.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            clicks: true,
          }
        }
      }
    });

    return NextResponse.json({ link });

  } catch (error) {
    console.error('Erro ao atualizar link de convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do link é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.inviteLink.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar link de convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
