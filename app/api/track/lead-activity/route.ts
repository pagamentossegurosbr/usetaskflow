import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, type, action, details, email, name, source, campaign, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

    if (!type || !action) {
      return NextResponse.json(
        { error: 'Tipo e ação são obrigatórios' },
        { status: 400 }
      );
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');

    let lead = null;

    // Se não há leadId, tentar encontrar ou criar lead
    if (!leadId) {
      if (email) {
        // Tentar encontrar lead existente por email
        lead = await prisma.lead.findUnique({
          where: { email }
        });
      }

      // Se não encontrou lead, criar um novo
      if (!lead) {
        lead = await prisma.lead.create({
          data: {
            email,
            name,
            source: source || 'website',
            campaign,
            ipAddress,
            userAgent,
            referrer: referer,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
          }
        });
      }
    } else {
      // Buscar lead existente
      lead = await prisma.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        return NextResponse.json(
          { error: 'Lead não encontrado' },
          { status: 404 }
        );
      }
    }

    // Registrar a atividade
    const activity = await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type,
        action,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        ipAddress,
        userAgent,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          }
        }
      }
    });

    // Atualizar score do lead baseado no tipo de atividade
    let scoreIncrement = 0;
    switch (type) {
      case 'page_view':
        scoreIncrement = 1;
        break;
      case 'form_start':
        scoreIncrement = 5;
        break;
      case 'form_complete':
        scoreIncrement = 10;
        break;
      case 'email_open':
        scoreIncrement = 3;
        break;
      case 'click':
        scoreIncrement = 2;
        break;
      case 'signup':
        scoreIncrement = 20;
        break;
      case 'purchase':
        scoreIncrement = 50;
        break;
    }

    if (scoreIncrement > 0) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: {
            increment: scoreIncrement
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      activity,
      leadId: lead.id
    });

  } catch (error) {
    console.error('Erro ao registrar atividade do lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
