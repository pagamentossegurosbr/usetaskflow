'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Tag, 
  Clock,
  Share2,
  BookOpen,
  Heart,
  MessageCircle,
  Download,
  ExternalLink
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

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  featuredImage?: string;
}

export default function BlogPostPage() {
  const { translations } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost();
      fetchRelatedPosts();
      fetchLikes();
      fetchComments();
      incrementViewCount();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        setViewCount(data.post.viewCount);
      } else {
        router.push('/blog');
      }
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar posts relacionados:', error);
    }
  };

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}/like`);
      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Erro ao buscar curtidas:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/blog/posts/${slug}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  };

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

  const sharePost = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleLike = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Não enviar userId para usar o usuário padrão
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
      } else {
        console.error('Erro na resposta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !commentAuthor.trim() || !commentEmail.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorName: commentAuthor,
          authorEmail: commentEmail
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setCommentAuthor('');
        setCommentEmail('');
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-8 bg-white/10 rounded w-2/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-white/60">
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/blog?category=${post.category}`} className="hover:text-white transition-colors">
                {post.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-white">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <article className="mb-12">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {post.category}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/60">
                {getReadTime(post.content)} min de leitura
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/70 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            {post.featuredImage && (
              <div className="aspect-video bg-white/10 rounded-lg mb-6 overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-white/60 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author?.name || 'Autor Desconhecido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{viewCount} visualizações</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLike}
                  className={`border-white/20 text-white hover:bg-white/10 ${
                    liked ? 'bg-red-500/20 border-red-500/30 text-red-400' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Curtido' : 'Curtir'} ({likesCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sharePost}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <div 
              className="text-white/90 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${tag}`}>
                    <Badge
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Pronto para aumentar sua produtividade?
              </h3>
              <p className="text-white/70 mb-6">
                Experimente o TaskFlow gratuitamente e transforme sua forma de trabalhar
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Checklist Gratuito
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Testar TaskFlow Grátis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card className="bg-white/5 border-white/10 mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{post.author?.name || 'Autor Desconhecido'}</h4>
                  <p className="text-white/60">
                    Especialista em produtividade e autor do TaskFlow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="pb-4">
                    {relatedPost.featuredImage && (
                      <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 w-fit">
                      {relatedPost.category}
                    </Badge>
                    <CardTitle className="text-white line-clamp-2">
                      {relatedPost.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-white/70 text-sm line-clamp-3 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{formatDate(relatedPost.publishedAt)}</span>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Ler
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Comentários ({comments.length})</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="ml-auto border-white/20 text-white hover:bg-white/10"
            >
              {showComments ? 'Ocultar' : 'Mostrar'} Comentários
            </Button>
          </div>
          
          {showComments && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                {/* Formulário de comentário */}
                <form onSubmit={submitComment} className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium">Nome *</label>
                      <input
                        type="text"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder:text-white/50"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium">Email *</label>
                      <input
                        type="email"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder:text-white/50"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Comentário *</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder:text-white/50"
                      placeholder="Deixe seu comentário..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Enviar Comentário
                  </Button>
                </form>

                {/* Lista de comentários */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-white/60 text-center py-4">
                      Seja o primeiro a comentar!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-white/10 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-white/60" />
                          <span className="text-white font-medium">{comment.authorName}</span>
                          <span className="text-white/40 text-sm">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-white/80 leading-relaxed">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Back to Blog */}
        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
