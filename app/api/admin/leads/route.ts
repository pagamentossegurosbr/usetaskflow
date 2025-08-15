import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (source) {
      where.source = source;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar leads com contagem total
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
            }
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              activities: true,
              funnelSteps: true,
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where })
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar leads:', error);
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
    const { email, name, phone, source, campaign, notes, tags, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

    // Verificar se já existe lead com este email
    if (email) {
      const existingLead = await prisma.lead.findUnique({
        where: { email }
      });

      if (existingLead) {
        return NextResponse.json(
          { error: 'Lead com este email já existe' },
          { status: 400 }
        );
      }
    }

    const lead = await prisma.lead.create({
      data: {
        email,
        name,
        phone,
        source: source || 'manual',
        campaign,
        notes,
        tags: tags || '',
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          }
        },
        _count: {
          select: {
            activities: true,
            funnelSteps: true,
          }
        }
      }
    });

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('Erro ao criar lead:', error);
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
        { error: 'ID do lead é obrigatório' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          }
        },
        _count: {
          select: {
            activities: true,
            funnelSteps: true,
          }
        }
      }
    });

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
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
        { error: 'ID do lead é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
