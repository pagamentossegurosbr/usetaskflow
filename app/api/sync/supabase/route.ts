import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente do Supabase para uso no servidor
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Função para converter CUID para UUID válido
function cuidToUuid(cuid: string): string {
  const hash = createHash('sha256').update(cuid).digest('hex');
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
  return uuid;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o Supabase está configurado
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase não configurado',
        note: 'Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    // Converter ID do usuário para UUID
    const userIdUuid = cuidToUuid(session.user.id);

    // Buscar dados do Prisma local
    const [tasks, activityLogs] = await Promise.all([
      prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.activityLog.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    console.log(`🔄 Iniciando sincronização inteligente - Usuário: ${session.user.id} -> ${userIdUuid}`);
    console.log(`📊 Tarefas: ${tasks.length}, Logs: ${activityLogs.length}`);

    // Sincronizar tarefas de forma inteligente (sem duplicar)
    let tasksSynced = 0;
    if (tasks.length > 0) {
      // Buscar tarefas existentes no Supabase para este usuário
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id, updated_at')
        .eq('user_id', userIdUuid);

      const existingTaskIds = new Set(existingTasks?.map(t => t.id) || []);
      const existingTaskTimestamps = new Map(
        existingTasks?.map(t => [t.id, new Date(t.updated_at)]) || []
      );

      // Filtrar apenas tarefas que precisam ser sincronizadas
      const tasksToSync = tasks.filter(task => {
        const taskUuid = cuidToUuid(task.id);
        const existingTimestamp = existingTaskTimestamps.get(taskUuid);
        
        // Sincronizar se:
        // 1. Tarefa não existe no Supabase
        // 2. Tarefa foi atualizada mais recentemente no Prisma
        return !existingTimestamp || task.updatedAt > existingTimestamp;
      });

      console.log(`📝 Tarefas para sincronizar: ${tasksToSync.length} de ${tasks.length}`);

      if (tasksToSync.length > 0) {
        // Usar upsert para inserir/atualizar tarefas
        const tasksToUpsert = tasksToSync.map(task => ({
          id: cuidToUuid(task.id),
          user_id: userIdUuid,
          title: task.title,
          text: task.text,
          completed: task.completed,
          priority: task.priority,
          scheduled_for: task.scheduledFor,
          created_at: task.createdAt.toISOString(),
          updated_at: task.updatedAt.toISOString(),
          completed_at: task.completedAt?.toISOString() || null
        }));

        const { error: upsertError } = await supabase
          .from('tasks')
          .upsert(tasksToUpsert, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error('Erro ao sincronizar tarefas:', upsertError);
        } else {
          tasksSynced = tasksToSync.length;
          console.log(`✅ ${tasksSynced} tarefas sincronizadas (upsert)`);
        }
      } else {
        console.log('✅ Todas as tarefas já estão sincronizadas');
      }
    }

    // Sincronizar logs de atividade de forma inteligente
    let logsSynced = 0;
    if (activityLogs.length > 0) {
      // Buscar logs existentes no Supabase para este usuário
      const { data: existingLogs } = await supabase
        .from('activity_logs')
        .select('id, created_at')
        .eq('user_id', userIdUuid);

      const existingLogIds = new Set(existingLogs?.map(l => l.id) || []);

      // Filtrar apenas logs que não existem no Supabase
      const logsToSync = activityLogs.filter(log => {
        const logUuid = cuidToUuid(log.id);
        return !existingLogIds.has(logUuid);
      });

      console.log(`📝 Logs para sincronizar: ${logsToSync.length} de ${activityLogs.length}`);

      if (logsToSync.length > 0) {
        const logsToInsert = logsToSync.map(log => ({
          id: cuidToUuid(log.id),
          user_id: userIdUuid,
          action: log.action,
          details: log.details,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          created_at: log.createdAt.toISOString()
        }));

        const { error: insertError } = await supabase
          .from('activity_logs')
          .insert(logsToInsert);

        if (insertError) {
          console.error('Erro ao inserir logs:', insertError);
        } else {
          logsSynced = logsToSync.length;
          console.log(`✅ ${logsSynced} logs sincronizados`);
        }
      } else {
        console.log('✅ Todos os logs já estão sincronizados');
      }
    }

    // Sincronizar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        level: true,
        xp: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        maxLevel: true,
        isActive: true,
        isBanned: true,
        updatedAt: true
      }
    });

    let userSynced = 0;
    if (user) {
      // Verificar se o usuário existe no Supabase por email
      const { data: existingUserByEmail } = await supabase
        .from('users')
        .select('id, updated_at')
        .eq('email', user.email)
        .single();

      // Verificar se o usuário existe por ID
      const { data: existingUserById } = await supabase
        .from('users')
        .select('id, updated_at')
        .eq('id', userIdUuid)
        .single();

      let needsUpdate = false;
      let shouldUpsert = true;

      if (existingUserByEmail && existingUserById) {
        // Usuário existe tanto por email quanto por ID
        if (existingUserByEmail.id === existingUserById.id) {
          // Mesmo usuário, verificar se precisa atualizar
          needsUpdate = new Date(user.updatedAt) > new Date(existingUserByEmail.updated_at);
        } else {
          // IDs diferentes para o mesmo email - conflito
          console.error('Conflito de usuário: email existe com ID diferente');
          shouldUpsert = false;
        }
      } else if (existingUserByEmail && !existingUserById) {
        // Email existe mas ID não - atualizar o registro existente
        needsUpdate = new Date(user.updatedAt) > new Date(existingUserByEmail.updated_at);
        if (needsUpdate) {
          // Atualizar o registro existente com o novo ID
          const { error: updateError } = await supabase
            .from('users')
            .update({
              id: userIdUuid,
              name: user.name,
              level: user.level,
              xp: user.xp,
              subscription_plan: user.subscriptionPlan,
              subscription_status: user.subscriptionStatus,
              max_level: user.maxLevel,
              is_active: user.isActive,
              is_banned: user.isBanned,
              updated_at: user.updatedAt.toISOString()
            })
            .eq('email', user.email);

          if (updateError) {
            console.error('Erro ao atualizar usuário existente:', updateError);
          } else {
            userSynced = 1;
            console.log('✅ Dados do usuário atualizados (email existente)');
          }
          shouldUpsert = false;
        }
      } else if (!existingUserByEmail && existingUserById) {
        // ID existe mas email não - verificar se precisa atualizar
        needsUpdate = new Date(user.updatedAt) > new Date(existingUserById.updated_at);
      } else {
        // Usuário não existe - pode inserir
        needsUpdate = true;
      }

      if (shouldUpsert && needsUpdate) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: userIdUuid,
            name: user.name,
            email: user.email,
            level: user.level,
            xp: user.xp,
            subscription_plan: user.subscriptionPlan,
            subscription_status: user.subscriptionStatus,
            max_level: user.maxLevel,
            is_active: user.isActive,
            is_banned: user.isBanned,
            updated_at: user.updatedAt.toISOString()
          }, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (userError) {
          console.error('Erro ao sincronizar usuário:', userError);
        } else {
          userSynced = 1;
          console.log('✅ Dados do usuário sincronizados');
        }
      } else if (!needsUpdate) {
        console.log('✅ Dados do usuário já estão sincronizados');
      }
    }

    console.log(`🎉 Sincronização inteligente concluída - Tarefas: ${tasksSynced}, Logs: ${logsSynced}, Usuário: ${userSynced}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização inteligente realizada com sucesso',
      timestamp: new Date().toISOString(),
      stats: {
        tasks: tasksSynced,
        activityLogs: logsSynced,
        user: userSynced,
        totalTasks: tasks.length,
        totalLogs: activityLogs.length
      }
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o Supabase está configurado
    if (!supabase) {
      return NextResponse.json({
        success: false,
        backup: null,
        timestamp: new Date().toISOString(),
        note: 'Supabase não configurado'
      });
    }

    // Converter ID do usuário para UUID
    const userIdUuid = cuidToUuid(session.user.id);

    // Criar backup dos dados do Supabase
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userIdUuid);

    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userIdUuid);

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userIdUuid)
      .single();

    const backup = {
      userId: session.user.id,
      userIdUuid: userIdUuid,
      timestamp: new Date().toISOString(),
      data: {
        tasks: tasks || [],
        activityLogs: activityLogs || [],
        user: user || null,
      },
    };

    return NextResponse.json({
      success: true,
      backup,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
