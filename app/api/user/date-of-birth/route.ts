import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { dateOfBirth } = body;

    if (!dateOfBirth) {
      return NextResponse.json({ error: 'Data de nascimento é obrigatória' }, { status: 400 });
    }

    // Validar formato da data
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }

    // Verificar se a data não é no futuro
    if (date > new Date()) {
      return NextResponse.json({ error: 'Data de nascimento não pode ser no futuro' }, { status: 400 });
    }

    // Verificar se a data não é muito antiga (mais de 120 anos)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (date < minDate) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }

    // Log da data de nascimento (sem salvar no banco - schema ultra-minimal)
    console.log('=== DATE OF BIRTH SAVE ===');
    console.log('Email:', session.user.email);
    console.log('Date of Birth:', dateOfBirth);
    console.log('Validated Date:', date);
    console.log('Timestamp:', new Date().toISOString());

    // Retornar sucesso sem salvar no banco
    return NextResponse.json({ 
      message: 'Data de nascimento processada com sucesso',
      dateOfBirth: date,
      changeCount: 0,
      remainingChanges: 2
    });

  } catch (error) {
    console.error('Erro ao processar data de nascimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Retornar dados padrão (sem consultar banco - schema ultra-minimal)
    return NextResponse.json({
      dateOfBirth: null,
      changeCount: 0,
      remainingChanges: 2
    });

  } catch (error) {
    console.error('Erro ao buscar data de nascimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
