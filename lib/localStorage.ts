// Sistema de persistência local para garantir que usuários nunca percam dados

interface LocalStorageData {
  tasks: any[];
  userProfile: any;
  settings: any;
  lastSync: string | null;
  pendingChanges: any[];
  timestamp: string;
}

class LocalStorageManager {
  private readonly STORAGE_KEY = 'taskflow_local_data';
  private readonly PENDING_CHANGES_KEY = 'taskflow_pending_changes';
  private readonly USER_PROFILE_KEY = 'taskflow_user_profile';
  private readonly SETTINGS_KEY = 'taskflow_settings';

  // Salvar dados localmente
  saveData(data: Partial<LocalStorageData>): void {
    try {
      const existingData = this.getData();
      const updatedData = {
        ...existingData,
        ...data,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
      // Reduzir logs para evitar spam
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
        console.log('💾 Dados salvos localmente:', Object.keys(data));
      }
    } catch (error) {
      console.error('❌ Erro ao salvar dados localmente:', error);
    }
  }

  // Carregar dados localmente
  getData(): LocalStorageData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados localmente:', error);
    }
    
    return {
      tasks: [],
      userProfile: null,
      settings: {},
      lastSync: null,
      pendingChanges: [],
      timestamp: new Date().toISOString()
    };
  }

  // Salvar tarefas localmente
  saveTasks(tasks: any[]): void {
    this.saveData({ tasks });
  }

  // Carregar tarefas localmente
  getTasks(): any[] {
    return this.getData().tasks || [];
  }

  // Salvar perfil do usuário localmente
  saveUserProfile(profile: any): void {
    this.saveData({ userProfile: profile });
  }

  // Carregar perfil do usuário localmente
  getUserProfile(): any {
    return this.getData().userProfile || null;
  }

  // Salvar configurações localmente
  saveSettings(settings: any): void {
    this.saveData({ settings });
  }

  // Carregar configurações localmente
  getSettings(): any {
    return this.getData().settings || {};
  }

  // Adicionar mudança pendente
  addPendingChange(change: any): void {
    try {
      const pendingChanges = this.getPendingChanges();
      pendingChanges.push({
        ...change,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem(this.PENDING_CHANGES_KEY, JSON.stringify(pendingChanges));
      // Reduzir logs para evitar spam
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.2) {
        console.log('📝 Mudança pendente adicionada:', change.type);
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar mudança pendente:', error);
    }
  }

  // Obter mudanças pendentes
  getPendingChanges(): any[] {
    try {
      const data = localStorage.getItem(this.PENDING_CHANGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Erro ao carregar mudanças pendentes:', error);
      return [];
    }
  }

  // Limpar mudanças pendentes
  clearPendingChanges(): void {
    try {
      localStorage.removeItem(this.PENDING_CHANGES_KEY);
      // Reduzir logs para evitar spam
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.3) {
        console.log('✅ Mudanças pendentes limpas');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar mudanças pendentes:', error);
    }
  }

  // Verificar se há dados locais
  hasLocalData(): boolean {
    const data = this.getData();
    return data.tasks.length > 0 || data.userProfile !== null;
  }

  // Verificar se há mudanças pendentes
  hasPendingChanges(): boolean {
    return this.getPendingChanges().length > 0;
  }

  // Obter timestamp da última sincronização
  getLastSync(): string | null {
    return this.getData().lastSync;
  }

  // Atualizar timestamp da última sincronização
  updateLastSync(): void {
    this.saveData({ lastSync: new Date().toISOString() });
  }

  // Limpar todos os dados locais
  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.PENDING_CHANGES_KEY);
      localStorage.removeItem(this.USER_PROFILE_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      console.log('🗑️ Todos os dados locais limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados locais:', error);
    }
  }

  // Verificar se o localStorage está disponível
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Obter estatísticas dos dados locais
  getStats(): { tasks: number; pendingChanges: number; lastSync: string | null } {
    const data = this.getData();
    const pendingChanges = this.getPendingChanges();
    
    return {
      tasks: data.tasks.length,
      pendingChanges: pendingChanges.length,
      lastSync: data.lastSync
    };
  }
}

// Instância global
export const localStorageManager = new LocalStorageManager();

// Hooks para uso em componentes
export const useLocalStorage = () => {
  return {
    saveTasks: localStorageManager.saveTasks.bind(localStorageManager),
    getTasks: localStorageManager.getTasks.bind(localStorageManager),
    saveUserProfile: localStorageManager.saveUserProfile.bind(localStorageManager),
    getUserProfile: localStorageManager.getUserProfile.bind(localStorageManager),
    saveSettings: localStorageManager.saveSettings.bind(localStorageManager),
    getSettings: localStorageManager.getSettings.bind(localStorageManager),
    addPendingChange: localStorageManager.addPendingChange.bind(localStorageManager),
    getPendingChanges: localStorageManager.getPendingChanges.bind(localStorageManager),
    clearPendingChanges: localStorageManager.clearPendingChanges.bind(localStorageManager),
    hasLocalData: localStorageManager.hasLocalData.bind(localStorageManager),
    hasPendingChanges: localStorageManager.hasPendingChanges.bind(localStorageManager),
    getLastSync: localStorageManager.getLastSync.bind(localStorageManager),
    updateLastSync: localStorageManager.updateLastSync.bind(localStorageManager),
    clearAllData: localStorageManager.clearAllData.bind(localStorageManager),
    isAvailable: localStorageManager.isAvailable.bind(localStorageManager),
    getStats: localStorageManager.getStats.bind(localStorageManager)
  };
};
