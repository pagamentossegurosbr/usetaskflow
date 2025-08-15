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

    if (!prisma) {
      return NextResponse.json({ error: 'Erro de conexão com banco de dados' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem acesso à Biblioteca de Leitura
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const books = await prisma.readingLibrary.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching reading library:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se tem acesso à Biblioteca de Leitura
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const { title, author, isbn, coverUrl, status, rating, notes } = await request.json();

    if (!title || !author) {
      return NextResponse.json({ error: 'Título e autor são obrigatórios' }, { status: 400 });
    }

    const book = await prisma.readingLibrary.create({
      data: {
        userId: user.id,
        title: title.trim(),
        author: author.trim(),
        isbn: isbn?.trim(),
        coverUrl: coverUrl?.trim(),
        status: status || 'to_read',
        rating: rating || null,
        notes: notes?.trim(),
        startedAt: status === 'reading' ? new Date() : null,
        completedAt: status === 'completed' ? new Date() : null,
      }
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar livro' },
      { status: 500 }
    );
  }
}
