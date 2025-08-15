'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { playCompletionSound, playAchievementSound } from '@/lib/sounds';
import { debug } from '@/lib/debug';

export interface ProductivityStats {
  totalXP: number;
  currentLevel: number;
  levelName: string;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  totalTasksCompleted: number;
  consecutiveDays: number;
  bestDay: string;
  mostCommonTask: string;
  achievements: Achievement[];
  weeklyStats: WeeklyStats;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
  requirement: {
    type: string;
    value: number;
  };
}

export interface WeeklyStats {
  tasksCompleted: number;
  totalTasks: number;
  averageCompletionRate: number;
  bestDay: string;
  mostProductiveHour: string;
  streakDays: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  priority?: boolean;
}

const LEVELS = [
  { level: 1, name: 'Iniciante', xpRequired: 0 },
  { level: 2, name: 'Praticante', xpRequired: 100 },
  { level: 3, name: 'Constante', xpRequired: 250 },
  { level: 4, name: 'Comprometido', xpRequired: 450 },
  { level: 5, name: 'Disciplinado', xpRequired: 700 },
  { level: 6, name: 'Produtivo', xpRequired: 1000 },
  { level: 7, name: 'Focado', xpRequired: 1350 },
  { level: 8, name: 'Autônomo', xpRequired: 1750 },
  { level: 9, name: 'Alta Performance', xpRequired: 2200 },
  { level: 10, name: 'Mestre da Produtividade', xpRequired: 4200 },
];

const ACHIEVEMENTS = [
  {
    id: 'first_task',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira tarefa',
    icon: '🎯',
    xpReward: 25, // Reduzido de 50 para 25
    requirement: { type: 'tasks_completed', value: 1 },
  },
  {
    id: 'productive_day',
    name: 'Dia Produtivo',
    description: 'Complete 5 tarefas em um dia',
    icon: '⚡',
    xpReward: 50, // Reduzido de 100 para 50
    requirement: { type: 'daily_tasks', value: 5 },
  },
  {
    id: 'week_warrior',
    name: 'Guerreiro da Semana',
    description: 'Complete tarefas por 7 dias consecutivos',
    icon: '🔥',
    xpReward: 100, // Reduzido de 200 para 100
    requirement: { type: 'consecutive_days', value: 7 },
  },
  {
    id: 'priority_master',
    name: 'Mestre das Prioridades',
    description: 'Complete 10 tarefas prioritárias',
    icon: '⭐',
    xpReward: 75, // Reduzido de 150 para 75
    requirement: { type: 'priority_tasks', value: 10 },
  },
  {
    id: 'speed_demon',
    name: 'Demônio da Velocidade',
    description: 'Complete 5 tarefas antes das 9h da manhã',
    icon: '🌅',
    xpReward: 50, // Reduzido de 100 para 50
    requirement: { type: 'early_tasks', value: 5 },
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Complete 3 tarefas após as 22h',
    icon: '🦉',
    xpReward: 40, // Reduzido de 80 para 40
    requirement: { type: 'late_tasks', value: 3 },
  },
  {
    id: 'morning_person',
    name: 'Pessoa da Manhã',
    description: 'Complete 10 tarefas entre 6h e 12h',
    icon: '☀️',
    xpReward: 60, // Reduzido de 120 para 60
    requirement: { type: 'morning_tasks', value: 10 },
  },
  {
    id: 'afternoon_worker',
    name: 'Trabalhador da Tarde',
    description: 'Complete 10 tarefas entre 12h e 18h',
    icon: '🌤️',
    xpReward: 60, // Reduzido de 120 para 60
    requirement: { type: 'afternoon_tasks', value: 10 },
  },
  {
    id: 'evening_achiever',
    name: 'Conquistador da Noite',
    description: 'Complete 10 tarefas entre 18h e 22h',
    icon: '🌙',
    xpReward: 60, // Reduzido de 120 para 60
    requirement: { type: 'evening_tasks', value: 10 },
  },
  {
    id: 'task_creator',
    name: 'Criador de Tarefas',
    description: 'Crie 50 tarefas no total',
    icon: '📝',
    xpReward: 75, // Reduzido de 150 para 75
    requirement: { type: 'total_tasks_created', value: 50 },
  },
  {
    id: 'completion_master',
    name: 'Mestre da Conclusão',
    description: 'Complete 100 tarefas no total',
    icon: '✅',
    xpReward: 150, // Reduzido de 300 para 150
    requirement: { type: 'total_tasks_completed', value: 100 },
  },
  {
    id: 'xp_collector',
    name: 'Coletor de XP',
    description: 'Acumule 1000 XP no total',
    icon: '💎',
    xpReward: 200, // Reduzido de 400 para 200
    requirement: { type: 'total_xp', value: 1000 },
  },
  {
    id: 'level_5_reached',
    name: 'Nível 5 Alcançado',
    description: 'Alcance o nível 5',
    icon: '🏆',
    xpReward: 100, // Reduzido de 200 para 100
    requirement: { type: 'level', value: 5 },
  },
  {
    id: 'level_10_reached',
    name: 'Nível 10 Alcançado',
    description: 'Alcance o nível 10',
    icon: '👑',
    xpReward: 300, // Reduzido de 600 para 300
    requirement: { type: 'level', value: 10 },
  },
];

const MOTIVATIONAL_MESSAGES = {
  1: ['Cada jornada começa com um passo!', 'Você está no caminho certo!'],
  2: ['Continue praticando!', 'A prática leva à perfeição!'],
  3: ['Você está sendo constante!', 'Mantenha o ritmo!'],
  4: ['Compromisso é a chave!', 'Você está comprometido!'],
  5: ['Disciplina é liberdade!', 'Você é disciplinado!'],
  6: ['Você é produtivo!', 'Continue assim!'],
  7: ['Foco total!', 'Você está focado!'],
  8: ['Autonomia é poder!', 'Você é autônomo!'],
  9: ['Alta performance!', 'Você está no topo!'],
  10: ['Você é um mestre!', 'Inspiração para todos!'],
};

export function useProductivityLevel() {
  // Função para gerar chave única baseada no domínio
  const getStorageKey = useCallback((key: string) => {
    if (typeof window === 'undefined') return key;
    const domain = window.location.hostname;
    return `${domain}-${key}`;
  }, []);

  // Função para obter nome do nível
  const getLevelName = useCallback((level: number) => {
    const levelNames: { [key: number]: string } = {
      1: 'Iniciante',
      2: 'Praticante',
      3: 'Constante',
      4: 'Comprometido',
      5: 'Disciplinado',
      6: 'Produtivo',
      7: 'Focado',
      8: 'Autônomo',
      9: 'Alta Performance',
      10: 'Mestre da Produtividade',
    };
    return levelNames[level] || 'Iniciante';
  }, []);

  // Calcular nível atual baseado no XP - MOVIDO PARA ANTES DO USO
  const calculateLevel = useCallback((xp: number) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return {
          level: LEVELS[i].level,
          name: LEVELS[i].name,
          xpToNextLevel: i < LEVELS.length - 1 ? LEVELS[i + 1].xpRequired - xp : 0,
          xpInCurrentLevel: xp - LEVELS[i].xpRequired,
        };
      }
    }
    return { level: 1, name: 'Iniciante', xpToNextLevel: 100, xpInCurrentLevel: xp };
  }, []);

  // Função para sincronizar dados do servidor (quando admin altera XP)
  const syncFromServer = useCallback(async (userEmail?: string) => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`/api/user/sync?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const serverData = await response.json();
        if (serverData.xp !== undefined && serverData.level !== undefined) {
          // Verificar se os dados são diferentes antes de atualizar
          setStats(prev => {
            // Se os dados são iguais, não fazer nada
            if (prev.totalXP === serverData.xp && prev.currentLevel === serverData.level) {
              return prev;
            }
            
            // Só atualizar se os dados do servidor são mais recentes ou se não temos dados locais
            const shouldUpdate = prev.totalXP === 0 || serverData.xp >= prev.totalXP;
            
            if (!shouldUpdate) {
              debug.log('Dados locais são mais recentes, mantendo dados locais');
              return prev;
            }
            
            const previousLevel = prev.currentLevel;
            const newLevel = serverData.level;
            
            // Se houve mudança de nível, forçar atualização do localStorage para trigger do ProfileHeader
            if (previousLevel !== newLevel) {
              // Atualizar o previous-level para forçar o modal aparecer
              localStorage.setItem('previous-level', previousLevel.toString());
              
              // Pequeno delay para garantir que o ProfileHeader detecte a mudança
              setTimeout(() => {
                localStorage.setItem('previous-level', newLevel.toString());
              }, 100);
            }
            
            // Calcular informações corretas do nível
            const levelInfo = calculateLevel(serverData.xp);
            
            const newStats = {
              ...prev,
              totalXP: serverData.xp,
              currentLevel: levelInfo.level,
              levelName: levelInfo.name,
              xpInCurrentLevel: levelInfo.xpInCurrentLevel,
              xpToNextLevel: levelInfo.xpToNextLevel,
            };
            localStorage.setItem(getStorageKey('productivity-stats'), JSON.stringify(newStats));
            debug.log('Dados sincronizados do servidor:', serverData);
            return newStats;
          });
        }
      }
    } catch (error) {
      debug.log('Sincronização silenciosa falhou:', error);
    }
  }, [getStorageKey, calculateLevel]);

  const [isLoaded, setIsLoaded] = useState(false);
  const syncSetupRef = useRef(false);
  const initialLoadRef = useRef(false);
  const [stats, setStats] = useState<ProductivityStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('productivity-stats'));
      if (saved) {
        return JSON.parse(saved);
      }
    }
    
    return {
      totalXP: 0,
      currentLevel: 1,
      levelName: 'Iniciante',
      xpToNextLevel: 100,
      xpInCurrentLevel: 0,
      totalTasksCompleted: 0,
      consecutiveDays: 0,
      bestDay: '',
      mostCommonTask: '',
      achievements: ACHIEVEMENTS.map(achievement => ({ ...achievement, unlocked: false })),
      weeklyStats: {
        tasksCompleted: 0,
        totalTasks: 0,
        averageCompletionRate: 0,
        bestDay: '',
        mostProductiveHour: '',
        streakDays: 0,
      },
    };
  });

  const [taskHistory, setTaskHistory] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('task-history'));
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Marcar como carregado após a hidratação
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Carregar XP inicial do banco de dados usando NextAuth session
  useEffect(() => {
    if (!isLoaded || initialLoadRef.current) return;

    const loadUserXPFromServer = async () => {
      try {
        initialLoadRef.current = true;
        
        // Usar NextAuth para obter a sessão
        const { useSession } = await import('next-auth/react');
        
        // Como estamos dentro de um hook, vamos usar fetch para verificar a sessão
        const sessionResponse = await fetch('/api/auth/session');
        if (!sessionResponse.ok) return;
        
        const sessionData = await sessionResponse.json();
        if (!sessionData?.user?.email) return;

        const response = await fetch(`/api/user/sync?email=${encodeURIComponent(sessionData.user.email)}`);
        if (response.ok) {
          const serverData = await response.json();
          if (serverData.xp !== undefined && serverData.level !== undefined) {
            // Calcular informações corretas do nível
            const levelInfo = calculateLevel(serverData.xp);
            
            // Atualizar dados locais com dados do servidor
            setStats(prev => {
              // Só atualizar se os dados do servidor são mais recentes ou se não temos dados locais
              const shouldUpdate = prev.totalXP === 0 || serverData.xp > prev.totalXP;
              
              if (!shouldUpdate) {
                debug.log('Dados locais são mais recentes, mantendo dados locais');
                return prev;
              }
              
              const newStats = {
                ...prev,
                totalXP: serverData.xp,
                currentLevel: levelInfo.level,
                levelName: levelInfo.name,
                xpInCurrentLevel: levelInfo.xpInCurrentLevel,
                xpToNextLevel: levelInfo.xpToNextLevel,
              };
              localStorage.setItem(getStorageKey('productivity-stats'), JSON.stringify(newStats));
              debug.log('XP inicial carregado do servidor:', serverData);
              return newStats;
            });
          }
        }
      } catch (error) {
        debug.log('Erro ao carregar XP inicial:', error);
        initialLoadRef.current = false;
      }
    };

    loadUserXPFromServer();
  }, [isLoaded, calculateLevel]);

  // Sincronização periódica com servidor (para quando admin altera XP)
  useEffect(() => {
    if (!isLoaded || syncSetupRef.current) return;

    // Tentar obter email da sessão
    const getSessionEmail = () => {
      try {
        // Em produção, isso viria da sessão NextAuth
        const sessionData = localStorage.getItem('user-session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          return session.email;
        }
      } catch (error) {
        debug.log('Erro ao obter email da sessão:', error);
      }
      return null;
    };

    const userEmail = getSessionEmail();
    if (userEmail) {
      syncSetupRef.current = true;
      
      // Sincronizar após um pequeno delay para evitar setState durante render
      const timeoutId = setTimeout(() => {
        syncFromServer(userEmail);
      }, 10000); // Aumentado para 10 segundos

      // Configurar polling a cada 10 minutos (600 segundos) para reduzir conflitos
      const interval = setInterval(() => {
        syncFromServer(userEmail);
      }, 600000);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(interval);
        syncSetupRef.current = false;
      };
    }
  }, [isLoaded]);

  // Salvar dados no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem(getStorageKey('productivity-stats'), JSON.stringify(stats));
      localStorage.setItem(getStorageKey('task-history'), JSON.stringify(taskHistory));
    }
  }, [stats, taskHistory, isLoaded]);

  // Função para calcular XP necessário para um nível específico
  const calculateXPForLevel = useCallback((targetLevel: number) => {
    const levelData = LEVELS.find(l => l.level === targetLevel);
    return levelData ? levelData.xpRequired : 0;
  }, []);

  // Verificar conquistas
  const checkAchievements = useCallback((tasks: Task[], newXP: number) => {
    const newAchievements: Achievement[] = [];
    const currentAchievements = stats.achievements;

    // Primeira tarefa
    if (tasks.length === 1 && !currentAchievements.find(a => a.id === 'first_task')?.unlocked) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'first_task')!,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }

    // Dia produtivo (5 tarefas em um dia)
    const today = new Date().toDateString();
    const todayTasks = tasks.filter(task => 
      task.completed && task.completedAt && 
      new Date(task.completedAt).toDateString() === today
    );
    
    if (todayTasks.length >= 5 && !currentAchievements.find(a => a.id === 'productive_day')?.unlocked) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'productive_day')!,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }

    // Tarefas prioritárias
    const priorityTasks = tasks.filter(task => task.completed && task.priority);
    if (priorityTasks.length >= 10 && !currentAchievements.find(a => a.id === 'priority_master')?.unlocked) {
      newAchievements.push({
        ...ACHIEVEMENTS.find(a => a.id === 'priority_master')!,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }

    return newAchievements;
  }, [stats.achievements]);

  // Calcular XP por ação
  const calculateXPGain = useCallback((action: string, tasks: Task[]) => {
    let xpGain = 0;

    switch (action) {
      case 'complete_task':
        xpGain += 5; // Reduzido de 10 para 5
        break;
      case 'complete_priority_task':
        xpGain += 10; // Reduzido de 20 para 10
        break;
      case 'complete_all_daily':
        xpGain += 15; // Reduzido de 30 para 15
        break;
      case 'consecutive_3_days':
        xpGain += 10; // Reduzido de 25 para 10
        break;
      case 'consecutive_7_days':
        xpGain += 50; // Reduzido de 100 para 50
        break;
      case 'no_tasks_day':
        xpGain -= 5; // Reduzido de 10 para 5
        break;
      case 'no_tasks_2_days':
        xpGain -= 10; // Reduzido de 20 para 10
        break;
    }

    return xpGain;
  }, []);

  // Adicionar XP - otimizado para performance com verificação de plano
  const addXP = useCallback(async (amount: number, reason: string, taskId?: string) => {
    // Atualizar estado local imediatamente para resposta instantânea
    setStats(prevStats => {
      const newXP = Math.max(0, prevStats.totalXP + amount);
      const levelInfo = calculateLevel(newXP);
      const wasLevelUp = levelInfo.level > prevStats.currentLevel;

      // Verificar limite de nível baseado no plano (implementação local para performance)
      let subscription;
      try {
        const stored = localStorage.getItem(getStorageKey('subscription'));
        subscription = stored ? JSON.parse(stored) : { plan: 'free', maxLevel: 3 };
      } catch {
        subscription = { plan: 'free', maxLevel: 3 };
      }

      // Limitar o nível baseado no plano
      const maxAllowedLevel = subscription.maxLevel || 3;
      const finalLevel = Math.min(levelInfo.level, maxAllowedLevel);
      const finalLevelInfo = finalLevel < levelInfo.level ? calculateLevel(calculateXPForLevel(finalLevel)) : levelInfo;

      const newStats = {
        ...prevStats,
        totalXP: newXP,
        currentLevel: finalLevel,
        levelName: finalLevelInfo.name,
        xpToNextLevel: finalLevelInfo.xpToNextLevel,
        xpInCurrentLevel: finalLevelInfo.xpInCurrentLevel,
      };

      // Verificar se atingiu o limite do plano
      if (levelInfo.level > maxAllowedLevel && prevStats.currentLevel < maxAllowedLevel) {
        // Disparar evento para mostrar modal de upgrade
        window.dispatchEvent(new CustomEvent('show-upgrade-modal', {
          detail: { 
            currentLevel: maxAllowedLevel,
            targetLevel: levelInfo.level,
            plan: subscription.plan 
          }
        }));
        
        toast.success(`🎉 Level ${maxAllowedLevel} Alcançado!`, {
          description: `Você atingiu o limite do plano ${subscription.plan}. Faça upgrade para continuar evoluindo!`,
          duration: 6000,
        });
      } else if (wasLevelUp && finalLevel === levelInfo.level) {
        // Registrar a mudança real de nível
        localStorage.setItem('last-level-change', Date.now().toString());
        
        const messages = MOTIVATIONAL_MESSAGES[levelInfo.level as keyof typeof MOTIVATIONAL_MESSAGES] || ['Parabéns!'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        toast.success(`🎉 Level Up! ${levelInfo.name}`, {
          description: `${randomMessage} Você agora é ${levelInfo.name}!`,
          duration: 5000,
        });
      } else if (amount > 0) {
        toast.success(`+${amount} XP`, {
          description: reason,
          duration: 3000,
        });
      } else if (amount < 0) {
        toast.error(`${amount} XP`, {
          description: reason,
          duration: 3000,
        });
      }

      return newStats;
    });

    // Salvar XP no banco de dados em background para não bloquear a UI
    setTimeout(async () => {
      try {
        const response = await fetch('/api/user/xp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            xpGain: amount,
            reason,
            taskId,
          }),
        });

        if (!response.ok) {
          console.error('Erro ao salvar XP no servidor');
        } else {
          const result = await response.json();
          debug.log('XP salvo no servidor:', result);
        }
      } catch (error) {
        console.error('Erro ao salvar XP no servidor:', error);
      }
    }, 0);
  }, [calculateLevel]);

  // Completar tarefa - otimizado para performance
  const completeTask = useCallback((task: Task) => {
    const updatedTask = { ...task, completed: true, completedAt: new Date() };
    
    // Atualizar task history imediatamente
    setTaskHistory(prev => [...prev, updatedTask]);

    // Tocar som de conclusão imediatamente
    playCompletionSound();

    // Calcular XP básico imediatamente para feedback visual rápido
    let baseXP = calculateXPGain('complete_task', taskHistory);
    if (task.priority) {
      baseXP += calculateXPGain('complete_priority_task', taskHistory);
    }

    // Atualizar XP imediatamente para responsividade visual
    addXP(baseXP, task.priority ? 'Tarefa prioritária completada!' : 'Tarefa completada!', task.id);

    // Executar cálculos pesados em microtask para não bloquear a UI
    queueMicrotask(() => {
      // Verificar se completou todas as tarefas do dia
      const today = new Date().toDateString();
      const todayTasks = taskHistory.filter(t => 
        new Date(t.createdAt).toDateString() === today
      );
      const todayCompleted = todayTasks.filter(t => t.completed).length + 1;
      
      let bonusXP = 0;
      if (todayCompleted === todayTasks.length && todayTasks.length > 1) {
        bonusXP = calculateXPGain('complete_all_daily', taskHistory);
        addXP(bonusXP, 'Todas as tarefas do dia completadas!');
      }

      // Verificar conquistas em background
      const newAchievements = checkAchievements([...taskHistory, updatedTask], stats.totalXP + baseXP + bonusXP);
      if (newAchievements.length > 0) {
        setStats(prev => ({
          ...prev,
          achievements: prev.achievements.map(achievement => {
            const newAchievement = newAchievements.find(a => a.id === achievement.id);
            return newAchievement || achievement;
          }),
        }));

        newAchievements.forEach(achievement => {
          // Tocar som de conquista
          playAchievementSound();
          toast.success(`🏆 ${achievement.name}`, {
            description: `${achievement.description} +${achievement.xpReward} XP`,
            duration: 6000,
          });
          addXP(achievement.xpReward, `Conquista: ${achievement.name}`);
        });
      }
    });
  }, [taskHistory, calculateXPGain, addXP, checkAchievements, stats.totalXP]);

  // Calcular estatísticas semanais
  const calculateWeeklyStats = useCallback((tasks: Task[]) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    const completedTasks = weekTasks.filter(task => task.completed);
    const totalTasks = weekTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Melhor dia da semana
    const dayStats = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayCounts = dayStats.map(() => 0);
    
    completedTasks.forEach(task => {
      const day = new Date(task.completedAt || task.createdAt).getDay();
      dayCounts[day]++;
    });

    const bestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const bestDay = dayStats[bestDayIndex];

    return {
      tasksCompleted: completedTasks.length,
      totalTasks,
      averageCompletionRate: completionRate,
      bestDay,
      mostProductiveHour: '09:00', // Simplificado
      streakDays: stats.consecutiveDays,
    };
  }, [stats.consecutiveDays]);

  // Atualizar estatísticas
  useEffect(() => {
    const weeklyStats = calculateWeeklyStats(taskHistory);
    setStats(prev => ({
      ...prev,
      totalTasksCompleted: taskHistory.filter(task => task.completed).length,
      weeklyStats,
    }));
  }, [taskHistory, calculateWeeklyStats]);

  // Calcular progresso de uma conquista
  const calculateAchievementProgress = useCallback((achievement: Achievement, tasks: Task[], currentStats: ProductivityStats) => {
    // Verificar se a conquista tem requirement (para compatibilidade com dados antigos)
    if (!achievement.requirement) {
      return { current: 0, required: 1, percentage: 0 };
    }

    if (achievement.unlocked) return { current: achievement.requirement.value, required: achievement.requirement.value, percentage: 100 };

    const { type, value } = achievement.requirement;
    let current = 0;

    switch (type) {
      case 'tasks_completed':
        current = tasks.filter(t => t.completed).length;
        break;
      case 'daily_tasks':
        const today = new Date().toDateString();
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).toDateString() === today
        ).length;
        break;
      case 'consecutive_days':
        current = currentStats.consecutiveDays;
        break;
      case 'priority_tasks':
        current = tasks.filter(t => t.completed && t.priority).length;
        break;
      case 'total_tasks_created':
        current = tasks.length;
        break;
      case 'total_tasks_completed':
        current = tasks.filter(t => t.completed).length;
        break;
      case 'total_xp':
        current = currentStats.totalXP;
        break;
      case 'level':
        current = currentStats.currentLevel;
        break;
      case 'early_tasks':
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).getHours() < 9
        ).length;
        break;
      case 'late_tasks':
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).getHours() >= 22
        ).length;
        break;
      case 'morning_tasks':
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).getHours() >= 6 && 
          new Date(t.completedAt).getHours() < 12
        ).length;
        break;
      case 'afternoon_tasks':
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).getHours() >= 12 && 
          new Date(t.completedAt).getHours() < 18
        ).length;
        break;
      case 'evening_tasks':
        current = tasks.filter(t => 
          t.completed && t.completedAt && 
          new Date(t.completedAt).getHours() >= 18 && 
          new Date(t.completedAt).getHours() < 22
        ).length;
        break;
      default:
        current = 0;
    }

    const percentage = Math.min(100, (current / value) * 100);
    return { current, required: value, percentage };
  }, []);

  // Encontrar a próxima conquista
  const getNextAchievement = useCallback((achievements: Achievement[], tasks: Task[], currentStats: ProductivityStats) => {
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    
    if (lockedAchievements.length === 0) return null;

    // Ordenar por progresso (maior progresso primeiro)
    const achievementsWithProgress = lockedAchievements.map(achievement => ({
      ...achievement,
      progress: calculateAchievementProgress(achievement, tasks, currentStats)
    }));

    achievementsWithProgress.sort((a, b) => b.progress.percentage - a.progress.percentage);
    
    return achievementsWithProgress[0];
  }, [calculateAchievementProgress]);

  // Migrar conquistas antigas para o novo formato
  const migrateAchievements = useCallback((oldAchievements: any[]): Achievement[] => {
    return oldAchievements.map(oldAchievement => {
      // Se já tem requirement, retornar como está
      if (oldAchievement.requirement) {
        return oldAchievement;
      }

      // Encontrar a conquista correspondente no array ACHIEVEMENTS
      const templateAchievement = ACHIEVEMENTS.find(a => a.id === oldAchievement.id);
      if (templateAchievement) {
        return {
          ...templateAchievement,
          unlocked: oldAchievement.unlocked || false,
          unlockedAt: oldAchievement.unlockedAt,
        };
      }

      // Se não encontrar template, criar uma conquista padrão
      return {
        id: oldAchievement.id || 'unknown',
        name: oldAchievement.name || 'Conquista Desconhecida',
        description: oldAchievement.description || 'Descrição não disponível',
        icon: oldAchievement.icon || '🏆',
        unlocked: oldAchievement.unlocked || false,
        unlockedAt: oldAchievement.unlockedAt,
        xpReward: oldAchievement.xpReward || 50,
        requirement: { type: 'tasks_completed', value: 1 },
      };
    });
  }, []);

  // Atualizar estatísticas iniciais para incluir conquistas migradas (otimizado)
  useEffect(() => {
    if (isLoaded && stats.achievements.length > 0) {
      const needsMigration = stats.achievements.some(a => !a.requirement);
      if (needsMigration) {
        const migratedAchievements = migrateAchievements(stats.achievements);
        setStats(prev => ({
          ...prev,
          achievements: migratedAchievements,
        }));
      }
    }
  }, [isLoaded, migrateAchievements]); // Removido stats.achievements das dependências

  return {
    stats,
    taskHistory,
    completeTask,
    addXP,
    calculateLevel,
    checkAchievements,
    calculateAchievementProgress,
    getNextAchievement,
    migrateAchievements,
    syncFromServer,
    isLoaded,
  };
} 