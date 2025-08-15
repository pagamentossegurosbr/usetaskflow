import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Construir where clause
    const where: any = {
      status: 'published'
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    // Filtrar por tag se especificado
    let filteredPosts = posts;
    if (tag) {
      filteredPosts = posts.filter(post => {
        try {
          const postTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
          return Array.isArray(postTags) && postTags.includes(tag);
        } catch (error) {
          return false;
        }
      });
    }

    // Processar posts
    const processedPosts = filteredPosts.map(post => {
      let tags = [];
      try {
        if (post.tags) {
          tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
        }
      } catch (error) {
        console.error('Erro ao parsear tags:', error);
        tags = [];
      }
      
      // Calcular tempo de leitura
      let readTime = 5; // Valor padrão
      try {
        const wordsPerMinute = 200;
        const words = post.content.split(' ').length;
        readTime = Math.ceil(words / wordsPerMinute);
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
      posts: processedPosts,
      pagination: {
        page: 1,
        limit: 12,
        total: filteredPosts.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts do blog:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
