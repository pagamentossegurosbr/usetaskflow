import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    // Verificar se tem acesso ao Modo Caverna
    if (user.subscriptionPlan !== 'executor') {
      return NextResponse.json({ error: 'Recurso disponível apenas no plano Executor' }, { status: 403 });
    }

    const contentId = params.id;

    // Verificar se o conteúdo existe e está publicado
    const content = await prisma.caveContent.findFirst({
      where: { 
        id: contentId,
        isPublished: true
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 });
    }

    // Registrar a visualização (incrementar views)
    // Note: Em um cenário real, você pode querer rastrear visualizações por usuário
    // para evitar contagem múltipla do mesmo usuário
    await prisma.caveContent.update({
      where: { id: contentId },
      data: {
        // Como não temos campo views no schema atual, vamos simular
        // Em uma implementação real, você adicionaria um campo views ou uma tabela separada
      }
    });

    // Log da atividade (opcional)
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'cave_content_view',
        details: {
          contentId,
          contentTitle: content.title,
          contentType: content.contentType
        }
      }
    });

    return NextResponse.json({ message: 'Visualização registrada' });
  } catch (error) {
    console.error('Error recording content view:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar visualização' },
      { status: 500 }
    );
  }
}
