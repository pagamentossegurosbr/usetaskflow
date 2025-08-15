import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkCode, leadId, referrer } = body;

    if (!linkCode) {
      return NextResponse.json(
        { error: 'Código do link é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o link
    const link = await prisma.inviteLink.findUnique({
      where: { code: linkCode },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o link está ativo
    if (!link.isActive) {
      return NextResponse.json(
        { error: 'Link inativo' },
        { status: 400 }
      );
    }

    // Verificar se o link expirou
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json(
        { error: 'Link expirado' },
        { status: 400 }
      );
    }

    // Verificar se atingiu o limite de usos
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return NextResponse.json(
        { error: 'Link atingiu o limite de usos' },
        { status: 400 }
      );
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip');
    const userAgent = request.headers.get('user-agent');
    const referer = referrer || request.headers.get('referer');

    // Detectar dispositivo e browser (simplificado)
    let device = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    if (userAgent) {
      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        device = 'mobile';
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        device = 'tablet';
      }

      if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
      }

      if (userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac')) {
        os = 'macOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
      } else if (userAgent.includes('iOS')) {
        os = 'iOS';
      }
    }

    // Registrar o clique
    const click = await prisma.linkClick.create({
      data: {
        linkId: link.id,
        leadId: leadId || null,
        ipAddress,
        userAgent,
        referrer: referer,
        device,
        browser,
        os,
      },
      include: {
        link: {
          select: {
            name: true,
            type: true,
            campaign: true,
          }
        },
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Atualizar contador de usos do link
    await prisma.inviteLink.update({
      where: { id: link.id },
      data: {
        currentUses: {
          increment: 1
        }
      }
    });

    // Se não há lead associado, criar um lead anônimo
    if (!leadId) {
      const anonymousLead = await prisma.lead.create({
        data: {
          source: 'invite_link',
          campaign: link.campaign,
          ipAddress,
          userAgent,
          referrer: referer,
          utmSource: 'invite_link',
          utmMedium: link.type.toLowerCase(),
          utmCampaign: link.campaign,
        }
      });

      // Associar o clique ao lead anônimo
      await prisma.linkClick.update({
        where: { id: click.id },
        data: { leadId: anonymousLead.id }
      });
    }

    return NextResponse.json({ 
      success: true, 
      click,
      linkName: link.name,
      remainingUses: link.maxUses ? link.maxUses - link.currentUses - 1 : null
    });

  } catch (error) {
    console.error('Erro ao registrar clique no link:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
