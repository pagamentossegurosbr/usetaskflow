'use client';

import { useState, useEffect, useCallback } from 'react';

interface CooldownData {
  taskId: string;
  lastToggle: number;
  toggleCount: number;
  isBlocked: boolean;
  blockUntil: number;
  blockReason: string;
  actionType: 'toggle' | 'delete' | 'edit' | 'create' | 'priority';
  consecutiveActions: number;
  lastActionTime: number;
}

interface UseCooldownReturn {
  isBlocked: (taskId: string, actionType?: string) => boolean;
  canToggle: (taskId: string, actionType?: string) => boolean;
  recordToggle: (taskId: string, actionType?: string) => void;
  getBlockReason: (taskId: string) => string;
  getRemainingTime: (taskId: string) => number;
  resetCooldown: (taskId: string) => void;
  getGlobalCooldown: () => boolean;
  recordGlobalAction: (actionType: string) => void;
}

// Configuração aprimorada do sistema anti-farming
const COOLDOWN_CONFIG = {
  // Cooldowns por ação (removido cooldown imediato para toggle)
  toggleCooldown: 0, // SEM cooldown imediato - só aplica quando há farming
  deleteCooldown: 10 * 1000, // 10 segundos para delete
  editCooldown: 15 * 1000, // 15 segundos para edit
  createCooldown: 5 * 1000, // 5 segundos para criar
  priorityCooldown: 20 * 1000, // 20 segundos para mudar prioridade
  
  // Limites de ações
  maxTogglesPerTask: 5, // Aumentado para permitir mais toggles antes do bloqueio
  maxActionsPerMinute: 15, // Aumentado para permitir mais ações
  maxCreatesPerMinute: 8, // Aumentado para permitir mais criações
  
  // Detecção de farming (ajustado para ser mais preciso)
  farmingThreshold: 4, // Aumentado para 4 ações em sequência rápida
  farmingWindow: 20 * 1000, // 20 segundos para detectar farming (reduzido)
  rapidActionWindow: 3 * 1000, // 3 segundos para ações muito rápidas (reduzido)
  
  // Penalidades progressivas
  progressiveBlockTime: 2 * 60 * 1000, // 2 minutos inicial (reduzido)
  maxBlockTime: 30 * 60 * 1000, // 30 minutos máxima (reduzido)
  blockTimeMultiplier: 1.5, // Multiplicador reduzido
  
  // Reset automático
  autoResetAfter: 24 * 60 * 60 * 1000, // 24 horas
};

export function useCooldown(): UseCooldownReturn {
  const [cooldowns, setCooldowns] = useState<Map<string, CooldownData>>(new Map());
  const [globalActions, setGlobalActions] = useState<Array<{actionType: string, timestamp: number}>>([]);

  // Carregar cooldowns do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('task-cooldowns');
    const savedGlobal = localStorage.getItem('global-actions');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cooldownMap = new Map(Object.entries(parsed)) as Map<string, CooldownData>;
        
        // Limpar cooldowns antigos (mais de 24 horas)
        const now = Date.now();
        const filteredMap = new Map();
        for (const [key, value] of Array.from(cooldownMap.entries())) {
          if (now - value.lastToggle < COOLDOWN_CONFIG.autoResetAfter) {
            filteredMap.set(key, value);
          }
        }
        
        setCooldowns(filteredMap);
      } catch (error) {
        console.error('Erro ao carregar cooldowns:', error);
      }
    }
    
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal);
        const now = Date.now();
        const filtered = parsed.filter((action: any) => 
          now - action.timestamp < COOLDOWN_CONFIG.autoResetAfter
        );
        setGlobalActions(filtered);
      } catch (error) {
        console.error('Erro ao carregar ações globais:', error);
      }
    }
  }, []);

  // Limpar ações globais antigas periodicamente
  useEffect(() => {
    const cleanupGlobalActions = () => {
      const now = Date.now();
      const filtered = globalActions.filter(action => 
        now - action.timestamp < 60 * 1000 // Manter apenas ações da última hora
      );
      if (filtered.length !== globalActions.length) {
        setGlobalActions(filtered);
        saveGlobalActions(filtered);
      }
    };

    const interval = setInterval(cleanupGlobalActions, 30000); // Limpar a cada 30 segundos
    return () => clearInterval(interval);
  }, [globalActions]);

  // Salvar cooldowns no localStorage
  const saveCooldowns = (newCooldowns: Map<string, CooldownData>) => {
    const obj = Object.fromEntries(newCooldowns);
    localStorage.setItem('task-cooldowns', JSON.stringify(obj));
  };

  // Salvar ações globais
  const saveGlobalActions = (actions: Array<{actionType: string, timestamp: number}>) => {
    localStorage.setItem('global-actions', JSON.stringify(actions));
  };

  // Verificar bloqueio global
  const getGlobalCooldown = (): boolean => {
    const now = Date.now();
    const recentActions = globalActions.filter(action => 
      now - action.timestamp < 60 * 1000
    );
    
    return recentActions.length >= COOLDOWN_CONFIG.maxActionsPerMinute;
  };

  // Registrar ação global
  const recordGlobalAction = (actionType: string) => {
    const now = Date.now();
    const newActions = [...globalActions, { actionType, timestamp: now }];
    setGlobalActions(newActions);
    saveGlobalActions(newActions);
  };

  // Obter cooldown específico para uma ação
  const getActionCooldown = (actionType: string): number => {
    switch (actionType) {
      case 'toggle': return COOLDOWN_CONFIG.toggleCooldown;
      case 'delete': return COOLDOWN_CONFIG.deleteCooldown;
      case 'edit': return COOLDOWN_CONFIG.editCooldown;
      case 'create': return COOLDOWN_CONFIG.createCooldown;
      case 'priority': return COOLDOWN_CONFIG.priorityCooldown;
      default: return COOLDOWN_CONFIG.toggleCooldown;
    }
  };

  // Verificar se está bloqueado - otimizado com cache
  const isBlocked = useCallback((taskId: string, actionType: string = 'toggle'): boolean => {
    // Verificar bloqueio global primeiro
    if (getGlobalCooldown()) {
      return true;
    }
    
    const cooldown = cooldowns.get(taskId);
    if (!cooldown) return false;
    
    const now = Date.now();
    
    // Verificar bloqueio específico da tarefa
    if (cooldown.isBlocked && now < cooldown.blockUntil) {
      return true;
    }
    
    // Para toggle, não aplicar cooldown imediato - só se estiver bloqueado por farming
    if (actionType === 'toggle') {
      return cooldown.isBlocked && now < cooldown.blockUntil;
    }
    
    // Para outras ações, verificar cooldown da ação específica
    const actionCooldown = getActionCooldown(actionType);
    const timeSinceLastAction = now - cooldown.lastActionTime;
    
    return timeSinceLastAction < actionCooldown;
  }, [cooldowns, getGlobalCooldown, getActionCooldown]);

  // Verificar se pode executar ação - otimizado
  const canToggle = useCallback((taskId: string, actionType: string = 'toggle'): boolean => {
    return !isBlocked(taskId, actionType);
  }, [isBlocked]);

  // Registrar ação
  const recordToggle = (taskId: string, actionType: string = 'toggle') => {
    const now = Date.now();
    const existing = cooldowns.get(taskId);
    
    // Registrar ação global
    recordGlobalAction(actionType);
    
    let newCooldown: CooldownData;
    
    if (!existing) {
      // Primeira vez - SEM cooldown, apenas registrar a ação
      newCooldown = {
        taskId,
        lastToggle: now,
        toggleCount: actionType === 'toggle' ? 1 : 0,
        isBlocked: false,
        blockUntil: 0,
        blockReason: '',
        actionType: actionType as any,
        consecutiveActions: 1,
        lastActionTime: now,
      };
    } else {
      const timeSinceLastAction = now - existing.lastActionTime;
      const newToggleCount = actionType === 'toggle' ? existing.toggleCount + 1 : existing.toggleCount;
      
      // Verificar farming de forma mais inteligente
      const isRapidAction = timeSinceLastAction < COOLDOWN_CONFIG.rapidActionWindow;
      const isFarming = timeSinceLastAction < COOLDOWN_CONFIG.farmingWindow && 
                       existing.consecutiveActions >= COOLDOWN_CONFIG.farmingThreshold;
      
      // Só aplicar bloqueio se realmente há farming ou muitas ações rápidas
      const shouldBlock = (isFarming || isRapidAction) && newToggleCount > 2;
      
      // Calcular tempo de bloqueio progressivo
      let blockTime = COOLDOWN_CONFIG.progressiveBlockTime;
      if (existing.isBlocked) {
        blockTime = Math.min(
          existing.blockUntil - existing.lastActionTime + COOLDOWN_CONFIG.progressiveBlockTime,
          COOLDOWN_CONFIG.maxBlockTime
        );
      }
      
      newCooldown = {
        taskId,
        lastToggle: actionType === 'toggle' ? now : existing.lastToggle,
        toggleCount: newToggleCount,
        isBlocked: shouldBlock,
        blockUntil: shouldBlock ? now + blockTime : 0,
        blockReason: isRapidAction 
          ? 'Ações muito rápidas detectadas. Desacelere e seja mais produtivo!'
          : isFarming
          ? 'Comportamento de farming detectado. Mantenha a integridade do seu progresso!'
          : '',
        actionType: actionType as any,
        consecutiveActions: isRapidAction ? existing.consecutiveActions + 1 : 1,
        lastActionTime: now,
      };
    }
    
    const newCooldowns = new Map(cooldowns);
    newCooldowns.set(taskId, newCooldown);
    setCooldowns(newCooldowns);
    saveCooldowns(newCooldowns);
  };

  // Obter motivo do bloqueio
  const getBlockReason = (taskId: string): string => {
    const cooldown = cooldowns.get(taskId);
    return cooldown?.blockReason || '';
  };

  // Obter tempo restante
  const getRemainingTime = (taskId: string): number => {
    const cooldown = cooldowns.get(taskId);
    if (!cooldown) return 0;
    
    const now = Date.now();
    
    // Para toggle, só retornar tempo se estiver bloqueado por farming
    if (cooldown.actionType === 'toggle') {
      if (cooldown.isBlocked) {
        return Math.max(0, cooldown.blockUntil - now);
      }
      return 0; // Sem cooldown para toggle normal
    }
    
    if (cooldown.isBlocked) {
      return Math.max(0, cooldown.blockUntil - now);
    }
    
    // Verificar cooldown da última ação (apenas para ações não-toggle)
    const timeSinceLastAction = now - cooldown.lastActionTime;
    const actionCooldown = getActionCooldown(cooldown.actionType);
    return Math.max(0, actionCooldown - timeSinceLastAction);
  };

  // Resetar cooldown de uma tarefa específica
  const resetCooldown = (taskId: string) => {
    const newCooldowns = new Map(cooldowns);
    newCooldowns.delete(taskId);
    setCooldowns(newCooldowns);
    saveCooldowns(newCooldowns);
  };

  return {
    isBlocked,
    canToggle,
    recordToggle,
    getBlockReason,
    getRemainingTime,
    resetCooldown,
    getGlobalCooldown,
    recordGlobalAction,
  };
} 