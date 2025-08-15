import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_EVENTS, constructWebhookEvent, mapStripeStatusToSubscriptionStatus } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { rateLimiters } from '@/lib/rateLimiter';

// Rate limiting para webhooks
const webhookLimiter = rateLimiters.api;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('stripe-signature') || 'webhook';
    const rateLimit = webhookLimiter.checkLimit(identifier);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = constructWebhookEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error('Erro ao verificar assinatura do webhook:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Webhook recebido:', event.type);

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case STRIPE_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object);
        break;

      case STRIPE_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object);
        break;

      case STRIPE_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object);
        break;

      case STRIPE_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case STRIPE_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_SUCCEEDED:
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case STRIPE_EVENTS.PAYMENT_INTENT_FAILED:
        await handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handlers para diferentes eventos
async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Assinatura criada:', subscription.id);

    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer },
    });

    if (!user) {
      console.error('Usuário não encontrado para customer:', subscription.customer);
      return;
    }

    // Determinar o plano baseado no price ID
    const priceId = subscription.items.data[0]?.price.id;
    let plan: 'aspirante' | 'executor' = 'aspirante';

    if (priceId === 'price_1Ru0F9DY8STDZSZWdEHYfYFo' || priceId === 'price_1Ru0F5DY8STDZSZWNZaukwiu') {
      plan = 'aspirante';
    } else if (priceId === 'price_1Ru0FGDY8STDZSZWL6ArBwl2' || priceId === 'price_1Ru0FCDY8STDZSZWz6KEmH5L') {
      plan = 'executor';
    }

    // Atualizar usuário no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: mapStripeStatusToSubscriptionStatus(subscription.status),
        stripeSubscriptionId: subscription.id,
        subscriptionStartedAt: new Date(subscription.created * 1000),
        subscriptionExpiresAt: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });

    console.log(`Usuário ${user.id} atualizado com plano ${plan}`);
  } catch (error) {
    console.error('Erro ao processar criação de assinatura:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Assinatura atualizada:', subscription.id);

    // Buscar usuário pelo subscription ID
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!user) {
      console.error('Usuário não encontrado para subscription:', subscription.id);
      return;
    }

    // Determinar o plano baseado no price ID
    const priceId = subscription.items.data[0]?.price.id;
    let plan: 'aspirante' | 'executor' = 'aspirante';

    if (priceId === 'price_1Ru0F9DY8STDZSZWdEHYfYFo' || priceId === 'price_1Ru0F5DY8STDZSZWNZaukwiu') {
      plan = 'aspirante';
    } else if (priceId === 'price_1Ru0FGDY8STDZSZWL6ArBwl2' || priceId === 'price_1Ru0FCDY8STDZSZWz6KEmH5L') {
      plan = 'executor';
    }

    // Atualizar usuário no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: mapStripeStatusToSubscriptionStatus(subscription.status),
        subscriptionExpiresAt: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    });

    console.log(`Usuário ${user.id} atualizado com status ${subscription.status}`);
  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Assinatura cancelada:', subscription.id);

    // Buscar usuário pelo subscription ID
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!user) {
      console.error('Usuário não encontrado para subscription:', subscription.id);
      return;
    }

    // Atualizar usuário para plano gratuito
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: 'free',
        subscriptionStatus: 'canceled',
        subscriptionExpiresAt: new Date(subscription.canceled_at * 1000),
      },
    });

    console.log(`Usuário ${user.id} movido para plano gratuito`);
  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    console.log('Pagamento de invoice realizado:', invoice.id);

    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (!user) {
      console.error('Usuário não encontrado para customer:', invoice.customer);
      return;
    }

    // Atualizar dados de pagamento
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripePaymentIntentId: invoice.payment_intent,
        stripeInvoiceId: invoice.id,
        subscriptionExpiresAt: invoice.period_end 
          ? new Date(invoice.period_end * 1000)
          : null,
      },
    });

    console.log(`Pagamento processado para usuário ${user.id}`);
  } catch (error) {
    console.error('Erro ao processar pagamento de invoice:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    console.log('Falha no pagamento de invoice:', invoice.id);

    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: invoice.customer },
    });

    if (!user) {
      console.error('Usuário não encontrado para customer:', invoice.customer);
      return;
    }

    // Atualizar status da assinatura
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    console.log(`Status atualizado para past_due para usuário ${user.id}`);
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('Payment intent realizado:', paymentIntent.id);

    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: paymentIntent.customer },
    });

    if (!user) {
      console.error('Usuário não encontrado para customer:', paymentIntent.customer);
      return;
    }

    // Atualizar dados de pagamento
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    console.log(`Payment intent processado para usuário ${user.id}`);
  } catch (error) {
    console.error('Erro ao processar payment intent:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    console.log('Falha no payment intent:', paymentIntent.id);

    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: paymentIntent.customer },
    });

    if (!user) {
      console.error('Usuário não encontrado para customer:', paymentIntent.customer);
      return;
    }

    console.log(`Falha no payment intent para usuário ${user.id}`);
  } catch (error) {
    console.error('Erro ao processar falha de payment intent:', error);
  }
}
