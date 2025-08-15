'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Trophy,
  Download,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
    priority?: boolean;
  }>;
  currentLevel: number;
  totalXP: number;
}

interface ChartData {
  date: string;
  tasks: number;
  completed: number;
  xp: number;
}

interface WeeklyStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageTasksPerDay: number;
  bestDay: string;
  mostProductiveHour: string;
  priorityTasks: number;
}

export function StatsModal({ isOpen, onClose, todos, currentLevel, totalXP }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateChartData();
      calculateWeeklyStats();
    }
  }, [isOpen, todos, timeRange]);

  const generateChartData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data: ChartData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayTodos = todos.filter(todo => {
        const todoDate = format(new Date(todo.createdAt), 'yyyy-MM-dd');
        return todoDate === dateStr;
      });

      const completedTodos = dayTodos.filter(todo => todo.completed);
      const xpGained = completedTodos.length * 10; // 10 XP por tarefa

      data.push({
        date: format(date, 'dd/MM'),
        tasks: dayTodos.length,
        completed: completedTodos.length,
        xp: xpGained
      });
    }

    setChartData(data);
  };

  const calculateWeeklyStats = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: ptBR });
    const weekEnd = endOfWeek(now, { locale: ptBR });
    
    const weekTodos = todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate >= weekStart && todoDate <= weekEnd;
    });

    const completedTodos = weekTodos.filter(todo => todo.completed);
    const priorityTodos = weekTodos.filter(todo => todo.priority);

    // Calcular melhor dia
    const dayStats = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
      const dayTodos = weekTodos.filter(todo => {
        const todoDate = new Date(todo.createdAt);
        return format(todoDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        day: format(day, 'EEEE', { locale: ptBR }),
        count: dayTodos.filter(todo => todo.completed).length
      };
    });

    const bestDay = dayStats.reduce((max, current) => 
      current.count > max.count ? current : max
    ).day;

    setWeeklyStats({
      totalTasks: weekTodos.length,
      completedTasks: completedTodos.length,
      completionRate: weekTodos.length > 0 ? (completedTodos.length / weekTodos.length) * 100 : 0,
      averageTasksPerDay: weekTodos.length / 7,
      bestDay,
      mostProductiveHour: '14:00', // Placeholder
      priorityTasks: priorityTodos.length
    });
  };

  const getProductivityScore = () => {
    if (!weeklyStats) return 0;
    const baseScore = weeklyStats.completionRate;
    const bonusScore = weeklyStats.priorityTasks * 5;
    return Math.min(100, baseScore + bonusScore);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas Detalhadas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Período:</span>
              <div className="flex gap-1">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="charts">Gráficos</TabsTrigger>
              <TabsTrigger value="productivity">Produtividade</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todos.length}</div>
                    <p className="text-xs text-muted-foreground">
                      +{todos.filter(t => new Date(t.createdAt) > subDays(new Date(), 7)).length} esta semana
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {todos.filter(t => t.completed).length} de {todos.length} concluídas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">XP Total</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalXP}</div>
                    <p className="text-xs text-muted-foreground">
                      Nível {currentLevel}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tarefas Prioritárias</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todos.filter(t => t.priority).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {todos.filter(t => t.priority && t.completed).length} concluídas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {weeklyStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas da Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalTasks}</div>
                        <div className="text-sm text-muted-foreground">Total de Tarefas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{weeklyStats.completedTasks}</div>
                        <div className="text-sm text-muted-foreground">Concluídas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{Math.round(weeklyStats.completionRate)}%</div>
                        <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{weeklyStats.bestDay}</div>
                        <div className="text-sm text-muted-foreground">Melhor Dia</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progresso Diário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completed" stroke="#8884d8" strokeWidth={2} />
                        <Line type="monotone" dataKey="tasks" stroke="#82ca9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>XP Ganho</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="xp" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score de Produtividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-purple-600">
                      {getProductivityScore()}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      Pontos de Produtividade
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${getProductivityScore()}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {weeklyStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas da Semana</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Média de Tarefas/Dia:</span>
                        <Badge variant="secondary">{weeklyStats.averageTasksPerDay.toFixed(1)}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarefas Prioritárias:</span>
                        <Badge variant="destructive">{weeklyStats.priorityTasks}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Hora Mais Produtiva:</span>
                        <Badge variant="outline">{weeklyStats.mostProductiveHour}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {weeklyStats.completionRate < 70 && (
                        <div className="text-sm text-orange-600">
                          ⚠️ Sua taxa de conclusão está baixa. Tente definir metas menores.
                        </div>
                      )}
                      {weeklyStats.priorityTasks === 0 && (
                        <div className="text-sm text-blue-600">
                          💡 Use tarefas prioritárias para focar no que é mais importante.
                        </div>
                      )}
                      {weeklyStats.averageTasksPerDay < 3 && (
                        <div className="text-sm text-green-600">
                          🎯 Você pode aumentar sua produtividade definindo mais tarefas.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Insights Personalizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">🎯 Padrão de Produtividade</h4>
                      <p className="text-blue-700">
                        Você é mais produtivo aos {weeklyStats?.bestDay || 'fins de semana'}. 
                        Aproveite esse padrão para agendar suas tarefas mais importantes.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">📈 Progresso</h4>
                      <p className="text-green-700">
                        Sua taxa de conclusão de {Math.round(weeklyStats?.completionRate || 0)}% está 
                        {weeklyStats && weeklyStats.completionRate > 80 ? ' excelente!' : 
                         weeklyStats && weeklyStats.completionRate > 60 ? ' boa!' : ' abaixo do ideal.'}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🚀 Próximos Passos</h4>
                      <ul className="text-purple-700 space-y-1">
                        <li>• Defina mais tarefas prioritárias para focar no essencial</li>
                        <li>• Use o modo foco para aumentar sua concentração</li>
                        <li>• Complete o tutorial para desbloquear mais funcionalidades</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
