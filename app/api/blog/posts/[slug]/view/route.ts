import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Incrementar o contador de visualizações
    const updatedPost = await prisma.blogPost.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        viewCount: true
      }
    });

    return NextResponse.json({
      success: true,
      viewCount: updatedPost.viewCount
    });
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

