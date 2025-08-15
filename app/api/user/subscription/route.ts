import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStartedAt: true,
        subscriptionExpiresAt: true,
        maxLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const subscriptionData = {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      maxLevel: user.maxLevel,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStartedAt: user.subscriptionStartedAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    };

    // Log removido para evitar spam no console

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
