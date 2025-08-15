'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  Activity,
  Brain,
  Trophy,
  Star,
  BarChart,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Lightbulb,
  Award,
  Lock
} from 'lucide-react';
import { Task } from '@/hooks/useProductivityLevel';

interface AdvancedTrackingChartProps {
  tasks: Task[];
  currentLevel: number;
  totalXP: number;
  isUnlocked: boolean;
}

interface TrackingData {
  hourlyProductivity: Array<{ hour: number; tasks: number; xp: number }>;
  weeklyPatterns: Array<{ day: string; tasks: number; xp: number; efficiency: number }>;
  monthlyTrends: Array<{ month: string; tasks: number; xp: number; growth: number; completionPercentage: number }>;
  productivityInsights: {
    bestHour: number;
    bestDay: string;
    averageTasksPerDay: number;
    completionRate: number;
    streakDays: number;
    totalSessions: number;
    focusScore: number;
  };
}

export function AdvancedTrackingChart({ tasks, currentLevel, totalXP, isUnlocked }: AdvancedTrackingChartProps) {
  const [selectedView, setSelectedView] = useState<'hourly' | 'weekly' | 'monthly' | 'insights'>('insights');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Gerar dados avançados de tracking
  const trackingData = useMemo((): TrackingData => {
    if (!isUnlocked || tasks.length === 0) {
      return {
        hourlyProductivity: [],
        weeklyPatterns: [],
        monthlyTrends: [],
        productivityInsights: {
          bestHour: 0,
          bestDay: 'N/A',
          averageTasksPerDay: 0,
          completionRate: 0,
          streakDays: 0,
          totalSessions: 0,
          focusScore: 0
        }
      };
    }

    const now = new Date();
    const completedTasks = tasks.filter(task => task.completed && task.completedAt);
    
    // Análise por hora do dia
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourTasks = completedTasks.filter(task => {
        const completedHour = new Date(task.completedAt!).getHours();
        return completedHour === hour;
      });
      
      return {
        hour,
        tasks: hourTasks.length,
        xp: hourTasks.length * 10
      };
    });

    // Análise semanal
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weeklyData = days.map((day, index) => {
      const dayTasks = completedTasks.filter(task => {
        const completedDate = new Date(task.completedAt!);
        return completedDate.getDay() === (index + 1) % 7;
      });
      
      const efficiency = dayTasks.length > 0 ? Math.min(100, dayTasks.length * 20) : 0;
      
      return {
        day,
        tasks: dayTasks.length,
        xp: dayTasks.length * 10,
        efficiency
      };
    });

    // Análise mensal (últimos 6 meses)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTasks = completedTasks.filter(task => {
        const taskDate = new Date(task.completedAt!);
        return taskDate.getMonth() === monthDate.getMonth() && 
               taskDate.getFullYear() === monthDate.getFullYear();
      });
      
      // Calcular o tempo total desde o primeiro momento até o final do mês
      const firstTaskDate = tasks.length > 0 ? new Date(tasks[0].createdAt) : now;
      const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const totalTimeInMonth = Math.min(monthEndDate.getTime(), now.getTime()) - Math.max(firstTaskDate.getTime(), monthDate.getTime());
      const totalTimeInMonthDays = Math.max(1, totalTimeInMonth / (24 * 60 * 60 * 1000));
      
      // Calcular a porcentagem baseada no tempo real disponível
      const expectedTasksPerDay = 3; // Média esperada de tarefas por dia
      const expectedTasksInMonth = totalTimeInMonthDays * expectedTasksPerDay;
      const completionPercentage = expectedTasksInMonth > 0 ? (monthTasks.length / expectedTasksInMonth) * 100 : 0;
      
      // Calcular crescimento real comparando com o mês anterior
      let growth = 0;
      if (i > 0) {
        const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const previousMonthTasks = completedTasks.filter(task => {
          const taskDate = new Date(task.completedAt!);
          return taskDate.getMonth() === previousMonthDate.getMonth() && 
                 taskDate.getFullYear() === previousMonthDate.getFullYear();
        });
        
        if (previousMonthTasks.length > 0) {
          growth = ((monthTasks.length - previousMonthTasks.length) / previousMonthTasks.length) * 100;
        } else if (monthTasks.length > 0) {
          growth = 100; // Crescimento de 100% se não havia tarefas no mês anterior
        }
      }
      
      return {
        month: monthDate.toLocaleDateString('pt-BR', { month: 'short' }),
        tasks: monthTasks.length,
        xp: monthTasks.length * 10,
        growth: Math.round(growth),
        completionPercentage: Math.round(completionPercentage)
      };
    }).reverse();

    // Insights de produtividade melhorados
    const bestHourData = hourlyData.reduce((max, current) => 
      current.tasks > max.tasks ? current : max, hourlyData[0]);
    
    const bestDayData = weeklyData.reduce((max, current) => 
      current.tasks > max.tasks ? current : max, weeklyData[0]);
    
    // Calcular dias desde o início de forma mais precisa
    const firstTaskDate = tasks.length > 0 ? new Date(tasks[0].createdAt) : now;
    const totalDays = Math.max(1, Math.ceil((now.getTime() - firstTaskDate.getTime()) / (24 * 60 * 60 * 1000)));
    
    // Média de tarefas por dia mais realista
    const averageTasksPerDay = totalDays > 0 ? completedTasks.length / totalDays : 0;
    
    // Taxa de conclusão mais precisa
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Calcular streak real baseado em dias consecutivos
    let streakDays = 0;
    if (completedTasks.length > 0) {
      const sortedTasks = completedTasks
        .map(task => new Date(task.completedAt!).toDateString())
        .sort()
        .filter((date, index, arr) => arr.indexOf(date) === index); // Remover duplicatas
      
      let currentStreak = 1;
      let maxStreak = 1;
      
      for (let i = 1; i < sortedTasks.length; i++) {
        const currentDate = new Date(sortedTasks[i]);
        const previousDate = new Date(sortedTasks[i - 1]);
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (dayDiff === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      streakDays = maxStreak;
    }
    
    // Total de sessões baseado em padrões reais
    const totalSessions = Math.max(1, Math.ceil(completedTasks.length / Math.max(1, averageTasksPerDay)));
    
    // Score de foco mais sofisticado
    const consistencyBonus = Math.min(20, streakDays * 2); // Bônus por consistência
    const completionBonus = Math.min(30, completionRate * 0.3); // Bônus por conclusão
    const productivityBonus = Math.min(25, averageTasksPerDay * 8); // Bônus por produtividade
    const timeEfficiencyBonus = Math.min(25, (bestHourData?.tasks || 0) * 3); // Bônus por eficiência horária
    
    const focusScore = Math.min(100, Math.max(10, 
      consistencyBonus + completionBonus + productivityBonus + timeEfficiencyBonus
    ));

    return {
      hourlyProductivity: hourlyData,
      weeklyPatterns: weeklyData,
      monthlyTrends: monthlyData,
      productivityInsights: {
        bestHour: bestHourData?.hour || 0,
        bestDay: bestDayData?.day || 'N/A',
        averageTasksPerDay,
        completionRate,
        streakDays,
        totalSessions,
        focusScore
      }
    };
  }, [tasks, isUnlocked]);

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
    if (isUnlocked && trackingData.hourlyProductivity.length > 0 && !isAnimating) {
      setAnimationProgress(0);
      setIsAnimating(true);
    }
  }, [trackingData.hourlyProductivity.length, isUnlocked, isAnimating]);

  if (!isUnlocked) {
    return (
      <Card className="p-6 border-border bg-card/50 backdrop-blur-sm animate-fade-in rounded-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-purple-500/20">
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tracking Avançado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Desbloqueie no nível 5 para acessar análises detalhadas de produtividade, 
              padrões de tempo e insights personalizados.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-500 font-medium">
                Nível 5 Requerido
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-purple-500/30 bg-gradient-to-br from-black via-gray-900/90 to-black backdrop-blur-sm animate-fade-in rounded-2xl hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20 hover:bg-gradient-to-br hover:from-black hover:via-gray-800/90 hover:to-black transition-all duration-300 relative group before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-purple-500/0 before:via-purple-500/5 before:to-purple-500/0 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-transparent after:via-black/20 after:to-transparent after:opacity-0 after:group-hover:opacity-100 after:transition-opacity after:duration-700 after:pointer-events-none">
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-400/30 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-purple-500 group-hover:text-purple-400 transition-colors duration-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-purple-100 transition-colors duration-300">Tracking Avançado</h3>
              <p className="text-xs text-muted-foreground">
                Análises detalhadas de produtividade
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
            <TrendingUp className="h-3 w-3 group-hover:text-purple-400 transition-colors duration-300" />
            Nível {currentLevel}
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'insights' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('insights')}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-3 w-3" />
            Insights
          </Button>
          <Button
            variant={selectedView === 'hourly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('hourly')}
            className="flex items-center gap-2"
          >
            <Clock className="h-3 w-3" />
            Por Hora
          </Button>
          <Button
            variant={selectedView === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('weekly')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-3 w-3" />
            Semanal
          </Button>
          <Button
            variant={selectedView === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('monthly')}
            className="flex items-center gap-2"
          >
            <BarChart className="h-3 w-3" />
            Mensal
          </Button>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'insights' && (
          <div className="space-y-4">
            {/* Focus Score */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold text-foreground">Score de Foco</h4>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-2">
                  {trackingData.productivityInsights.focusScore.toFixed(0)}
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${trackingData.productivityInsights.focusScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Baseado em conclusão, consistência e produtividade
                </p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Taxa de Conclusão</span>
                </div>
                <div className="text-xl font-bold text-green-500">
                  {trackingData.productivityInsights.completionRate.toFixed(1)}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Melhor Hora</span>
                </div>
                <div className="text-xl font-bold text-blue-500">
                  {trackingData.productivityInsights.bestHour > 0 ? 
                    `${trackingData.productivityInsights.bestHour}h` : 
                    'N/A'
                  }
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">Melhor Dia</span>
                </div>
                <div className="text-xl font-bold text-orange-500">
                  {trackingData.productivityInsights.bestDay}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-foreground">Sequência</span>
                </div>
                <div className="text-xl font-bold text-red-500">
                  {trackingData.productivityInsights.streakDays > 0 ? 
                    `${trackingData.productivityInsights.streakDays} dias` : 
                    '0 dias'
                  }
                </div>
              </div>
            </div>

            {/* Productivity Tips */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h4 className="font-semibold text-foreground">Dicas de Produtividade</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {trackingData.productivityInsights.bestHour > 0 ? 
                      `Você é mais produtivo às ${trackingData.productivityInsights.bestHour}h - agende tarefas importantes neste horário` :
                      'Complete mais tarefas para descobrir seu horário mais produtivo'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {trackingData.productivityInsights.bestDay !== 'N/A' ? 
                      `${trackingData.productivityInsights.bestDay} é seu dia mais produtivo - aproveite para tarefas complexas` :
                      'Continue trabalhando para identificar seu dia mais produtivo'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {trackingData.productivityInsights.streakDays > 1 ? 
                      `Mantenha sua sequência de ${trackingData.productivityInsights.streakDays} dias para maximizar o progresso` :
                      'Tente completar tarefas em dias consecutivos para aumentar sua sequência'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {trackingData.productivityInsights.completionRate > 80 ? 
                      'Excelente taxa de conclusão! Continue mantendo esse ritmo' :
                      trackingData.productivityInsights.completionRate > 50 ?
                      'Sua taxa de conclusão pode melhorar - foque em completar mais tarefas' :
                      'Tente completar mais tarefas para melhorar sua produtividade'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-muted-foreground">
                    {trackingData.productivityInsights.focusScore > 70 ? 
                      'Seu score de foco está excelente! Mantenha essa consistência' :
                      trackingData.productivityInsights.focusScore > 40 ?
                      'Seu score de foco pode melhorar - foque em completar tarefas regularmente' :
                      'Complete mais tarefas para melhorar seu score de foco'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'hourly' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Produtividade por Hora
            </h4>
            <div className="space-y-2">
              {trackingData.hourlyProductivity.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 text-sm font-medium text-muted-foreground">
                    {data.hour.toString().padStart(2, '0')}h
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(100, (data.tasks / Math.max(...trackingData.hourlyProductivity.map(d => d.tasks))) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-foreground">
                    {data.tasks} tarefas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'weekly' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Padrões Semanais
            </h4>
            <div className="space-y-3">
              {trackingData.weeklyPatterns.map((data, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{data.day}</span>
                    <Badge variant="secondary" className="text-xs">
                      {data.efficiency.toFixed(0)}% eficiência
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${data.efficiency}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.tasks} tarefas • {data.xp} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'monthly' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Tendências Mensais
            </h4>
            <div className="space-y-3">
              {trackingData.monthlyTrends.map((data, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{data.month}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={data.completionPercentage >= 80 ? "default" : data.completionPercentage >= 50 ? "secondary" : "destructive"} 
                        className="text-xs"
                      >
                        {data.completionPercentage}% completo
                      </Badge>
                      <Badge 
                        variant={data.growth >= 0 ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {data.growth >= 0 ? '+' : ''}{data.growth}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          data.completionPercentage >= 80 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : data.completionPercentage >= 50 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(100, data.completionPercentage)}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.tasks} tarefas • {data.xp} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 