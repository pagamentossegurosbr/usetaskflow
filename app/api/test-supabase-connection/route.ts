import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: 'Variáveis de ambiente do Supabase não configuradas',
        missing: {
          url: !supabaseUrl,
          serviceKey: !supabaseServiceKey
        }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Testar conexão fazendo uma consulta simples
    const { data, error } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao conectar com Supabase',
        error: error.message,
        code: error.code
      });
    }

    // Verificar se as tabelas existem
    const { data: tasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    const { data: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { data: logsCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso',
      tables: {
        tasks: tasksCount?.length || 0,
        users: usersCount?.length || 0,
        activity_logs: logsCount?.length || 0
      },
      config: {
        url: supabaseUrl.substring(0, 20) + '...',
        hasServiceKey: !!supabaseServiceKey
      }
    });

  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno ao testar conexão',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
