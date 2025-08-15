import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, stepName, stepOrder, completed, timeSpent, data, email, name, source, campaign } = body;

    if (!stepName || stepOrder === undefined) {
      return NextResponse.json(
        { error: 'Nome e ordem do step são obrigatórios' },
        { status: 400 }
      );
    }

    // Log do step do funil (sem usar banco de dados)
    console.log('=== FUNNEL STEP TRACKING ===');
    console.log('Step Name:', stepName);
    console.log('Step Order:', stepOrder);
    console.log('Completed:', completed);
    console.log('Time Spent:', timeSpent);
    console.log('Email:', email);
    console.log('Nome:', name);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());

    // Retornar sucesso sem usar banco
    return NextResponse.json({ 
      success: true, 
      message: 'Step do funil registrado com sucesso',
      stepName,
      stepOrder,
      completed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao registrar step do funil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
