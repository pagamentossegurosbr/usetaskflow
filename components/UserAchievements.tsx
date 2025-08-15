'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  Trophy, 
  Lock, 
  Unlock, 
  Star, 
  Award, 
  Zap, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useAchievements, Achievement, AchievementProgress } from '@/hooks/useAchievements'
import { useProductivityLevel } from '@/hooks/useProductivityLevel'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface UserAchievementsProps {
  isOpen: boolean
  onClose: () => void
}

export function UserAchievements({ isOpen, onClose }: UserAchievementsProps) {
  const { achievements, loading, unlockAchievement, calculateAchievementProgress, getNextAchievement, refreshAchievements } = useAchievements()
  const { stats } = useProductivityLevel()
  
  // Só carregar achievements quando o modal estiver aberto
  const shouldLoadAchievements = isOpen

  // Carregar achievements quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      refreshAchievements()
    }
  }, [isOpen, refreshAchievements])
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [unlocking, setUnlocking] = useState<string | null>(null)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  // Preparar estatísticas do usuário para cálculo de progresso
  const userStats = {
    tasksCompleted: stats.tasksCompleted,
    totalTasks: stats.totalTasks,
    totalXP: stats.totalXP,
    currentLevel: stats.currentLevel,
    consecutiveDays: stats.consecutiveDays,
    dailyTasks: stats.dailyTasks,
    priorityTasks: stats.priorityTasks,
    earlyTasks: stats.earlyTasks,
    lateTasks: stats.lateTasks,
    morningTasks: stats.morningTasks,
    afternoonTasks: stats.afternoonTasks,
    eveningTasks: stats.eveningTasks,
  }

  const nextAchievement = getNextAchievement(userStats)

  // Verificar achievements que podem ser desbloqueados
  useEffect(() => {
    if (!loading && achievements.length > 0 && !unlocking && isOpen) {
      const unlockableAchievements = achievements.filter(achievement => {
        if (achievement.unlocked) return false
        const progress = calculateAchievementProgress(achievement, userStats)
        return progress.percentage >= 100
      })

      // Desbloquear achievements automaticamente (apenas um por vez)
      if (unlockableAchievements.length > 0) {
        const achievement = unlockableAchievements[0]
        const unlockAchievementAsync = async () => {
          try {
            setUnlocking(achievement.id)
            await unlockAchievement(achievement.id)
          } catch (error) {
            console.error('Erro ao desbloquear achievement:', error)
          } finally {
            setUnlocking(null)
          }
        }
        unlockAchievementAsync()
      }
    }
  }, [achievements, loading, userStats, unlockAchievement, calculateAchievementProgress, unlocking, isOpen])

  const handleUnlockAchievement = async (achievement: Achievement) => {
    if (achievement.unlocked || unlocking) return

    try {
      setUnlocking(achievement.id)
      await unlockAchievement(achievement.id)
    } catch (error) {
      console.error('Erro ao desbloquear achievement:', error)
    } finally {
      setUnlocking(null)
    }
  }

  const getAchievementIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'tasks_completed': <Target className="h-4 w-4" />,
      'daily_tasks': <Calendar className="h-4 w-4" />,
      'consecutive_days': <TrendingUp className="h-4 w-4" />,
      'priority_tasks': <Star className="h-4 w-4" />,
      'total_tasks_created': <CheckCircle className="h-4 w-4" />,
      'total_tasks_completed': <Award className="h-4 w-4" />,
      'total_xp': <Zap className="h-4 w-4" />,
      'level': <Crown className="h-4 w-4" />,
      'early_tasks': <Clock className="h-4 w-4" />,
      'late_tasks': <Clock className="h-4 w-4" />,
      'morning_tasks': <Clock className="h-4 w-4" />,
      'afternoon_tasks': <Clock className="h-4 w-4" />,
      'evening_tasks': <Clock className="h-4 w-4" />,
    }
    return icons[type] || <Trophy className="h-4 w-4" />
  }

  const getRequirementText = (requirement: { type: string; value: number }) => {
    const texts: Record<string, string> = {
      'tasks_completed': 'Tarefas completadas',
      'daily_tasks': 'Tarefas em um dia',
      'consecutive_days': 'Dias consecutivos',
      'priority_tasks': 'Tarefas prioritárias',
      'total_tasks_created': 'Tarefas criadas',
      'total_tasks_completed': 'Tarefas completadas',
      'total_xp': 'XP total',
      'level': 'Nível',
      'early_tasks': 'Tarefas antes das 9h',
      'late_tasks': 'Tarefas após 22h',
      'morning_tasks': 'Tarefas da manhã (6h-12h)',
      'afternoon_tasks': 'Tarefas da tarde (12h-18h)',
      'evening_tasks': 'Tarefas da noite (18h-22h)',
    }
    return `${texts[requirement.type] || requirement.type}: ${requirement.value}`
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Conquistas
              </DialogTitle>
              <DialogDescription>
                Desbloqueie conquistas completando objetivos e ganhe XP extra!
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progresso Geral */}
          <Card className="bg-black/80 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Progresso Geral</h3>
                  <p className="text-sm text-muted-foreground">
                    {unlockedCount} de {totalCount} conquistas desbloqueadas
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {progressPercentage}%
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Próxima Conquista */}
          {nextAchievement && (
            <Card className="bg-black/80 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{nextAchievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Próxima Conquista</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {nextAchievement.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getAchievementIcon(nextAchievement.requirement.type)}
                      {getRequirementText(nextAchievement.requirement)}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span>{nextAchievement.progress.current}/{nextAchievement.progress.required}</span>
                      </div>
                      <Progress value={nextAchievement.progress.percentage} className="h-2" />
                    </div>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    +{nextAchievement.xpReward} XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Conquistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {achievements.map((achievement, index) => {
                const progress = calculateAchievementProgress(achievement, userStats)
                const canUnlock = !achievement.unlocked && progress.percentage >= 100
                const isUnlocking = unlocking === achievement.id

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                          : canUnlock
                          ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                          : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/30'
                      }`}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {achievement.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {achievement.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {achievement.unlocked ? (
                              <Unlock className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Progresso</span>
                            <span>{progress.current}/{progress.required}</span>
                          </div>
                          <Progress value={progress.percentage} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              +{achievement.xpReward} XP
                            </Badge>
                            
                            {canUnlock && !achievement.unlocked && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnlockAchievement(achievement)
                                }}
                                disabled={isUnlocking}
                                className="text-xs"
                              >
                                {isUnlocking ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : (
                                  <Sparkles className="h-3 w-3" />
                                )}
                                Desbloquear
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal de Detalhes da Conquista */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-md">
            {selectedAchievement && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedAchievement.icon}</span>
                    {selectedAchievement.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    {selectedAchievement.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {getAchievementIcon(selectedAchievement.requirement.type)}
                      <span>Requisito:</span>
                      <span className="font-medium">
                        {getRequirementText(selectedAchievement.requirement)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>Recompensa:</span>
                      <span className="font-medium">+{selectedAchievement.xpReward} XP</span>
                    </div>
                  </div>

                  {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                    <div className="text-sm text-muted-foreground">
                      Desbloqueado em: {new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
