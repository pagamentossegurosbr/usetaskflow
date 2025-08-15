'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface SupportConfig {
  whatsappNumber: string;
  supportEmail: string;
  supportEnabled: boolean;
  lastModified?: number;
}

export function useSupportConfig() {
  const [config, setConfig] = useState<SupportConfig>({
    whatsappNumber: '+55 11 98900-2458',
    supportEmail: 'suporte@taskflow.com',
    supportEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSupportConfig = async (force = false) => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/support-config?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar configuração de suporte');
      }

      const data: SupportConfig = await response.json();
      
      // Verificar se houve mudanças reais
      const hasChanges = force || 
        data.whatsappNumber !== config.whatsappNumber ||
        data.supportEmail !== config.supportEmail ||
        data.supportEnabled !== config.supportEnabled ||
        (data.lastModified && data.lastModified !== config.lastModified);

      if (hasChanges) {
        // Log reduzido para melhorar performance
        if (process.env.NODE_ENV === 'development') {
          console.log('useSupportConfig: Mudanças detectadas');
        }

        setConfig(data);
        setLastUpdate(Date.now());

        // Mostrar toast apenas para atualizações automáticas (não no carregamento inicial)
        if (!force && lastUpdate > 0) {
          toast.success('Configurações de suporte atualizadas automaticamente');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configuração de suporte:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregamento inicial
    fetchSupportConfig(true);

    // Configurar polling a cada 5 minutos (reduzido de 30 segundos)
    pollingIntervalRef.current = setInterval(() => {
      fetchSupportConfig();
    }, 300000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return { config, loading, lastUpdate };
}
