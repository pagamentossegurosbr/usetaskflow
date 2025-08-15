'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createBrowserClient, subscribeToRealtimeChanges } from '@/lib/supabase';
import { toast } from 'sonner';

interface UseSupabaseSyncOptions {
  enabled?: boolean;
  syncInterval?: number;
  onDataChange?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useSupabaseSync(options: UseSupabaseSyncOptions = {}) {
  const { data: session } = useSession();
  const {
    enabled = true,
    syncInterval = 30000, // 30 segundos
    onDataChange,
    onError,
  } = options;

  const subscriptionRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createBrowserClient());

  // Função para sincronizar dados
  const syncData = useCallback(async () => {
    if (!session?.user?.id || !enabled) return;

    try {
      // Aqui você pode implementar a lógica de sincronização específica
      // Por exemplo, buscar dados do localStorage e enviar para Supabase
      const localData = {
        tasks: JSON.parse(localStorage.getItem('todos') || '[]'),
        pomodoroSessions: JSON.parse(localStorage.getItem('pomodoroSessions') || '[]'),
        habits: JSON.parse(localStorage.getItem('habits') || '[]'),
        habitLogs: JSON.parse(localStorage.getItem('habitLogs') || '[]'),
        stats: JSON.parse(localStorage.getItem('userStats') || '{}'),
      };

      // Enviar dados para Supabase
      const response = await fetch('/api/sync/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          data: localData,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na sincronização');
      }

      console.log('Dados sincronizados com Supabase');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      onError?.(error as Error);
      toast.error('Erro na sincronização dos dados');
    }
  }, [session?.user?.id, enabled, onError]);

  // Função para configurar sincronização em tempo real
  const setupRealtimeSync = useCallback(() => {
    if (!session?.user?.id || !enabled) return;

    // Limpar subscription anterior se existir
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Configurar nova subscription
    subscriptionRef.current = subscribeToRealtimeChanges(
      session.user.id,
      (payload) => {
        console.log('Mudança em tempo real detectada:', payload);
        onDataChange?.(payload);
        
        // Atualizar dados locais baseado na mudança
        handleRealtimeChange(payload);
      }
    );
  }, [session?.user?.id, enabled, onDataChange]);

  // Função para lidar com mudanças em tempo real
  const handleRealtimeChange = useCallback((payload: any) => {
    const { eventType, table, new: newRecord, old: oldRecord } = payload;

    switch (table) {
      case 'tasks':
        handleTaskChange(eventType, newRecord, oldRecord);
        break;
      case 'pomodoro_sessions':
        handlePomodoroChange(eventType, newRecord, oldRecord);
        break;
      case 'habits':
        handleHabitChange(eventType, newRecord, oldRecord);
        break;
      default:
        console.log('Tabela não reconhecida:', table);
    }
  }, []);

  // Handlers específicos para cada tipo de dado
  const handleTaskChange = useCallback((eventType: string, newRecord: any, oldRecord: any) => {
    const currentTasks = JSON.parse(localStorage.getItem('todos') || '[]');
    
    switch (eventType) {
      case 'INSERT':
        // Adicionar nova tarefa se não existir
        if (!currentTasks.find((task: any) => task.id === newRecord.id)) {
          const newTask = {
            id: newRecord.id,
            title: newRecord.title,
            description: newRecord.description,
            completed: newRecord.completed,
            priority: newRecord.priority,
            dueDate: newRecord.due_date,
            createdAt: newRecord.created_at,
            updatedAt: newRecord.updated_at,
          };
          currentTasks.push(newTask);
          localStorage.setItem('todos', JSON.stringify(currentTasks));
          toast.success('Nova tarefa sincronizada');
        }
        break;
        
      case 'UPDATE':
        // Atualizar tarefa existente
        const taskIndex = currentTasks.findIndex((task: any) => task.id === newRecord.id);
        if (taskIndex !== -1) {
          currentTasks[taskIndex] = {
            ...currentTasks[taskIndex],
            title: newRecord.title,
            description: newRecord.description,
            completed: newRecord.completed,
            priority: newRecord.priority,
            dueDate: newRecord.due_date,
            updatedAt: newRecord.updated_at,
          };
          localStorage.setItem('todos', JSON.stringify(currentTasks));
          toast.success('Tarefa atualizada');
        }
        break;
        
      case 'DELETE':
        // Remover tarefa
        const filteredTasks = currentTasks.filter((task: any) => task.id !== oldRecord.id);
        localStorage.setItem('todos', JSON.stringify(filteredTasks));
        toast.success('Tarefa removida');
        break;
    }
  }, []);

  const handlePomodoroChange = useCallback((eventType: string, newRecord: any, oldRecord: any) => {
    const currentSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]');
    
    switch (eventType) {
      case 'INSERT':
        if (!currentSessions.find((session: any) => session.id === newRecord.id)) {
          const newSession = {
            id: newRecord.id,
            duration: newRecord.duration,
            completed: newRecord.completed,
            startedAt: newRecord.started_at,
            endedAt: newRecord.ended_at,
            createdAt: newRecord.created_at,
          };
          currentSessions.push(newSession);
          localStorage.setItem('pomodoroSessions', JSON.stringify(currentSessions));
          toast.success('Nova sessão Pomodoro sincronizada');
        }
        break;
        
      case 'UPDATE':
        const sessionIndex = currentSessions.findIndex((session: any) => session.id === newRecord.id);
        if (sessionIndex !== -1) {
          currentSessions[sessionIndex] = {
            ...currentSessions[sessionIndex],
            duration: newRecord.duration,
            completed: newRecord.completed,
            startedAt: newRecord.started_at,
            endedAt: newRecord.ended_at,
          };
          localStorage.setItem('pomodoroSessions', JSON.stringify(currentSessions));
          toast.success('Sessão Pomodoro atualizada');
        }
        break;
        
      case 'DELETE':
        const filteredSessions = currentSessions.filter((session: any) => session.id !== oldRecord.id);
        localStorage.setItem('pomodoroSessions', JSON.stringify(filteredSessions));
        toast.success('Sessão Pomodoro removida');
        break;
    }
  }, []);

  const handleHabitChange = useCallback((eventType: string, newRecord: any, oldRecord: any) => {
    const currentHabits = JSON.parse(localStorage.getItem('habits') || '[]');
    
    switch (eventType) {
      case 'INSERT':
        if (!currentHabits.find((habit: any) => habit.id === newRecord.id)) {
          const newHabit = {
            id: newRecord.id,
            name: newRecord.name,
            description: newRecord.description,
            frequency: newRecord.frequency,
            targetCount: newRecord.target_count,
            currentStreak: newRecord.current_streak,
            longestStreak: newRecord.longest_streak,
            createdAt: newRecord.created_at,
            updatedAt: newRecord.updated_at,
          };
          currentHabits.push(newHabit);
          localStorage.setItem('habits', JSON.stringify(currentHabits));
          toast.success('Novo hábito sincronizado');
        }
        break;
        
      case 'UPDATE':
        const habitIndex = currentHabits.findIndex((habit: any) => habit.id === newRecord.id);
        if (habitIndex !== -1) {
          currentHabits[habitIndex] = {
            ...currentHabits[habitIndex],
            name: newRecord.name,
            description: newRecord.description,
            frequency: newRecord.frequency,
            targetCount: newRecord.target_count,
            currentStreak: newRecord.current_streak,
            longestStreak: newRecord.longest_streak,
            updatedAt: newRecord.updated_at,
          };
          localStorage.setItem('habits', JSON.stringify(currentHabits));
          toast.success('Hábito atualizado');
        }
        break;
        
      case 'DELETE':
        const filteredHabits = currentHabits.filter((habit: any) => habit.id !== oldRecord.id);
        localStorage.setItem('habits', JSON.stringify(filteredHabits));
        toast.success('Hábito removido');
        break;
    }
  }, []);

  // Configurar sincronização periódica
  const setupPeriodicSync = useCallback(() => {
    if (!enabled) return;

    // Limpar timeout anterior se existir
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Configurar novo timeout
    syncTimeoutRef.current = setTimeout(() => {
      syncData();
      setupPeriodicSync(); // Recursivo para continuar sincronizando
    }, syncInterval);
  }, [enabled, syncInterval, syncData]);

  // Efeito para inicializar sincronização
  useEffect(() => {
    if (!session?.user?.id || !enabled) return;

    // Sincronização inicial
    syncData();
    
    // Configurar sincronização em tempo real
    setupRealtimeSync();
    
    // Configurar sincronização periódica
    setupPeriodicSync();

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [session?.user?.id, enabled, syncData, setupRealtimeSync, setupPeriodicSync]);

  // Função para forçar sincronização manual
  const forceSync = useCallback(() => {
    syncData();
  }, [syncData]);

  // Função para pausar/resumir sincronização
  const toggleSync = useCallback((pause: boolean) => {
    if (pause) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    } else {
      setupRealtimeSync();
      setupPeriodicSync();
    }
  }, [setupRealtimeSync, setupPeriodicSync]);

  return {
    forceSync,
    toggleSync,
    isConnected: !!subscriptionRef.current,
  };
}
