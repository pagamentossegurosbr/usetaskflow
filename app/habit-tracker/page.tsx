'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { Check } from 'lucide-react';
// import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Target, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Trash2,
  Crown,
  Flame,
  Award,
  Table as TableIcon,
  Grid3X3,
  BarChart3,
  Filter,
  Eye,
  Edit,
  Circle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  color: string;
  isActive: boolean;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  entries: HabitEntry[];
}

interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

const HABIT_COLORS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16', '#F97316'
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diário', icon: '📅' },
  { value: 'weekly', label: 'Semanal', icon: '📊' },
  { value: 'monthly', label: 'Mensal', icon: '📆' }
];

type ViewMode = 'table' | 'cards' | 'stats';
type DateFilter = 'today' | 'week' | 'month' | 'all';

// Badge de frequência
const FrequencyBadge = ({ frequency }: { frequency: 'daily' | 'weekly' | 'monthly' }) => {
  const badges = {
    daily: { 
      label: 'Diário', 
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: '📅'
    },
    weekly: { 
      label: 'Semanal', 
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: '📊'
    },
    monthly: { 
      label: 'Mensal', 
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      icon: '📆'
    }
  };
  
  const badge = badges[frequency];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
      <span className="text-xs">{badge.icon}</span>
      {badge.label}
    </span>
  );
};

// Componente de botão para concluir hábitos
const HabitCompleteButton = ({ 
  completed, 
  onComplete, 
  habitColor, 
  habitName,
  isLoading = false
}: { 
  completed: boolean; 
  onComplete: () => void;
  habitColor?: string;
  habitName?: string;
  isLoading?: boolean;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onComplete}
      disabled={isLoading}
      className={cn(
        "relative w-8 h-8 rounded-full transition-colors duration-200 flex items-center justify-center",
        completed
          ? "bg-emerald-500 text-white border border-emerald-500"
          : "bg-transparent text-emerald-400 border border-emerald-500/60 hover:bg-emerald-500/10",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      aria-label={completed ? `Hábito ${habitName || ''} concluído` : `Concluir hábito ${habitName || ''}`}
    >
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.button>
  );
};

// Componente customizado de Progress para hábitos
const HabitProgress = ({ value, habitColor, className }: { 
  value: number; 
  habitColor?: string;
  className?: string;
}) => {
  const percentage = Math.min(Math.max(value || 0, 0), 100);
  
  return (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        className="h-full rounded-full relative overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
          backgroundColor: percentage > 0 ? (habitColor || '#8B5CF6') : 'transparent'
        }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        
        {/* Glow effect */}
        {percentage > 0 && (
          <div 
            className="absolute inset-0 rounded-full opacity-50 blur-sm"
            style={{ backgroundColor: habitColor || '#8B5CF6' }}
          />
        )}
      </motion.div>
      
      {/* Percentage text overlay */}
      {percentage > 15 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-md">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Componente de Card de HÃ¡bito reutilizÃ¡vel
const HabitCard = ({ habit, index, getTodayProgress, getPeriodProgress, toggleHabitEntry, openDetailsModal, openEditModal, deleteHabit, loadingHabits }: {
  habit: Habit;
  index: number;
  getTodayProgress: (habit: Habit) => boolean;
  getPeriodProgress: (habit: Habit) => number;
  toggleHabitEntry: (habitId: string, date: string) => void;
  openDetailsModal: (habit: Habit) => void;
  openEditModal: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  loadingHabits: Set<string>;
}) => (
  <motion.div
    key={habit.id}
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      delay: index * 0.1,
      duration: 0.6,
      ease: "easeOut"
    }}
    className="group"
  >
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative backdrop-blur-xl bg-white/5 border border-purple-500/20 rounded-3xl p-6 hover:bg-white/10 hover:border-purple-400/30 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10"
    >
      {/* Glassmorphism Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-5 h-5 rounded-lg shadow-lg"
              style={{ 
                backgroundColor: habit.color,
                boxShadow: `0 4px 15px ${habit.color}40`
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-white">{habit.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <FrequencyBadge frequency={habit.frequency} />
              </div>
              {habit.description && (
                <p className="text-gray-400 text-sm mt-1">{habit.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => openDetailsModal(habit)}
              className="w-7 h-7 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all duration-300"
              title="Ver detalhes"
            >
              <Eye className="h-3 w-3" />
            </button>
            <button
              onClick={() => openEditModal(habit)}
              className="w-7 h-7 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg flex items-center justify-center text-yellow-400 hover:text-yellow-300 transition-all duration-300"
              title="Editar"
            >
              <Edit className="h-3 w-3" />
            </button>
            <button
              onClick={() => deleteHabit(habit.id)}
              className="w-7 h-7 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-300"
              title="Excluir"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Status and Date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HabitCompleteButton
              completed={getTodayProgress(habit)}
              onComplete={() => {
                toggleHabitEntry(habit.id, format(new Date(), 'yyyy-MM-dd'));
              }}
              habitColor={habit.color}
              habitName={habit.name}
              isLoading={loadingHabits.has(habit.id)}
            />
            <div className="text-center">
              <div className="text-white text-sm font-medium">
                {getTodayProgress(habit) ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    Concluído
                  </span>
                ) : (
                  'Clique para concluir'
                )}
              </div>
              <div className="text-gray-400 text-xs">
                {format(new Date(), 'dd \'de\' MMMM', { locale: ptBR })}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white text-sm font-medium">
              🔥 {habit.currentStreak}
            </div>
            <div className="text-gray-400 text-xs">sequência</div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm font-medium">Progresso</span>
            <span className="text-white text-sm font-bold">
              {Math.round(getPeriodProgress(habit))}%
            </span>
          </div>
          <HabitProgress 
            value={getPeriodProgress(habit)} 
            habitColor={habit.color}
          />
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default function HabitTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subscription, canAccessFeature } = useSubscription();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingHabits, setLoadingHabits] = useState<Set<string>>(new Set());

  // Organizar hábitos por frequência (mantém layout e apenas fornece dados prontos)
  const organizedHabits = useMemo(() => {
    const active = habits.filter(h => h.isActive);
    return {
      daily: active.filter(h => h.frequency === 'daily'),
      weekly: active.filter(h => h.frequency === 'weekly'),
      monthly: active.filter(h => h.frequency === 'monthly'),
      all: active,
    };
  }, [habits]);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetCount: number;
    color: string;
  }>({
    name: '',
    description: '',
    frequency: 'daily',
    targetCount: 1,
    color: HABIT_COLORS[0]
  });

  // Verificar permissão
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!canAccessFeature('habitTracker')) {
      setShowUpgradeModal(true);
      return;
    }

    loadHabits();
  }, [session, status, canAccessFeature]);

  // Forçar re-render quando habits carregam para atualizar indicadores
  useEffect(() => {
    if (habits.length > 0) {
      // Trigger re-calculation of stats by updating selected date
      const now = new Date();
      setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    }
  }, [habits]);

  // Garantir que indicadores sejam atualizados quando hábitos mudam
  useEffect(() => {
    // Force re-render of components that depend on habit stats
    const timeoutId = setTimeout(() => {
      setSelectedDate(prev => new Date(prev.getTime()));
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [habits]);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/habits');
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Erro ao carregar hábitos');
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do hábito é obrigatório');
      return;
    }

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Hábito criado com sucesso! 🎯');
        setShowCreateModal(false);
        resetForm();
        await loadHabits();
      } else {
        throw new Error('Failed to create habit');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Erro ao criar hábito');
    }
  };

  const toggleHabitEntry = async (habitId: string, date: string) => {
    // Evitar cliques múltiplos
    if (loadingHabits.has(habitId)) return;
    
    // Adicionar ao estado de loading
    setLoadingHabits(prev => new Set(Array.from(prev).concat([habitId])));
    
    // Normalizar data para comparação
    const normalizeDate = (dateStr: string) => {
      try {
        return format(parseISO(dateStr), 'yyyy-MM-dd');
      } catch {
        return format(new Date(dateStr), 'yyyy-MM-dd');
      }
    };
    
    const targetDate = normalizeDate(date);
    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = targetDate === today;
    
    try {
      // Atualização otimista ANTES da requisição
      setHabits(prevHabits => {
        return prevHabits.map(habit => {
          if (habit.id === habitId) {
            // Verificar se já existe entrada para esta data
            const existingEntryIndex = habit.entries.findIndex(entry => {
              const entryDate = normalizeDate(entry.date);
              return entryDate === targetDate && entry.habitId === habitId;
            });
            
            let updatedEntries;
            let newCompleted = false;
            
            if (existingEntryIndex >= 0) {
              // Toggle entrada existente
              const currentEntry = habit.entries[existingEntryIndex];
              newCompleted = !currentEntry.completed;
              
              if (newCompleted) {
                // Marcar como concluída
                updatedEntries = [...habit.entries];
                updatedEntries[existingEntryIndex] = { ...currentEntry, completed: true };
              } else {
                // Remover entrada (não concluída)
                updatedEntries = habit.entries.filter((_, index) => index !== existingEntryIndex);
              }
            } else {
              // Criar nova entrada concluída
              newCompleted = true;
              updatedEntries = [...habit.entries, {
                id: Date.now().toString(),
                habitId,
                date: targetDate,
                completed: true
              }];
            }
            
            // Atualizar streak se for hoje
            let updatedStreak = habit.currentStreak;
            if (isToday) {
              if (newCompleted) {
                updatedStreak = habit.currentStreak + 1;
              } else {
                updatedStreak = Math.max(0, habit.currentStreak - 1);
              }
            }
            
            return {
              ...habit,
              entries: updatedEntries,
              currentStreak: updatedStreak
            };
          }
          return habit;
        });
      });
      
      // Fazer requisição para servidor
      const response = await fetch('/api/habits/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date: targetDate }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.completed ? 'Hábito concluído! ✨' : 'Progresso removido');
        
        // Adicionar XP se o hábito foi completado hoje
        if (result.completed && isToday) {
          try {
            const xpGain = 3; // 3 XP por hábito completado
            await fetch('/api/user/xp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                xpGain,
                reason: `Hábito "${result.habitName}" completado!`,
              }),
            });
            
            // Mostrar toast de XP ganho
            toast.success(`+${xpGain} XP`, {
              description: `Hábito "${result.habitName}" completado!`,
              duration: 3000,
            });
          } catch (error) {
            console.error('Erro ao adicionar XP:', error);
          }
        }
        
        // Sincronizar com resposta do servidor (opcional, para garantir consistência)
        setHabits(prevHabits => {
          return prevHabits.map(habit => {
            if (habit.id === habitId) {
              // Atualizar com dados reais do servidor se necessário
              const existingEntryIndex = habit.entries.findIndex(entry => {
                const entryDate = normalizeDate(entry.date);
                return entryDate === targetDate && entry.habitId === habitId;
              });
              
              let updatedEntries = [...habit.entries];
              
              if (result.completed) {
                if (existingEntryIndex >= 0) {
                  updatedEntries[existingEntryIndex] = { 
                    ...updatedEntries[existingEntryIndex], 
                    id: result.entry?.id || updatedEntries[existingEntryIndex].id,
                    completed: true 
                  };
                } else {
                  updatedEntries.push({
                    id: result.entry?.id || Date.now().toString(),
                    habitId,
                    date: targetDate,
                    completed: true
                  });
                }
              } else {
                // Remover entrada se não concluída
                updatedEntries = updatedEntries.filter(entry => {
                  const entryDate = normalizeDate(entry.date);
                  return !(entryDate === targetDate && entry.habitId === habitId);
                });
              }
              
              return { ...habit, entries: updatedEntries };
            }
            return habit;
          });
        });
        
        // Forçar re-render dos indicadores e estatísticas
        setSelectedDate(prev => new Date(prev.getTime()));
        
        // Garantir que todos os componentes sejam atualizados
        setTimeout(() => {
          setSelectedDate(prev => new Date(prev.getTime() + 1));
        }, 50);
      } else {
        // Reverter mudança otimista em caso de erro
        await loadHabits();
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar progresso');
      }
    } catch (error) {
      // Reverter mudança otimista em caso de erro
      await loadHabits();
      toast.error('Erro ao atualizar progresso');
    } finally {
      // Remover do estado de loading
      setLoadingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  const updateHabit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!selectedHabit) return;
    
    try {
      const response = await fetch(`/api/habits/${selectedHabit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency,
          targetCount: formData.targetCount,
          color: formData.color,
        }),
      });

      if (response.ok) {
        await loadHabits();
        setShowEditModal(false);
        resetForm();
        toast.success('Hábito atualizado com sucesso!');
      } else {
        toast.error('Erro ao atualizar hábito');
      }
    } catch (error) {
      toast.error('Erro ao atualizar hábito');
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Hábito removido');
        loadHabits();
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Erro ao remover hábito');
    }
  };

  const openEditModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      targetCount: habit.targetCount,
      color: habit.color
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      targetCount: 1,
      color: HABIT_COLORS[0]
    });
  };

  // Gerar range de datas
  const getDateRange = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };

  // Verificar se data está completa
  const isDateCompleted = (habit: Habit, date: string) => {
    return habit.entries.some(entry => {
      const entryDate = typeof entry.date === 'string' ? entry.date : format(new Date(entry.date), 'yyyy-MM-dd');
      return entryDate === date && entry.completed;
    });
  };

  // Ícone de streak
  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Flame className="h-4 w-4 text-orange-500" />;
    if (streak >= 7) return <Award className="h-4 w-4 text-yellow-500" />;
    if (streak >= 3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  // Filtros de data
  const getDateRangeFilter = (filter: DateFilter, date: Date) => {
    const today = new Date();
    switch (filter) {
      case 'today':
        return { start: today, end: today };
      case 'week':
        return { start: startOfWeek(date, { locale: ptBR }), end: endOfWeek(date, { locale: ptBR }) };
      case 'month':
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case 'all':
        return { start: new Date('2020-01-01'), end: new Date('2030-12-31') };
      default:
        return { start: today, end: today };
    }
  };

  // Função simples para verificar se um hábito foi completado hoje
  const isHabitCompletedToday = (habit: Habit): boolean => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return habit.entries.some(entry => {
      const entryDate = typeof entry.date === 'string' ? entry.date : format(new Date(entry.date), 'yyyy-MM-dd');
      return entryDate === today && entry.completed;
    });
  };

  // Função simples para calcular progresso de um hábito
  const getHabitProgress = (habit: Habit): number => {
    const { start, end } = getDateRangeFilter(dateFilter, selectedDate);

    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const completedInRange = habit.entries.filter((entry) => {
      if (!entry.completed) return false;
      let entryDate: Date;
      try {
        entryDate = parseISO(entry.date);
      } catch {
        entryDate = new Date(entry.date);
      }
      const d = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      return isWithinInterval(d, { start: startDate, end: endDate });
    }).length;

    const msInDay = 24 * 60 * 60 * 1000;
    const daysInRange = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / msInDay) + 1);

    let target = 1;
    if (habit.frequency === 'daily') {
      target = Math.max(1, habit.targetCount * daysInRange);
    } else if (habit.frequency === 'weekly') {
      const weeks = Math.max(1, Math.ceil(daysInRange / 7));
      target = Math.max(1, habit.targetCount * weeks);
    } else {
      // monthly
      if (dateFilter === 'month') {
        target = Math.max(1, habit.targetCount);
      } else if (dateFilter === 'week') {
        target = Math.max(1, Math.round(habit.targetCount / 4) || 1);
      } else if (dateFilter === 'today') {
        target = 1; // visão diária, mostra 0/1 de forma simplificada
      } else {
        // all
        target = Math.max(1, habit.targetCount);
      }
    }

    const percentage = Math.min(100, Math.round((completedInRange / target) * 100));
    return Number.isFinite(percentage) ? percentage : 0;
  };

  // Função simples para obter hábitos ativos
  const getActiveHabits = (): Habit[] => {
    return habits.filter(h => h.isActive);
  };

  // Função simples para calcular estatísticas
  const getHabitStats = () => {
    const activeHabits = getActiveHabits();
    const completedToday = activeHabits.filter(h => isHabitCompletedToday(h)).length;
    const totalHabits = activeHabits.length;
    const maxStreak = Math.max(...activeHabits.map(h => h.currentStreak), 0);
    const avgCompletion = totalHabits > 0 
      ? Math.round(activeHabits.reduce((acc, h) => acc + getHabitProgress(h), 0) / totalHabits)
      : 0;
    
    return {
      totalHabits,
      completedToday,
      maxStreak,
      avgCompletion
    };
  };

  // Dados para gráficos (minimalistas, com contraste e hover simples)
  const normalizeDateStr = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'yyyy-MM-dd');
    } catch {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    }
  };

  const dailyCompletionData = useMemo(() => {
    const days = dateFilter === 'month' ? 30 : 14;
    const daysRange = getDateRange(days); // ISO strings oldest -> newest
    const active = getActiveHabits();
    return daysRange.map((d) => {
      const count = active.reduce((acc, h) => (
        acc + h.entries.filter(e => e.completed && normalizeDateStr(e.date) === d).length
      ), 0);
      return {
        date: format(parseISO(d), "dd/MM"),
        completed: count,
      };
    });
  }, [habits, dateFilter]);

  const { start: rangeStart, end: rangeEnd } = useMemo(() => getDateRangeFilter(dateFilter, selectedDate), [dateFilter, selectedDate]);

  const isInRange = (dateStr: string) => {
    let dt: Date;
    try { dt = parseISO(dateStr); } catch { dt = new Date(dateStr); }
    const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const s = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const e = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    return isWithinInterval(d, { start: s, end: e });
  };

  const frequencyBreakdown = useMemo(() => {
    const active = getActiveHabits();
    const counts = { daily: 0, weekly: 0, monthly: 0 } as Record<'daily'|'weekly'|'monthly', number>;
    active.forEach(h => {
      const c = h.entries.filter(e => e.completed && isInRange(e.date)).length;
      counts[h.frequency] += c;
    });
    return [
      { name: 'Diário', key: 'daily', value: counts.daily },
      { name: 'Semanal', key: 'weekly', value: counts.weekly },
      { name: 'Mensal', key: 'monthly', value: counts.monthly },
    ];
  }, [habits, rangeStart, rangeEnd]);

  const topHabits = useMemo(() => {
    const active = getActiveHabits();
    const arr = active.map(h => ({
      id: h.id,
      name: h.name,
      color: h.color,
      value: h.entries.filter(e => e.completed && isInRange(e.date)).length
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
    const total = arr.reduce((acc, i) => acc + i.value, 0) || 1;
    return { data: arr, total };
  }, [habits, rangeStart, rangeEnd]);

  const CHART_GRID = 'rgba(255,255,255,0.08)';
  const AXIS = 'rgba(255,255,255,0.5)';
  const AXIS_LINE = 'rgba(255,255,255,0.15)';
  const MINOR_TEXT = 'rgba(255,255,255,0.7)';

  const PIE_COLORS = ['#10B981', '#60A5FA', '#8B5CF6', '#F59E0B', '#F97316'];

  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 bg-black/90 border border-white/10 rounded text-white text-xs">
          <div className="font-semibold">{label}</div>
          <div className="text-gray-300">Concluídos: <span className="text-emerald-400 font-bold">{payload[0].value}</span></div>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="px-3 py-2 bg-black/90 border border-white/10 rounded text-white text-xs">
          <div className="font-semibold">{label}</div>
          <div className="text-gray-300">Concluídos: <span className="text-blue-400 font-bold">{payload[0].value}</span></div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="px-3 py-2 bg-black/90 border border-white/10 rounded text-white text-xs">
          <div className="font-semibold">{p.name}</div>
          <div className="text-gray-300">Concluídos: <span className="text-purple-300 font-bold">{p.value}</span></div>
        </div>
      );
    }
    return null;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl mb-6 shadow-2xl shadow-purple-500/25">
              <Target className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Rastreador de Hábitos
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Transforme sua rotina com o poder dos pequenos hábitos diários
            </p>
            
            <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 text-sm font-medium border-0 mt-6">
              <Crown className="h-4 w-4 mr-2" />
              Executor Premium
            </Badge>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="group backdrop-blur-xl bg-white/5 border border-purple-500/20 hover:bg-white/10 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-white group-hover:animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors duration-300">{getHabitStats().totalHabits}</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Hábitos Ativos</div>
              </CardContent>
            </Card>

            <Card className="group backdrop-blur-xl bg-white/5 border border-emerald-500/20 hover:bg-white/10 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Flame className="h-6 w-6 text-white group-hover:animate-bounce" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-orange-300 transition-colors duration-300">
                  {getHabitStats().maxStreak}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Maior Sequência</div>
              </CardContent>
            </Card>

            <Card className="group backdrop-blur-xl bg-white/5 border border-blue-500/20 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-white group-hover:animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                  {getHabitStats().avgCompletion}%
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Taxa Média</div>
              </CardContent>
            </Card>

            <Card className="group backdrop-blur-xl bg-white/5 border border-yellow-500/20 hover:bg-white/10 hover:border-yellow-400/30 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Calendar className="h-6 w-6 text-white group-hover:animate-pulse" />
                </div>
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors duration-300">
                  {getHabitStats().completedToday}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Concluídos Hoje</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions and View Switcher */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-white">Seus Hábitos</h2>
              
              {/* View Switcher */}
              <div className="flex items-center bg-white/5 rounded-xl p-1 border border-purple-500/20">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={`h-8 px-3 ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  Tabela
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={`h-8 px-3 ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('stats')}
                  className={`h-8 px-3 ${viewMode === 'stats' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Estatísticas
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                <SelectTrigger className="w-32 bg-white/5 border-purple-500/20 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-purple-500/20">
                  <SelectItem value="today" className="text-white hover:bg-purple-500/20">Hoje</SelectItem>
                  <SelectItem value="week" className="text-white hover:bg-purple-500/20">Semana</SelectItem>
                  <SelectItem value="month" className="text-white hover:bg-purple-500/20">Mês</SelectItem>
                  <SelectItem value="all" className="text-white hover:bg-purple-500/20">Todos</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Habit Button */}
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 border-0 shadow-lg shadow-purple-500/25 px-6 py-3 text-sm font-medium text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Hábito
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="backdrop-blur-2xl bg-black/80 border border-purple-500/20 shadow-2xl shadow-purple-500/10 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      Criar Novo Hábito
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Configure seu novo hábito definindo nome, frequência e outras preferências.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Nome do Hábito</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Meditar 10 minutos"
                        className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Descrição (opcional)</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva seu hábito..."
                        rows={3}
                        className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:bg-white/10 transition-all resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Frequência</label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as 'daily' | 'weekly' | 'monthly' })}>
                        <SelectTrigger className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white focus:border-purple-400/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-purple-500/20">
                          <SelectItem value="daily" className="text-white hover:bg-purple-500/20">
                            <span className="flex items-center gap-2">
                              <span>📅</span>
                              Diário
                            </span>
                          </SelectItem>
                          <SelectItem value="weekly" className="text-white hover:bg-purple-500/20">
                            <span className="flex items-center gap-2">
                              <span>📊</span>
                              Semanal
                            </span>
                          </SelectItem>
                          <SelectItem value="monthly" className="text-white hover:bg-purple-500/20">
                            <span className="flex items-center gap-2">
                              <span>📆</span>
                              Mensal
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Cor do Hábito</label>
                      <div className="flex flex-wrap gap-3">
                        {HABIT_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-8 h-8 rounded-xl shadow-lg transition-all ${
                              formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={createHabit}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-purple-500/25"
                    >
                      Criar Hábito
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Habit Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              {organizedHabits.all.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="h-12 w-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Nenhum hábito ainda</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Comece sua jornada de transformação criando seu primeiro hábito
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 shadow-lg shadow-purple-500/25 px-8 py-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Hábito
                  </Button>
                </motion.div>
              ) : (
                <>
                  {viewMode === 'table' && (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="backdrop-blur-xl bg-white/5 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-purple-500/20 hover:bg-white/5">
                                <TableHead className="text-purple-300 font-semibold">Hábito</TableHead>
                                <TableHead className="text-purple-300 font-semibold">Frequência</TableHead>
                                <TableHead className="text-purple-300 font-semibold">Progresso</TableHead>
                                <TableHead className="text-purple-300 font-semibold">Sequência</TableHead>
                                <TableHead className="text-purple-300 font-semibold">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getActiveHabits().map((habit) => (
                                <TableRow key={habit.id} className="border-purple-500/10 hover:bg-white/5 transition-colors">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-4 h-4 rounded-lg"
                                        style={{ backgroundColor: habit.color }}
                                      />
                                      <div>
                                        <div className="font-semibold text-white">{habit.name}</div>
                                        {habit.description && (
                                          <div className="text-sm text-gray-400">{habit.description}</div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <FrequencyBadge frequency={habit.frequency} />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <HabitProgress 
                                        value={getHabitProgress(habit)} 
                                        habitColor={habit.color}
                                        className="flex-1"
                                      />
                                      <span className="text-white text-sm font-bold min-w-[3rem]">
                                        {Math.round(getHabitProgress(habit))}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getStreakIcon(habit.currentStreak)}
                                      <span className="text-white font-semibold">{habit.currentStreak}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <HabitCompleteButton
                                        completed={isHabitCompletedToday(habit)}
                                        onComplete={() => toggleHabitEntry(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                                        habitColor={habit.color}
                                        habitName={habit.name}
                                        isLoading={loadingHabits.has(habit.id)}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDetailsModal(habit)}
                                        className="text-gray-400 hover:text-white hover:bg-white/10"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditModal(habit)}
                                        className="text-gray-400 hover:text-white hover:bg-white/10"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteHabit(habit.id)}
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {viewMode === 'cards' && (
                    <div className="space-y-12">
                      {/* Daily Habits */}
                      {organizedHabits.daily.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Hábitos Diários</h3>
                            <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30">
                              <span className="text-sm font-medium text-blue-300">{organizedHabits.daily.length}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizedHabits.daily.map((habit, index) => (
                              <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                              >
                                <Card className="group backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">{habit.name}</h4>
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{habit.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                          isHabitCompletedToday(habit) ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-600'
                                        }`} />
                                        <Button
                                          size="sm"
                                          onClick={() => toggleHabitEntry(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                                          disabled={loadingHabits.has(habit.id)}
                                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                                        >
                                          {loadingHabits.has(habit.id) ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                                          ) : (
                                            'Concluir'
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Progresso</span>
                                        <span className="text-white font-medium">{Math.round(getHabitProgress(habit))}%</span>
                                      </div>
                                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg shadow-emerald-500/25"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.round(getHabitProgress(habit))}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Sequência: {habit.currentStreak} dias</span>
                                        <span>Meta: {habit.targetCount || 1}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Weekly Habits */}
                      {organizedHabits.weekly.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Hábitos Semanais</h3>
                            <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/30">
                              <span className="text-sm font-medium text-emerald-300">{organizedHabits.weekly.length}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizedHabits.weekly.map((habit, index) => (
                              <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                              >
                                <Card className="group backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">{habit.name}</h4>
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{habit.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Button
                                          size="sm"
                                          onClick={() => toggleHabitEntry(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                                          disabled={loadingHabits.has(habit.id)}
                                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                                        >
                                          {loadingHabits.has(habit.id) ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                                          ) : (
                                            'Concluir'
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Progresso</span>
                                        <span className="text-white font-medium">{Math.round(getHabitProgress(habit))}%</span>
                                      </div>
                                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg shadow-emerald-500/25"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.round(getHabitProgress(habit))}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Sequência: {habit.currentStreak} semanas</span>
                                        <span>Meta: {habit.targetCount || 1}/sem</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Monthly Habits */}
                      {organizedHabits.monthly.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Hábitos Mensais</h3>
                            <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-400/30">
                              <span className="text-sm font-medium text-purple-300">{organizedHabits.monthly.length}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {organizedHabits.monthly.map((habit, index) => (
                              <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                              >
                                <Card className="group backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">{habit.name}</h4>
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{habit.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Button
                                          size="sm"
                                          onClick={() => toggleHabitEntry(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                                          disabled={loadingHabits.has(habit.id)}
                                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                                        >
                                          {loadingHabits.has(habit.id) ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                                          ) : (
                                            'Concluir'
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Progresso</span>
                                        <span className="text-white font-medium">{Math.round(getHabitProgress(habit))}%</span>
                                      </div>
                                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                        <motion.div
                                          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg shadow-emerald-500/25"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.round(getHabitProgress(habit))}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>Sequência: {habit.currentStreak} meses</span>
                                        <span>Meta: {habit.targetCount || 1}/mês</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {viewMode === 'stats' && (
                    <motion.div
                      key="stats"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* Overall Progress */}
                      <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-white mb-4 text-center">Progresso Geral</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="p-4 rounded-xl border border-white/10 bg-black/30">
                              <div className="text-sm text-gray-300 mb-2">Conclusões por Dia</div>
                              <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={dailyCompletionData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
                                    <XAxis dataKey="date" stroke={AXIS} tick={{ fill: MINOR_TEXT, fontSize: 11 }} axisLine={{ stroke: AXIS_LINE }} tickLine={false} interval={Math.ceil(dailyCompletionData.length / 6)} />
                                    <YAxis stroke={AXIS} tick={{ fill: MINOR_TEXT, fontSize: 11 }} axisLine={{ stroke: AXIS_LINE }} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<LineTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                                    <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#10B981' }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl border border-white/10 bg-black/30">
                              <div className="text-sm text-gray-300 mb-2">Distribuição por Frequência</div>
                              <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={frequencyBreakdown} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke={AXIS} tick={{ fill: MINOR_TEXT, fontSize: 11 }} axisLine={{ stroke: AXIS_LINE }} tickLine={false} />
                                    <YAxis stroke={AXIS} tick={{ fill: MINOR_TEXT, fontSize: 11 }} axisLine={{ stroke: AXIS_LINE }} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
                                    <Bar dataKey="value" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <div className="p-4 rounded-xl border border-white/10 bg-black/30">
                              <div className="text-sm text-gray-300 mb-2">Top Hábitos no Período</div>
                              <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Tooltip content={<PieTooltip />} />
                                    <Pie data={topHabits.data} dataKey="value" nameKey="name" innerRadius={28} outerRadius={55} paddingAngle={3} stroke="rgba(255,255,255,0.15)" strokeWidth={1}>
                                      {topHabits.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Individual Habit Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getActiveHabits().map((habit) => {
                          const progress = getHabitProgress(habit);
                          return (
                            <Card key={habit.id} className="backdrop-blur-xl bg-white/5 border border-white/10">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-white">{habit.name}</h4>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    habit.frequency === 'daily' ? 'bg-blue-500/20 text-blue-300' :
                                    habit.frequency === 'weekly' ? 'bg-green-500/20 text-green-300' :
                                    'bg-purple-500/20 text-purple-300'
                                  }`}>
                                    {habit.frequency === 'daily' ? 'Diário' :
                                     habit.frequency === 'weekly' ? 'Semanal' : 'Mensal'}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm text-gray-400">Progresso</span>
                                      <span className="text-sm font-medium text-white">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                      <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.round(progress)}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                      <div className="text-lg font-bold text-white">{habit.currentStreak}</div>
                                      <div className="text-xs text-gray-400">Sequência Atual</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-bold text-white">{habit.longestStreak}</div>
                                      <div className="text-xs text-gray-400">Maior Sequência</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Upgrade Modal */}
          <UpgradeModal 
            isOpen={showUpgradeModal}
            onClose={() => {
              setShowUpgradeModal(false);
              router.push('/dashboard');
            }}
            currentLevel={0}
            targetPlan="executor"
          />

          {/* Edit Habit Dialog */}
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="backdrop-blur-2xl bg-black/80 border border-purple-500/20 shadow-2xl shadow-purple-500/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Editar Hábito</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Atualize as informações do hábito selecionado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:bg-white/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:bg-white/10 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Frequência</label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value as 'daily'|'weekly'|'monthly' })}>
                    <SelectTrigger className="backdrop-blur-sm bg-white/5 border border-purple-500/20 text-white focus:border-purple-400/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-purple-500/20">
                      <SelectItem value="daily" className="text-white hover:bg-purple-500/20">Diário</SelectItem>
                      <SelectItem value="weekly" className="text-white hover:bg-purple-500/20">Semanal</SelectItem>
                      <SelectItem value="monthly" className="text-white hover:bg-purple-500/20">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Cor</label>
                  <div className="flex flex-wrap gap-3">
                    {HABIT_COLORS.map(color => (
                      <button key={color} onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-xl shadow-lg transition-all ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Cancelar</Button>
                <Button onClick={updateHabit} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Details Dialog */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="backdrop-blur-2xl bg-black/80 border border-purple-500/20 shadow-2xl shadow-purple-500/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Detalhes do Hábito</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Informações do hábito selecionado
                </DialogDescription>
              </DialogHeader>
              {selectedHabit && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedHabit.color }} />
                    <div className="text-white font-semibold">{selectedHabit.name}</div>
                  </div>
                  {selectedHabit.description && (
                    <p className="text-sm text-gray-300">{selectedHabit.description}</p>
                  )}
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <span>Frequência:</span>
                    <FrequencyBadge frequency={selectedHabit.frequency} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{selectedHabit.currentStreak}</div>
                      <div className="text-xs text-gray-400">Sequência</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{selectedHabit.longestStreak}</div>
                      <div className="text-xs text-gray-400">Recorde</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{selectedHabit.targetCount}</div>
                      <div className="text-xs text-gray-400">Meta</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Fechar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
