import { NextRequest, NextResponse } from 'next/server';
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
    // Verificar se o Supabase está configurado
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase não configurado',
        note: 'Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    // Dados de teste
    const testUserId = 'test-user-cuid-123';
    const testUserIdUuid = cuidToUuid(testUserId);
    
    const testTasks = [
      {
        id: 'task-1-cuid',
        title: 'Tarefa de Teste 1',
        text: 'Esta é uma tarefa de teste criada automaticamente',
        completed: false,
        priority: true,
        scheduledFor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null
      },
      {
        id: 'task-2-cuid',
        title: 'Tarefa de Teste 2',
        text: 'Segunda tarefa de teste para sincronização',
        completed: true,
        priority: false,
        scheduledFor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date()
      }
    ];

    console.log(`🔄 Testando sincronização - Usuário: ${testUserId} -> ${testUserIdUuid}`);
    console.log(`📊 Tarefas de teste: ${testTasks.length}`);

    // Sincronizar tarefas de teste
    let tasksSynced = 0;
    
    // Primeiro, deletar tarefas existentes do usuário no Supabase
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', testUserIdUuid);

    if (deleteError) {
      console.error('Erro ao deletar tarefas antigas:', deleteError);
    } else {
      // Inserir novas tarefas
      const tasksToInsert = testTasks.map(task => ({
        id: cuidToUuid(task.id),
        user_id: testUserIdUuid,
        title: task.title,
        text: task.text,
        completed: task.completed,
        priority: task.priority,
        scheduled_for: task.scheduledFor,
        created_at: task.createdAt.toISOString(),
        updated_at: task.updatedAt.toISOString(),
        completed_at: task.completedAt?.toISOString() || null
      }));

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (insertError) {
        console.error('Erro ao inserir tarefas:', insertError);
        return NextResponse.json({
          success: false,
          message: 'Erro ao inserir tarefas no Supabase',
          error: insertError
        });
      } else {
        tasksSynced = testTasks.length;
        console.log(`✅ ${tasksSynced} tarefas sincronizadas`);
      }
    }

    // Sincronizar dados do usuário de teste
    const testUser = {
      name: 'Usuário de Teste',
      email: 'test@example.com',
      level: 1,
      xp: 100,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
      maxLevel: 3,
      isActive: true,
      isBanned: false,
      updatedAt: new Date()
    };

    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: testUserIdUuid,
        name: testUser.name,
        email: testUser.email,
        level: testUser.level,
        xp: testUser.xp,
        subscription_plan: testUser.subscriptionPlan,
        subscription_status: testUser.subscriptionStatus,
        max_level: testUser.maxLevel,
        is_active: testUser.isActive,
        is_banned: testUser.isBanned,
        updated_at: testUser.updatedAt.toISOString()
      });

    if (userError) {
      console.error('Erro ao sincronizar usuário:', userError);
    } else {
      console.log('✅ Dados do usuário sincronizados');
    }

    console.log(`🎉 Teste de sincronização concluído - Tarefas: ${tasksSynced}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Teste de sincronização realizado com sucesso',
      timestamp: new Date().toISOString(),
      stats: {
        tasks: tasksSynced,
        user: 1
      },
      testData: {
        userId: testUserId,
        userIdUuid: testUserIdUuid,
        tasksCreated: testTasks.length
      }
    });

  } catch (error) {
    console.error('Erro no teste de sincronização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
