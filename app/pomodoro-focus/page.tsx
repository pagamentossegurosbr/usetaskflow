"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Crown,
  Coffee,
  Target,
  TrendingUp,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Plus,
  Check,
  X
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/UpgradeModal';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { playNotificationSound } from '@/lib/sounds';

interface PomodoroSession {
  id: string;
  taskName?: string;
  duration: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

interface PomodoroStats {
  todaySessions: number;
  totalSessions: number;
  totalFocusTime: number;
  avgSessionLength: number;
  charts?: {
    last30Days: Array<{ date: string; count: number }>;
    weekdayCounts: Array<{ weekday: number; count: number }>;
    monthlyCounts: Array<{ month: string; count: number }>;
  };
  bestDays?: Array<{ date: string; count: number }>;
}

const TIMER_PRESETS = [
  { name: 'Pomodoro', duration: 25 * 60, color: 'bg-red-500' },
  { name: 'Pausa Curta', duration: 5 * 60, color: 'bg-green-500' },
  { name: 'Pausa Longa', duration: 15 * 60, color: 'bg-blue-500' },
  { name: 'Foco Profundo', duration: 50 * 60, color: 'bg-purple-500' },
] as const;

const DEFAULT_CONFIG = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  autoCycle: true,
};

const getStorageKey = (key: string) => {
  return `pomodoro_${key}`;
};

const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const;

type TimerState = typeof TIMER_STATES[keyof typeof TIMER_STATES];

export default function PomodoroFocusPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscription } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.focusMinutes * 60);
  const [timerState, setTimerState] = useState<TimerState>(TIMER_STATES.IDLE);
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_CONFIG.focusMinutes * 60);
  const [periodType, setPeriodType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [cycleCount, setCycleCount] = useState(0);
  
  // Task management
  const [currentTask, setCurrentTask] = useState('');
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats>({
    todaySessions: 0,
    totalSessions: 0,
    totalFocusTime: 0,
    avgSessionLength: 0,
  });
  
  // Configuration
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  // Session editing
  const [editingSession, setEditingSession] = useState<PomodoroSession | null>(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSession, setDeletingSession] = useState<PomodoroSession | null>(null);
  
  // New states for compact layout
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  
  // Timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check access
  useEffect(() => {
    if (session && subscription.plan !== 'executor') {
      setShowUpgradeModal(true);
    }
  }, [session, subscription.plan]);

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/pomodoro');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/pomodoro/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem(getStorageKey('pomodoro_config'));
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        setSelectedDuration(parsed.focusMinutes * 60);
        setTimeLeft(parsed.focusMinutes * 60);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (session && subscription.plan === 'executor') {
      loadSessions();
      loadStats();
      loadConfig();
    }
  }, [session, subscription.plan, loadSessions, loadStats]);
  
  const handleTimerComplete = useCallback(async () => {
    setTimerState(TIMER_STATES.COMPLETED);
    
    // Play notification sound
    try {
      await playNotificationSound();
    } catch (error) {
      console.error('Erro ao tocar som:', error);
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Completo!', {
        body: 'Sua sessão de foco foi concluída com sucesso!',
        icon: '/favicon.ico',
      });
    }

    // Save session
    const session: Omit<PomodoroSession, 'id'> = {
      taskName: currentTask || undefined,
      duration: selectedDuration,
      completed: true,
      startedAt: new Date(Date.now() - selectedDuration * 1000),
      completedAt: new Date(),
    };

    try {
      const response = await fetch('/api/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        const savedSession = await response.json();
        
        // Atualizar sessões localmente sem duplicação
        setSessions(prev => {
          const existingIndex = prev.findIndex(s => s.id === savedSession.id);
          if (existingIndex >= 0) {
            // Atualizar sessão existente
            const updated = [...prev];
            updated[existingIndex] = savedSession;
            return updated;
          } else {
            // Adicionar nova sessão no início
            return [savedSession, ...prev];
          }
        });
        
        setCurrentTask('');
        
        // Recarregar estatísticas após salvar
        await loadStats();
        
        // Grant XP based on session duration
        const xpToGrant = Math.min(5, Math.max(1, Math.floor(selectedDuration / 300))); // 1-5 XP based on duration
        try {
          await fetch('/api/user/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp: xpToGrant }),
          });
        } catch (error) {
          console.error('Erro ao conceder XP:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }

    // Auto-cycle logic
    if (config.autoCycle) {
      setTimeout(() => {
        if (periodType === 'focus') {
          if (cycleCount % config.longBreakEvery === 0) {
            setPeriodType('long_break');
            setSelectedDuration(config.longBreakMinutes * 60);
          } else {
            setPeriodType('short_break');
            setSelectedDuration(config.shortBreakMinutes * 60);
          }
        } else {
          setPeriodType('focus');
          setSelectedDuration(config.focusMinutes * 60);
        }
        
        setTimeLeft(selectedDuration);
        setTimerState(TIMER_STATES.IDLE);
        
        if (config.autoCycle) {
          setTimeout(() => startTimer(), 1000);
        }
      }, 2000);
    } else {
      setTimerState(TIMER_STATES.IDLE);
      setTimeLeft(selectedDuration);
    }
  }, [currentTask, selectedDuration, config, periodType, cycleCount, loadStats]);

  // Timer logic
  useEffect(() => {
    if (timerState === TIMER_STATES.RUNNING && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerState, timeLeft, handleTimerComplete]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = async () => {
    if (timerState === TIMER_STATES.PAUSED) {
      setTimerState(TIMER_STATES.RUNNING);
      return;
    }

    setTimerState(TIMER_STATES.RUNNING);
    
    if (periodType === 'focus') {
      setCycleCount(prev => prev + 1);
    }
  };

  const pauseTimer = () => {
    setTimerState(TIMER_STATES.PAUSED);
  };

  const stopTimer = async () => {
    setTimerState(TIMER_STATES.IDLE);
    setTimeLeft(selectedDuration);
    setCycleCount(0);
    setPeriodType('focus');
  };

  const resetTimer = () => {
    setTimerState(TIMER_STATES.IDLE);
    setTimeLeft(selectedDuration);
    setCycleCount(0);
    setPeriodType('focus');
  };

  const selectPreset = (preset: typeof TIMER_PRESETS[number]) => {
    setSelectedDuration(preset.duration);
    setTimeLeft(preset.duration);
    setPeriodType('focus');
    setTimerState(TIMER_STATES.IDLE);
    setCycleCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getTimerColor = () => {
    if (periodType === 'focus') return 'bg-red-500';
    if (periodType === 'short_break') return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getProgressPercentage = () => {
    return ((selectedDuration - timeLeft) / selectedDuration) * 100;
  };

  const handleEditSession = (session: PomodoroSession) => {
    setEditingSession(session);
    setEditTaskName(session.taskName || '');
    setShowEditDialog(true);
  };

  const handleDeleteSession = (session: PomodoroSession) => {
    setDeletingSession(session);
    setShowDeleteDialog(true);
  };

  const saveEditSession = async () => {
    if (!editingSession) return;
    
    try {
      const response = await fetch(`/api/pomodoro/${editingSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName: editTaskName.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        
        // Atualizar sessões localmente
        setSessions(prev => 
          prev.map(s => s.id === updatedSession.id ? updatedSession : s)
        );
        
        // Recarregar estatísticas
        await loadStats();
        
        setShowEditDialog(false);
        setEditingSession(null);
        setEditTaskName('');
        
        toast.success('Sessão atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      toast.error('Erro ao atualizar sessão');
    }
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;
    
    try {
      const response = await fetch(`/api/pomodoro/${deletingSession.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover sessão localmente
        setSessions(prev => prev.filter(s => s.id !== deletingSession.id));
        
        // Recarregar estatísticas
        await loadStats();
        
        setShowDeleteDialog(false);
        setDeletingSession(null);
        
        toast.success('Sessão removida com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover sessão:', error);
      toast.error('Erro ao remover sessão');
    }
  };

  const confirmDeleteAllSessions = async () => {
    try {
      const response = await fetch('/api/pomodoro', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions([]);
        await loadStats();
        setShowDeleteAllDialog(false);
        toast.success('Todas as sessões foram removidas!');
      }
    } catch (error) {
      console.error('Erro ao remover todas as sessões:', error);
      toast.error('Erro ao remover sessões');
    }
  };

  const saveConfig = () => {
    const newConfig = { ...config };
    localStorage.setItem(getStorageKey('pomodoro_config'), JSON.stringify(newConfig));
    setConfig(newConfig);
    setSelectedDuration(newConfig.focusMinutes * 60);
    setTimeLeft(newConfig.focusMinutes * 60);
    setShowConfigDialog(false);
    toast.success('Configurações salvas!');
  };

  // Se não tem acesso, mostrar modal de upgrade
  if (session && subscription.plan !== 'executor') {
    return (
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentLevel={1}
        blockedFeature="pomodoro-focus"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black relative overflow-hidden pt-16">
        {/* Subtle purple blur background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 px-6 py-8">
          {/* Beautiful Header - Following Habit Tracker Design Pattern */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-purple-500/25">
              <Timer className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Pomodoro Focus
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Gerencie seu tempo de foco e aumente sua produtividade com a técnica Pomodoro
            </p>
            
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium border-0 mt-6">
              <Crown className="h-4 w-4 mr-2" />
              Executor Premium
            </Badge>
          </motion.div>

          {/* Estatísticas Rápidas - Beautiful Design Following Habit Tracker Pattern */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group backdrop-blur-xl bg-white/5 border border-purple-500/20 hover:bg-white/10 hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Clock className="h-6 w-6 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">{stats.todaySessions}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Sessões Hoje</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white max-w-xs">
                <p className="font-medium mb-1">Sessões de Hoje</p>
                <p className="text-sm text-gray-300">Número de sessões Pomodoro completadas hoje. Acompanhe sua produtividade diária e mantenha o foco!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group backdrop-blur-xl bg-white/5 border border-violet-500/20 hover:bg-white/10 hover:border-violet-400/30 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Target className="h-6 w-6 text-white group-hover:animate-bounce" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors duration-300">{stats.totalSessions}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total de Sessões</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white max-w-xs">
                <p className="font-medium mb-1">Total de Sessões</p>
                <p className="text-sm text-gray-300">Número total de sessões Pomodoro completadas desde o início. Veja seu progresso geral e consistência ao longo do tempo!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group backdrop-blur-xl bg-white/5 border border-indigo-500/20 hover:bg-white/10 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Zap className="h-6 w-6 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors duration-300">
                      {Math.floor(stats.totalFocusTime / 60)}
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Minutos de Foco</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white max-w-xs">
                <p className="font-medium mb-1">Minutos de Foco</p>
                <p className="text-sm text-gray-300">Tempo total em minutos gasto em sessões de foco. Monitore sua produtividade e veja quantas horas você dedicou ao trabalho focado!</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group backdrop-blur-xl bg-white/5 border border-blue-500/20 hover:bg-white/10 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <TrendingUp className="h-6 w-6 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                      {Math.floor(stats.avgSessionLength / 60)}
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Média por Sessão</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 border-gray-700 text-white max-w-xs">
                <p className="font-medium mb-1">Média por Sessão</p>
                <p className="text-sm text-gray-300">Duração média das suas sessões Pomodoro em minutos. Acompanhe sua consistência e otimize seus intervalos de foco!</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Main Content - Timer and Sessions Side by Side */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Timer Principal - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2"
            >
              <Card className="bg-gray-900/90 backdrop-blur border-gray-800 p-6">
                <CardContent className="p-0">
                  {/* Timer Display */}
                  <div className="text-center mb-6">
                    <div className="text-6xl font-mono font-bold text-white mb-4">
                      {formatTime(timeLeft)}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Progress 
                        value={getProgressPercentage()} 
                        className="h-3 bg-gray-800"
                      />
                    </div>
                    
                    {/* Period Type Badge */}
                    <Badge className={`${getTimerColor()} text-white mb-4`}>
                      {periodType === 'focus' ? 'Foco' : 
                       periodType === 'short_break' ? 'Pausa Curta' : 'Pausa Longa'}
                    </Badge>
                    
                    {/* Cycle Counter */}
                    {periodType === 'focus' && (
                      <div className="text-sm text-gray-400">
                        Ciclo {cycleCount} de {config.longBreakEvery}
                      </div>
                    )}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex justify-center gap-4 mb-6">
                    {timerState === TIMER_STATES.IDLE && (
                      <Button
                        onClick={startTimer}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    
                    {timerState === TIMER_STATES.RUNNING && (
                      <>
                        <Button
                          onClick={pauseTimer}
                          size="lg"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-800"
                        >
                          <Pause className="h-5 w-5 mr-2" />
                          Pausar
                        </Button>
                        <Button
                          onClick={stopTimer}
                          size="lg"
                          variant="outline"
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Square className="h-5 w-5 mr-2" />
                          Parar
                        </Button>
                      </>
                    )}
                    
                    {timerState === TIMER_STATES.PAUSED && (
                      <>
                        <Button
                          onClick={startTimer}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Continuar
                        </Button>
                        <Button
                          onClick={resetTimer}
                          size="lg"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-800"
                        >
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Resetar
                        </Button>
                      </>
                    )}
                    
                    {timerState === TIMER_STATES.COMPLETED && (
                      <Button
                        onClick={resetTimer}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Nova Sessão
                      </Button>
                    )}
                  </div>

                  {/* Task Input */}
                  <div className="mb-4">
                    <Input
                      placeholder="O que você está focando?"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      disabled={timerState === TIMER_STATES.RUNNING}
                    />
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-2 gap-2">
                    {TIMER_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        onClick={() => selectPreset(preset)}
                        variant="outline"
                        size="sm"
                        className={`border-gray-700 text-white hover:bg-gray-800 ${
                          selectedDuration === preset.duration ? 'bg-gray-800' : ''
                        }`}
                        disabled={timerState === TIMER_STATES.RUNNING}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>

                  {/* Config Button */}
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => setShowConfigDialog(true)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sessões Recentes - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-gray-900/90 backdrop-blur border-gray-800 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Clock className="h-4 w-4" />
                      Sessões
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSessionsExpanded(!sessionsExpanded)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        {sessionsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      {sessions.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowDeleteAllDialog(true)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <AnimatePresence>
                    {sessionsExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 max-h-96 overflow-y-auto"
                      >
                        {sessions.length === 0 ? (
                          <div className="text-gray-500 text-center py-4 text-sm">
                            Nenhuma sessão ainda
                          </div>
                        ) : (
                          sessions.slice(0, 8).map((session, index) => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center justify-between p-2 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">
                                  {session.taskName || 'Sessão de foco'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatDuration(session.duration)} • {' '}
                                  {new Date(session.startedAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSession(session)}
                                  className="h-5 w-5 p-0 text-gray-400 hover:text-purple-400"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSession(session)}
                                  className="h-5 w-5 p-0 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-4"
                      >
                        <div className="text-2xl font-bold text-white mb-1">{sessions.length}</div>
                        <div className="text-xs text-gray-400">sessões totais</div>
                        {sessions.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Última: {new Date(sessions[0].startedAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Estatísticas e Ranking */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gray-900/90 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Concluídos por Dia (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.charts?.last30Days || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                      <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <RechartsTooltip 
                        cursor={false} 
                        contentStyle={{ 
                          background: 'rgba(17,24,39,0.95)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: 8, 
                          color: 'white' 
                        }}
                        labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                        formatter={(value: any) => [`${value} sessões`, 'Concluídas']}
                      />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/90 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Melhores Dias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(stats.bestDays || []).slice(0, 5).map((d) => (
                  <div key={d.date} className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                    <span className="text-gray-300 text-sm">{new Date(d.date).toLocaleDateString('pt-BR')}</span>
                    <Badge className="bg-purple-600 text-white">{d.count}</Badge>
                  </div>
                ))}
                {!stats.bestDays || stats.bestDays.length === 0 ? (
                  <div className="text-gray-500 text-sm">Sem dados suficientes.</div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Adicionais */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            {/* Gráfico por Dia da Semana */}
            <Card className="bg-gray-900/90 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Produtividade por Dia da Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts?.weekdayCounts || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                      <XAxis 
                        dataKey="weekday" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(value) => {
                          const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                          return days[value] || value;
                        }}
                      />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                        contentStyle={{ 
                          background: 'rgba(17,24,39,0.95)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: 8, 
                          color: 'white' 
                        }}
                        labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                        formatter={(value: any, name: any, props: any) => {
                          const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                          const dayName = days[props.payload.weekday] || 'Desconhecido';
                          return [`${value} sessões`, `${dayName}`];
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico por Mês */}
            <Card className="bg-gray-900/90 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Produtividade por Mês (12 meses)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.charts?.monthlyCounts || []}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(value) => {
                          const months = [
                            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                          ];
                          return months[parseInt(value) - 1] || value;
                        }}
                      />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                        contentStyle={{ 
                          background: 'rgba(17,24,39,0.95)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: 8, 
                          color: 'white' 
                        }}
                        labelStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                        formatter={(value: any, name: any, props: any) => {
                          const months = [
                            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                          ];
                          const monthName = months[parseInt(props.payload.month) - 1] || 'Desconhecido';
                          return [`${value} sessões`, `${monthName}`];
                        }}
                      />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Configuração */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Configurações do Pomodoro</DialogTitle>
              <DialogDescription>
                Personalize seus intervalos de foco e pausa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Minutos de Foco</label>
                <Input
                  type="number"
                  value={config.focusMinutes}
                  onChange={(e) => setConfig(prev => ({ ...prev, focusMinutes: parseInt(e.target.value) || 25 }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  min="1"
                  max="120"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Minutos de Pausa Curta</label>
                <Input
                  type="number"
                  value={config.shortBreakMinutes}
                  onChange={(e) => setConfig(prev => ({ ...prev, shortBreakMinutes: parseInt(e.target.value) || 5 }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Minutos de Pausa Longa</label>
                <Input
                  type="number"
                  value={config.longBreakMinutes}
                  onChange={(e) => setConfig(prev => ({ ...prev, longBreakMinutes: parseInt(e.target.value) || 15 }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  min="1"
                  max="60"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Pausa Longa a Cada</label>
                <Input
                  type="number"
                  value={config.longBreakEvery}
                  onChange={(e) => setConfig(prev => ({ ...prev, longBreakEvery: parseInt(e.target.value) || 4 }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  min="1"
                  max="10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoCycle"
                  checked={config.autoCycle}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoCycle: e.target.checked }))}
                  className="rounded border-gray-700 bg-gray-800"
                />
                <label htmlFor="autoCycle" className="text-sm text-gray-300">
                  Ciclo automático
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={saveConfig}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Editar Sessão</DialogTitle>
              <DialogDescription>
                Altere o nome da tarefa desta sessão
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nome da Tarefa</label>
                <Input
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Nome da tarefa"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={saveEditSession}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteSession}>
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão de Todas as Sessões */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão de Todas as Sessões</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir TODAS as sessões? Esta ação não pode ser desfeita e removerá todo o histórico de Pomodoro.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAllSessions}>
                Excluir Todas
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}