'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Search,
  Filter,
  Activity,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Trash2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ActivityLog {
  id: string
  userId: string
  action: string
  details: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LogsResponse {
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [clearingLogs, setClearingLogs] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  })

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      })

      const response = await fetch(`/api/admin/logs?${params}`)
      if (response.ok) {
        const data: LogsResponse = await response.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
      toast.error("Erro ao carregar logs")
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = async () => {
    setClearingLogs(true)
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Logs limpos com sucesso!')
        setLogs([])
        setPagination(prev => ({ ...prev, total: 0, pages: 0 }))
      } else {
        throw new Error('Erro ao limpar logs')
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
      toast.error('Erro ao limpar logs')
    } finally {
      setClearingLogs(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getActionIcon = (action: string) => {
    if (action.includes("admin")) return <Shield className="h-4 w-4 text-blue-500" />
    if (action.includes("ban")) return <XCircle className="h-4 w-4 text-red-500" />
    if (action.includes("create")) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (action.includes("delete")) return <XCircle className="h-4 w-4 text-red-500" />
    if (action.includes("update")) return <Info className="h-4 w-4 text-yellow-500" />
    return <Activity className="h-4 w-4 text-muted-foreground" />
  }

  const getActionBadge = (action: string) => {
    if (action.includes("admin")) return <Badge className="bg-blue-500">Admin</Badge>
    if (action.includes("ban")) return <Badge variant="destructive">Banimento</Badge>
    if (action.includes("create")) return <Badge className="bg-green-500">Criação</Badge>
    if (action.includes("delete")) return <Badge variant="destructive">Exclusão</Badge>
    if (action.includes("update")) return <Badge variant="outline">Atualização</Badge>
    return <Badge variant="secondary">Sistema</Badge>
  }

  const getActionDescription = (log: ActivityLog) => {
    const { action, details } = log
    
    switch (action) {
      case "admin_changeRole":
        return `Alterou cargo para ${details?.role}`
      case "admin_ban":
        return `Baniu usuário - Motivo: ${details?.reason || "Não especificado"}`
      case "admin_unban":
        return "Desbaniu usuário"
      case "admin_adjustXP":
        return `Ajustou XP em ${details?.xp > 0 ? '+' : ''}${details?.xp}`
      case "admin_create_achievement":
        return `Criou conquista: ${details?.name}`
      case "admin_update_achievement":
        return "Atualizou conquista"
      case "admin_delete_achievement":
        return "Deletou conquista"
      case "admin_delete_task":
        return `Deletou tarefa: ${details?.taskTitle}`
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatDetails = (details: any) => {
    if (!details) return null
    
    const formatted = Object.entries(details)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ")
    
    return formatted || null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs de Atividade</h1>
          <p className="text-muted-foreground">
            Monitore todas as ações administrativas e do sistema
          </p>
        </div>
        
        {/* Clear Logs Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Limpar Logs
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Confirmar Limpeza de Logs
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá <strong>permanentemente</strong> remover todos os logs de atividade do sistema.
                <br /><br />
                <strong>⚠️ ATENÇÃO:</strong> Esta operação não pode ser desfeita!
                <br /><br />
                Você tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearLogs}
                disabled={clearingLogs}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {clearingLogs ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sim, Limpar Todos os Logs
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="action">Ação</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="action"
                  placeholder="Buscar ação..."
                  value={filters.action}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="userId">ID do Usuário</Label>
              <Input
                id="userId"
                placeholder="ID do usuário..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="datetime-local"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Data final</Label>
              <Input
                id="dateTo"
                type="datetime-local"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Atividade ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-4 w-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getActionDescription(log)}</span>
                        {getActionBadge(log.action)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.user.name} ({log.user.email})
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.user.role}
                    </Badge>
                  </div>

                  {formatDetails(log.details) && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      <strong>Detalhes:</strong> {formatDetails(log.details)}
                    </div>
                  )}

                  {(log.ipAddress || log.userAgent) && (
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      {log.ipAddress && (
                        <div><strong>IP:</strong> {log.ipAddress}</div>
                      )}
                      {log.userAgent && (
                        <div className="truncate"><strong>User Agent:</strong> {log.userAgent}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}