import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsFixed } from '@/lib/auth-fixed';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar links de convite
    const links = await prisma.$queryRaw`
      SELECT 
        il.id,
        il.code,
        il.name,
        il.description,
        il.type,
        il.campaign,
        il.is_active as "isActive",
        il.max_uses as "maxUses",
        il.current_uses as "currentUses",
        il.expires_at as "expiresAt",
        il.created_at as "createdAt",
        il.updated_at as "updatedAt"
      FROM invite_links il
      ORDER BY il.created_at DESC
    `;

    return NextResponse.json({ links });

  } catch (error) {
    console.error('Erro ao buscar links de convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, campaign, maxUses, expiresAt } = body;

    // Validar dados obrigatórios
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Gerar código único
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Criar link de convite
    await prisma.$executeRaw`
      INSERT INTO invite_links (id, code, name, description, type, campaign, max_uses, expires_at, created_at, updated_at)
      VALUES (gen_random_uuid()::text, ${code}, ${name}, ${description || null}, ${type || 'GENERAL'}, ${campaign || null}, ${maxUses || null}, ${expiresAt || null}, NOW(), NOW())
    `;

    return NextResponse.json({ 
      message: 'Link criado com sucesso',
      code: code
    });

  } catch (error) {
    console.error('Erro ao criar link de convite:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
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
    const session = await getServerSession(authOptionsFixed);
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
