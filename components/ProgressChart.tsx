'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { Task } from '@/hooks/useProductivityLevel';

interface ProgressChartProps {
  tasks: Task[];
  currentLevel: number;
  totalXP: number;
  isUnlocked: boolean;
}

interface ChartDataPoint {
  date: string;
  tasksCompleted: number;
  xpGained: number;
  level: number;
}

export function ProgressChart({ tasks, currentLevel, totalXP, isUnlocked }: ProgressChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Gerar dados do gráfico baseado no período selecionado - MELHORADO
  const chartData = useMemo(() => {
    if (!isUnlocked || tasks.length === 0) return [];

    const now = new Date();
    const data: ChartDataPoint[] = [];
    
    let startDate: Date;
    let daysToShow: number;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        daysToShow = 7;
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        daysToShow = 30;
        break;
      case 'all':
        startDate = new Date(tasks[0]?.createdAt || now);
        daysToShow = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        break;
    }

    // Filtrar tarefas completadas
    const completedTasks = tasks.filter(task => task.completedAt);
    
    // Calcular XP total real
    const totalRealXP = completedTasks.reduce((sum, task) => {
      const baseXP = 10;
      const priorityBonus = task.priority ? 5 : 0;
      return sum + baseXP + priorityBonus;
    }, 0);

    // Gerar pontos de dados para cada dia
    for (let i = 0; i <= daysToShow; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Filtrar tarefas completadas neste dia específico
      const dayTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.completedAt!).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      // Calcular XP ganho real baseado nas tarefas do dia
      const xpGained = dayTasks.reduce((sum, task) => {
        const baseXP = 10;
        const priorityBonus = task.priority ? 5 : 0;
        return sum + baseXP + priorityBonus;
      }, 0);

      // Calcular XP acumulado até este dia
      const accumulatedXP = completedTasks
        .filter(task => new Date(task.completedAt!) <= currentDate)
        .reduce((sum, task) => {
          const baseXP = 10;
          const priorityBonus = task.priority ? 5 : 0;
          return sum + baseXP + priorityBonus;
        }, 0);

      // Calcular nível baseado no XP acumulado real
      const level = Math.floor(accumulatedXP / 100) + 1;

      data.push({
        date: dateStr,
        tasksCompleted: dayTasks.length,
        xpGained,
        level: Math.min(level, currentLevel)
      });
    }

    return data;
  }, [tasks, selectedPeriod, currentLevel, isUnlocked]);

  // Animação do gráfico
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          setIsAnimating(false);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Iniciar animação quando dados mudam
  useEffect(() => {
    if (isUnlocked && chartData.length > 0 && !isAnimating) {
      setAnimationProgress(0);
      setIsAnimating(true);
    }
  }, [chartData.length, isUnlocked, isAnimating]);

  if (!isUnlocked) {
    return (
              <Card className="p-6 border-border bg-black/80 backdrop-blur-sm animate-fade-in rounded-2xl">
        <div className="text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Gráfico de Progresso
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Atinga o nível 3 para desbloquear o gráfico de progresso detalhado
            </p>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
              <Target className="h-3 w-3 mr-1" />
              Nível 3 Requerido
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  const maxTasks = Math.max(...chartData.map(d => d.tasksCompleted), 1);
  const maxXP = Math.max(...chartData.map(d => d.xpGained), 1);

  return (
            <Card className="p-6 border-emerald-500/30 bg-gradient-to-br from-black via-gray-900/90 to-black backdrop-blur-sm animate-fade-in rounded-2xl hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/20 hover:bg-gradient-to-br hover:from-black hover:via-gray-800/90 hover:to-black transition-all duration-300 relative group before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-emerald-500/0 before:via-emerald-500/5 before:to-emerald-500/0 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-transparent after:via-black/20 after:to-transparent after:opacity-0 after:group-hover:opacity-100 after:transition-opacity after:duration-700 after:pointer-events-none">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-400/30 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-100 transition-colors duration-300">Gráfico de Progresso</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe sua evolução desde o início
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 group-hover:bg-emerald-400/30 group-hover:border-emerald-400/40 transition-all duration-300">
            <Zap className="h-3 w-3 mr-1 group-hover:text-emerald-400 transition-colors duration-300" />
            Desbloqueado
          </Badge>
        </div>

        {/* Controles de Período */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
              className="text-xs"
            >
              7 Dias
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
              className="text-xs"
            >
              30 Dias
            </Button>
            <Button
              variant={selectedPeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('all')}
              className="text-xs"
            >
              Total
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnimationProgress(0);
              setIsAnimating(true);
            }}
            disabled={isAnimating}
            className="text-xs"
          >
            {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isAnimating ? 'Animando...' : 'Animar'}
          </Button>
        </div>

        {/* Gráfico */}
        <div className="space-y-4">
          {/* Tarefas Completadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tarefas Completadas</span>
              <span className="font-medium text-foreground">
                {chartData.reduce((sum, d) => sum + d.tasksCompleted, 0)} total
              </span>
            </div>
            <div className="relative h-32 bg-muted/20 rounded-lg p-4">
              <div className="flex items-end justify-between h-full gap-1">
                {chartData.map((point, index) => {
                  const height = (point.tasksCompleted / maxTasks) * 100;
                  const opacity = (index / chartData.length) * (animationProgress / 100);
                  
                  return (
                    <TooltipProvider key={point.date}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                                                     <div
                             className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-500 chart-bar-glow"
                             style={{
                               height: `${height}%`,
                               opacity: Math.min(opacity, 1),
                               minHeight: '4px'
                             }}
                           />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{new Date(point.date).toLocaleDateString('pt-BR')}</p>
                            <p className="text-sm text-muted-foreground">
                              {point.tasksCompleted} tarefa{point.tasksCompleted !== 1 ? 's' : ''} completada{point.tasksCompleted !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-emerald-500">
                              +{point.xpGained} XP ganho
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Nível {point.level} alcançado
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          </div>

          {/* XP Ganho */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP Ganho</span>
              <span className="font-medium text-foreground">
                {chartData.reduce((sum, d) => sum + d.xpGained, 0)} total
              </span>
            </div>
            <div className="relative h-32 bg-muted/20 rounded-lg p-4">
              <div className="flex items-end justify-between h-full gap-1">
                {chartData.map((point, index) => {
                  const height = (point.xpGained / maxXP) * 100;
                  const opacity = (index / chartData.length) * (animationProgress / 100);
                  
                  return (
                    <TooltipProvider key={`xp-${point.date}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                                                     <div
                             className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 chart-bar-glow"
                             style={{
                               height: `${height}%`,
                               opacity: Math.min(opacity, 1),
                               minHeight: '4px'
                             }}
                           />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{point.date}</p>
                            <p className="text-sm text-blue-500">
                              +{point.xpGained} XP ganho
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Nível {point.level}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {tasks.filter(t => t.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">Tarefas Totais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {tasks.filter(t => t.completed).reduce((sum, task) => {
                  const baseXP = 10;
                  const priorityBonus = task.priority ? 5 : 0;
                  return sum + baseXP + priorityBonus;
                }, 0)}
              </div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {currentLevel}
              </div>
              <div className="text-xs text-muted-foreground">Nível Atual</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 