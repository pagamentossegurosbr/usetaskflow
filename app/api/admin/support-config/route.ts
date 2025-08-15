import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Interface para a configuração de suporte
interface SupportConfig {
  whatsappNumber: string;
  supportEmail: string;
  supportEnabled: boolean;
  lastModified: number;
}

// Configuração padrão
const defaultSupportConfig: SupportConfig = {
  whatsappNumber: '+55 11 98900-2458',
  supportEmail: 'suporte@taskflow.com',
  supportEnabled: false,
  lastModified: Date.now()
};

// Função para obter configuração do banco de dados
async function getSupportConfigFromDB(): Promise<SupportConfig> {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: 'support_config' }
    });

    if (setting && setting.value) {
      const config = setting.value as SupportConfig;
      return {
        ...defaultSupportConfig,
        ...config,
        lastModified: config.lastModified || Date.now()
      };
    }

    // Se não existe, criar com valores padrão
    const newConfig = { ...defaultSupportConfig };
    await prisma.settings.create({
      data: {
        key: 'support_config',
        value: newConfig
      }
    });

    return newConfig;
  } catch (error) {
    console.error('Erro ao buscar configuração de suporte:', error);
    return defaultSupportConfig;
  }
}

// Função para salvar configuração no banco de dados
async function saveSupportConfigToDB(config: SupportConfig): Promise<SupportConfig> {
  try {
    const updatedConfig = {
      ...config,
      lastModified: Date.now()
    };

    await prisma.settings.upsert({
      where: { key: 'support_config' },
      update: { value: updatedConfig },
      create: {
        key: 'support_config',
        value: updatedConfig
      }
    });

    console.log('Configuração de suporte salva no banco:', updatedConfig);
    return updatedConfig;
  } catch (error) {
    console.error('Erro ao salvar configuração de suporte:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin (OWNER ou MODERATOR)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'OWNER' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const config = await getSupportConfigFromDB();
    console.log('Configuração de suporte retornada:', config);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro no GET /api/admin/support-config:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin (OWNER ou MODERATOR)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role !== 'OWNER' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { whatsappNumber, supportEmail, supportEnabled } = body;

    // Validar dados
    if (typeof whatsappNumber !== 'string' || typeof supportEmail !== 'string' || typeof supportEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Obter configuração atual
    const currentConfig = await getSupportConfigFromDB();
    
    // Atualizar configuração
    const updatedConfig: SupportConfig = {
      ...currentConfig,
      whatsappNumber,
      supportEmail,
      supportEnabled
    };

    // Salvar no banco de dados
    const savedConfig = await saveSupportConfigToDB(updatedConfig);
    
    console.log('Configuração de suporte atualizada:', savedConfig);
    
    return NextResponse.json(savedConfig);
  } catch (error) {
    console.error('Erro no PUT /api/admin/support-config:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
