'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ProfileHeader } from '@/components/ProfileHeader';
import { UnifiedTaskManager } from '@/components/UnifiedTaskManager';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { Calendar } from '@/components/Calendar';
import { RightSidebar } from '@/components/RightSidebar';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { Tutorial } from '@/components/Tutorial';
import { MiniGame } from '@/components/MiniGame';
import { SnakeGame } from '@/components/SnakeGame';
import { ProgressChart } from '@/components/ProgressChart';
import { AdvancedTrackingChart } from '@/components/AdvancedTrackingChart';
import { FocusMode } from '@/components/FocusMode';
import { UserMenu } from '@/components/UserMenu';
import { UpgradeModal } from '@/components/UpgradeModal';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { SidebarPomodoro } from '@/components/SidebarPomodoro';
// import { AntiFarmingDebug } from '@/components/AntiFarmingDebug';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, HelpCircle, Crown, User, Sparkles, Timer, FileText } from 'lucide-react';
import { useProductivityLevel, Task } from '@/hooks/useProductivityLevel';
import { useGameTime } from '@/hooks/useGameTime';
import { useBanCheck } from '@/hooks/useBanCheck';
import { validateAndFormatProfile } from '@/lib/profileValidation';
import { GlobalContextMenu } from '@/components/GlobalContextMenu';
import { StatsModal } from '@/components/StatsModal';
import { CalendarModal } from '@/components/CalendarModal';
import { QuickUpgradeButton } from '@/components/QuickUpgradeButton';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { SyncStatus } from '@/components/SyncStatus';
import { toast } from 'sonner';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useAutoSyncMiddleware } from '@/lib/autoSyncMiddleware';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority?: boolean;
  scheduledFor?: Date;
  // Campos opcionais para tarefas expandidas
  description?: string;
  category?: string;
  deadline?: Date;
  estimatedTime?: number;
  tags?: string[];
  reward?: string;
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  title: string;
  badges: string[];
  theme: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Steve Jobs',
  email: 'steve@corp.com',
  bio: 'O seu tempo é limitado, então não o gaste vivendo a vida de outra pessoa!',
  avatar: '/favicon.svg',
  title: 'Empreendedor',
  badges: ['Produtivo', 'Desenvolvedor', 'Focado'],
  theme: 'dark'
};

export default function Home() {
  // TODOS OS HOOKS DEVEM SER CHAMADOS NO TOPO, ANTES DE QUALQUER LÓGICA CONDICIONAL
  const { data: session, status } = useSession();
  const { stats, taskHistory, completeTask, addXP, isLoaded, getNextAchievement, syncFromServer } = useProductivityLevel();
  const { dailyPlayTime, maxDailyPlayTime, addPlayTime } = useGameTime();
  
  // Verificar banimento em tempo real
  useBanCheck();

  // Sistema de upgrade
  const {
    isOpen: isUpgradeModalOpen,
    targetPlan,
    blockedFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    canAccessFeature,
    currentPlan,
  } = useUpgradeModal({
    onUpgrade: async (plan) => {
      console.log(`Upgrading to ${plan} plan`);
      // A lógica de upgrade será implementada no modal
    }
  });

  // TODOS OS HOOKS NO TOPO - ANTES DE QUALQUER RETURN
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(false);
  const [showPulseAnimation, setShowPulseAnimation] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showSnakeGame, setShowSnakeGame] = useState(false);
  const [showScheduledTasks, setShowScheduledTasks] = useState(true);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    currentLevel: number;
    targetLevel: number;
    plan: string;
  } | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPlanBanner, setShowPlanBanner] = useState(true);

  // Callback para sincronização - memoizado para evitar re-renderizações
  const handleSyncComplete = useCallback((stats: any) => {
    if (stats && (stats.tasks > 0 || stats.activityLogs > 0)) {
      console.log('🔄 Sincronização automática concluída:', stats);
    }
  }, []);

  // Sincronização automática - MOVIDO PARA O TOPO
  const { manualSync, isSyncing, lastSync } = useAutoSync({
    enabled: true,
    syncInterval: 60000, // 1 minuto (reduzido de 30 segundos)
    showNotifications: false, // Não mostrar notificações automáticas
    onSyncComplete: handleSyncComplete
  });

  // Middleware de sincronização automática - MOVIDO PARA O TOPO
  const { onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskCompleted } = useAutoSyncMiddleware();

  // Função para gerar chave única baseada no domínio
  const getStorageKey = (key: string) => {
    if (typeof window === 'undefined') return key;
    const domain = window.location.hostname;
    return `${domain}-${key}`;
  };

  // Controlar visibilidade da faixa do plano
  useEffect(() => {
    if (!isLoaded) return;

    // Timer para esconder a faixa após 5 segundos
    const timer = setTimeout(() => {
      setShowPlanBanner(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Calcular próxima conquista
  const nextAchievement = useMemo(() => {
    if (isLoaded && stats) {
      return getNextAchievement(stats.achievements, todos, stats);
    }
    return null;
  }, [isLoaded, stats, todos, getNextAchievement]);

  // TODOS OS USEEFFECT NO TOPO
  // Redirecionar para landing page se não autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/landing';
    }
  }, [status]);

  // Desativar animação pulsante após 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulseAnimation(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Salvar dados da sessão para sincronização
  useEffect(() => {
    if (session?.user?.email && typeof window !== 'undefined') {
      localStorage.setItem('user-session', JSON.stringify({
        email: session.user.email,
        name: session.user.name,
        id: session.user.id,
      }));
    }
  }, [session]);

  // Sincronizar dados com o servidor
  useEffect(() => {
    if (session?.user?.email && syncFromServer && isClient) {
      const timer = setTimeout(() => {
        try {
          syncFromServer(session.user.email!);
        } catch (error) {
          console.error('Erro na sincronização:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [session?.user?.email, syncFromServer, isClient]);

  // Verificar se é um novo usuário que acabou de completar onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tutorialCompleted = localStorage.getItem(getStorageKey('tutorial-completed'));
      const onboardingCompleted = localStorage.getItem(getStorageKey('onboarding-completed'));
      const hasProfile = localStorage.getItem(getStorageKey('user-profile'));
      
      // Se completou onboarding mas não fez tutorial, é um novo usuário
      if (onboardingCompleted && hasProfile && !tutorialCompleted) {
        setIsNewUser(true);
        
        // Mostrar tutorial automaticamente apenas se for realmente novo
        const justCompletedOnboarding = sessionStorage.getItem('just-completed-onboarding');
        if (justCompletedOnboarding) {
          // Não mostrar tutorial imediatamente - aguardar o level up modal primeiro
          // O tutorial será mostrado após o level up modal ser fechado
          sessionStorage.removeItem('just-completed-onboarding');
          // Marcar que deve mostrar tutorial após level up
          sessionStorage.setItem('show-tutorial-after-levelup', 'true');
        }
      }
    }
  }, []);

  // Carregar perfil do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(getStorageKey('user-profile'));
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          
          // Validar e formatar perfil automaticamente
          const profileValidation = validateAndFormatProfile(parsedProfile);
          if (profileValidation.isValid) {
            const validatedProfile: UserProfile = {
              ...parsedProfile,
              ...profileValidation.formatted
            };
            setUserProfile(validatedProfile);
            // Salvar versão validada se houver mudanças
            if (JSON.stringify(parsedProfile) !== JSON.stringify(validatedProfile)) {
              localStorage.setItem(getStorageKey('user-profile'), JSON.stringify(validatedProfile));
            }
          } else {
            // Se inválido, usar valores padrão seguros
            const safeProfile: UserProfile = {
              name: 'Usuário',
              title: 'Profissional',
              email: parsedProfile.email || DEFAULT_PROFILE.email,
              bio: parsedProfile.bio || DEFAULT_PROFILE.bio,
              avatar: parsedProfile.avatar || DEFAULT_PROFILE.avatar,
              badges: parsedProfile.badges || DEFAULT_PROFILE.badges,
              theme: parsedProfile.theme || DEFAULT_PROFILE.theme
            };
            setUserProfile(safeProfile);
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          setUserProfile(DEFAULT_PROFILE);
        }
      }
    }
  }, []);

  // Salvar perfil no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      localStorage.setItem(getStorageKey('user-profile'), JSON.stringify(userProfile));
    }
  }, [userProfile, isClient]);

  // Verificar se há dados de perfil anterior que precisam ser limpos
  useEffect(() => {
    if (isClient) {
      // Verificar se o perfil atual é diferente do que estava salvo anteriormente
      const savedProfile = localStorage.getItem(getStorageKey('user-profile'));
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          // Se o nome do perfil mudou, limpar todos os dados relacionados
          if (parsedProfile.name !== userProfile.name) {
            localStorage.removeItem(getStorageKey('user-todos'));
            localStorage.removeItem(getStorageKey('productivity-stats'));
            localStorage.removeItem(getStorageKey('task-history'));
            setTodos([]);
          }
        } catch (error) {
          console.error('Erro ao verificar perfil anterior:', error);
        }
      }
    }
  }, [userProfile.name, isClient]);

  // Marcar como cliente após hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verificar consistência dos dados ao carregar
  useEffect(() => {
    if (isClient) {
      // Verificar se há dados inconsistentes (tarefas sem perfil ou vice-versa)
      const hasTodos = localStorage.getItem(getStorageKey('user-todos'));
      const hasProfile = localStorage.getItem(getStorageKey('user-profile'));
      const hasStats = localStorage.getItem(getStorageKey('productivity-stats'));
      
      // Se há tarefas mas não há perfil, limpar as tarefas
      if (hasTodos && !hasProfile) {
        localStorage.removeItem(getStorageKey('user-todos'));
        setTodos([]);
      }
      
      // Se há stats mas não há perfil, limpar os stats
      if (hasStats && !hasProfile) {
        localStorage.removeItem(getStorageKey('productivity-stats'));
        localStorage.removeItem(getStorageKey('task-history'));
      }
    }
  }, [isClient]);

  // Carregar tarefas da API
  const fetchTasks = async () => {
    if (status === 'loading' || !session?.user?.id) return;
    
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        const tasksWithDates = data.tasks
          .filter((task: any) => task.id && task.id !== 'undefined' && task.id !== 'null') // Filtrar tarefas sem ID válido
          .map((task: any) => ({
            id: task.id.toString(),
            text: task.text || '',
            completed: task.completed || false,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            priority: task.priority || false,
            scheduledFor: task.scheduledFor ? new Date(task.scheduledFor) : undefined,
          }));
        
        // Log para debug
        if (data.tasks.length !== tasksWithDates.length) {
          // Log removido para melhorar performance
        }
        
        setTodos(tasksWithDates);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  // Carregar tarefas da API
  useEffect(() => {
    if (isClient && session?.user?.id) {
      fetchTasks();
    }
  }, [isClient, session?.user?.id, status]);

  // Listener para modal de upgrade
  useEffect(() => {
    const handleShowUpgradeModal = (event: CustomEvent) => {
      setUpgradeModalData(event.detail);
      setShowUpgradeModal(true);
    };

    window.addEventListener('show-upgrade-modal', handleShowUpgradeModal as EventListener);
    
    return () => {
      window.removeEventListener('show-upgrade-modal', handleShowUpgradeModal as EventListener);
    };
  }, []);

  // Loading state enquanto verifica autenticação
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar se não autenticado
  if (status === 'unauthenticated') {
    return null; // O useEffect já redirecionou
  }

  const addTodo = async (taskData: any) => {
    if (!taskData.title?.trim()) return;

    try {
      const requestBody = {
        title: taskData.title,
        text: taskData.title,
        // Campos opcionais
        ...(taskData.description && { description: taskData.description }),
        ...(taskData.category && { category: taskData.category }),
        ...(taskData.priority && { priority: taskData.priority }),
        ...(taskData.deadline && { deadline: taskData.deadline }),
        ...(taskData.estimatedTime && { estimatedTime: taskData.estimatedTime }),
        ...(taskData.tags && { tags: taskData.tags }),
        ...(taskData.reward && { reward: taskData.reward }),
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newTask = responseData.task || responseData;
        setTodos(prev => [newTask, ...prev]);
        
        // Sincronizar automaticamente após adicionar tarefa
        await onTaskCreated(newTask);
        
        toast.success('Tarefa criada com sucesso!');
      } else {
        toast.error('Erro ao criar tarefa');
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      // Log removido para melhorar performance
      
      if (!id || id === 'undefined' || id === 'null') {
        console.error('toggleTodo - ID inválido:', id);
        toast.error('ID da tarefa inválido');
        return;
      }
      
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        console.error('Tarefa não encontrada com ID:', id);
        return;
      }

      const requestBody = {
        id: id.toString(),
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : null
      };
      
              // Logs removidos para melhorar performance

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedTask = responseData.task || responseData;
        // Log removido para melhorar performance
        
        // Atualizar estado local imediatamente para fluidez
        setTodos(prev => prev.map(t => t.id === id ? {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date() : undefined
        } : t));
        
        // Sincronizar automaticamente após atualizar tarefa
        if (!todo.completed) {
          await onTaskCompleted(updatedTask);
          // Chamar completeTask para atualizar estatísticas de produtividade
          completeTask({
            id: updatedTask.id,
            text: updatedTask.text,
            completed: true,
            createdAt: new Date(updatedTask.createdAt),
            completedAt: new Date(),
            priority: updatedTask.priority
          } as any);
        } else {
          await onTaskUpdated(updatedTask);
        }
        
        toast.success(todo.completed ? 'Tarefa reaberta!' : 'Tarefa concluída!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('toggleTodo - Erro na resposta:', response.status, errorData);
        toast.error('Erro ao atualizar tarefa');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(prev => prev.filter(t => t.id !== id));
        
        // Sincronizar automaticamente após deletar tarefa
        await onTaskDeleted(id);
        
        toast.success('Tarefa excluída com sucesso!');
      } else {
        toast.error('Erro ao excluir tarefa');
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const deleteMultipleTodos = async (ids: string[]) => {
    if (!session?.user?.id) return;

    try {
      // Deletar cada tarefa individualmente
      const deletePromises = ids.map(id => 
        fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Recarregar tarefas para ter os dados atualizados do banco
      await fetchTasks();
    } catch (error) {
      console.error('Erro ao deletar tarefas:', error);
    }
  };

  const editTodo = async (id: string, newText: string) => {
    if (!newText.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title: newText,
          text: newText
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedTask = responseData.task || responseData;
        setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
        
        // Sincronizar automaticamente após editar tarefa
        await onTaskUpdated(updatedTask);
        
        toast.success('Tarefa atualizada com sucesso!');
      } else {
        toast.error('Erro ao atualizar tarefa');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedTask = responseData.task || responseData;
        setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
        
        // Sincronizar automaticamente após atualizar tarefa
        await onTaskUpdated(updatedTask);
        
        return updatedTask;
      } else {
        throw new Error('Erro ao atualizar tarefa');
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const togglePriority = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          priority: !todo.priority
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const updatedTask = responseData.task || responseData;
        setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
        
        // Sincronizar automaticamente após alterar prioridade
        await onTaskUpdated(updatedTask);
        
        toast.success(todo.priority ? 'Prioridade removida!' : 'Tarefa marcada como prioridade!');
      } else {
        toast.error('Erro ao atualizar prioridade');
      }
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error);
      toast.error('Erro ao atualizar prioridade');
    }
  };

  const handleTutorialComplete = () => {
    setIsNewUser(false);
    setShowTutorial(false);
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  // Função para pular tutorial (apenas se não for obrigatório)
  const skipTutorial = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey('tutorial-completed'), 'true');
      setShowTutorial(false);
      setIsNewUser(false);
    }
  };

  const openMiniGame = () => {
    setShowMiniGame(true);
  };

  const closeMiniGame = () => {
    setShowMiniGame(false);
  };

  const openSnakeGame = () => {
    setShowSnakeGame(true);
  };

  const closeSnakeGame = () => {
    setShowSnakeGame(false);
  };

  const openFocusMode = () => {
    setShowFocusMode(true);
  };

  const closeFocusMode = () => {
    setShowFocusMode(false);
  };

  const rescheduleTodo = async (id: string, newDate: Date) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          scheduledFor: newDate.toISOString(),
        }),
      });

      if (response.ok) {
        // Recarregar tarefas para ter os dados atualizados do banco
        await fetchTasks();
      } else {
        console.error('Erro ao reagendar tarefa');
      }
    } catch (error) {
      console.error('Erro ao reagendar tarefa:', error);
    }
  };

  const handleGameEarnXP = (xp: number) => {
    addXP(xp, 'Mini-game completion');
    // Adicionar tempo de jogo (30 segundos por sessão)
    addPlayTime(30);
  };

  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;
  const progressPercentage = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // Preparar dados para o calendário
  const completedTasksForCalendar = todos
    .filter(todo => todo.completed && todo.completedAt)
    .map(todo => ({
      id: todo.id,
      text: todo.text,
      completedAt: todo.completedAt!.toISOString()
    }));

  // Renderizar loading enquanto não estiver no cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        {/* Purple blur effect sutil na parte superior */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-500/5 via-purple-500/3 to-transparent pointer-events-none"></div>
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-20 border-r border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="space-y-6">
              <div className="h-8 w-8 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-64 bg-muted rounded animate-pulse" />
              <div className="h-96 bg-muted rounded animate-pulse" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
              <div className="space-y-8">
                {/* Profile Header Skeleton */}
                <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <div className="h-8 w-64 bg-muted rounded animate-pulse mx-auto md:mx-0" />
                      <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto md:mx-0" />
                    </div>
                    <div className="text-center md:text-right space-y-2">
                      <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                </Card>

                {/* Main Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-12 w-full bg-muted rounded animate-pulse" />
                      </div>
                    </Card>
                    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                      <div className="space-y-4">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-8">
                    <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
                      <div className="space-y-6">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-32 bg-muted rounded animate-pulse" />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GlobalContextMenu
      onAddTodo={(priority) => {
        // Abrir modal para adicionar tarefa
        const text = prompt('Digite o nome da tarefa:');
        if (text && text.trim()) {
          addTodo(text.trim(), priority);
        }
      }}
      onOpenFocusMode={openFocusMode}
      onOpenMiniGame={openMiniGame}
      onOpenSnakeGame={openSnakeGame}
      onOpenTutorial={openTutorial}
      onOpenAchievements={() => {
        // Abrir modal de conquistas (já implementado no ProfileHeader)
        toast.info('Conquistas - clique no botão "Conquistas" no cabeçalho');
      }}
      onOpenCalendar={() => {
        setShowCalendarModal(true);
      }}
      onOpenStats={() => {
        setShowStatsModal(true);
      }}
      onOpenProfile={() => {
        // Abrir edição de perfil (já implementado no ProfileHeader)
        toast.info('Editar perfil - clique no botão "Editar Perfil" no cabeçalho');
      }}
      onClearCompleted={() => {
        const completedTodos = todos.filter(todo => todo.completed);
        if (completedTodos.length > 0) {
          deleteMultipleTodos(completedTodos.map(todo => todo.id));
        }
      }}
      currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
      hasCompletedTasks={todos.some(todo => todo.completed)}
      hasScheduledTasks={todos.some(todo => todo.scheduledFor)}
      isFocusModeAvailable={true}
      isMiniGameAvailable={true}
      isSnakeGameAvailable={isLoaded && stats && stats.currentLevel >= 5}
      isAdvancedFeaturesAvailable={isLoaded && stats && stats.currentLevel >= 3}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20 relative">
        {/* Purple blur effect sutil na parte superior */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-500/5 via-purple-500/3 to-transparent pointer-events-none group-hover:from-purple-500/8 group-hover:via-purple-500/5 transition-all duration-500"></div>

        {/* Faixa de Plano */}
        {isLoaded && (
          <div 
            className={`relative z-10 transition-all duration-500 ease-in-out ${
              showPlanBanner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
            onMouseEnter={() => setShowPlanBanner(true)}
            onMouseLeave={() => {
              // Resetar o timer quando o mouse sair
              setTimeout(() => {
                setShowPlanBanner(false);
              }, 3000);
            }}
          >
            <div className={`
              flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm border-b transition-all duration-500 hover:scale-[1.02] group
              ${currentPlan === 'free' 
                ? 'bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 border-gray-400/30 hover:from-gray-500/30 hover:via-gray-600/30 hover:to-gray-500/30' 
                : currentPlan === 'aspirante'
                ? 'bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 border-blue-400/30 hover:from-blue-500/30 hover:via-blue-600/30 hover:to-blue-500/30'
                : 'bg-gradient-to-r from-purple-500/20 via-purple-600/20 to-purple-500/20 border-purple-400/30 hover:from-purple-500/30 hover:via-purple-600/30 hover:to-purple-500/30'
              }
            `}>
              {/* Ícone do Plano */}
              <div className={`
                p-1.5 rounded-full transition-all duration-300 group-hover:scale-110
                ${currentPlan === 'free' 
                  ? 'bg-gray-400/20 text-gray-300' 
                  : currentPlan === 'aspirante'
                  ? 'bg-blue-400/20 text-blue-300'
                  : 'bg-purple-400/20 text-purple-300'
                }
              `}>
                {currentPlan === 'free' ? (
                  <User className="h-4 w-4" />
                ) : currentPlan === 'aspirante' ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
              </div>
              
              {/* Nome do Plano */}
              <span className={`
                transition-all duration-300 group-hover:text-white
                ${currentPlan === 'free' 
                  ? 'text-gray-300' 
                  : currentPlan === 'aspirante'
                  ? 'text-blue-300'
                  : 'text-purple-300'
                }
              `}>
                {currentPlan === 'free' ? 'Plano Gratuito' : currentPlan === 'aspirante' ? 'Plano Aspirante' : 'Plano Executor'}
              </span>
              
              {/* Indicador de Status */}
              <div className={`
                w-2 h-2 rounded-full animate-pulse transition-all duration-300
                ${currentPlan === 'free' 
                  ? 'bg-gray-400' 
                  : currentPlan === 'aspirante'
                  ? 'bg-blue-400'
                  : 'bg-purple-400'
                }
              `}></div>
            </div>
          </div>
        )}

      <div className="flex">
        {/* Sidebar Esquerda com Calendário */}
        <div 
          className={`
            hidden lg:block border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out
            ${leftSidebarExpanded ? 'w-80' : 'w-20'} 
          `}
          data-tutorial="calendar"
        >
          <div className="relative h-full">
            {/* Botão de toggle */}
            <div className="absolute -right-3 top-4 z-10">
              <Button
                size="sm"
                variant="secondary"
                className={`h-6 w-6 rounded-full p-0 shadow-lg border border-border bg-card hover:bg-purple-500/20 transition-all duration-200 sidebar-hover-effect ${
                  showPulseAnimation ? 'animate-pulse-glow' : ''
                }`}
                onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
              >
                {leftSidebarExpanded ? (
                  <ChevronLeft className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Conteúdo da Sidebar */}
            <div className={`h-full transition-all duration-300 ${leftSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="p-4 space-y-4">
                {/* Botão de Upgrade - Mostrar apenas para usuários gratuitos */}
                {isLoaded && currentPlan === 'free' && (
                  <div className="relative group">
                    {/* Glassmorphism Card */}
                    <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Content */}
                      <div className="relative p-6 text-center space-y-4">
                        {/* Ícone */}
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                          <Crown className="h-6 w-6 text-purple-300" />
                        </div>
                        
                        {/* Título */}
                        <div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1">
                            Desbloqueie seu Potencial
                          </h3>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Transforme sua produtividade com recursos premium exclusivos
                          </p>
                        </div>
                        
                        {/* CTA Button */}
                        <button
                          onClick={() => openUpgradeModal('executor', 'Todos os Recursos')}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          ✨ Fazer Upgrade Agora
                        </button>
                        
                        {/* Subtle Text */}
                        <p className="text-xs text-white/40">
                          Apenas para quem quer resultados extraordinários
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pomodoro Focus - Apenas para usuários Executor */}
                {isLoaded && currentPlan === 'executor' && (
                  <div className="relative group">
                    {/* Glassmorphism Card */}
                    <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Content */}
                      <div className="relative p-4">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 mb-2">
                            <Timer className="h-5 w-5 text-purple-300" />
                          </div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1">
                            Pomodoro Focus
                          </h3>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Técnica de produtividade avançada
                          </p>
                        </div>
                        
                        {/* Embedded Pomodoro Component */}
                        <SidebarPomodoro />
                      </div>
                    </div>
                  </div>
                )}

                {/* Planejador de Projetos */}
                <div className="relative group">
                  {/* Glassmorphism Card */}
                  <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative p-4">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 mb-2">
                          <FileText className="h-5 w-5 text-blue-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-white/90 mb-1">
                          Planejador de Projetos
                        </h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Organize seus projetos com visão 360°
                        </p>
                      </div>
                      
                      {/* CTA Button */}
                      <Link href="/project-planner" className="block">
                        <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600/80 to-green-600/80 hover:from-blue-600 hover:to-green-600 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95">
                          🚀 Abrir Planejador
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Calendário */}
                <Calendar 
                  completedTasks={completedTasksForCalendar}
                  scheduledTasks={todos
                    .filter(todo => todo.scheduledFor)
                    .map(todo => ({
                      id: todo.id,
                      text: todo.text,
                      scheduledFor: todo.scheduledFor!.toISOString(),
                      priority: todo.priority
                    }))}
                  currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
                  showScheduledTasks={showScheduledTasks}
                  onToggleScheduledTasks={() => setShowScheduledTasks(!showScheduledTasks)}
                />
              </div>
            </div>

            {/* Ícone quando recolhido */}
            {!leftSidebarExpanded && (
              <div className={`absolute inset-0 flex items-center justify-center opacity-100 transition-opacity ${
                showPulseAnimation ? 'animate-pulse-glow' : ''
              }`}>
                <div className="text-center">
                  {isLoaded && currentPlan === 'executor' ? (
                    <>
                      <Timer className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground font-medium">Pomodoro</div>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground font-medium">Calendário</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <div className="space-y-6">
              {/* Profile Header */}
              <div data-tutorial="profile">
                <ProfileHeader 
                  profile={userProfile} 
                  onUpdateProfile={setUserProfile} 
                  productivityStats={isLoaded ? stats : undefined}
                  completed={completedTodos}
                  total={totalTodos}
                  percentage={progressPercentage}
                  onOpenTutorial={openTutorial}
                  isExpanded={profileExpanded}
                  onToggleExpansion={() => setProfileExpanded(!profileExpanded)}
                  achievements={isLoaded ? stats.achievements : undefined}
                  nextAchievement={nextAchievement || undefined}

                />
              </div>



              {/* Debug Anti-Farming (temporariamente desabilitado) */}
              {/* {showDebug && (
                <AntiFarmingDebug isVisible={showDebug} />
              )} */}

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Todo Section */}
                <div className="space-y-4">
                  <div data-tutorial="unified-task-manager">
                    <UnifiedTaskManager 
                      onAddTodo={addTodo} 
                      todos={todos}
                      onToggleTodo={toggleTodo}
                      onDeleteTodo={deleteTodo}
                      onEditTodo={editTodo}
                      onUpdateTodo={updateTodo}
                      onTogglePriority={togglePriority}
                      currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
                    />
                  </div>
                </div>

                {/* Conquistas e Gráfico de Progresso */}
                <div className="space-y-6">
                  <div data-tutorial="achievements">
                    {isLoaded && <AchievementsPanel achievements={stats.achievements} nextAchievement={nextAchievement || undefined} />}
                  </div>
                  
                  {/* Gráfico de Progresso - Desbloqueado no nível 3 */}
                  <div data-tutorial="progress-chart">
                    {isLoaded && (
                      <ProgressChart 
                        tasks={taskHistory}
                        currentLevel={stats.currentLevel}
                        totalXP={stats.totalXP}
                        isUnlocked={stats.currentLevel >= 3}
                      />
                    )}
                  </div>
                  
                  {/* Tracking Avançado - Desbloqueado no nível 5 */}
                  <div data-tutorial="advanced-tracking">
                    {isLoaded && (
                      <AdvancedTrackingChart 
                        tasks={taskHistory}
                        currentLevel={stats.currentLevel}
                        totalXP={stats.totalXP}
                        isUnlocked={stats.currentLevel >= 5}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Direita com Nível e Dashboard */}
        {isLoaded && stats && (
          <RightSidebar
            stats={stats}
            tasks={taskHistory}
            sidebarExpanded={rightSidebarExpanded}
            onToggleSidebar={() => setRightSidebarExpanded(!rightSidebarExpanded)}
            showPulseAnimation={showPulseAnimation}
            onOpenMiniGame={openMiniGame}
            onOpenSnakeGame={openSnakeGame}
            currentLevel={stats.currentLevel}
          />
        )}
      </div>

      {/* Tutorial Modal */}
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Mini-Game Modal */}
      <MiniGame
        isOpen={showMiniGame}
        onClose={closeMiniGame}
        onEarnXP={handleGameEarnXP}
        currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
        dailyPlayTime={dailyPlayTime}
        maxDailyPlayTime={maxDailyPlayTime}
      />

      {/* Snake Game Modal - Desbloqueado no nível 5 */}
      {isLoaded && stats && stats.currentLevel >= 5 && (
        <SnakeGame
          isOpen={showSnakeGame}
          onClose={closeSnakeGame}
          onEarnXP={handleGameEarnXP}
          currentLevel={stats.currentLevel}
          dailyPlayTime={dailyPlayTime}
          maxDailyPlayTime={maxDailyPlayTime}
        />
      )}

      {/* Modo de Foco */}
      {showFocusMode && (
        <FocusMode
          todos={todos}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          onEditTodo={editTodo}
          onRescheduleTodo={rescheduleTodo}
          onAddTodo={addTodo}
          onClose={closeFocusMode}
          currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
        />
      )}

      {/* Menu do usuário - canto inferior esquerdo */}
      <UserMenu />

      {/* Modal de Upgrade */}
      {upgradeModalData && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            setUpgradeModalData(null);
          }}
          currentLevel={upgradeModalData.currentLevel}
          targetPlan={upgradeModalData.plan as any}
        />
      )}

      {/* Modal de Upgrade do Novo Sistema */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
        blockedFeature={blockedFeature}
        targetPlan={targetPlan}
      />

      {/* Modal de Estatísticas */}
      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        todos={todos}
        currentLevel={isLoaded ? stats?.currentLevel || 1 : 1}
        totalXP={isLoaded ? stats?.totalXP || 0 : 0}
      />

      {/* Modal de Calendário */}
      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        todos={todos}
        onAddTodo={addTodo}
      />

      {/* Status de Sincronização */}
      <div className="fixed bottom-4 right-4 z-50">
        <SyncStatus />
      </div>

      {/* Botão Flutuante de Ajuda */}
      <FloatingHelpButton />

      </div>
    </GlobalContextMenu>
  );
}