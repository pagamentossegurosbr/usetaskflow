import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://taskflow.com';

  // Páginas estáticas
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cave-mode`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Buscar posts do blog (com tratamento de erro)
  let posts: any[] = [];
  let categories: any[] = [];
  
  try {
    posts = await prisma.blogPost.findMany({
      where: {
        status: 'published'
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Buscar categorias
    categories = await prisma.blogPost.groupBy({
      by: ['category'],
      where: {
        status: 'published'
      }
    });
  } catch (error) {
    console.log('Blog tables not available, skipping blog sitemap entries');
  }

  // Páginas dinâmicas dos posts
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Páginas de categorias
  const categoryPages = categories
    .filter(cat => cat.category)
    .map((cat) => ({
      url: `${baseUrl}/blog?category=${encodeURIComponent(cat.category!)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...blogPages, ...categoryPages];
}

