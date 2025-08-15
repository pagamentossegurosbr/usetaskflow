import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    // Usar MCP do Stripe para criar customer
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/mcp/stripe/create-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const customer = await response.json();
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return NextResponse.json(
      { error: 'Erro ao criar customer no Stripe' },
      { status: 500 }
    );
  }
}
