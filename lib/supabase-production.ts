import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ========================================
// CONFIGURAÇÃO DO SUPABASE PARA PRODUÇÃO
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
      throw new Error(`Missing required environment variable: ${var_name}`);
    }
  }
};

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Configurações otimizadas para produção
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'notch-todo-list-v3',
    },
  },
};

// Cliente do Supabase para uso no servidor (com service role)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  ...supabaseConfig,
  auth: {
    ...supabaseConfig.auth,
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cliente do Supabase para uso no cliente (browser)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);
};

// Cliente do Supabase para uso no servidor (SSR)
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    ...supabaseConfig,
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
          // Ignorar se chamado de um Server Component
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

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// ========================================
// CONFIGURAÇÕES DE SINCRONIZAÇÃO
// ========================================

export const SYNC_CONFIG = {
  batchSize: 50, // Reduzido para produção
  retryAttempts: 5, // Aumentado para produção
  retryDelay: 2000, // 2 segundos
  syncInterval: 60000, // 1 minuto
  maxConcurrentRequests: 3,
  timeout: 30000, // 30 segundos
};

// ========================================
// FUNÇÕES DE SINCRONIZAÇÃO OTIMIZADAS
// ========================================

// Função para sincronizar dados com retry e timeout
export async function syncDataToSupabase(data: SyncData): Promise<boolean> {
  const maxRetries = SYNC_CONFIG.retryAttempts;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SYNC_CONFIG.timeout);

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
        })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error(`Erro na tentativa ${attempt + 1}:`, error);
        attempt++;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.retryDelay * attempt));
        }
        continue;
      }

      return true;
    } catch (error) {
      console.error(`Erro na tentativa ${attempt + 1}:`, error);
      attempt++;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.retryDelay * attempt));
      }
    }
  }

  return false;
}

// Função para sincronizar usuário com validação
export async function syncUserWithSupabase(userId: string, userData: any): Promise<boolean> {
  try {
    // Validação dos dados
    if (!userId || !userData?.email) {
      throw new Error('Dados do usuário inválidos');
    }

    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userData.email,
        name: userData.name || null,
        image: userData.image || null,
        updated_at: new Date().toISOString(),
        last_sync: new Date().toISOString(),
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

// Função para sincronizar tarefas em lotes
export async function syncTasksToSupabase(userId: string, tasks: any[]): Promise<boolean> {
  try {
    // Dividir em lotes para evitar timeouts
    const batches = [];
    for (let i = 0; i < tasks.length; i += SYNC_CONFIG.batchSize) {
      batches.push(tasks.slice(i, i + SYNC_CONFIG.batchSize));
    }

    // Primeiro, deletar todas as tarefas do usuário
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar tarefas antigas:', deleteError);
      return false;
    }

    // Depois, inserir as novas tarefas em lotes
    for (const batch of batches) {
      if (batch.length > 0) {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(batch.map(task => ({
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
          console.error('Erro ao inserir lote de tarefas:', insertError);
          return false;
        }

        // Pequena pausa entre lotes para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar tarefas:', error);
    return false;
  }
}

// Função para sincronizar sessões Pomodoro
export async function syncPomodoroSessionsToSupabase(userId: string, sessions: any[]): Promise<boolean> {
  try {
    const batches = [];
    for (let i = 0; i < sessions.length; i += SYNC_CONFIG.batchSize) {
      batches.push(sessions.slice(i, i + SYNC_CONFIG.batchSize));
    }

    // Deletar sessões antigas
    const { error: deleteError } = await supabase
      .from('pomodoro_sessions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar sessões antigas:', deleteError);
      return false;
    }

    // Inserir novas sessões em lotes
    for (const batch of batches) {
      if (batch.length > 0) {
        const { error: insertError } = await supabase
          .from('pomodoro_sessions')
          .insert(batch.map(session => ({
            id: session.id,
            user_id: userId,
            duration: session.duration,
            completed: session.completed,
            started_at: session.startedAt,
            ended_at: session.endedAt,
            created_at: session.createdAt,
          })));

        if (insertError) {
          console.error('Erro ao inserir lote de sessões:', insertError);
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar sessões Pomodoro:', error);
    return false;
  }
}

// Função para sincronizar hábitos
export async function syncHabitsToSupabase(userId: string, habits: any[]): Promise<boolean> {
  try {
    const batches = [];
    for (let i = 0; i < habits.length; i += SYNC_CONFIG.batchSize) {
      batches.push(habits.slice(i, i + SYNC_CONFIG.batchSize));
    }

    // Deletar hábitos antigos
    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar hábitos antigos:', deleteError);
      return false;
    }

    // Inserir novos hábitos em lotes
    for (const batch of batches) {
      if (batch.length > 0) {
        const { error: insertError } = await supabase
          .from('habits')
          .insert(batch.map(habit => ({
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
          console.error('Erro ao inserir lote de hábitos:', insertError);
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar hábitos:', error);
    return false;
  }
}

// Função para sincronizar registros de hábitos
export async function syncHabitLogsToSupabase(userId: string, habitLogs: any[]): Promise<boolean> {
  try {
    const batches = [];
    for (let i = 0; i < habitLogs.length; i += SYNC_CONFIG.batchSize) {
      batches.push(habitLogs.slice(i, i + SYNC_CONFIG.batchSize));
    }

    // Deletar registros antigos
    const { error: deleteError } = await supabase
      .from('habit_logs')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Erro ao deletar registros antigos:', deleteError);
      return false;
    }

    // Inserir novos registros em lotes
    for (const batch of batches) {
      if (batch.length > 0) {
        const { error: insertError } = await supabase
          .from('habit_logs')
          .insert(batch.map(log => ({
            id: log.id,
            user_id: userId,
            habit_id: log.habitId,
            completed_at: log.completedAt,
            created_at: log.createdAt,
          })));

        if (insertError) {
          console.error('Erro ao inserir lote de registros:', insertError);
          return false;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao sincronizar registros de hábitos:', error);
    return false;
  }
}

// Função para sincronizar estatísticas do usuário
export async function syncUserStatsToSupabase(userId: string, stats: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_xp: stats.totalXP || 0,
        current_level: stats.currentLevel || 1,
        max_level: stats.maxLevel || 10,
        tasks_completed: stats.tasksCompleted || 0,
        pomodoro_sessions: stats.pomodoroSessions || 0,
        total_focus_time: stats.totalFocusTime || 0,
        updated_at: new Date().toISOString(),
        last_sync: new Date().toISOString(),
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

// ========================================
// SINCRONIZAÇÃO COMPLETA OTIMIZADA
// ========================================

export async function syncAllDataToSupabase(userId: string, data: {
  tasks?: any[];
  pomodoroSessions?: any[];
  habits?: any[];
  habitLogs?: any[];
  stats?: any;
}): Promise<boolean> {
  try {
    // Limitar requisições concorrentes
    const promises = [];
    const maxConcurrent = SYNC_CONFIG.maxConcurrentRequests;

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

    // Executar em lotes para evitar sobrecarga
    const results = [];
    for (let i = 0; i < promises.length; i += maxConcurrent) {
      const batch = promises.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results.every(result => result);
  } catch (error) {
    console.error('Erro ao sincronizar todos os dados:', error);
    return false;
  }
}

// ========================================
// SUBSCRIÇÃO EM TEMPO REAL OTIMIZADA
// ========================================

export function subscribeToRealtimeChanges(userId: string, callback: (payload: any) => void) {
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
    .subscribe((status) => {
      console.log('Status da subscription:', status);
    });

  return subscription;
}

// ========================================
// FUNÇÕES DE BACKUP E RECUPERAÇÃO
// ========================================

export async function createBackup(userId: string): Promise<any> {
  try {
    const [tasksResult, pomodoroResult, habitsResult, habitLogsResult, statsResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('pomodoro_sessions').select('*').eq('user_id', userId),
      supabase.from('habits').select('*').eq('user_id', userId),
      supabase.from('habit_logs').select('*').eq('user_id', userId),
      supabase.from('user_stats').select('*').eq('user_id', userId).single(),
    ]);

    return {
      userId,
      timestamp: new Date().toISOString(),
      data: {
        tasks: tasksResult.data || [],
        pomodoroSessions: pomodoroResult.data || [],
        habits: habitsResult.data || [],
        habitLogs: habitLogsResult.data || [],
        stats: statsResult.data || null,
      },
    };
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return null;
  }
}

// ========================================
// FUNÇÕES DE MONITORAMENTO
// ========================================

export async function logSyncEvent(userId: string, event: string, success: boolean, details?: any) {
  try {
    await supabase
      .from('sync_events')
      .insert({
        user_id: userId,
        event,
        success,
        details,
        timestamp: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Erro ao logar evento de sincronização:', error);
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Validar variáveis de ambiente na inicialização
if (typeof window === 'undefined') {
  validateEnvVars();
}
