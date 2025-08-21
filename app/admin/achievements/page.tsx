'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Trophy,
  Plus,
  Edit,
  Trash2,
  Users,
  Zap,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  requirement: any
  createdAt: string
  _count: {
    userAchievements: number
  }
}

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    achievement: Achievement | null
  }>({
    open: false,
    achievement: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    achievement: Achievement | null
  }>({
    open: false,
    achievement: null,
  })
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    xpReward: "",
    requirementType: "tasks_completed",
    requirementValue: "",
  })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/achievements")
      if (response.ok) {
        const data = await response.json()
        // Verificar se data.achievements existe, senão usar data diretamente
        setAchievements(data.achievements || data || [])
      } else {
        console.error("Erro na resposta da API:", response.status)
        setAchievements([])
        toast.error("Erro ao carregar conquistas")
      }
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error)
      setAchievements([])
      toast.error("Erro ao carregar conquistas")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAchievement = async () => {
    if (!formData.name || !formData.description || !formData.xpReward) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon || "trophy",
        xpReward: parseInt(formData.xpReward),
        requirement: {
          type: formData.requirementType,
          value: parseInt(formData.requirementValue) || 1,
        },
      }

      const response = await fetch("/api/admin/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Conquista criada com sucesso")
        fetchAchievements()
        setCreateDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao criar conquista")
      }
    } catch (error) {
      console.error("Erro ao criar conquista:", error)
      toast.error("Erro interno")
    }
  }

  const handleEditAchievement = async () => {
    if (!editDialog.achievement || !formData.name || !formData.description) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const payload = {
        id: editDialog.achievement.id,
        name: formData.name,
        description: formData.description,
        icon: formData.icon || "trophy",
        xpReward: parseInt(formData.xpReward),
        requirement: {
          type: formData.requirementType,
          value: parseInt(formData.requirementValue) || 1,
        },
      }

      const response = await fetch("/api/admin/achievements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Conquista atualizada com sucesso")
        fetchAchievements()
        setEditDialog({ open: false, achievement: null })
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao atualizar conquista")
      }
    } catch (error) {
      console.error("Erro ao atualizar conquista:", error)
      toast.error("Erro interno")
    }
  }

  const handleDeleteAchievement = async () => {
    if (!deleteDialog.achievement) return

    try {
      const response = await fetch(`/api/admin/achievements?id=${deleteDialog.achievement.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Conquista deletada com sucesso")
        fetchAchievements()
        setDeleteDialog({ open: false, achievement: null })
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao deletar conquista")
      }
    } catch (error) {
      console.error("Erro ao deletar conquista:", error)
      toast.error("Erro interno")
    }
  }

  const openEditDialog = (achievement: Achievement) => {
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xpReward: achievement.xpReward.toString(),
      requirementType: achievement.requirement?.type || "tasks_completed",
      requirementValue: achievement.requirement?.value?.toString() || "1",
    })
    setEditDialog({ open: true, achievement })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      xpReward: "",
      requirementType: "tasks_completed",
      requirementValue: "",
    })
  }

  const getRequirementText = (requirement: any) => {
    if (!requirement) return "Sem requisito"
    
    const typeLabels = {
      tasks_completed: "tarefas concluídas",
      level_reached: "nível atingido",
      consecutive_days: "dias consecutivos",
      xp_earned: "XP ganho",
    }

    const typeLabel = typeLabels[requirement.type as keyof typeof typeLabels] || requirement.type
    return `${requirement.value} ${typeLabel}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Conquistas</h1>
          <p className="text-muted-foreground">
            Crie e gerencie conquistas para motivar os usuários
          </p>
        </div>
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conquista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Conquista</DialogTitle>
              <DialogDescription>
                Defina os detalhes da nova conquista
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da conquista"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da conquista"
                />
              </div>

              <div>
                <Label htmlFor="icon">Ícone</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="trophy, star, crown, etc."
                />
              </div>

              <div>
                <Label htmlFor="xpReward">Recompensa XP *</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="requirementType">Tipo de Requisito</Label>
                <select
                  id="requirementType"
                  value={formData.requirementType}
                  onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="tasks_completed">Tarefas Concluídas</option>
                  <option value="level_reached">Nível Atingido</option>
                  <option value="consecutive_days">Dias Consecutivos</option>
                  <option value="xp_earned">XP Ganho</option>
                </select>
              </div>

              <div>
                <Label htmlFor="requirementValue">Valor do Requisito</Label>
                <Input
                  id="requirementValue"
                  type="number"
                  value={formData.requirementValue}
                  onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAchievement}>
                Criar Conquista
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          achievements.map((achievement) => (
            <Card key={achievement.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(achievement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, achievement })}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {achievement.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recompensa:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {achievement.xpReward} XP
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Requisito:</span>
                    <span className="text-sm text-muted-foreground">
                      {getRequirementText(achievement.requirement)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Desbloqueadas:</span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {achievement._count.userAchievements}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Conquista</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da conquista
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da conquista"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da conquista"
              />
            </div>

            <div>
              <Label htmlFor="edit-icon">Ícone</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="trophy, star, crown, etc."
              />
            </div>

            <div>
              <Label htmlFor="edit-xpReward">Recompensa XP *</Label>
              <Input
                id="edit-xpReward"
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="edit-requirementType">Tipo de Requisito</Label>
              <select
                id="edit-requirementType"
                value={formData.requirementType}
                onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="tasks_completed">Tarefas Concluídas</option>
                <option value="level_reached">Nível Atingido</option>
                <option value="consecutive_days">Dias Consecutivos</option>
                <option value="xp_earned">XP Ganho</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-requirementValue">Valor do Requisito</Label>
              <Input
                id="edit-requirementValue"
                type="number"
                value={formData.requirementValue}
                onChange={(e) => setFormData({ ...formData, requirementValue: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, achievement: null })}>
              Cancelar
            </Button>
            <Button onClick={handleEditAchievement}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deletar Conquista
            </DialogTitle>
            <DialogDescription>
              {deleteDialog.achievement && (
                <>
                  Tem certeza que deseja deletar a conquista "{deleteDialog.achievement.name}"?
                  <br />
                  Esta ação não pode ser desfeita e afetará {deleteDialog.achievement._count.userAchievements} usuários.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, achievement: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAchievement}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}