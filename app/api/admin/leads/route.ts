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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    
    // Calcular data de início baseada no período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Buscar leads
    const leads = await prisma.$queryRaw`
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.source,
        l.campaign,
        l.status,
        l.score,
        l.notes,
        l.tags,
        l.created_at as "createdAt",
        l.updated_at as "updatedAt",
        l.converted_at as "convertedAt",
        l.user_id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        u.level as "userLevel"
      FROM leads l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.created_at >= ${startDate}
      ORDER BY l.created_at DESC
    `;

    return NextResponse.json({ leads });

  } catch (error) {
    console.error('Erro ao buscar leads:', error);
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
    const { name, email, phone, source, campaign, notes, tags, status } = body;

    // Validar dados obrigatórios
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Criar lead
    const lead = await prisma.$executeRaw`
      INSERT INTO leads (id, name, email, phone, source, campaign, notes, tags, status, created_at, updated_at)
      VALUES (gen_random_uuid()::text, ${name || null}, ${email}, ${phone || null}, ${source || 'website'}, ${campaign || null}, ${notes || null}, ${tags || ''}, ${status || 'NEW'}, NOW(), NOW())
    `;

    return NextResponse.json({ message: 'Lead criado com sucesso' });

  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Retornar erro (tabela lead não existe no schema ultra-minimal)
    return NextResponse.json(
      { error: 'Funcionalidade de leads não disponível no schema atual' },
      { status: 501 }
    );

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
    const session = await getServerSession(authOptionsFixed);
    if (!session?.user?.id || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Retornar erro (tabela lead não existe no schema ultra-minimal)
    return NextResponse.json(
      { error: 'Funcionalidade de leads não disponível no schema atual' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
