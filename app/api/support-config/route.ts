import { NextResponse } from 'next/server';
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

    // Se não existe, retornar valores padrão
    return defaultSupportConfig;
  } catch (error) {
    console.error('Erro ao buscar configuração de suporte:', error);
    return defaultSupportConfig;
  }
}

export async function GET() {
  try {
    const config = await getSupportConfigFromDB();
    
    // Adicionar headers para evitar cache
    const response = NextResponse.json(config);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Erro no GET /api/support-config:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
