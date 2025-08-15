import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Se é a primeira vez salvando a data de nascimento (onboarding)
    if (!user.dateOfBirth) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          dateOfBirth: date,
          dateOfBirthChangeCount: 0
        }
      });

      return NextResponse.json({ 
        message: 'Data de nascimento salva com sucesso',
        dateOfBirth: date,
        changeCount: 0
      });
    }

    // Se já existe uma data de nascimento, verificar se pode alterar
    if (user.dateOfBirthChangeCount >= 2) {
      return NextResponse.json({ 
        error: 'Você já utilizou suas 2 chances de alterar a data de nascimento. Entre em contato com o administrador.',
        changeCount: user.dateOfBirthChangeCount
      }, { status: 403 });
    }

    // Atualizar data de nascimento e incrementar contador
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        dateOfBirth: date,
        dateOfBirthChangeCount: user.dateOfBirthChangeCount + 1
      }
    });

    return NextResponse.json({ 
      message: 'Data de nascimento atualizada com sucesso',
      dateOfBirth: date,
      changeCount: updatedUser.dateOfBirthChangeCount,
      remainingChanges: 2 - updatedUser.dateOfBirthChangeCount
    });

  } catch (error) {
    console.error('Erro ao salvar data de nascimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        dateOfBirth: true,
        dateOfBirthChangeCount: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      dateOfBirth: user.dateOfBirth,
      changeCount: user.dateOfBirthChangeCount,
      remainingChanges: 2 - user.dateOfBirthChangeCount
    });

  } catch (error) {
    console.error('Erro ao buscar data de nascimento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
