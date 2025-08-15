import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        tags: true
      }
    });

    // Extrair todas as tags únicas
    const allTags = new Set<string>();
    
    posts.forEach(post => {
      if (post.tags) {
        try {
          const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
          if (Array.isArray(tags)) {
            tags.forEach(tag => allTags.add(tag));
          }
        } catch (error) {
          console.error('Erro ao parsear tags:', error);
        }
      }
    });

    const tags = Array.from(allTags).sort();

    return NextResponse.json({
      tags
    });
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    // Retornar array vazio se a tabela não existir
    return NextResponse.json({
      tags: []
    });
  }
}
