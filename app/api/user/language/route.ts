import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { language: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ language: user.language || 'pt' });
  } catch (error) {
    console.error('Erro ao buscar idioma do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { language } = body;

    if (!language || !['pt', 'en', 'es'].includes(language)) {
      return NextResponse.json(
        { error: 'Idioma inválido. Use: pt, en, es' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { language },
      select: { language: true }
    });

    return NextResponse.json({ language: user.language });
  } catch (error) {
    console.error('Erro ao atualizar idioma do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

