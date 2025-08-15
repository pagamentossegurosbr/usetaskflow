import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Calcular tempo de leitura
    const wordsPerMinute = 200;
    const words = post.content.split(' ').length;
    const readTime = Math.ceil(words / wordsPerMinute);

    // Converter tags de string para array
    let tags = [];
    try {
      if (post.tags) {
        tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
      }
    } catch (error) {
      console.error('Erro ao parsear tags:', error);
      tags = [];
    }

    return NextResponse.json({
      post: {
        ...post,
        readTime,
        tags
      }
    });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
