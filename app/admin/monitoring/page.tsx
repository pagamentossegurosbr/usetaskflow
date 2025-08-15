'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Database, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Server,
  Globe,
  HardDrive,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemStatus {
  database: 'online' | 'offline' | 'error';
  sync: 'active' | 'inactive' | 'error';
  users: number;
  activeUsers: number;
  lastSync: string | null;
  pendingChanges: number;
  storageUsage: number;
  responseTime: number;
}

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncTime: string | null;
  averageSyncTime: number;
}

export default function AdminMonitoring() {
  const { data: session } = useSession();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'offline',
    sync: 'inactive',
    users: 0,
    activeUsers: 0,
    lastSync: null,
    pendingChanges: 0,
    storageUsage: 0,
    responseTime: 0
  });
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    lastSyncTime: null,
    averageSyncTime: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Verificar se é admin
  if (!session?.user || session.user.role !== 'OWNER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const checkSystemStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Obter dados de monitoramento da API
      const response = await fetch('/api/admin/monitoring');
      const result = await response.json();
      
      if (response.ok && result.success) {
        const data = result.data;
        
        setSystemStatus({
          database: data.system.status.database,
          sync: data.system.status.sync,
          users: data.users.total,
          activeUsers: data.users.active,
          lastSync: data.sync.lastSync,
          pendingChanges: data.sync.pendingChanges,
          storageUsage: data.storage.usage,
          responseTime: data.system.responseTime.database
        });

        setSyncStats({
          totalSyncs: data.sync.stats.totalSyncs,
          successfulSyncs: data.sync.stats.successfulSyncs,
          failedSyncs: data.sync.stats.failedSyncs,
          lastSyncTime: data.sync.stats.lastSyncTime,
          averageSyncTime: data.sync.stats.averageSyncTime
        });

        setLastUpdate(new Date());
        toast.success('Status atualizado com sucesso');
      } else {
        throw new Error(result.error || 'Erro ao obter dados de monitoramento');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast.error('Erro ao verificar status do sistema');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'offline':
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  // Atualizar status automaticamente a cada 30 segundos
  useEffect(() => {
    checkSystemStatus();
    
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-gray-600">Status em tempo real da aplicação</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Última atualização: {formatTimeAgo(lastUpdate.toISOString())}
          </Badge>
          <Button 
            onClick={checkSystemStatus} 
            disabled={isRefreshing}
            size="sm"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status do Banco de Dados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            {getStatusIcon(systemStatus.database)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus.database === 'online' ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.responseTime.toFixed(0)}ms de resposta
            </p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(systemStatus.database)}`}
            >
              {systemStatus.database === 'online' ? 'Funcionando' : 'Problema detectado'}
            </Badge>
          </CardContent>
        </Card>

        {/* Status da Sincronização */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronização</CardTitle>
            {getStatusIcon(systemStatus.sync)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus.sync === 'active' ? 'Ativa' : 'Inativa'}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.pendingChanges} mudanças pendentes
            </p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${getStatusColor(systemStatus.sync)}`}
            >
              {formatTimeAgo(systemStatus.lastSync)}
            </Badge>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              de {systemStatus.users} usuários totais
            </p>
            <Badge variant="outline" className="mt-2">
              {((systemStatus.activeUsers / systemStatus.users) * 100).toFixed(1)}% ativos
            </Badge>
          </CardContent>
        </Card>

        {/* Uso de Armazenamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStatus.storageUsage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Uso do banco de dados
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  systemStatus.storageUsage > 80 ? 'bg-red-500' : 
                  systemStatus.storageUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemStatus.storageUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas de Sincronização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estatísticas de Sincronização
            </CardTitle>
            <CardDescription>
              Métricas detalhadas da sincronização com Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {syncStats.successfulSyncs}
                </div>
                <div className="text-sm text-muted-foreground">Sincronizações bem-sucedidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {syncStats.failedSyncs}
                </div>
                <div className="text-sm text-muted-foreground">Sincronizações falharam</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total de sincronizações:</span>
                <span className="font-medium">{syncStats.totalSyncs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taxa de sucesso:</span>
                <span className="font-medium">
                  {syncStats.totalSyncs > 0 
                    ? ((syncStats.successfulSyncs / syncStats.totalSyncs) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tempo médio de sincronização:</span>
                <span className="font-medium">{syncStats.averageSyncTime.toFixed(0)}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas do Sistema
            </CardTitle>
            <CardDescription>
              Problemas e notificações importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.database === 'offline' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium text-red-800">Banco de dados offline</div>
                    <div className="text-sm text-red-600">Verifique a conexão com o Supabase</div>
                  </div>
                </div>
              )}
              
              {systemStatus.sync === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-yellow-800">Erro na sincronização</div>
                    <div className="text-sm text-yellow-600">Problemas na sincronização com Supabase</div>
                  </div>
                </div>
              )}
              
              {systemStatus.pendingChanges > 5 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-blue-800">Mudanças pendentes</div>
                    <div className="text-sm text-blue-600">
                      {systemStatus.pendingChanges} mudanças aguardando sincronização
                    </div>
                  </div>
                </div>
              )}
              
              {systemStatus.storageUsage > 80 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <HardDrive className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-medium text-orange-800">Armazenamento alto</div>
                    <div className="text-sm text-orange-600">
                      {systemStatus.storageUsage.toFixed(1)}% do armazenamento utilizado
                    </div>
                  </div>
                </div>
              )}
              
              {systemStatus.database === 'online' && 
               systemStatus.sync === 'active' && 
               systemStatus.pendingChanges <= 5 && 
               systemStatus.storageUsage <= 80 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-green-800">Sistema funcionando normalmente</div>
                    <div className="text-sm text-green-600">Todos os serviços estão operacionais</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
