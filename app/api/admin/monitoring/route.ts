import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar status do banco de dados local (Prisma)
    let dbStatus = 'offline';
    let dbResponseTime = 0;
    
    try {
      const startTime = Date.now();
      await prisma.user.count();
      const endTime = Date.now();
      dbResponseTime = endTime - startTime;
      dbStatus = 'online';
    } catch (error) {
      console.error('Erro ao conectar com banco local:', error);
      dbStatus = 'error';
    }

    // Verificar status do Supabase
    let supabaseStatus = 'offline';
    let supabaseResponseTime = 0;
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const startTime = Date.now();
        await supabase.from('users').select('count').limit(1);
        const endTime = Date.now();
        supabaseResponseTime = endTime - startTime;
        supabaseStatus = 'online';
      } catch (error) {
        console.error('Erro ao conectar com Supabase:', error);
        supabaseStatus = 'error';
      }
    }

    // Obter estatísticas de usuários (apenas da tabela users que existe)
    const totalUsers = await prisma.user.count();
    const activeUsers = Math.floor(totalUsers * 0.7); // Mock - 70% dos usuários ativos

    // Dados mock para tarefas (tabela task não existe no schema ultra-minimal)
    const totalTasks = 0;
    const completedTasks = 0;

    // Obter estatísticas de sincronização (simuladas por enquanto)
    const syncStats = {
      totalSyncs: Math.floor(Math.random() * 1000) + 500,
      successfulSyncs: Math.floor(Math.random() * 950) + 450,
      failedSyncs: Math.floor(Math.random() * 50) + 5,
      lastSyncTime: new Date().toISOString(),
      averageSyncTime: Math.floor(Math.random() * 200) + 100
    };

    // Calcular uso de armazenamento (simulado)
    const storageUsage = Math.random() * 20 + 10; // 10-30%

    // Verificar mudanças pendentes (simulado)
    const pendingChanges = Math.floor(Math.random() * 10);

    // Status geral do sistema
    const systemStatus = {
      overall: dbStatus === 'online' && supabaseStatus === 'online' ? 'healthy' : 'degraded',
      database: dbStatus,
      supabase: supabaseStatus,
      sync: supabaseStatus === 'online' ? 'active' : 'inactive'
    };

    // Alertas do sistema
    const alerts = [];
    
    if (dbStatus === 'offline' || dbStatus === 'error') {
      alerts.push({
        type: 'error',
        title: 'Banco de dados offline',
        message: 'Problemas na conexão com o banco de dados local',
        severity: 'high'
      });
    }
    
    if (supabaseStatus === 'offline' || supabaseStatus === 'error') {
      alerts.push({
        type: 'warning',
        title: 'Supabase offline',
        message: 'Problemas na conexão com o Supabase',
        severity: 'medium'
      });
    }
    
    if (pendingChanges > 5) {
      alerts.push({
        type: 'info',
        title: 'Mudanças pendentes',
        message: `${pendingChanges} mudanças aguardando sincronização`,
        severity: 'low'
      });
    }
    
    if (storageUsage > 80) {
      alerts.push({
        type: 'warning',
        title: 'Armazenamento alto',
        message: `${storageUsage.toFixed(1)}% do armazenamento utilizado`,
        severity: 'medium'
      });
    }

    // Se tudo estiver funcionando, adicionar alerta de sucesso
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        title: 'Sistema funcionando normalmente',
        message: 'Todos os serviços estão operacionais',
        severity: 'low'
      });
    }

    const monitoringData = {
      timestamp: new Date().toISOString(),
      system: {
        status: systemStatus,
        responseTime: {
          database: dbResponseTime,
          supabase: supabaseResponseTime
        }
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        percentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      },
      sync: {
        stats: syncStats,
        pendingChanges,
        lastSync: new Date().toISOString()
      },
      storage: {
        usage: storageUsage,
        status: storageUsage > 80 ? 'critical' : storageUsage > 60 ? 'warning' : 'normal'
      },
      alerts,
      uptime: {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Últimas 24h
        currentTime: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: monitoringData
    });

  } catch (error) {
    console.error('Erro ao obter dados de monitoramento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, 
      { status: 500 }
    );
  }
}
