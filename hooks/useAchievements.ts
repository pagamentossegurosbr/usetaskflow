import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  requirement: {
    type: string
    value: number
  }
  unlocked: boolean
  unlockedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AchievementProgress {
  current: number
  required: number
  percentage: number
}

export function useAchievements() {
  const { data: session } = useSession()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar achievements do usuário
  const fetchAchievements = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/achievements')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar achievements')
      }

      const data = await response.json()
      setAchievements(data)
    } catch (err) {
      console.error('Erro ao buscar achievements:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      toast.error('Erro ao carregar achievements')
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  // Desbloquear achievement
  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/user/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievementId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao desbloquear achievement')
      }

      const data = await response.json()
      
      // Atualizar lista de achievements
      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() }
            : achievement
        )
      )

      // Mostrar notificação de sucesso
      const currentAchievement = achievements.find(a => a.id === achievementId)
      if (currentAchievement) {
        toast.success(`🏆 Achievement Desbloqueado: ${currentAchievement.name}!`, {
          description: `+${currentAchievement.xpReward} XP ganho!`
        })
      }

      return data
    } catch (err) {
      console.error('Erro ao desbloquear achievement:', err)
      toast.error(err instanceof Error ? err.message : 'Erro ao desbloquear achievement')
      throw err
    }
  }, [session?.user, achievements])

  // Calcular progresso de um achievement
  const calculateAchievementProgress = useCallback((
    achievement: Achievement, 
    userStats: {
      tasksCompleted: number
      totalTasks: number
      totalXP: number
      currentLevel: number
      consecutiveDays: number
      dailyTasks: number
      priorityTasks: number
      earlyTasks: number
      lateTasks: number
      morningTasks: number
      afternoonTasks: number
      eveningTasks: number
    }
  ): AchievementProgress => {
    if (achievement.unlocked) {
      return { 
        current: achievement.requirement.value, 
        required: achievement.requirement.value, 
        percentage: 100 
      }
    }

    const { type, value } = achievement.requirement
    let current = 0

    switch (type) {
      case 'tasks_completed':
        current = userStats.tasksCompleted
        break
      case 'daily_tasks':
        current = userStats.dailyTasks
        break
      case 'consecutive_days':
        current = userStats.consecutiveDays
        break
      case 'priority_tasks':
        current = userStats.priorityTasks
        break
      case 'total_tasks_created':
        current = userStats.totalTasks
        break
      case 'total_tasks_completed':
        current = userStats.tasksCompleted
        break
      case 'total_xp':
        current = userStats.totalXP
        break
      case 'level':
        current = userStats.currentLevel
        break
      case 'early_tasks':
        current = userStats.earlyTasks
        break
      case 'late_tasks':
        current = userStats.lateTasks
        break
      case 'morning_tasks':
        current = userStats.morningTasks
        break
      case 'afternoon_tasks':
        current = userStats.afternoonTasks
        break
      case 'evening_tasks':
        current = userStats.eveningTasks
        break
      default:
        current = 0
    }

    const percentage = Math.min(100, (current / value) * 100)
    return { current, required: value, percentage }
  }, [])

  // Verificar se um achievement pode ser desbloqueado
  const checkAchievementUnlock = useCallback((
    achievement: Achievement,
    userStats: {
      tasksCompleted: number
      totalTasks: number
      totalXP: number
      currentLevel: number
      consecutiveDays: number
      dailyTasks: number
      priorityTasks: number
      earlyTasks: number
      lateTasks: number
      morningTasks: number
      afternoonTasks: number
      eveningTasks: number
    }
  ): boolean => {
    if (achievement.unlocked) return false

    const progress = calculateAchievementProgress(achievement, userStats)
    return progress.percentage >= 100
  }, [calculateAchievementProgress])

  // Buscar próximo achievement mais próximo de ser desbloqueado
  const getNextAchievement = useCallback((
    userStats: {
      tasksCompleted: number
      totalTasks: number
      totalXP: number
      currentLevel: number
      consecutiveDays: number
      dailyTasks: number
      priorityTasks: number
      earlyTasks: number
      lateTasks: number
      morningTasks: number
      afternoonTasks: number
      eveningTasks: number
    }
  ): Achievement & { progress: AchievementProgress } | null => {
    const lockedAchievements = achievements.filter(a => !a.unlocked)
    
    if (lockedAchievements.length === 0) return null

    // Calcular progresso de todos os achievements bloqueados
    const achievementsWithProgress = lockedAchievements.map(achievement => ({
      ...achievement,
      progress: calculateAchievementProgress(achievement, userStats)
    }))

    // Ordenar por progresso (maior progresso primeiro)
    achievementsWithProgress.sort((a, b) => b.progress.percentage - a.progress.percentage)
    
    return achievementsWithProgress[0]
  }, [achievements, calculateAchievementProgress])

  // Carregar achievements quando a sessão estiver disponível
  useEffect(() => {
    if (session?.user && achievements.length === 0 && !loading) {
      fetchAchievements()
    }
  }, [session?.user, fetchAchievements, achievements.length, loading])

  // Função para forçar recarregamento dos achievements
  const refreshAchievements = useCallback(() => {
    if (session?.user) {
      fetchAchievements()
    }
  }, [session?.user, fetchAchievements])

  return {
    achievements,
    loading,
    error,
    fetchAchievements,
    refreshAchievements,
    unlockAchievement,
    calculateAchievementProgress,
    checkAchievementUnlock,
    getNextAchievement,
    unlockedCount: achievements.filter(a => a.unlocked).length,
    totalCount: achievements.length,
  }
}
