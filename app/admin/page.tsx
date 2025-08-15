'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Music, 
  Video, 
  Award,
  TrendingUp,
  Activity,
  Shield,
  Globe,
  Database,
  Zap,
  Target,
  BookOpen,
  Play,
  Headphones,
  Mountain,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  X,
  Upload,
  Search
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import BlogEditor from '@/components/BlogEditor';
import PricingPlanForm from '@/components/admin/PricingPlanForm';
import LandingPageForm from '@/components/admin/LandingPageForm';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalAchievements: number;
  totalBlogPosts: number;
  totalCaveContent: number;
}

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalAchievements: number;
  totalBlogPosts: number;
  totalCaveContent: number;
  conversionRate: number;
  taskCompletionRate: number;
  avgTasksPerUser: number;
  avgAchievementsPerUser: number;
  avgSessionTime: number;
  satisfactionScore: number;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
  }>;
  subscriptionDistribution: Record<string, number>;
  dailyStats: {
    newUsers: number;
    newTasks: number;
    completedTasks: number;
  };
}

interface XPLevel {
  id: string;
  level: number;
  xpRequired: number;
  title: string;
  description?: string;
  badge?: string;
  color?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featuredImage?: string;
  tags?: string[];
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  viewCount: number;
}

interface CaveContent {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
  isActive: boolean;
  order: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
  lastLoginAt?: string;
  _count: {
    tasks: number;
    userAchievements: number;
    habitTrackers: number;
    readingLibrary: number;
    pomodoroSessions: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { translations } = useLanguage();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    totalAchievements: 0,
    totalBlogPosts: 0,
    totalCaveContent: 0
  });
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para dados
  const [xpLevels, setXpLevels] = useState<XPLevel[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [caveContent, setCaveContent] = useState<CaveContent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  
  // Estados para modais
  const [xpLevelModal, setXpLevelModal] = useState(false);
  const [blogPostModal, setBlogPostModal] = useState(false);
  const [caveContentModal, setCaveContentModal] = useState(false);
  const [pricingPlanModal, setPricingPlanModal] = useState(false);
  const [landingPageModal, setLandingPageModal] = useState(false);
  
  // Estados para formulários
  const [editingXPLevel, setEditingXPLevel] = useState<XPLevel | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [editingCaveContent, setEditingCaveContent] = useState<CaveContent | null>(null);
  const [editingPricingPlan, setEditingPricingPlan] = useState<any>(null);
  const [editingLandingPage, setEditingLandingPage] = useState<any>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'OWNER') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      const [statsResponse, metricsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/metrics')
      ]);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchXPLevels = async () => {
    try {
      const response = await fetch('/api/admin/xp-levels');
      if (response.ok) {
        const data = await response.json();
        setXpLevels(data);
      }
    } catch (error) {
      console.error('Erro ao buscar XP levels:', error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog-posts');
      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Erro ao buscar posts do blog:', error);
    }
  };

  const fetchCaveContent = async () => {
    try {
      const response = await fetch('/api/admin/cave-content');
      if (response.ok) {
        const data = await response.json();
        setCaveContent(data);
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo da caverna:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/admin/pricing-plans');
      if (response.ok) {
        const data = await response.json();
        setPricingPlans(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar planos de preço:', error);
    }
  };

  const fetchLandingPages = async () => {
    try {
      const response = await fetch('/api/admin/landing-pages');
      if (response.ok) {
        const data = await response.json();
        setLandingPages(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar landing pages:', error);
    }
  };

  // Carregar dados quando a aba mudar
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'xp-levels':
        fetchXPLevels();
        break;
      case 'blog':
        fetchBlogPosts();
        break;
      case 'cave':
        fetchCaveContent();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'pricing':
        fetchPricingPlans();
        break;
      case 'landing':
        fetchLandingPages();
        break;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'OWNER') {
    return null;
  }

  // Componente XPLevelForm
  const XPLevelForm = ({ xpLevel, onSave }: { xpLevel: XPLevel | null, onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      level: xpLevel?.level || 1,
      xpRequired: xpLevel?.xpRequired || 0,
      title: xpLevel?.title || '',
      description: xpLevel?.description || '',
      badge: xpLevel?.badge || '🎯',
      color: xpLevel?.color || '#3b82f6'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        id: xpLevel?.id
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="level" className="text-white">Nível</Label>
            <Input
              id="level"
              type="number"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
          <div>
            <Label htmlFor="xpRequired" className="text-white">XP Necessário</Label>
            <Input
              id="xpRequired"
              type="number"
              value={formData.xpRequired}
              onChange={(e) => setFormData({ ...formData, xpRequired: parseInt(e.target.value) })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title" className="text-white">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-white">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="badge" className="text-white">Badge (Emoji)</Label>
            <Input
              id="badge"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
          <div>
            <Label htmlFor="color" className="text-white">Cor</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            {xpLevel ? 'Atualizar' : 'Criar'} Nível
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setXpLevelModal(false);
              setEditingXPLevel(null);
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  // Componente BlogPostForm
  const BlogPostForm = ({ post, onSave }: { post: BlogPost | null, onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      title: post?.title || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      category: post?.category || '',
      status: post?.status || 'draft',
      seoTitle: post?.seoTitle || '',
      seoDescription: post?.seoDescription || '',
      seoKeywords: post?.seoKeywords || '',
      featuredImage: post?.featuredImage || '',
      tags: post?.tags || []
    });

    const [tags, setTags] = useState<string[]>(formData.tags);
    const [newTag, setNewTag] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload');
      }
      
      const data = await response.json();
      return data.imageUrl;
    };

    const handleFeaturedImageUpload = async (file: File) => {
      setIsUploading(true);
      try {
        const imageUrl = await handleImageUpload(file);
        setFormData({ ...formData, featuredImage: imageUrl });
        toast.success('Imagem destacada enviada com sucesso!');
      } catch (error) {
        toast.error('Erro ao fazer upload da imagem');
      } finally {
        setIsUploading(false);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleFeaturedImageUpload(files[0]);
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFeaturedImageUpload(file);
      }
    };

    const addTag = () => {
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
        setNewTag('');
      }
    };

    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        tags,
        id: post?.id
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[85vh] overflow-y-auto p-1">
        {/* Cabeçalho */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {post ? 'Editar Post' : 'Novo Post'}
          </h3>
          <p className="text-gray-400 text-sm">
            Preencha os campos abaixo para criar seu artigo
          </p>
        </div>

        {/* Informações básicas */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="title" className="text-white text-sm font-medium">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                placeholder="Digite o título do artigo..."
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white text-sm font-medium">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="produtividade">Produtividade</SelectItem>
                  <SelectItem value="habitos">Hábitos</SelectItem>
                  <SelectItem value="foco">Foco</SelectItem>
                  <SelectItem value="gestao-tempo">Gestão de Tempo</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt" className="text-white text-sm font-medium">Resumo</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
              placeholder="Breve descrição do artigo (máximo 200 caracteres)"
              maxLength={200}
              rows={2}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.excerpt.length}/200
            </div>
          </div>
        </div>

        {/* Imagem destacada */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Imagem Destacada</Label>
          
          {/* Área de Drag & Drop */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              isDragOver 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {formData.featuredImage ? (
              <div className="relative">
                <img 
                  src={formData.featuredImage} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setFormData({ ...formData, featuredImage: '' })}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 font-medium mb-2">
                  {isUploading ? 'Enviando imagem...' : 'Arraste uma imagem aqui'}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  ou clique para selecionar um arquivo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="featured-image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="featured-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* URL da imagem */}
          <div>
            <Label htmlFor="featuredImageUrl" className="text-white text-sm font-medium">URL da Imagem (opcional)</Label>
            <Input
              id="featuredImageUrl"
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
              placeholder="Ou cole a URL da imagem aqui"
            />
          </div>
        </div>

        {/* Tags e Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-white text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                placeholder="Adicionar tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button 
                type="button" 
                onClick={addTag} 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300 bg-gray-800">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-white text-sm font-medium">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SEO */}
        <div className="border-t border-gray-700 pt-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Configurações SEO
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seoTitle" className="text-white text-sm font-medium">Título SEO</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                placeholder="Título otimizado para SEO"
              />
            </div>
            <div>
              <Label htmlFor="seoKeywords" className="text-white text-sm font-medium">Palavras-chave</Label>
              <Input
                id="seoKeywords"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                placeholder="palavra-chave1, palavra-chave2"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="seoDescription" className="text-white text-sm font-medium">Descrição SEO</Label>
            <Textarea
              id="seoDescription"
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
              placeholder="Descrição para motores de busca"
              rows={2}
            />
          </div>
        </div>

        {/* Editor de Conteúdo */}
        <div className="space-y-3">
          <Label className="text-white text-sm font-medium">Conteúdo *</Label>
          <BlogEditor
            initialContent={formData.content}
            onContentChange={(content) => setFormData({ ...formData, content })}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-6 border-t border-gray-700">
          <Button type="submit" className="bg-green-600 hover:bg-green-700 px-6">
            {post ? 'Atualizar' : 'Criar'} Post
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setBlogPostModal(false);
              setEditingBlogPost(null);
            }}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  // Componente CaveContentForm
  const CaveContentForm = ({ content, onSave }: { content: CaveContent | null, onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      title: content?.title || '',
      description: content?.description || '',
      type: content?.type || 'article',
      category: content?.category || '',
      url: content?.url || '',
      thumbnail: content?.thumbnail || '',
      duration: content?.duration || 0,
      isActive: content?.isActive ?? true,
      order: content?.order || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        id: content?.id
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-white">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type" className="text-white">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Artigo</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="playlist">Playlist</SelectItem>
                <SelectItem value="music">Música</SelectItem>
                <SelectItem value="ambient">Som Ambiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category" className="text-white">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="url" className="text-white">URL</Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="thumbnail" className="text-white">Thumbnail URL</Label>
          <Input
            id="thumbnail"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
            placeholder="https://..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration" className="text-white">Duração (segundos)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
          <div>
            <Label htmlFor="order" className="text-white">Ordem</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="bg-slate-800 border-white/20 text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-white/20 bg-slate-800"
          />
          <Label htmlFor="isActive" className="text-white">Ativo</Label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
            {content ? 'Atualizar' : 'Criar'} Conteúdo
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setCaveContentModal(false);
              setEditingCaveContent(null);
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Painel Administrativo
                </h1>
                <p className="text-white/70">
                  Gerencie usuários, conteúdo e configurações do sistema
                </p>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                <p className="text-xs text-white/60">
                  {stats.activeUsers} ativos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Total de Tarefas
                </CardTitle>
                <Target className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.totalTasks}</div>
                <p className="text-xs text-white/60">
                  Criadas pelos usuários
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Conquistas
                </CardTitle>
                <Award className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{stats.totalAchievements}</div>
                <p className="text-xs text-white/60">
                  Desbloqueadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Posts do Blog
                </CardTitle>
                <FileText className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{stats.totalBlogPosts}</div>
                <p className="text-xs text-white/60">
                  Publicados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-cyan-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Conteúdo Caverna
                </CardTitle>
                <Mountain className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">{stats.totalCaveContent}</div>
                <p className="text-xs text-white/60">
                  Itens ativos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-pink-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">
                  Analytics
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-400">24h</div>
                <p className="text-xs text-white/60">
                  Atualizado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-8 bg-slate-900/50 backdrop-blur-xl border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
                <TrendingUp className="h-4 w-4 mr-2" />
                Preços
              </TabsTrigger>
              <TabsTrigger value="landing" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
                <Globe className="h-4 w-4 mr-2" />
                Landing Pages
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                <FileText className="h-4 w-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="cave" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
                <Mountain className="h-4 w-4 mr-2" />
                Caverna
              </TabsTrigger>
              <TabsTrigger value="xp" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
                <Award className="h-4 w-4 mr-2" />
                XP Levels
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-purple-400" />
                      Atividade Recente
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Últimas ações dos usuários
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                        metrics.recentActivity.slice(0, 5).map((activity, index) => {
                          const getActivityColor = (action: string) => {
                            if (action.includes('registrado') || action.includes('criado')) return 'bg-green-400';
                            if (action.includes('completada') || action.includes('finalizada')) return 'bg-blue-400';
                            if (action.includes('conquista') || action.includes('achievement')) return 'bg-purple-400';
                            if (action.includes('login') || action.includes('entrada')) return 'bg-cyan-400';
                            return 'bg-orange-400';
                          };

                          const getActivityIcon = (action: string) => {
                            if (action.includes('registrado') || action.includes('criado')) return '👤';
                            if (action.includes('completada') || action.includes('finalizada')) return '✅';
                            if (action.includes('conquista') || action.includes('achievement')) return '🏆';
                            if (action.includes('login') || action.includes('entrada')) return '🔐';
                            return '📝';
                          };

                          const timeAgo = (dateString: string) => {
                            const now = new Date();
                            const activityTime = new Date(dateString);
                            const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
                            
                            if (diffInMinutes < 1) return 'Agora mesmo';
                            if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
                            if (diffInMinutes < 1440) return `Há ${Math.floor(diffInMinutes / 60)}h`;
                            return `Há ${Math.floor(diffInMinutes / 1440)} dias`;
                          };

                          return (
                            <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 ${getActivityColor(activity.action)} rounded-full mr-3`}></div>
                                <div>
                                  <p className="text-white text-sm">
                                    {getActivityIcon(activity.action)} {activity.action}
                                  </p>
                                  <p className="text-white/60 text-xs">
                                    {activity.user} • {timeAgo(activity.time)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-8 w-8 text-white/30 mx-auto mb-2" />
                          <p className="text-white/60 text-sm">Nenhuma atividade recente</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                      Métricas Rápidas
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Estatísticas do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Taxa de Conversão</span>
                        <span className="text-green-400 font-semibold">
                          {metrics?.conversionRate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Tempo Médio de Sessão</span>
                        <span className="text-blue-400 font-semibold">
                          {metrics?.avgSessionTime || 0} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Tarefas por Usuário</span>
                        <span className="text-purple-400 font-semibold">
                          {metrics?.avgTasksPerUser || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Satisfação</span>
                        <span className="text-orange-400 font-semibold">
                          {metrics?.satisfactionScore || 0}/5
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Taxa de Conclusão</span>
                        <span className="text-cyan-400 font-semibold">
                          {metrics?.taskCompletionRate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Conquistas/Usuário</span>
                        <span className="text-yellow-400 font-semibold">
                          {metrics?.avgAchievementsPerUser || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas Diárias */}
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                    Estatísticas dos Últimos 7 Dias
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Crescimento e atividade recente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-2">
                        {metrics?.dailyStats?.newUsers || 0}
                      </div>
                      <div className="text-sm text-white/70">Novos Usuários</div>
                      <div className="text-xs text-green-400 mt-1">+12% vs semana anterior</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 mb-2">
                        {metrics?.dailyStats?.newTasks || 0}
                      </div>
                      <div className="text-sm text-white/70">Novas Tarefas</div>
                      <div className="text-xs text-blue-400 mt-1">+8% vs semana anterior</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 mb-2">
                        {metrics?.dailyStats?.completedTasks || 0}
                      </div>
                      <div className="text-sm text-white/70">Tarefas Concluídas</div>
                      <div className="text-xs text-purple-400 mt-1">+15% vs semana anterior</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Assinaturas */}
              {metrics?.subscriptionDistribution && Object.keys(metrics.subscriptionDistribution).length > 0 && (
                <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="h-5 w-5 mr-2 text-cyan-400" />
                      Distribuição de Assinaturas
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Usuários por plano de assinatura
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(metrics.subscriptionDistribution).map(([plan, count]) => (
                        <div key={plan} className="flex justify-between items-center">
                          <span className="text-white/70 capitalize">
                            {plan === 'free' ? 'Gratuito' : 
                             plan === 'aspirante' ? 'Aspirante' : 
                             plan === 'executor' ? 'Executor' : plan}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-cyan-400 h-2 rounded-full" 
                                style={{ 
                                  width: `${(count / metrics.totalUsers) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-cyan-400 font-semibold text-sm">
                              {count} ({Math.round((count / metrics.totalUsers) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-400" />
                      Gerenciamento de Usuários
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Visualize e gerencie todos os usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">Lista de usuários será implementada aqui</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-400" />
                      Gerenciamento de Conteúdo
                    </div>
                    <Dialog open={blogPostModal} onOpenChange={setBlogPostModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border border-green-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingBlogPost ? 'Editar Post' : 'Novo Post'}
                          </DialogTitle>
                        </DialogHeader>
                        <BlogPostForm 
                          post={editingBlogPost}
                          onSave={async (data) => {
                            try {
                              const response = await fetch('/api/admin/blog-posts', {
                                method: editingBlogPost ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                              });
                              
                              if (response.ok) {
                                toast.success(editingBlogPost ? 'Post atualizado!' : 'Post criado!');
                                setBlogPostModal(false);
                                setEditingBlogPost(null);
                                fetchBlogPosts();
                              } else {
                                toast.error('Erro ao salvar post');
                              }
                            } catch (error) {
                              toast.error('Erro ao salvar post');
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Crie e gerencie posts do blog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">📝</div>
                          <div>
                            <h4 className="text-white font-medium">{post.title}</h4>
                            <p className="text-white/60 text-sm">{post.category || 'Sem categoria'}</p>
                            <p className="text-green-400 text-sm">{post.status} • {post.viewCount} visualizações</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBlogPost(post);
                              setBlogPostModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja deletar este post?')) {
                                try {
                                  const response = await fetch(`/api/admin/blog-posts?id=${post.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    toast.success('Post deletado!');
                                    fetchBlogPosts();
                                  } else {
                                    toast.error('Erro ao deletar post');
                                  }
                                } catch (error) {
                                  toast.error('Erro ao deletar post');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {blogPosts.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">Nenhum post encontrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cave" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Mountain className="h-5 w-5 mr-2 text-cyan-400" />
                      Conteúdo da Caverna
                    </div>
                    <Dialog open={caveContentModal} onOpenChange={setCaveContentModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-cyan-600 hover:bg-cyan-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Conteúdo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border border-cyan-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingCaveContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                          </DialogTitle>
                        </DialogHeader>
                        <CaveContentForm 
                          content={editingCaveContent}
                          onSave={async (data) => {
                            try {
                              const response = await fetch('/api/admin/cave-content', {
                                method: editingCaveContent ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                              });
                              
                              if (response.ok) {
                                toast.success(editingCaveContent ? 'Conteúdo atualizado!' : 'Conteúdo criado!');
                                setCaveContentModal(false);
                                setEditingCaveContent(null);
                                fetchCaveContent();
                              } else {
                                toast.error('Erro ao salvar conteúdo');
                              }
                            } catch (error) {
                              toast.error('Erro ao salvar conteúdo');
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Gerencie artigos, vídeos e playlists do modo caverna
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {caveContent.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">
                            {content.type === 'article' && '📄'}
                            {content.type === 'video' && '🎥'}
                            {content.type === 'playlist' && '📺'}
                            {content.type === 'music' && '🎵'}
                            {content.type === 'ambient' && '🌊'}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{content.title}</h4>
                            <p className="text-white/60 text-sm">{content.description}</p>
                            <p className="text-cyan-400 text-sm">{content.type} • {content.category || 'Sem categoria'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCaveContent(content);
                              setCaveContentModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja deletar este conteúdo?')) {
                                try {
                                  const response = await fetch(`/api/admin/cave-content?id=${content.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    toast.success('Conteúdo deletado!');
                                    fetchCaveContent();
                                  } else {
                                    toast.error('Erro ao deletar conteúdo');
                                  }
                                } catch (error) {
                                  toast.error('Erro ao deletar conteúdo');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {caveContent.length === 0 && (
                      <div className="text-center py-8">
                        <Mountain className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">Nenhum conteúdo encontrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
                      Gerenciamento de Preços
                    </div>
                    <Dialog open={pricingPlanModal} onOpenChange={setPricingPlanModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-yellow-600 hover:bg-yellow-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Plano
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border border-yellow-500/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingPricingPlan ? 'Editar Plano' : 'Novo Plano de Preço'}
                          </DialogTitle>
                          <DialogDescription className="text-white/70">
                            Configure os detalhes do plano de preço
                          </DialogDescription>
                        </DialogHeader>
                        <PricingPlanForm 
                          plan={editingPricingPlan}
                          onSave={async (data) => {
                            try {
                              const response = await fetch('/api/admin/pricing-plans', {
                                method: editingPricingPlan ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                              });
                              
                              if (response.ok) {
                                toast.success(editingPricingPlan ? 'Plano atualizado!' : 'Plano criado!');
                                setPricingPlanModal(false);
                                setEditingPricingPlan(null);
                                fetchPricingPlans();
                              } else {
                                toast.error('Erro ao salvar plano');
                              }
                            } catch (error) {
                              toast.error('Erro ao salvar plano');
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Gerencie preços e planos de assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingPlans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">💰</div>
                          <div>
                            <h4 className="text-white font-medium">{plan.name}</h4>
                            <p className="text-white/60 text-sm">{plan.description}</p>
                            <div className="flex gap-4 mt-2">
                              <span className="text-yellow-400 text-sm">
                                Original: R$ {plan.originalPrice}
                              </span>
                              {plan.promotionalPrice && (
                                <span className="text-green-400 text-sm">
                                  Promoção: R$ {plan.promotionalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPricingPlan(plan);
                              setPricingPlanModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`/landing/${plan.slug}`);
                              toast.success('Link copiado!');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pricingPlans.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">Nenhum plano encontrado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="landing" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-indigo-400" />
                      Landing Pages
                    </div>
                    <Dialog open={landingPageModal} onOpenChange={setLandingPageModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Nova Landing Page
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border border-indigo-500/20 max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingLandingPage ? 'Editar Landing Page' : 'Nova Landing Page'}
                          </DialogTitle>
                          <DialogDescription className="text-white/70">
                            Configure os detalhes da landing page
                          </DialogDescription>
                        </DialogHeader>
                        <LandingPageForm 
                          landingPage={editingLandingPage}
                          pricingPlans={pricingPlans}
                          onSave={async (data) => {
                            try {
                              const response = await fetch('/api/admin/landing-pages', {
                                method: editingLandingPage ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                              });
                              
                              if (response.ok) {
                                toast.success(editingLandingPage ? 'Landing page atualizada!' : 'Landing page criada!');
                                setLandingPageModal(false);
                                setEditingLandingPage(null);
                                fetchLandingPages();
                              } else {
                                toast.error('Erro ao salvar landing page');
                              }
                            } catch (error) {
                              toast.error('Erro ao salvar landing page');
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Gerencie landing pages com diferentes preços e templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {landingPages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">🌐</div>
                          <div>
                            <h4 className="text-white font-medium">{page.name}</h4>
                            <p className="text-white/60 text-sm">{page.title}</p>
                            <div className="flex gap-4 mt-2">
                              <span className="text-indigo-400 text-sm">
                                Template: {page.template}
                              </span>
                              <span className="text-green-400 text-sm">
                                Conversões: {page._count?.conversions || 0}
                              </span>
                              <span className="text-blue-400 text-sm">
                                Cliques: {page._count?.affiliateClicks || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLandingPage(page);
                              setLandingPageModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = `${window.location.origin}/landing/${page.slug}`;
                              navigator.clipboard.writeText(url);
                              toast.success('Link copiado!');
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {landingPages.length === 0 && (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60">Nenhuma landing page encontrada</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xp" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-orange-400" />
                      Configuração de Níveis XP
                    </div>
                    <Dialog open={xpLevelModal} onOpenChange={setXpLevelModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Nível
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border border-orange-500/20">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingXPLevel ? 'Editar Nível XP' : 'Novo Nível XP'}
                          </DialogTitle>
                        </DialogHeader>
                        <XPLevelForm 
                          xpLevel={editingXPLevel}
                          onSave={async (data) => {
                            try {
                              const response = await fetch('/api/admin/xp-levels', {
                                method: editingXPLevel ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                              });
                              
                              if (response.ok) {
                                toast.success(editingXPLevel ? 'Nível atualizado!' : 'Nível criado!');
                                setXpLevelModal(false);
                                setEditingXPLevel(null);
                                fetchXPLevels();
                              } else {
                                toast.error('Erro ao salvar nível');
                              }
                            } catch (error) {
                              toast.error('Erro ao salvar nível');
                            }
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Defina os requisitos de XP para cada nível
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {xpLevels.map((level) => (
                      <div key={level.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{level.badge || '🎯'}</div>
                          <div>
                            <h4 className="text-white font-medium">Nível {level.level} - {level.title}</h4>
                            <p className="text-white/60 text-sm">{level.description}</p>
                            <p className="text-orange-400 text-sm">{level.xpRequired} XP necessário</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingXPLevel(level);
                              setXpLevelModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja deletar este nível?')) {
                                try {
                                  const response = await fetch(`/api/admin/xp-levels?id=${level.id}`, {
                                    method: 'DELETE'
                                  });
                                  
                                  if (response.ok) {
                                    toast.success('Nível deletado!');
                                    fetchXPLevels();
                                  } else {
                                    toast.error('Erro ao deletar nível');
                                  }
                                } catch (error) {
                                  toast.error('Erro ao deletar nível');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-pink-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-pink-400" />
                    Configurações do Sistema
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Configurações gerais da aplicação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Configurações Gerais</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">Manutenção</span>
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                            Desativado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">Registros</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">Backup</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Automático
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Segurança</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">2FA</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Obrigatório
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">Rate Limiting</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/70">Logs de Segurança</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}