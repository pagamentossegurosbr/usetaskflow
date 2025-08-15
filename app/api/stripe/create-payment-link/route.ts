import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan, quantity } = await request.json();

    if (!priceId || !quantity) {
      return NextResponse.json({ error: 'Price ID e quantidade são obrigatórios' }, { status: 400 });
    }

    // Criar payment link usando Stripe
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      after_completion: { type: 'redirect', redirect: { url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success` } },
    });

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Erro ao criar link de pagamento' },
      { status: 500 }
    );
  }
}
