import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, type, action, details, email, name, source, campaign, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

    if (!type || !action) {
      return NextResponse.json(
        { error: 'Tipo e ação são obrigatórios' },
        { status: 400 }
      );
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');

    // Log da atividade (sem usar banco de dados)
    console.log('=== LEAD ACTIVITY TRACKING ===');
    console.log('Tipo:', type);
    console.log('Ação:', action);
    console.log('Email:', email);
    console.log('Nome:', name);
    console.log('IP:', ipAddress);
    console.log('User Agent:', userAgent);
    console.log('Referer:', referer);
    console.log('Detalhes:', details);
    console.log('Timestamp:', new Date().toISOString());

    // Retornar sucesso sem usar banco
    return NextResponse.json({ 
      success: true, 
      message: 'Atividade registrada com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao registrar atividade do lead:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
