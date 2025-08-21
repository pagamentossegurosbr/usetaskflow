import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsFixed } from '@/lib/auth-fixed';
import { prisma } from '@/lib/prisma';

async function getSupportConfigFromDB() {
  try {
    const settings = await prisma.$queryRaw`
      SELECT key, value
      FROM settings
      WHERE key IN ('support_email', 'support_phone', 'support_hours')
    `;
    
    const config: any = {};
    settings.forEach((setting: any) => {
      config[setting.key] = setting.value;
    });
    
    return {
      email: config.support_email || 'suporte@taskflow.com',
      phone: config.support_phone || '(11) 99999-9999',
      hours: config.support_hours || 'Segunda a Sexta, 9h às 18h'
    };
  } catch (error) {
    console.error('Erro ao buscar configuração de suporte:', error);
    return {
      email: 'suporte@taskflow.com',
      phone: '(11) 99999-9999',
      hours: 'Segunda a Sexta, 9h às 18h'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptionsFixed);
    
    // Configuração de suporte é pública, não precisa de autenticação
    const config = await getSupportConfigFromDB();
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração de suporte:', error);
    return NextResponse.json({
      email: 'suporte@taskflow.com',
      phone: '(11) 99999-9999',
      hours: 'Segunda a Sexta, 9h às 18h'
    });
  }
}
