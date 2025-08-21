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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search,
  Filter,
  UserCog,
  Ban,
  UserCheck,
  Zap,
  MoreHorizontal,
  Shield,
  Crown,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  CreditCard,
  Calendar,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Enum local para compatibilidade
enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  OWNER = "OWNER"
}
import { toast } from "sonner"
import { debug } from "@/lib/debug"

interface User {
  id: string
  name: string
  email: string
  role: string
  subscriptionPlan?: string
  // Remover campos que não existem no schema ultra-minimal
  // isBanned: boolean
  // bannedAt: string | null
  // banReason: string | null
  // subscriptionStatus: string | null
  // level: number
  // stripeCustomerId: string | null
  // xp: number
  // subscriptionStartedAt: string | null
  // subscriptionExpiresAt: string | null
  // dateOfBirth: string | null
  // createdAt: string
  // updatedAt: string
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    banned: "all",
    plan: "all",
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: "changeRole" | "ban" | "unban" | "delete" | "edit" | "changePlan" | null
    user: User | null
  }>({
    open: false,
    type: null,
    user: null,
  })
  const [actionData, setActionData] = useState({
    role: "",
    newName: "",
    newEmail: "",
    newPlan: "",
  })
  const [userDetailsDialog, setUserDetailsDialog] = useState(false)
  const [editUserDialog, setEditUserDialog] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && filters.role !== "all" && { role: filters.role }),
        ...(filters.banned && filters.banned !== "all" && { banned: filters.banned }),
        ...(filters.plan && filters.plan !== "all" && { plan: filters.plan }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      
      if (response.ok) {
        const data: UsersResponse = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!actionDialog.user || !actionDialog.type) return

    try {
      let endpoint = "/api/admin/users"
      let method = "PATCH"
      
      const payload = {
        id: actionDialog.user.id,
        ...(actionDialog.type === "changeRole" && { role: actionData.role }),
        ...(actionDialog.type === "ban" && { isBanned: true }),
        ...(actionDialog.type === "unban" && { isBanned: false }),
        ...(actionDialog.type === "changePlan" && { subscriptionPlan: actionData.newPlan }),
        ...(actionDialog.type === "edit" && { 
          name: actionData.newName, 
          email: actionData.newEmail 
        }),
      }

      if (actionDialog.type === "delete") {
        method = "DELETE"
        endpoint = `/api/admin/users?id=${actionDialog.user.id}`
      }


      
      debug.log("Payload sendo enviado:", payload)

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(payload),
      })

      if (response.ok) {
        const successMessages = {
          changeRole: "Função alterada com sucesso",
          ban: "Usuário banido com sucesso",
          unban: "Usuário desbanido com sucesso",
          changePlan: "Plano alterado com sucesso",
          edit: "Usuário editado com sucesso",
          delete: "Usuário deletado com sucesso"
        }
        
        toast.success(successMessages[actionDialog.type] || "Ação executada com sucesso")
        
        // Forçar refresh dos dados para mostrar as mudanças
        await fetchUsers()
        
        // Fechar diálogo e limpar dados
        setActionDialog({ open: false, type: null, user: null })
        setActionData({ role: "", newName: "", newEmail: "", newPlan: "" })
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao executar ação")
      }
    } catch (error) {
      console.error("Erro na ação:", error)
      toast.error("Erro interno")
    }
  }

  const openActionDialog = (type: typeof actionDialog.type, user: User) => {
    setActionDialog({ open: true, type, user })
    setActionData({ 
      role: user.role, 
      newName: user.name,
      newEmail: user.email,
      newPlan: user.subscriptionPlan || "free"
    })
  }

  const openUserDetails = (user: User) => {
    setSelectedUser(user)
    setUserDetailsDialog(true)
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { color: "bg-gray-500", text: "Gratuito" },
      aspirante: { color: "bg-purple-500", text: "Aspirante" },
      executor: { color: "bg-yellow-500", text: "Executor" }
    }
    const badge = badges[plan as keyof typeof badges] || badges.free
    return (
      <Badge className={`${badge.color} text-white`}>
        {badge.text}
      </Badge>
    )
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    const badges = {
      active: { color: "bg-green-500", text: "Ativo" },
      canceled: { color: "bg-red-500", text: "Cancelado" },
      past_due: { color: "bg-orange-500", text: "Em atraso" },
      incomplete: { color: "bg-yellow-500", text: "Incompleto" }
    }
    const badge = badges[status as keyof typeof badges]
    if (!badge) return null
    return (
      <Badge className={`${badge.color} text-white text-xs`}>
        {badge.text}
      </Badge>
    )
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return <Crown className="h-4 w-4" />
      case Role.MODERATOR:
        return <Shield className="h-4 w-4" />
      default:
        return <UserCog className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: Role) => {
    const variants = {
      [Role.OWNER]: "default",
      [Role.MODERATOR]: "secondary",
      [Role.USER]: "outline",
    } as const

    return (
      <Badge variant={variants[role]} className="flex items-center gap-1">
        {getRoleIcon(role)}
        {role}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os usuários do sistema
        </p>
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
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Cargo</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                  <SelectItem value="MODERATOR">Moderador</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="banned">Status</Label>
              <Select value={filters.banned} onValueChange={(value) => setFilters({ ...filters, banned: value })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="false">Ativos</SelectItem>
                  <SelectItem value="true">Banidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select value={filters.plan} onValueChange={(value) => setFilters({ ...filters, plan: value })}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="free">Gratuito</SelectItem>
                  <SelectItem value="aspirante">Aspirante</SelectItem>
                  <SelectItem value="executor">Executor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{user.name || "Sem nome"}</p>
                        {/* {user.isBanned && (
                          <Badge variant="destructive" className="text-xs">Banido</Badge>
                        )} */}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(user.role as Role)}
                        {user.subscriptionPlan && getPlanBadge(user.subscriptionPlan)}
                        {/* {getStatusBadge(user.subscriptionStatus)} */}
                      </div>
                       {/* <div className="flex items-center gap-2 mt-1">
                         <Badge variant="outline" className="text-xs">
                           Nível 0 • 0 XP
                         </Badge>
                         <Badge variant="outline" className="text-xs">
                           Max Level: 0
                         </Badge>
                       </div> */}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p>0 tarefas</p>
                      <p className="text-muted-foreground">0 conquistas</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Informações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openUserDetails(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Edição</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openActionDialog("edit", user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Usuário
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openActionDialog("changeRole", user)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Alterar Cargo
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Plano & Progresso</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openActionDialog("changePlan", user)}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Alterar Plano
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => openActionDialog("changeLevel", user)}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Alterar Nível
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuItem onClick={() => openActionDialog("adjustXP", user)}>
                          <Zap className="mr-2 h-4 w-4" />
                          Ajustar XP
                        </DropdownMenuItem> */}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Moderação</DropdownMenuLabel>
                        {/* {user.isBanned ? (
                          <DropdownMenuItem onClick={() => openActionDialog("unban", user)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Desbanir
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => openActionDialog("ban", user)}
                            className="text-orange-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Banir
                          </DropdownMenuItem>
                        )} */}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openActionDialog("delete", user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "changeRole" && "Alterar Cargo"}
              {actionDialog.type === "ban" && "Banir Usuário"}
              {actionDialog.type === "unban" && "Desbanir Usuário"}
              {actionDialog.type === "adjustXP" && "Ajustar XP"}
              {actionDialog.type === "changePlan" && "Alterar Plano"}
              {actionDialog.type === "changeLevel" && "Alterar Nível"}
              {actionDialog.type === "edit" && "Editar Usuário"}
              {actionDialog.type === "editDateOfBirth" && "Editar Data de Nascimento"}
              {actionDialog.type === "delete" && "Deletar Usuário"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.user && (
                <>Ação para: {actionDialog.user.name} ({actionDialog.user.email})</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionDialog.type === "changeRole" && (
              <div>
                <Label htmlFor="role">Novo Cargo</Label>
                <Select value={actionData.role} onValueChange={(value) => setActionData({ ...actionData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuário</SelectItem>
                    <SelectItem value="MODERATOR">Moderador</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionDialog.type === "ban" && (
              <div>
                <Label htmlFor="banReason">Motivo do Banimento</Label>
                <Textarea
                  id="banReason"
                  value={actionData.banReason}
                  onChange={(e) => setActionData({ ...actionData, banReason: e.target.value })}
                  placeholder="Descreva o motivo do banimento..."
                />
              </div>
            )}

            {actionDialog.type === "adjustXP" && (
              <div>
                <Label htmlFor="xpAdjustment">Ajuste de XP</Label>
                <Input
                  id="xpAdjustment"
                  type="number"
                  value={actionData.xpAdjustment}
                  onChange={(e) => setActionData({ ...actionData, xpAdjustment: e.target.value })}
                  placeholder="Ex: +100 ou -50"
                />
                <p className="text-xs text-muted-foreground">
                  Use números positivos para adicionar XP, negativos para remover
                </p>
              </div>
            )}

            {actionDialog.type === "changePlan" && (
              <div>
                <Label htmlFor="newPlan">Novo Plano</Label>
                <Select value={actionData.newPlan} onValueChange={(value) => setActionData({ ...actionData, newPlan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="aspirante">Aspirante</SelectItem>
                    <SelectItem value="executor">Executor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {actionDialog.type === "changeLevel" && (
              <div>
                <Label htmlFor="newLevel">Novo Nível</Label>
                <Input
                  id="newLevel"
                  type="number"
                  min="1"
                  max="999"
                  value={actionData.newLevel}
                  onChange={(e) => setActionData({ ...actionData, newLevel: e.target.value })}
                  placeholder="Ex: 5"
                />
                <p className="text-xs text-muted-foreground">
                  Nível atual: 0
                </p>
              </div>
            )}

            {actionDialog.type === "edit" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newName">Nome</Label>
                  <Input
                    id="newName"
                    value={actionData.newName}
                    onChange={(e) => setActionData({ ...actionData, newName: e.target.value })}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="newEmail">Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={actionData.newEmail}
                    onChange={(e) => setActionData({ ...actionData, newEmail: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
            )}

            {actionDialog.type === "editDateOfBirth" && (
              <div>
                <Label htmlFor="newDateOfBirth">Nova Data de Nascimento</Label>
                <Input
                  id="newDateOfBirth"
                  type="date"
                  value={actionData.newDateOfBirth}
                  onChange={(e) => setActionData({ ...actionData, newDateOfBirth: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Data atual: Não informada
                </p>
                <p className="text-xs text-muted-foreground">
                  Alterações realizadas: 0/2
                </p>
              </div>
            )}

            {actionDialog.type === "delete" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Atenção: Esta ação não pode ser desfeita!</p>
                    <p className="text-sm text-muted-foreground">
                      Todos os dados do usuário serão permanentemente removidos.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Digite "DELETAR" para confirmar a exclusão:
                </p>
                <Input
                  value={actionData.banReason}
                  onChange={(e) => setActionData({ ...actionData, banReason: e.target.value })}
                  placeholder="DELETAR"
                />
              </div>
            )}

            {actionDialog.type === "unban" && (
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja desbanir este usuário?
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, user: null })}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAction}
              disabled={
                (actionDialog.type === "delete" && actionData.banReason !== "DELETAR") ||
                (actionDialog.type === "changeLevel" && !actionData.newLevel) ||
                (actionDialog.type === "edit" && (!actionData.newName.trim() || !actionData.newEmail.trim())) ||
                (actionDialog.type === "editDateOfBirth" && !actionData.newDateOfBirth)
              }
              variant={actionDialog.type === "delete" ? "destructive" : "default"}
            >
              {actionDialog.type === "delete" ? "Deletar Permanentemente" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialog} onOpenChange={setUserDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes do Usuário
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                    <p className="font-medium">{selectedUser.name || "Não definido"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-mono text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cargo</Label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role as Role)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      {/* {selectedUser.isBanned ? (
                        <Badge variant="destructive">Banido</Badge>
                      ) : (
                        <Badge variant="secondary">Ativo</Badge>
                      )} */}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Não informada
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionDialog({
                            open: true,
                            type: "editDateOfBirth",
                            user: selectedUser,
                          });
                          setActionData({
                            ...actionData,
                            newDateOfBirth: ""
                          });
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progresso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progresso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nível Atual</Label>
                    <p className="text-2xl font-bold text-primary">0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">XP Total</Label>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nível Máximo</Label>
                    <p className="font-medium">0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Atividade</Label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">0 tarefas</Badge>
                      <Badge variant="outline">0 conquistas</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assinatura */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Plano Atual</Label>
                    <div className="mt-1">{getPlanBadge(selectedUser.subscriptionPlan || "free")}</div>
                  </div>
                  {/* {selectedUser.subscriptionStatus && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status da Assinatura</Label>
                      <div className="mt-1">{getStatusBadge(selectedUser.subscriptionStatus)}</div>
                    </div>
                  )} */}
                  {/* {selectedUser.stripeCustomerId && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Customer ID</Label>
                      <p className="font-mono text-sm">{selectedUser.stripeCustomerId}</p>
                    </div>
                  )} */}
                  {/* {selectedUser.subscriptionStartedAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Iniciada em</Label>
                      <p className="text-sm">{new Date(selectedUser.subscriptionStartedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )} */}
                  {/* {selectedUser.subscriptionExpiresAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Expira em</Label>
                      <p className="text-sm">{new Date(selectedUser.subscriptionExpiresAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )} */}
                </CardContent>
              </Card>

              {/* Datas Importantes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Datas Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
                    <p className="text-sm">Data não disponível</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Última atualização</Label>
                    <p className="text-sm">Data não disponível</p>
                  </div>
                  {/* {selectedUser.bannedAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Banido em</Label>
                      <p className="text-sm">{new Date(selectedUser.bannedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )} */}
                </CardContent>
              </Card>

              {/* Informações de Banimento */}
              {/* {selectedUser.isBanned && selectedUser.banReason && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                      <Ban className="h-5 w-5" />
                      Informações do Banimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Motivo</Label>
                      <p className="mt-1 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
                        {selectedUser.banReason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailsDialog(false)}>
              Fechar
            </Button>
            {selectedUser && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUserDetailsDialog(false)
                    openActionDialog("edit", selectedUser)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUserDetailsDialog(false)
                    openActionDialog("changePlan", selectedUser)
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Alterar Plano
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}