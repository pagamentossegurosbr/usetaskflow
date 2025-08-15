'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Star, 
  Calendar, 
  Search,
  Edit,
  Trash2,
  Crown,
  Filter,
  BookMarked,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { toast } from 'sonner';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { CustomTooltip } from '@/components/ui/custom-tooltip';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Constantes de gráficos (fora do componente para evitar qualquer ambiguidade de parsing)
const GRID = 'rgba(255,255,255,0.08)';
const AXIS = 'rgba(255,255,255,0.6)';
const AXIS_LINE = 'rgba(255,255,255,0.15)';
const TICK = { fill: 'rgba(255,255,255,0.7)', fontSize: 11 } as const;
const PIE_COLORS = ['#7C4DFF', '#8B5CF6', '#A78BFA', '#C4B5FD', '#E9D5FF'];

function SimpleTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="px-3 py-2 bg-black/90 border border-white/10 rounded text-white text-xs">
      {label && <div className="font-semibold mb-1">{label}</div>}
      <div className="text-gray-300">Valor: <span className="text-purple-300 font-bold">{payload[0].value}</span></div>
    </div>
  );
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  status: 'to_read' | 'reading' | 'completed';
  rating?: number;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const STATUS_OPTIONS = [
  { value: 'to_read', label: 'Quero Ler', icon: '📚', color: 'bg-blue-500' },
  { value: 'reading', label: 'Lendo', icon: '📖', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Concluído', icon: '✅', color: 'bg-green-500' }
];

const RATING_STARS = [1, 2, 3, 4, 5];

export default function ReadingLibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subscription, canAccessFeature } = useSubscription();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'library' | 'stats'>('library');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Busca Open Library
  const [olQuery, setOlQuery] = useState('');
  const [olLoading, setOlLoading] = useState(false);
  const [olSuggestions, setOlSuggestions] = useState<any[]>([]);
  const [olError, setOlError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    coverUrl: '',
    status: 'to_read' as const,
    rating: undefined as number | undefined,
    notes: ''
  });

  // Verificar permissão
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!canAccessFeature('readingLibrary')) {
      setShowUpgradeModal(true);
      return;
    }

    // Tentar carregar do localStorage primeiro (offline básico)
    try {
      const cached = localStorage.getItem('reading_library_books');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setBooks(parsed);
      }
    } catch {}

    loadBooks();
  }, [session, status, canAccessFeature]);

  // Filtrar livros
  useEffect(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(book => book.status === statusFilter);
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, statusFilter]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reading-library');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        try { localStorage.setItem('reading_library_books', JSON.stringify(data)); } catch {}
      }
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Título e autor são obrigatórios');
      return;
    }

    try {
      // Preferir capa local se houver
      let coverUrl = formData.coverUrl;
      if (coverFile) {
        if (coverFile.size > 3 * 1024 * 1024) {
          toast.error('Arquivo de capa maior que 3MB');
          return;
        }
        // Upload temporário (base64) — em produção, substituir por storage
        const b64 = await coverFile.arrayBuffer().then(buf => Buffer.from(buf).toString('base64'));
        coverUrl = `data:${coverFile.type};base64,${b64}`;
      }
      const payload = { ...formData, coverUrl } as any;

      // Se não há capa definida, tentar Open Library por ISBN
      if (!payload.coverUrl && payload.isbn) {
        const isbn = encodeURIComponent(payload.isbn.trim());
        const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        if (res.ok) {
          const js = await res.json();
          if (js?.covers?.length) {
            payload.coverUrl = `https://covers.openlibrary.org/b/id/${js.covers[0]}-M.jpg`;
          }
        }
      }

      const response = await fetch('/api/reading-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Livro adicionado à biblioteca! 📚');
        setShowCreateModal(false);
        resetForm();
        await loadBooks();
      } else {
        throw new Error('Failed to create book');
      }
    } catch (error) {
      console.error('Error creating book:', error);
      toast.error('Erro ao adicionar livro');
    }
  };

  const updateBookStatus = async (bookId: string, status: Book['status']) => {
    try {
      const updateData: any = { status };
      
      if (status === 'reading' && books.find(b => b.id === bookId)?.status === 'to_read') {
        updateData.startedAt = new Date().toISOString();
      }
      
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      const response = await fetch(`/api/reading-library/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await loadBooks();
        toast.success('Status atualizado! ✨');
      }
    } catch (error) {
      console.error('Error updating book status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const updateBookRating = async (bookId: string, rating: number) => {
    try {
      const response = await fetch(`/api/reading-library/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        await loadBooks();
        toast.success('Avaliação salva! ⭐');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Erro ao salvar avaliação');
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/reading-library/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Livro removido da biblioteca');
        await loadBooks();
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Erro ao remover livro');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      coverUrl: '',
      status: 'to_read',
      rating: undefined,
      notes: ''
    });
  };

  const getStatusOption = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const getReadingStats = () => {
    const toRead = books.filter(b => b.status === 'to_read').length;
    const reading = books.filter(b => b.status === 'reading').length;
    const completed = books.filter(b => b.status === 'completed').length;
    const avgRating = books
      .filter(b => b.rating)
      .reduce((acc, b) => acc + (b.rating || 0), 0) / books.filter(b => b.rating).length || 0;

    return { toRead, reading, completed, avgRating: Math.round(avgRating * 10) / 10 };
  };

  const stats = getReadingStats();

  // Estatísticas avançadas
  const statusData = useMemo(() => ([
    { name: 'Quero Ler', value: stats.toRead },
    { name: 'Lendo', value: stats.reading },
    { name: 'Concluído', value: stats.completed }
  ]), [stats]);

  const completedPerMonth = useMemo(() => {
    // últimos 12 meses
    const now = new Date();
    const arr: { label: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const count = books.filter(b => b.status === 'completed' && b.completedAt && new Date(b.completedAt).getMonth() === d.getMonth() && new Date(b.completedAt).getFullYear() === d.getFullYear()).length;
      arr.push({ label, value: count });
    }
    return arr;
  }, [books]);

  const ratingDistribution = useMemo(() => {
    const dist = [1,2,3,4,5].map(r => ({ rating: `${r}★`, value: books.filter(b => b.rating === r).length }));
    return dist;
  }, [books]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Executor
            </Badge>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            Biblioteca de Leitura
          </h1>
          <p className="text-gray-300 text-lg">
            Organize sua jornada literária e acompanhe seu progresso de leitura
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button onClick={() => setActiveTab('library')} variant={activeTab === 'library' ? 'default' : 'ghost'} className={`${activeTab === 'library' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'} h-9 px-4`}>Biblioteca</Button>
          <Button onClick={() => setActiveTab('stats')} variant={activeTab === 'stats' ? 'default' : 'ghost'} className={`${activeTab === 'stats' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'} h-9 px-4`}>Estatísticas</Button>
        </div>

        {/* Stats quick cards (sempre visíveis) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="backdrop-blur-xl bg-white/5 border border-blue-500/20">
            <CardContent className="p-4 text-center">
              <BookMarked className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.toRead}</div>
              <div className="text-sm text-gray-300">Quero Ler</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-white/5 border border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.reading}</div>
              <div className="text-sm text-gray-300">Lendo</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-white/5 border border-green-500/20">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.completed}</div>
              <div className="text-sm text-gray-300">Concluídos</div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-xl bg-white/5 border border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {stats.avgRating > 0 ? stats.avgRating : '—'}
              </div>
              <div className="text-sm text-gray-300">Média</div>
            </CardContent>
          </Card>
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-purple-500/20 text-white"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/5 border-purple-500/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-purple-500/20">
              <SelectItem value="all" className="text-white hover:bg-purple-500/20">
                Todos os Status
              </SelectItem>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-500/20">
                  {option.icon} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0 shadow-lg shadow-purple-500/25 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Livro
              </Button>
            </DialogTrigger>
            
            <DialogContent className="backdrop-blur-2xl bg-black/80 border border-purple-500/20 shadow-2xl shadow-purple-500/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Novo Livro</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Busca Open Library */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Buscar (título ou autor)</label>
                  <div className="relative">
                    <Input
                      placeholder="Digite 3+ caracteres para buscar..."
                      value={olQuery}
                      onChange={async (e) => {
                        const q = e.target.value;
                        setOlQuery(q);
                        setOlError(null);
                        if (q.trim().length < 3) { setOlSuggestions([]); return; }
                        setOlLoading(true);
                        try {
                          const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q.trim())}&limit=10`;
                          const res = await fetch(url);
                          if (!res.ok) throw new Error('Falha na busca');
                          const data = await res.json();
                          const items = (data?.docs || []).map((d: any) => ({
                            key: `${d.key}-${d.cover_i || ''}`,
                            title: d.title,
                            author: Array.isArray(d.author_name) ? d.author_name[0] : (d.author_name || ''),
                            isbn: Array.isArray(d.isbn) ? d.isbn[0] : (d.isbn || ''),
                            coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : '',
                            year: d.first_publish_year || ''
                          }));
                          setOlSuggestions(items);
                        } catch (err: any) {
                          setOlError('Erro ao buscar na Open Library');
                        } finally {
                          setOlLoading(false);
                        }
                      }}
                      className="bg-white/5 border-purple-500/20 text-white"
                    />
                    {/* Dropdown de sugestões */}
                    {(olLoading || olSuggestions.length > 0 || olError) && (
                      <div className="absolute z-50 w-full mt-2 bg-black/90 border border-purple-500/20 rounded-lg shadow-xl max-h-64 overflow-auto">
                        {olLoading && (
                          <div className="p-3 text-xs text-gray-300">Buscando...</div>
                        )}
                        {olError && (
                          <div className="p-3 text-xs text-red-300">{olError}</div>
                        )}
                        {!olLoading && !olError && olSuggestions.map((sug) => (
                          <button
                            key={sug.key}
                            onClick={() => {
                              setFormData({
                                title: sug.title || '',
                                author: sug.author || '',
                                isbn: sug.isbn || '',
                                coverUrl: sug.coverUrl || '',
                                status: 'to_read',
                                rating: undefined,
                                notes: ''
                              });
                              setOlQuery(`${sug.title} — ${sug.author}`);
                              setOlSuggestions([]);
                            }}
                            className="w-full text-left p-3 hover:bg-purple-500/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-10 bg-white/5 rounded overflow-hidden flex items-center justify-center">
                                {sug.coverUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={sug.coverUrl} alt={sug.title} className="w-full h-full object-cover" />
                                ) : (
                                  <BookOpen className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-white font-medium line-clamp-1">{sug.title}</div>
                                <div className="text-[10px] text-gray-400 line-clamp-1">{sug.author} {sug.year ? `• ${sug.year}` : ''}</div>
                              </div>
                              {sug.isbn && (
                                <div className="text-[10px] text-gray-500">ISBN {sug.isbn}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Título *
                  </label>
                  <Input
                    placeholder="Nome do livro"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Autor *
                  </label>
                  <Input
                    placeholder="Nome do autor"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Status
                    </label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="bg-white/5 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-purple-500/20">
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-500/20">
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      ISBN (opcional)
                    </label>
                    <Input
                      placeholder="ISBN"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      className="bg-white/5 border-purple-500/20 text-white"
                    />
                  </div>
                </div>

                {/* Upload de capa (3MB máx) */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Capa (upload até 3MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setCoverFile(f || null);
                    }}
                    className="block w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                  {!!coverFile && (
                    <div className="mt-2 text-xs text-gray-400">Selecionado: {coverFile.name} ({Math.round(coverFile.size/1024)} KB)</div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    URL da Capa (opcional)
                  </label>
                  <Input
                    placeholder="https://..."
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Notas
                  </label>
                  <Textarea
                    placeholder="Suas anotações sobre o livro..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-white/5 border-purple-500/20 text-white resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                  Cancelar
                </Button>
                <Button onClick={createBook} className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Switch de visualização */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant={viewMode==='cards'?'default':'ghost'} size="sm" onClick={()=>setViewMode('cards')} className={`${viewMode==='cards'?'bg-purple-600 text-white':'text-gray-300 hover:text-white'} h-8 px-3`}>Cards</Button>
          <Button variant={viewMode==='table'?'default':'ghost'} size="sm" onClick={()=>setViewMode('table')} className={`${viewMode==='table'?'bg-purple-600 text-white':'text-gray-300 hover:text-white'} h-8 px-3`}>Tabela</Button>
        </div>

        {/* Books View */}
        {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full">
              <Card className="backdrop-blur-xl bg-white/5 border border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    {books.length === 0 ? 'Sua biblioteca está vazia' : 'Nenhum livro encontrado'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {books.length === 0 
                      ? 'Comece adicionando seu primeiro livro à biblioteca!'
                      : 'Tente ajustar os filtros de busca.'
                    }
                  </p>
                  {books.length === 0 && (
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-violet-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Livro
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredBooks.map((book, index) => {
              const statusOption = getStatusOption(book.status);
              
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all h-full hover:shadow-lg hover:shadow-purple-500/10">
                    <CardContent className="p-4">
                      {/* Book Cover */}
                      <div className="aspect-[3/4] bg-white/10 rounded-lg mb-3 overflow-hidden">
                        {book.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={book.coverUrl} 
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      {/* Book Info */}
                      <div className="space-y-1">
                        <h3 className="font-semibold text-white line-clamp-2">{book.title}</h3>
                        <p className="text-sm text-gray-400">por {book.author}</p>
                        
                        {/* Status Badge */}
                        <Badge className={`text-white text-xs ${statusOption.color}`}>
                          {statusOption.icon} {statusOption.label}
                        </Badge>
                        
                        {/* Hover info */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-300 bg-black/50 rounded p-2 mt-2">
                          <div><span className="text-gray-400">ISBN:</span> {book.isbn || '—'}</div>
                          <div><span className="text-gray-400">Status:</span> {statusOption.label}</div>
                          {book.rating ? <div><span className="text-gray-400">Avaliação:</span> {book.rating}★</div> : null}
                        </div>

                        {/* Rating */}
                        {book.rating && (
                          <div className="flex items-center gap-1">
                            {RATING_STARS.map(star => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= book.rating! 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex gap-1 pt-2">
                          <Select 
                            value={book.status} 
                            onValueChange={(value: any) => updateBookStatus(book.id, value)}
                          >
                            <SelectTrigger className="flex-1 h-8 text-xs bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10">
                              {STATUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-500/20">
                                  {option.icon} {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBook(book.id)}
                            className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Rating Stars for completed books */}
                        {book.status === 'completed' && (
                          <div className="flex gap-1 pt-1">
                            {RATING_STARS.map(star => (
                              <button
                                key={star}
                                onClick={() => updateBookRating(book.id, star)}
                                className="p-0"
                              >
                                <Star
                                  className={`h-4 w-4 transition-colors ${
                                    star <= (book.rating || 0)
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-600 hover:text-yellow-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
        ) : (
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-300">Capa</TableHead>
                    <TableHead className="text-gray-300">Título</TableHead>
                    <TableHead className="text-gray-300">Autor</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Avaliação</TableHead>
                    <TableHead className="text-gray-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => {
                    const statusOption = getStatusOption(book.status);
                    return (
                      <TableRow key={book.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="w-10 h-14 bg-white/10 rounded overflow-hidden">
                            {book.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{book.title}</TableCell>
                        <TableCell className="text-gray-300">{book.author}</TableCell>
                        <TableCell>
                          <Badge className={`text-white text-xs ${statusOption.color}`}>{statusOption.label}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{book.rating ? `${book.rating}★` : '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={book.status} onValueChange={(value: any) => updateBookStatus(book.id, value)}>
                              <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 border-white/10">
                                {STATUS_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-500/20">
                                    {option.icon} {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={() => deleteBook(book.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Livros por Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} />
                      <YAxis stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} allowDecimals={false} />
                      <ReTooltip content={<SimpleTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
                      <Bar dataKey="value" fill="#7C4DFF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Concluídos por Mês (12m)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={completedPerMonth} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                        <XAxis dataKey="label" stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} />
                        <YAxis stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} allowDecimals={false} />
                        <ReTooltip content={<SimpleTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                        <Line type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#A78BFA' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Distribuição de Avaliações</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                        <XAxis dataKey="rating" stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} />
                        <YAxis stroke={AXIS} tick={TICK} axisLine={{ stroke: AXIS_LINE }} tickLine={false} allowDecimals={false} />
                        <ReTooltip content={<SimpleTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
                        <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </>
        )}

      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          router.push('/');
        }}
        currentLevel={3}
        targetPlan="executor"
      />
    </div>
  );
}
