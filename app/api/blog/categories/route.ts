import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published'
      },
      select: {
        category: true
      }
    });

    // Extrair categorias únicas
    const categories = [...new Set(posts.map(post => post.category).filter(Boolean))].sort();

    const formattedCategories = categories;

    return NextResponse.json({
      categories: formattedCategories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retornar array vazio se a tabela não existir
    return NextResponse.json({
      categories: []
    });
  }
}

