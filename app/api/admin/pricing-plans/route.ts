import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pricingPlans = await prisma.pricingPlan.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pricingPlans);
  } catch (error) {
    console.error('Erro ao buscar planos de preço:', error);
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
    const { name, slug, description, originalPrice, promotionalPrice } = body;

    // Criar produto no Stripe
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description || `Plano ${name} - ${description || 'Plano de assinatura'}`,
    });

    // Criar preço no Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(originalPrice * 100), // Stripe usa centavos
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
    });

    // Criar plano no banco
    const pricingPlan = await prisma.pricingPlan.create({
      data: {
        name,
        slug,
        description,
        originalPrice: parseFloat(originalPrice),
        promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      }
    });

    return NextResponse.json(pricingPlan);
  } catch (error) {
    console.error('Erro ao criar plano de preço:', error);
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
    const { id, name, slug, description, originalPrice, promotionalPrice } = body;

    // Buscar plano existente
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar produto no Stripe se necessário
    if (existingPlan.stripeProductId) {
      await stripe.products.update(existingPlan.stripeProductId, {
        name: name,
        description: description || `Plano ${name} - ${description || 'Plano de assinatura'}`,
      });
    }

    // Atualizar plano no banco
    const updatedPlan = await prisma.pricingPlan.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        originalPrice: parseFloat(originalPrice),
        promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : null,
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Erro ao atualizar plano de preço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
