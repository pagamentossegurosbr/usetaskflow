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

    const landingPages = await prisma.landingPage.findMany({
      include: {
        pricingPlan: true,
        _count: {
          select: {
            conversions: true,
            affiliateClicks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(landingPages);
  } catch (error) {
    console.error('Erro ao buscar landing pages:', error);
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
      name, 
      slug, 
      template, 
      title, 
      subtitle, 
      description, 
      pricingPlanId, 
      customPricing, 
      inviteCode 
    } = body;

    // Gerar código de convite único se não fornecido
    let finalInviteCode = inviteCode;
    if (!finalInviteCode) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      finalInviteCode = `INVITE${timestamp}${random}`.toUpperCase();
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        name,
        slug,
        template,
        title,
        subtitle,
        description,
        pricingPlanId,
        customPricing,
        inviteCode: finalInviteCode,
      },
      include: {
        pricingPlan: true
      }
    });

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Erro ao criar landing page:', error);
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
      name, 
      slug, 
      template, 
      title, 
      subtitle, 
      description, 
      pricingPlanId, 
      customPricing, 
      inviteCode,
      isActive 
    } = body;

    const updatedLandingPage = await prisma.landingPage.update({
      where: { id },
      data: {
        name,
        slug,
        template,
        title,
        subtitle,
        description,
        pricingPlanId,
        customPricing,
        inviteCode,
        isActive
      },
      include: {
        pricingPlan: true
      }
    });

    return NextResponse.json(updatedLandingPage);
  } catch (error) {
    console.error('Erro ao atualizar landing page:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
