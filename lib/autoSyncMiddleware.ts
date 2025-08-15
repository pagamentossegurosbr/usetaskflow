import { toast } from 'sonner';
import { localStorageManager } from './localStorage';

interface SyncStats {
  tasks: number;
  activityLogs: number;
  user: number;
}

class AutoSyncMiddleware {
  private static instance: AutoSyncMiddleware;
  private syncQueue: (() => Promise<void>)[] = [];
  private isProcessing = false;
  private lastSyncTime = 0;
  private readonly SYNC_COOLDOWN = 5000; // 5 segundos entre sincronizações

  private constructor() {}

  static getInstance(): AutoSyncMiddleware {
    if (!AutoSyncMiddleware.instance) {
      AutoSyncMiddleware.instance = new AutoSyncMiddleware();
    }
    return AutoSyncMiddleware.instance;
  }

  async triggerSync(operation: string, data?: any): Promise<void> {
    const now = Date.now();
    
    // Evitar sincronizações muito frequentes
    if (now - this.lastSyncTime < this.SYNC_COOLDOWN) {
      console.log(`🔄 Sincronização ignorada (cooldown): ${operation}`);
      return;
    }

    // Verificar se há muitas mudanças pendentes
    const pendingChanges = localStorageManager.getPendingChanges() || [];
    if (pendingChanges.length > 10) {
      console.log('⚠️ Muitas mudanças pendentes, aguardando processamento...');
      return;
    }

    // Adicionar mudança pendente ao localStorage
    localStorageManager.addPendingChange({
      type: operation,
      data,
      timestamp: new Date().toISOString()
    });

    // Adicionar à fila de sincronização
    this.syncQueue.push(async () => {
      try {
        console.log(`🔄 Iniciando sincronização automática após: ${operation}`);
        
        const response = await fetch('/api/sync/supabase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          this.lastSyncTime = Date.now();
          localStorageManager.updateLastSync();
          
          // Limpar mudanças pendentes após sincronização bem-sucedida
          localStorageManager.clearPendingChanges();
          
          if (result.stats && (result.stats.tasks > 0 || result.stats.activityLogs > 0)) {
            console.log(`✅ Sincronização automática concluída:`, result.stats);
          } else {
            console.log(`✅ Sincronização automática concluída (sem mudanças)`);
          }
        } else {
          console.error('❌ Erro na sincronização automática:', result.error || result.message);
          // Manter mudanças pendentes em caso de erro
        }
      } catch (error) {
        console.error('❌ Erro na sincronização automática:', error);
        // Manter mudanças pendentes em caso de erro de rede
      }
    });

    // Processar fila se não estiver processando
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const syncOperation = this.syncQueue.shift();
        if (syncOperation) {
          await syncOperation();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Métodos específicos para diferentes operações
  async onTaskCreated(taskData: any): Promise<void> {
    // Salvar tarefa localmente primeiro
    const currentTasks = localStorageManager.getTasks() || [];
    const updatedTasks = [...currentTasks, taskData];
    localStorageManager.saveTasks(updatedTasks);
    
    await this.triggerSync('task_created', taskData);
  }

  async onTaskUpdated(taskData: any): Promise<void> {
    // Atualizar tarefa localmente primeiro
    const currentTasks = localStorageManager.getTasks() || [];
    const updatedTasks = currentTasks.map(task => 
      task.id === taskData.id ? { ...task, ...taskData } : task
    );
    localStorageManager.saveTasks(updatedTasks);
    
    await this.triggerSync('task_updated', taskData);
  }

  async onTaskDeleted(taskId: string): Promise<void> {
    // Remover tarefa localmente primeiro
    const currentTasks = localStorageManager.getTasks() || [];
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    localStorageManager.saveTasks(updatedTasks);
    
    await this.triggerSync('task_deleted', { id: taskId });
  }

  async onTaskCompleted(taskData: any): Promise<void> {
    // Atualizar tarefa localmente primeiro
    const currentTasks = localStorageManager.getTasks() || [];
    const updatedTasks = currentTasks.map(task => 
      task.id === taskData.id ? { ...task, ...taskData } : task
    );
    localStorageManager.saveTasks(updatedTasks);
    
    await this.triggerSync('task_completed', taskData);
  }

  async onUserDataChanged(userData: any): Promise<void> {
    // Salvar dados do usuário localmente primeiro
    localStorageManager.saveUserProfile(userData);
    
    await this.triggerSync('user_data_changed', userData);
  }

  // Obter estatísticas de sincronização
  getSyncStats(): { pendingChanges: number; lastSync: string | null } {
    return {
      pendingChanges: (localStorageManager.getPendingChanges() || []).length,
      lastSync: localStorageManager.getLastSync()
    };
  }

  // Verificar se há mudanças pendentes
  hasPendingChanges(): boolean {
    return localStorageManager.hasPendingChanges();
  }

  // Forçar sincronização de mudanças pendentes
  async forceSyncPendingChanges(): Promise<void> {
    const pendingChanges = localStorageManager.getPendingChanges() || [];
    if (pendingChanges.length > 0) {
      console.log(`🔄 Forçando sincronização de ${pendingChanges.length} mudanças pendentes`);
      await this.triggerSync('force_sync_pending', { count: pendingChanges.length });
    }
  }
}

// Instância global
export const autoSync = AutoSyncMiddleware.getInstance();

// Hooks para uso em componentes
export const useAutoSyncMiddleware = () => {
  return {
    onTaskCreated: autoSync.onTaskCreated.bind(autoSync),
    onTaskUpdated: autoSync.onTaskUpdated.bind(autoSync),
    onTaskDeleted: autoSync.onTaskDeleted.bind(autoSync),
    onTaskCompleted: autoSync.onTaskCompleted.bind(autoSync),
    onUserDataChanged: autoSync.onUserDataChanged.bind(autoSync),
    getSyncStats: autoSync.getSyncStats.bind(autoSync),
    hasPendingChanges: autoSync.hasPendingChanges.bind(autoSync),
    forceSyncPendingChanges: autoSync.forceSyncPendingChanges.bind(autoSync)
  };
};
