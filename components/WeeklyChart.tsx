'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductivityStats, Task } from '@/hooks/useProductivityLevel';
import { BarChart3, TrendingUp } from 'lucide-react';

interface WeeklyChartProps {
  stats: ProductivityStats;
  tasks: Task[];
}

export function WeeklyChart({ stats, tasks }: WeeklyChartProps) {
  const weeklyStats = stats.weeklyStats || {
    tasksCompleted: 0,
    totalTasks: 0,
    averageCompletionRate: 0,
    bestDay: 'N/A',
    mostProductiveHour: 'N/A',
    streakDays: 0
  };

  return (
    <Card className="p-4 border-border bg-card/50 backdrop-blur-sm animate-fade-in w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Dashboard Semanal</h2>
              <p className="text-xs text-muted-foreground">Produtividade da semana</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
            <TrendingUp className="h-3 w-3" />
            {weeklyStats.tasksCompleted}/{weeklyStats.totalTasks}
          </Badge>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso Semanal</span>
            <span className="font-medium text-foreground">
              {weeklyStats.averageCompletionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${weeklyStats.averageCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-2">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-green-400">{weeklyStats.tasksCompleted}</div>
                <div className="text-xs text-muted-foreground truncate">Concluídas</div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-blue-400">{weeklyStats.streakDays}</div>
                <div className="text-xs text-muted-foreground truncate">Dias Seguidos</div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-yellow-400 truncate">{weeklyStats.bestDay}</div>
                <div className="text-xs text-muted-foreground truncate">Melhor Dia</div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-purple-400 truncate">{weeklyStats.mostProductiveHour}</div>
                <div className="text-xs text-muted-foreground truncate">Hora Pico</div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="text-center p-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            {weeklyStats.averageCompletionRate >= 70 ? "Ótimo trabalho! Mantenha o foco!" : "Continue assim! Você está fazendo um bom trabalho."}
          </p>
        </div>
      </div>
    </Card>
  );
} 