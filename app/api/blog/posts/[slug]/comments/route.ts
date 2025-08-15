import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    const [comments, total] = await Promise.all([
      prisma.blogPostComment.findMany({
        where: { postId: post.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.blogPostComment.count({
        where: { postId: post.id }
      })
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { content, authorName, authorEmail } = body;

    if (!content || !authorName || !authorEmail) {
      return NextResponse.json(
        { error: 'Conteúdo, nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    const comment = await prisma.blogPostComment.create({
      data: {
        content,
        authorName,
        authorEmail,
        postId: post.id
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
