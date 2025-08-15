import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ========================================
// CONFIGURAÇÃO DO SUPABASE COM VALIDAÇÃO
// ========================================

// Validação das variáveis de ambiente
const validateEnvVars = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const var_name of required) {
    if (!process.env[var_name]) {
      console.warn(`⚠️ Variável de ambiente ${var_name} não encontrada`);
    }
  }
};

// Configuração do Supabase com fallbacks para desenvolvimento
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';

// Verificar se estamos em desenvolvimento e se as variáveis estão configuradas
const isDevelopment = process.env.NODE_ENV === 'development';
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && 
                      supabaseAnonKey !== 'placeholder_anon_key' && 
                      supabaseServiceKey !== 'placeholder_service_key';

if (isDevelopment && !hasValidConfig) {
  console.warn('⚠️ Configuração do Supabase não encontrada. Algumas funcionalidades podem não funcionar.');
  console.warn('📝 Configure as variáveis de ambiente em .env.local');
}

// Cliente do Supabase para uso no servidor
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cliente do Supabase para uso no cliente (browser)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Cliente do Supabase para uso no servidor (SSR)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface SyncData {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
  userId: string;
}

// ========================================
// CONFIGURAÇÕES DE SINCRONIZAÇÃO
// ========================================

export const SYNC_CONFIG = {
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo
  syncInterval: 30000, // 30 segundos
};

// ========================================
// FUNÇÕES DE SINCRONIZAÇÃO COM VALIDAÇÃO
// ========================================

// Função para sincronizar dados com validação
export async function syncDataToSupabase(data: SyncData): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização');
    return false;
  }

  try {
    const { error } = await supabase
      .from('sync_log')
      .insert({
        id: data.id,
        table_name: data.table,
        action: data.action,
        data: data.data,
        user_id: data.userId,
        timestamp: data.timestamp,
        synced: true,
      });

    if (error) {
      console.error('Erro ao sincronizar dados:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
    return false;
  }
}

// Funções para autenticação híbrida com validação
export async function syncUserWithSupabase(userId: string, userData: any): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de usuário');
    return false;
  }

  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userData.email,
        name: userData.name,
        image: userData.image,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    return false;
  }
}

// Funções para sincronização de tarefas com validação
export async function syncTasksToSupabase(userId: string, tasks: any[]): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de tarefas');
    return false;
  }

  try {
    // Primeiro, deletar todas as tarefas do usuário no Supabase
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar tarefas antigas:', deleteError);
      return false;
    }

    // Depois, inserir as novas tarefas
    if (tasks.length > 0) {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasks.map(task => ({
          id: task.id,
          user_id: userId,
          title: task.title,
          description: task.description,
          completed: task.completed,
          priority: task.priority,
          due_date: task.dueDate,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        })));

      if (insertError) {
        console.error('Erro ao inserir tarefas:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
    return false;
  }
}

// Funções para sincronização de sessões Pomodoro com validação
export async function syncPomodoroSessionsToSupabase(userId: string, sessions: any[]): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de sessões');
    return false;
  }

  try {
    // Primeiro, deletar todas as sessões do usuário no Supabase
    const { error: deleteError } = await supabase
      .from('pomodoro_sessions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar sessões antigas:', deleteError);
      return false;
    }

    // Depois, inserir as novas sessões
    if (sessions.length > 0) {
      const { error: insertError } = await supabase
        .from('pomodoro_sessions')
        .insert(sessions.map(session => ({
          id: session.id,
          user_id: userId,
          duration: session.duration,
          completed: session.completed,
          started_at: session.startedAt,
          ended_at: session.endedAt,
          created_at: session.createdAt,
        })));

      if (insertError) {
        console.error('Erro ao inserir sessões:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar sessões Pomodoro:', error);
    return false;
  }
}

// Funções para sincronização de hábitos com validação
export async function syncHabitsToSupabase(userId: string, habits: any[]): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de hábitos');
    return false;
  }

  try {
    // Primeiro, deletar todos os hábitos do usuário no Supabase
    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar hábitos antigos:', deleteError);
      return false;
    }

    // Depois, inserir os novos hábitos
    if (habits.length > 0) {
      const { error: insertError } = await supabase
        .from('habits')
        .insert(habits.map(habit => ({
          id: habit.id,
          user_id: userId,
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          target_count: habit.targetCount,
          current_streak: habit.currentStreak,
          longest_streak: habit.longestStreak,
          created_at: habit.createdAt,
          updated_at: habit.updatedAt,
        })));

      if (insertError) {
        console.error('Erro ao inserir hábitos:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar hábitos:', error);
    return false;
  }
}

// Funções para sincronização de registros de hábitos com validação
export async function syncHabitLogsToSupabase(userId: string, habitLogs: any[]): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de registros');
    return false;
  }

  try {
    // Primeiro, deletar todos os registros do usuário no Supabase
    const { error: deleteError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar registros antigos:', deleteError);
      return false;
    }

    // Depois, inserir os novos registros
    if (habitLogs.length > 0) {
      const { error: insertError } = await supabase
        .from('habit_logs')
        .insert(habitLogs.map(log => ({
          id: log.id,
          user_id: userId,
          habit_id: log.habitId,
          completed_at: log.completedAt,
          created_at: log.createdAt,
        })));

      if (insertError) {
        console.error('Erro ao inserir registros:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar registros de hábitos:', error);
    return false;
  }
}

// Funções para sincronização de XP e níveis com validação
export async function syncUserStatsToSupabase(userId: string, stats: any): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização de estatísticas');
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_xp: stats.totalXP,
        current_level: stats.currentLevel,
        max_level: stats.maxLevel,
        tasks_completed: stats.tasksCompleted,
        pomodoro_sessions: stats.pomodoroSessions,
        total_focus_time: stats.totalFocusTime,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao sincronizar estatísticas:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar estatísticas:', error);
    return false;
  }
}

// Funções para sincronização completa com validação
export async function syncAllDataToSupabase(userId: string, data: {
  tasks?: any[];
  pomodoroSessions?: any[];
  habits?: any[];
  habitLogs?: any[];
  stats?: any;
}): Promise<boolean> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando sincronização completa');
    return false;
  }

  try {
    const promises = [];

    if (data.tasks) {
      promises.push(syncTasksToSupabase(userId, data.tasks));
    }

    if (data.pomodoroSessions) {
      promises.push(syncPomodoroSessionsToSupabase(userId, data.pomodoroSessions));
    }

    if (data.habits) {
      promises.push(syncHabitsToSupabase(userId, data.habits));
    }

    if (data.habitLogs) {
      promises.push(syncHabitLogsToSupabase(userId, data.habitLogs));
    }

    if (data.stats) {
      promises.push(syncUserStatsToSupabase(userId, data.stats));
    }

    const results = await Promise.all(promises);
    return results.every(result => result);
  } catch (error) {
    console.error('Erro ao sincronizar todos os dados:', error);
    return false;
  }
}

// Funções para sincronização em tempo real com validação
export function subscribeToRealtimeChanges(userId: string, callback: (payload: any) => void) {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando subscription em tempo real');
    return null;
  }

  const subscription = supabase
    .channel(`user-${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `user_id=eq.${userId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'pomodoro_sessions',
      filter: `user_id=eq.${userId}`,
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'habits',
      filter: `user_id=eq.${userId}`,
    }, callback)
    .subscribe();

  return subscription;
}

// Utilitários para backup com validação
export async function createBackup(userId: string): Promise<any> {
  if (!hasValidConfig) {
    console.warn('⚠️ Supabase não configurado, pulando backup');
    return null;
  }

  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    const { data: pomodoroSessions } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId);

    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    const { data: habitLogs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId);

    const { data: userStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      userId,
      timestamp: new Date().toISOString(),
      data: {
        tasks: tasks || [],
        pomodoroSessions: pomodoroSessions || [],
        habits: habits || [],
        habitLogs: habitLogs || [],
        stats: userStats || null,
      },
    };
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return null;
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Validar variáveis de ambiente na inicialização
if (typeof window === 'undefined') {
  validateEnvVars();
}
