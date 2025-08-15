'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Tag, 
  Filter,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    email: string;
  };
  publishedAt: string;
  viewCount: number;
  readTime: number;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export default function BlogPage() {
  const { translations } = useLanguage();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedTag, setSelectedTag] = useState(tag || '');

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchPosts(),
          fetchCategories(),
          fetchTags()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/blog/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blog/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    }
  };

  // Debounce para busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchPosts();
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedTag, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-white/5 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-white/60">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Início
              </Link>
            </li>
            <li>/</li>
            <li className="text-white">Blog</li>
            {selectedCategory && (
              <>
                <li>/</li>
                <li className="text-white capitalize">{selectedCategory}</li>
              </>
            )}
            {selectedTag && (
              <>
                <li>/</li>
                <li className="text-white">Tag: {selectedTag}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {translations.blog.title}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Descubra insights sobre produtividade, hábitos e foco para maximizar seus resultados
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Pesquisar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/20 text-white hover:bg-white/10'}
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'bg-purple-600 hover:bg-purple-700' : 'border-white/20 text-white hover:bg-white/10'}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    selectedTag === tag 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  {post.featuredImage && (
                    <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                      {post.category}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white/60">
                      {getReadTime(post.content)} min
                    </Badge>
                  </div>
                  <CardTitle className="text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white/70 text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{post.author?.name || 'Autor Desconhecido'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Eye className="h-3 w-3" />
                      <span>{post.viewCount} visualizações</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Ler Mais
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">Nenhum artigo encontrado</h3>
            <p className="text-white/60 mb-4">
              Tente ajustar os filtros ou pesquise por outro termo
            </p>
            <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700">
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Fique por dentro das novidades
              </h3>
              <p className="text-white/70 mb-6">
                Receba os melhores artigos sobre produtividade diretamente no seu email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  placeholder="Seu email"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Inscrever-se
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
