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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Search,
  Filter,
  CheckSquare,
  Clock,
  Star,
  Trash2,
  AlertTriangle,
  Calendar,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  text: string
  completed: boolean
  priority: boolean
  createdAt: string
  updatedAt: string
  completedAt: string | null
  scheduledFor: string | null
  user: {
    id: string
    name: string
    email: string
    level: number
  }
}

interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    userId: "",
    completed: "all",
    priority: "all",
    dateFrom: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    task: Task | null
  }>({
    open: false,
    task: null,
  })

  useEffect(() => {
    fetchTasks()
  }, [pagination.page, filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.completed && filters.completed !== "all" && { completed: filters.completed }),
        ...(filters.priority && filters.priority !== "all" && { priority: filters.priority }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      })

      const response = await fetch(`/api/admin/tasks?${params}`)
      if (response.ok) {
        const data: TasksResponse = await response.json()
        setTasks(data.tasks)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error)
      toast.error("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!deleteDialog.task) return

    try {
      const response = await fetch(`/api/admin/tasks?taskId=${deleteDialog.task.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Tarefa deletada com sucesso")
        fetchTasks()
        setDeleteDialog({ open: false, task: null })
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao deletar tarefa")
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error)
      toast.error("Erro interno")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (task: Task) => {
    if (task.completed) {
      return <Badge className="bg-green-500">Concluída</Badge>
    }
    
    if (task.scheduledFor) {
      const scheduledDate = new Date(task.scheduledFor)
      const now = new Date()
      
      if (scheduledDate < now) {
        return <Badge variant="destructive">Atrasada</Badge>
      } else {
        return <Badge variant="outline">Agendada</Badge>
      }
    }
    
    return <Badge variant="secondary">Pendente</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Tarefas</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie todas as tarefas dos usuários
          </p>
        </div>
        {tasks.length === 0 && !loading && (
          <Button
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/seed-tasks', { method: 'POST' })
                if (response.ok) {
                  toast.success("Tarefas de exemplo criadas!")
                  fetchTasks()
                } else {
                  toast.error("Erro ao criar tarefas de exemplo")
                }
              } catch (error) {
                toast.error("Erro interno")
              }
            }}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Dados de Exemplo
          </Button>
        )}
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
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Título ou texto..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="completed">Status</Label>
              <Select value={filters.completed} onValueChange={(value) => setFilters({ ...filters, completed: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="false">Pendentes</SelectItem>
                  <SelectItem value="true">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="true">Alta prioridade</SelectItem>
                  <SelectItem value="false">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Data inicial</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => {
                  const value = e.target.value
                  // Validar se a data é válida antes de definir
                  if (!value || !isNaN(Date.parse(value))) {
                    setFilters({ ...filters, dateFrom: value })
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Não há tarefas que correspondam aos filtros selecionados.
              </p>
              <p className="text-sm text-muted-foreground">
                Os usuários podem criar tarefas na aplicação principal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {task.priority && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        {getStatusBadge(task)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.text}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          Por: {task.user.name} (Nível {task.user.level})
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Criada: {formatDate(task.createdAt)}
                        </div>
                        {task.scheduledFor && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Agendada: {formatDate(task.scheduledFor)}
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckSquare className="h-3 w-3" />
                            Concluída: {formatDate(task.completedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, task })}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deletar Tarefa
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.task && (
                <>
                  Tem certeza que deseja deletar a tarefa "{deleteDialog.task.title}"?
                  <br />
                  Esta ação não pode ser desfeita.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, task: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}