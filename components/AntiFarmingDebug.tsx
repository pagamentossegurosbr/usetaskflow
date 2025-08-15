'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCooldown } from '@/hooks/useCooldown';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AntiFarmingDebugProps {
  isVisible?: boolean;
}

export function AntiFarmingDebug({ isVisible = false }: AntiFarmingDebugProps) {
  const [cooldowns, setCooldowns] = useState<Map<string, any>>(new Map());
  const [globalActions, setGlobalActions] = useState<Array<{actionType: string, timestamp: number}>>([]);
  const { getGlobalCooldown, resetCooldown } = useCooldown();

  // Carregar dados do localStorage
  const loadData = useCallback(() => {
    // Carregar cooldowns
    const saved = localStorage.getItem('task-cooldowns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCooldowns(new Map(Object.entries(parsed)));
      } catch (error) {
        console.error('Erro ao carregar cooldowns:', error);
      }
    }

    // Carregar ações globais
    const savedGlobal = localStorage.getItem('global-actions');
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal);
        setGlobalActions(parsed);
      } catch (error) {
        console.error('Erro ao carregar ações globais:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    loadData();
    const interval = setInterval(loadData, 2000); // Reduzir frequência para 2 segundos
    return () => clearInterval(interval);
  }, [isVisible, loadData]);

  const formatTime = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  }, []);

  const getTimeAgo = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return `${minutes}m ${seconds}s atrás`;
  }, []);

  const handleResetAll = useCallback(() => {
    localStorage.removeItem('task-cooldowns');
    localStorage.removeItem('global-actions');
    setCooldowns(new Map());
    setGlobalActions([]);
  }, []);

  const handleResetCooldown = useCallback((taskId: string) => {
    resetCooldown(taskId);
    loadData(); // Recarregar dados após reset
  }, [resetCooldown, loadData]);

  // Memoizar dados processados
  const processedGlobalActions = useMemo(() => {
    return globalActions.slice(-10);
  }, [globalActions]);

  const processedCooldowns = useMemo(() => {
    return Array.from(cooldowns.entries());
  }, [cooldowns]);

  const isGlobalBlocked = useMemo(() => {
    return getGlobalCooldown();
  }, [getGlobalCooldown]);

  if (!isVisible) return null;

  return (
    <Card className="p-4 border-orange-500/30 bg-orange-900/10 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-orange-400" />
        <h3 className="text-sm font-medium text-orange-200">Debug Anti-Farming</h3>
        <Badge variant="outline" className="text-xs">
          {isGlobalBlocked ? 'BLOQUEADO' : 'ATIVO'}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Ações Globais */}
        <div>
          <h4 className="text-xs font-medium text-orange-300 mb-2">Ações Globais ({globalActions.length})</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {processedGlobalActions.map((action, index) => (
              <div key={`${action.actionType}-${action.timestamp}-${index}`} className="flex items-center justify-between text-xs">
                <span className="text-orange-200">{action.actionType}</span>
                <span className="text-orange-400">{getTimeAgo(action.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cooldowns Específicos */}
        <div>
          <h4 className="text-xs font-medium text-orange-300 mb-2">Cooldowns ({cooldowns.size})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {processedCooldowns.map(([taskId, cooldown]) => (
              <div key={taskId} className="p-2 rounded border border-orange-500/20 bg-orange-900/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-orange-200 font-medium truncate">
                    {taskId.length > 20 ? taskId.substring(0, 20) + '...' : taskId}
                  </span>
                  <div className="flex items-center gap-1">
                    {cooldown.isBlocked ? (
                      <XCircle className="h-3 w-3 text-red-400" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
                <div className="text-xs text-orange-400 space-y-1">
                  <div>Ação: {cooldown.actionType}</div>
                  <div>Toggles: {cooldown.toggleCount}</div>
                  <div>Última ação: {getTimeAgo(cooldown.lastActionTime)}</div>
                  {cooldown.isBlocked && (
                    <div className="text-red-400">
                      Bloqueado até: {formatTime(cooldown.blockUntil)}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-6 text-xs"
                  onClick={() => handleResetCooldown(taskId)}
                >
                  Reset
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Controle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetAll}
            className="text-xs"
          >
            Resetar Tudo
          </Button>
        </div>
      </div>
    </Card>
  );
} 