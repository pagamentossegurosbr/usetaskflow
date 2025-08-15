import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Buscar o post atual para obter categoria e tags
    const currentPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        category: true,
        tags: true
      }
    });

    if (!currentPost) {
      return NextResponse.json({ posts: [] });
    }

    let currentTags = [];
    try {
      if (currentPost.tags) {
        currentTags = typeof currentPost.tags === 'string' ? JSON.parse(currentPost.tags) : currentPost.tags;
      }
    } catch (error) {
      console.error('Erro ao parsear tags do post atual:', error);
      currentTags = [];
    }

    // Buscar posts relacionados
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: currentPost.id }
      },
      take: 6
    });

    // Processar posts
    const processedPosts = relatedPosts.map(post => {
      let tags = [];
      try {
        if (post.tags) {
          tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
        }
      } catch (error) {
        console.error('Erro ao parsear tags:', error);
        tags = [];
      }
      
      // Calcular tempo de leitura de forma segura
      let readTime = 5; // Valor padrão
      try {
        if (post.content) {
          const wordsPerMinute = 200;
          const words = post.content.split(' ').length;
          readTime = Math.ceil(words / wordsPerMinute);
        }
      } catch (error) {
        console.error('Erro ao calcular tempo de leitura:', error);
      }
      
      return {
        ...post,
        readTime,
        tags
      };
    });

    return NextResponse.json({
      posts: processedPosts
    });
  } catch (error) {
    console.error('Erro ao buscar posts relacionados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
