import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { userId } = body;

    // Se não houver userId, usar um usuário padrão ou permitir likes anônimos
    let effectiveUserId = userId;
    
    if (!userId) {
      // Buscar um usuário padrão (primeiro usuário disponível)
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        effectiveUserId = defaultUser.id;
      } else {
        return NextResponse.json(
          { error: 'Nenhum usuário disponível no sistema' },
          { status: 500 }
        );
      }
    } else {
      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
    }

    // Buscar o post
    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já curtiu
    const existingLike = await prisma.blogPostLike.findFirst({
      where: {
        postId: post.id,
        userId: effectiveUserId
      }
    });

    if (existingLike) {
      // Remover curtida
      await prisma.blogPostLike.delete({
        where: { id: existingLike.id }
      });

      return NextResponse.json({
        liked: false,
        message: 'Curtida removida'
      });
    } else {
      // Adicionar curtida
      await prisma.blogPostLike.create({
        data: {
          postId: post.id,
          userId: effectiveUserId
        }
      });

      return NextResponse.json({
        liked: true,
        message: 'Post curtido'
      });
    }
  } catch (error) {
    console.error('Erro ao processar curtida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            likes: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    let isLiked = false;
    
    // Verificar se o usuário curtiu o post
    if (userId) {
      try {
        const userLike = await prisma.blogPostLike.findFirst({
          where: {
            postId: post.id,
            userId: userId
          }
        });
        isLiked = !!userLike;
      } catch (error) {
        console.error('Erro ao verificar like do usuário:', error);
        isLiked = false;
      }
    }

    return NextResponse.json({
      likesCount: post._count.likes,
      isLiked
    });
  } catch (error) {
    console.error('Erro ao buscar curtidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
