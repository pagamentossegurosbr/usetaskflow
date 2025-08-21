import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { localStorageManager } from '@/lib/localStorage';

interface AutoSyncOptions {
  enabled?: boolean;
  syncInterval?: number; // em milissegundos
  showNotifications?: boolean;
  onSyncStart?: () => void;
  onSyncComplete?: (stats: any) => void;
  onSyncError?: (error: any) => void;
}

export function useAutoSync(options: AutoSyncOptions = {}) {
  const {
    enabled = true,
    syncInterval = 30000, // 30 segundos
    showNotifications = false,
    onSyncStart,
    onSyncComplete,
    onSyncError
  } = options;

  const { data: session, status } = useSession();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);
  const lastSyncRef = useRef<Date | null>(null);

  // Garantir que os callbacks sejam sempre definidos
  const safeOnSyncStart = useMemo(() => onSyncStart || (() => {}), [onSyncStart]);
  const safeOnSyncComplete = useMemo(() => onSyncComplete || (() => {}), [onSyncComplete]);
  const safeOnSyncError = useMemo(() => onSyncError || (() => {}), [onSyncError]);

  // Função de sincronização principal
  const syncData = useCallback(async () => {
    // Verificar se a sessão está disponível
    if (status === 'loading' || !session?.user?.id || isSyncingRef.current) {
      return;
    }

    // Verificar se há mudanças pendentes antes de sincronizar
    const pendingChanges = localStorageManager.getPendingChanges();
    const hasLocalData = localStorageManager.hasLocalData();
    
    // Se não há mudanças pendentes e não há dados locais, não sincronizar
    if (pendingChanges.length === 0 && !hasLocalData) {
      return;
    }

    // Verificar se já sincronizamos recentemente (evitar sincronizações excessivas)
    const lastSync = localStorageManager.getLastSync();
    if (lastSync && Date.now() - lastSync < 5000) { // 5 segundos de cooldown
      return;
    }

    isSyncingRef.current = true;
    safeOnSyncStart();

    try {
      if (pendingChanges.length > 0) {
        console.log(`🔄 Sincronizando ${pendingChanges.length} mudanças pendentes`);
      }

      const response = await fetch('/api/sync/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        lastSyncRef.current = new Date();
        localStorageManager.updateLastSync();
        
        // Limpar mudanças pendentes após sincronização bem-sucedida
        if (pendingChanges.length > 0) {
          localStorageManager.clearPendingChanges();
          console.log('✅ Mudanças pendentes sincronizadas e limpas');
        }
        
        if (data.stats && (data.stats.tasks > 0 || data.stats.activityLogs > 0 || data.stats.user > 0)) {
          if (showNotifications) {
            toast.success('Sincronização automática realizada', {
              description: `Tarefas: ${data.stats.tasks}, Logs: ${data.stats.activityLogs}`
            });
          }
        }
        
        safeOnSyncComplete(data.stats);
      } else {
        // Se a sincronização falhou, manter as mudanças pendentes
        if (showNotifications) {
          toast.error('Erro na sincronização automática', {
            description: data.error || data.message || 'Falha na sincronização'
          });
        }
        safeOnSyncError(data);
      }
    } catch (error) {
      // Se houve erro de rede, manter as mudanças pendentes
      if (showNotifications) {
        toast.error('Erro na sincronização automática', {
          description: 'Falha na conexão - dados salvos localmente'
        });
      }
      safeOnSyncError(error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [session?.user?.id, status, showNotifications, safeOnSyncStart, safeOnSyncComplete, safeOnSyncError]);

  // Sincronização manual
  const manualSync = useCallback(async () => {
    await syncData();
  }, [syncData]);

  // Configurar sincronização automática
  useEffect(() => {
    if (!enabled || status === 'loading' || !session?.user?.id) {
      return;
    }

    // DESABILITAR TEMPORARIAMENTE A SINCRONIZAÇÃO AUTOMÁTICA
    // para evitar conflitos com as tarefas
    console.log('🔄 Sincronização automática desabilitada temporariamente');
    return;

    const startAutoSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        await syncData();
        startAutoSync(); // Agendar próxima sincronização
      }, syncInterval);
    };

    // Primeira sincronização apenas se houver dados locais ou mudanças pendentes
    const hasLocalData = localStorageManager.hasLocalData();
    const pendingChanges = localStorageManager.getPendingChanges();
    
    if (hasLocalData || pendingChanges.length > 0) {
      const initialSyncTimeout = setTimeout(() => {
        syncData();
        startAutoSync();
      }, 2000);
      
      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        clearTimeout(initialSyncTimeout);
      };
    } else {
      // Se não há dados locais, agendar sincronização com intervalo maior
      syncTimeoutRef.current = setTimeout(() => {
        syncData();
        startAutoSync();
      }, 60000); // 1 minuto para primeira sincronização
      
      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
      };
    }
  }, [enabled, session?.user?.id, status, syncInterval, syncData]);

  // Sincronização em eventos específicos
  useEffect(() => {
    if (!enabled || status === 'loading' || !session?.user?.id) {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && lastSyncRef.current) {
        // Se a página ficou visível e já sincronizamos antes, sincronizar novamente
        const timeSinceLastSync = Date.now() - lastSyncRef.current.getTime();
        if (timeSinceLastSync > 10000) { // Se passou mais de 10 segundos
          syncData();
        }
      }
    };

    const handleOnline = () => {
      // Sincronizar quando voltar a ficar online
      syncData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, session?.user?.id, status, syncData]);

  // Sempre retornar os mesmos valores, mesmo que a sessão não esteja disponível
  return {
    manualSync,
    isSyncing: isSyncingRef.current,
    lastSync: lastSyncRef.current,
  };
}
