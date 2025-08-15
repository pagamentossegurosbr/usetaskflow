import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { STRIPE_PRICE_IDS, SubscriptionPlan } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { plan }: { plan: SubscriptionPlan } = await request.json();

    if (!plan || !['aspirante', 'executor'].includes(plan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Criar ou recuperar customer no Stripe
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Criar customer no Stripe usando MCP
      const createCustomerResponse = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name || 'Usuário TaskFlow',
          email: user.email,
        }),
      });

      if (!createCustomerResponse.ok) {
        throw new Error('Failed to create Stripe customer');
      }

      const customer = await createCustomerResponse.json();
      stripeCustomerId = customer.id;

      // Salvar customer ID no banco
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Determinar o preço baseado no plano
    const isFirstPurchase = user.subscriptionPlan === 'free';
    const priceId = isFirstPurchase 
      ? STRIPE_PRICE_IDS[plan].firstMonth 
      : STRIPE_PRICE_IDS[plan].recurring;

    // Criar payment link no Stripe
    const createPaymentLinkResponse = await fetch('/api/stripe/create-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: priceId,
        quantity: 1,
      }),
    });

    if (!createPaymentLinkResponse.ok) {
      throw new Error('Failed to create payment link');
    }

    const paymentLink = await createPaymentLinkResponse.json();

    // Registrar a tentativa de upgrade
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: isFirstPurchase 
          ? (plan === 'aspirante' ? 990 : 9700)
          : (plan === 'aspirante' ? 2490 : 12990),
        currency: 'brl',
        planType: plan,
        status: 'pending',
      },
    });

    return NextResponse.json({ 
      paymentUrl: paymentLink.url,
      customerId: stripeCustomerId,
    });
  } catch (error) {
    console.error('Error creating upgrade session:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de upgrade' },
      { status: 500 }
    );
  }
}
