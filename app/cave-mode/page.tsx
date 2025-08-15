'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mountain,
  BookOpen, 
  Play, 
  Headphones,
  Search,
  Filter,
  Crown,
  FileText,
  Video,
  Music,
  Coffee,
  Zap,
  Star,
  Lock,
  Eye,
  Clock,
  TrendingUp,
  Target,
  Brain,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  SkipBack,
  SkipForward,
  Pause,
  Play as PlayIcon,
  Settings,
  Maximize,
  Minimize,
  X,
  Plus,
  Heart,
  Share2,
  Download,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Flame,
  Target as TargetIcon,
  Brain as BrainIcon,
  Zap as ZapIcon
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

interface CaveContent {
  id: string;
  title: string;
  description?: string;
  contentType: 'article' | 'video' | 'playlist' | 'music' | 'ambient';
  category: 'productivity' | 'motivation' | 'learning' | 'focus' | 'relaxation';
  url?: string;
  thumbnail?: string;
  duration?: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  views?: number;
  likes?: number;
}

interface AmbientSound {
  id: string;
  name: string;
  category: 'nature' | 'rain' | 'ocean' | 'forest' | 'white-noise' | 'lofi' | 'classical';
  url: string;
  isPlaying: boolean;
  volume: number;
}

export default function CaveModePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subscription, canAccessFeature } = useSubscription();
  const { translations } = useLanguage();
  
  const [contents, setContents] = useState<CaveContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<CaveContent[]>([]);
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<CaveContent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    startTime: null as Date | null,
    duration: 0,
    isActive: false
  });

  // Mock data para demonstração
  const mockContents: CaveContent[] = [
    {
      id: '1',
      title: 'Como Manter o Foco por 4 Horas Seguidas',
      description: 'Técnicas avançadas de concentração para trabalho profundo',
      contentType: 'article',
      category: 'focus',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 15,
      isActive: true,
      order: 1,
      createdAt: new Date('2024-01-15'),
      views: 15420,
      likes: 892
    },
    {
      id: '2',
      title: 'Playlist Lo-Fi para Produtividade',
      description: 'Música relaxante para manter o foco durante o trabalho',
      contentType: 'playlist',
      category: 'productivity',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 120,
      isActive: true,
      order: 2,
      createdAt: new Date('2024-01-14'),
      views: 8920,
      likes: 456
    },
    {
      id: '3',
      title: 'Sons da Floresta - Concentração Profunda',
      description: 'Ambientes naturais para eliminar distrações',
      contentType: 'ambient',
      category: 'focus',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 60,
      isActive: true,
      order: 3,
      createdAt: new Date('2024-01-13'),
      views: 12340,
      likes: 678
    },
    {
      id: '4',
      title: 'Técnicas de Respiração para Foco',
      description: 'Exercícios respiratórios para melhorar a concentração',
      contentType: 'video',
      category: 'learning',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 8,
      isActive: true,
      order: 4,
      createdAt: new Date('2024-01-12'),
      views: 18760,
      likes: 1023
    },
    {
      id: '5',
      title: 'Chuva Relaxante - 2 Horas',
      description: 'Som de chuva para relaxamento e foco',
      contentType: 'ambient',
      category: 'relaxation',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 120,
      isActive: true,
      order: 5,
      createdAt: new Date('2024-01-11'),
      views: 22100,
      likes: 1345
    },
    {
      id: '6',
      title: 'Música Clássica para Trabalho',
      description: 'Composições clássicas que aumentam a produtividade',
      contentType: 'music',
      category: 'productivity',
      url: '#',
      thumbnail: '/api/placeholder/300/200',
      duration: 90,
      isActive: true,
      order: 6,
      createdAt: new Date('2024-01-10'),
      views: 15680,
      likes: 789
    }
  ];

  const mockAmbientSounds: AmbientSound[] = [
    { id: '1', name: 'Chuva', category: 'rain', url: '#', isPlaying: false, volume: 0.5 },
    { id: '2', name: 'Oceano', category: 'ocean', url: '#', isPlaying: false, volume: 0.5 },
    { id: '3', name: 'Floresta', category: 'forest', url: '#', isPlaying: false, volume: 0.5 },
    { id: '4', name: 'Ruído Branco', category: 'white-noise', url: '#', isPlaying: false, volume: 0.5 },
    { id: '5', name: 'Lo-Fi Beats', category: 'lofi', url: '#', isPlaying: false, volume: 0.5 },
    { id: '6', name: 'Música Clássica', category: 'classical', url: '#', isPlaying: false, volume: 0.5 }
  ];

  // Verificar permissão
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!canAccessFeature('caveMode')) {
      setShowUpgradeModal(true);
      return;
    }

    loadContents();
  }, [session, status, canAccessFeature]);

  // Filtrar conteúdos
  useEffect(() => {
    let filtered = contents.filter(content => content.isActive);

    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(content => content.contentType === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(content => content.category === categoryFilter);
    }

    // Ordenar por order e depois por data
    filtered.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredContents(filtered);
  }, [contents, searchTerm, typeFilter, categoryFilter]);

  const loadContents = async () => {
    try {
      // Simular carregamento
      setTimeout(() => {
        setContents(mockContents);
        setAmbientSounds(mockAmbientSounds);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast.error('Erro ao carregar conteúdo da caverna');
    }
  };

  const startSession = () => {
    setCurrentSession({
      startTime: new Date(),
      duration: 0,
      isActive: true
    });
    toast.success('Sessão de foco iniciada!');
  };

  const stopSession = () => {
    setCurrentSession({
      startTime: null,
      duration: 0,
      isActive: false
    });
    toast.info('Sessão de foco finalizada');
  };

  const toggleAmbientSound = (soundId: string) => {
    setAmbientSounds(prev => prev.map(sound => 
      sound.id === soundId 
        ? { ...sound, isPlaying: !sound.isPlaying }
        : sound
    ));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Entrando na caverna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mr-4">
                    <Mountain className="h-8 w-8 text-purple-400" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Modo Caverna
                  </h1>
                </div>
                <p className="text-xl text-white/70 max-w-3xl mx-auto">
                  Foque no que realmente importa. Elimine distrações e maximize sua produtividade.
                </p>
              </motion.div>

              {/* Session Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8"
              >
                <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 max-w-md mx-auto">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Sessão de Foco
                      </h3>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            {currentSession.isActive ? '00:45:32' : '00:00:00'}
                          </div>
                          <div className="text-xs text-white/60">Tempo Ativo</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            {currentSession.isActive ? '85%' : '0%'}
                          </div>
                          <div className="text-xs text-white/60">Foco</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!currentSession.isActive ? (
                          <Button 
                            onClick={startSession}
                            className="bg-purple-600 hover:bg-purple-700 flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Sessão
                          </Button>
                        ) : (
                          <Button 
                            onClick={stopSession}
                            className="bg-red-600 hover:bg-red-700 flex-1"
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Parar Sessão
                          </Button>
                        )}
                        <Button variant="outline" className="bg-white/5 border-white/10">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="content" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 backdrop-blur-xl border border-white/10">
                <TabsTrigger value="content" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="ambient" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                  <Headphones className="h-4 w-4 mr-2" />
                  Sons Ambientes
                </TabsTrigger>
                <TabsTrigger value="playlists" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                  <Music className="h-4 w-4 mr-2" />
                  Playlists
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Estatísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Pesquisar conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-purple-500/50"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 focus:border-purple-500/50"
                    >
                      <option value="all">Todos os Tipos</option>
                      <option value="article">Artigos</option>
                      <option value="video">Vídeos</option>
                      <option value="playlist">Playlists</option>
                      <option value="music">Música</option>
                      <option value="ambient">Sons Ambientes</option>
                    </select>
                    
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 focus:border-purple-500/50"
                    >
                      <option value="all">Todas as Categorias</option>
                      <option value="productivity">Produtividade</option>
                      <option value="motivation">Motivação</option>
                      <option value="learning">Aprendizado</option>
                      <option value="focus">Foco</option>
                      <option value="relaxation">Relaxamento</option>
                    </select>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContents.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] group">
                        <div className="p-6">
                          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg h-48 flex items-center justify-center mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
                            <div className="relative z-10">
                              {content.contentType === 'article' && <FileText className="h-16 w-16 text-purple-400/50" />}
                              {content.contentType === 'video' && <Video className="h-16 w-16 text-red-400/50" />}
                              {content.contentType === 'playlist' && <Music className="h-16 w-16 text-green-400/50" />}
                              {content.contentType === 'music' && <Headphones className="h-16 w-16 text-blue-400/50" />}
                              {content.contentType === 'ambient' && <Coffee className="h-16 w-16 text-orange-400/50" />}
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                {content.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {content.title}
                            </h3>
                            <p className="text-white/70 text-sm line-clamp-2">
                              {content.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-white/60">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{formatViews(content.views || 0)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDuration(content.duration || 0)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{content.likes || 0}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1">
                                <Play className="h-3 w-3 mr-1" />
                                Acessar
                              </Button>
                              <Button size="sm" variant="outline" className="bg-white/5 border-white/10">
                                <Heart className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ambient" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ambientSounds.map((sound, index) => (
                    <motion.div
                      key={sound.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                                <Headphones className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{sound.name}</h3>
                                <p className="text-sm text-white/60 capitalize">{sound.category}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={sound.isPlaying ? "default" : "outline"}
                              onClick={() => toggleAmbientSound(sound.id)}
                              className={sound.isPlaying ? "bg-blue-600 hover:bg-blue-700" : "bg-white/5 border-white/10"}
                            >
                              {sound.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <VolumeX className="h-4 w-4 text-white/50" />
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={sound.volume}
                                onChange={(e) => {
                                  setAmbientSounds(prev => prev.map(s => 
                                    s.id === sound.id ? { ...s, volume: parseFloat(e.target.value) } : s
                                  ));
                                }}
                                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <Volume2 className="h-4 w-4 text-white/50" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="playlists" className="space-y-6">
                <div className="text-center py-12">
                  <Music className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Playlists em Desenvolvimento
                  </h3>
                  <p className="text-white/60">
                    Em breve você poderá criar e gerenciar suas próprias playlists
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TargetIcon className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-purple-400 mb-2">24h 32m</div>
                      <div className="text-white/70">Tempo Total de Foco</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BrainIcon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-2">87%</div>
                      <div className="text-white/70">Taxa de Concentração</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ZapIcon className="h-6 w-6 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-green-400 mb-2">156</div>
                      <div className="text-white/70">Sessões Completadas</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="caveMode"
      />
    </div>
  );
}
