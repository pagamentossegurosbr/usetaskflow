'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Wifi, WifiOff, Settings, Clock } from 'lucide-react';

export function SyncStatus() {
  const { data: session } = useSession();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'not-configured'>('idle');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  // Só mostrar para administradores
  if (!session?.user || session.user.role !== 'OWNER') {
    return null;
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'not-configured':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return autoSyncEnabled ? <Wifi className="h-4 w-4 text-blue-500" /> : <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Sincronizando...';
      case 'success':
        return 'Sincronizado';
      case 'error':
        return 'Erro';
      case 'not-configured':
        return 'Não configurado';
      default:
        return autoSyncEnabled ? 'Auto-sync ativo' : 'Auto-sync desativado';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'success':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'not-configured':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'syncing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return autoSyncEnabled 
          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
          : 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge 
        variant="outline" 
        className={`flex items-center gap-2 px-3 py-2 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {autoSyncEnabled && syncStatus === 'idle' && (
          <Clock className="h-3 w-3 text-blue-500" />
        )}
      </Badge>

      {lastSync && (
        <div className="text-xs text-gray-500 text-center">
          Última sincronização:<br />
          {formatTimeAgo(lastSync)}
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        Auto-sync a cada 30s
      </div>
    </div>
  );
}
