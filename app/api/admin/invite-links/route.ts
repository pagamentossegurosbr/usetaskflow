import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

// Função para gerar código único para o link
function generateLinkCode(name: string, timestamp: number): string {
  const hash = createHash('sha256').update(`${name}-${timestamp}`).digest('hex');
  return hash.substring(0, 8).toUpperCase();
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const code = searchParams.get('code');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (code) {
      where.code = code;
    } else if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { campaign: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar links com contagem total
    const [links, total] = await Promise.all([
      prisma.inviteLink.findMany({
        where,
        include: {
          _count: {
            select: {
              clicks: true,
            }
          },
          clicks: {
            orderBy: { clickedAt: 'desc' },
            take: 5,
            include: {
              lead: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.inviteLink.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        pages,
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

    const body = await request.json();
    const { name, description, type, campaign, maxUses, expiresAt } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do link é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar código único
    const timestamp = Date.now();
    let code = generateLinkCode(name, timestamp);
    
    // Verificar se o código já existe (muito improvável, mas por segurança)
    let existingLink = await prisma.inviteLink.findUnique({ where: { code } });
    let attempts = 0;
    
    while (existingLink && attempts < 10) {
      attempts++;
      code = generateLinkCode(name, timestamp + attempts);
      existingLink = await prisma.inviteLink.findUnique({ where: { code } });
    }

    if (existingLink) {
      return NextResponse.json(
        { error: 'Erro ao gerar código único para o link' },
        { status: 500 }
      );
    }

    const link = await prisma.inviteLink.create({
      data: {
        code,
        name,
        description,
        type: type || 'GENERAL',
        campaign,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
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
