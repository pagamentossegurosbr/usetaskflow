import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bookId = params.id;
    const updateData = await request.json();

    // Verificar se o livro pertence ao usuário
    const book = await prisma.readingLibrary.findFirst({
      where: { 
        id: bookId, 
        userId: user.id 
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }

    // Preparar dados de atualização
    const data: any = {};
    
    if (updateData.title !== undefined) data.title = updateData.title.trim();
    if (updateData.author !== undefined) data.author = updateData.author.trim();
    if (updateData.isbn !== undefined) data.isbn = updateData.isbn?.trim();
    if (updateData.coverUrl !== undefined) data.coverUrl = updateData.coverUrl?.trim();
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.rating !== undefined) data.rating = updateData.rating;
    if (updateData.notes !== undefined) data.notes = updateData.notes?.trim();

    // Gerenciar datas baseado no status
    if (updateData.status) {
      if (updateData.status === 'reading' && book.status !== 'reading') {
        data.startedAt = new Date();
      }
      if (updateData.status === 'completed' && book.status !== 'completed') {
        data.completedAt = new Date();
      }
      if (updateData.status === 'to_read') {
        data.startedAt = null;
        data.completedAt = null;
      }
    }

    // Atualizar timestamps específicos se fornecidos
    if (updateData.startedAt !== undefined) {
      data.startedAt = updateData.startedAt ? new Date(updateData.startedAt) : null;
    }
    if (updateData.completedAt !== undefined) {
      data.completedAt = updateData.completedAt ? new Date(updateData.completedAt) : null;
    }

    const updatedBook = await prisma.readingLibrary.update({
      where: { id: bookId },
      data
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar livro' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bookId = params.id;

    // Verificar se o livro pertence ao usuário
    const book = await prisma.readingLibrary.findFirst({
      where: { 
        id: bookId, 
        userId: user.id 
      }
    });

    if (!book) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
    }

    await prisma.readingLibrary.delete({
      where: { id: bookId }
    });

    return NextResponse.json({ message: 'Livro removido com sucesso' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Erro ao remover livro' },
      { status: 500 }
    );
  }
}
