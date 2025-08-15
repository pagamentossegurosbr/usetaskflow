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

    // Verificar se tem acesso ao Modo Caverna
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const contents = await prisma.caveContent.findMany({
      where: { isPublished: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching cave contents:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Esta rota seria usada apenas por admins para criar conteúdo
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

    // Verificar se é admin (OWNER ou MODERATOR)
    if (user.role !== 'OWNER' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { 
      title, 
      description, 
      contentType, 
      fileUrl, 
      videoUrl, 
      content, 
      isPublished,
      order 
    } = await request.json();

    if (!title || !contentType) {
      return NextResponse.json({ error: 'Título e tipo de conteúdo são obrigatórios' }, { status: 400 });
    }

    const caveContent = await prisma.caveContent.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        contentType,
        fileUrl: fileUrl?.trim(),
        videoUrl: videoUrl?.trim(),
        content: content?.trim(),
        isPublished: isPublished ?? false,
        order: order ?? 0
      }
    });

    return NextResponse.json(caveContent);
  } catch (error) {
    console.error('Error creating cave content:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conteúdo' },
      { status: 500 }
    );
  }
}
