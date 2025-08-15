import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get('invite');

    // Buscar landing page por slug ou código de convite
    const landingPage = await prisma.landingPage.findFirst({
      where: {
        OR: [
          { slug: slug },
          { inviteCode: slug }
        ],
        isActive: true
      },
      include: {
        pricingPlan: true
      }
    });

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      );
    }

    // Registrar clique de afiliado se houver código de convite
    if (inviteCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { code: inviteCode }
        });

        if (affiliate) {
          await prisma.affiliateClick.create({
            data: {
              affiliateId: affiliate.id,
              landingPageId: landingPage.id,
              ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown',
              referrer: request.headers.get('referer') || null
            }
          });
        }
      } catch (error) {
        console.error('Erro ao registrar clique de afiliado:', error);
      }
    }

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Erro ao buscar landing page:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
