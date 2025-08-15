'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Todo } from '@/app/page';
import { CalendarDays, TrendingUp, Award } from 'lucide-react';

interface StatsChartProps {
  todos: Todo[];
}

export function StatsChart({ todos }: StatsChartProps) {
  const weeklyData = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      
      const completed = todos.filter(todo => {
        if (!todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;

      const created = todos.filter(todo => {
        const createdDate = new Date(todo.createdAt);
        return createdDate.toDateString() === date.toDateString();
      }).length;

      return {
        day,
        completed,
        created,
        date: date.toDateString()
      };
    });
  }, [todos]);

  const pieData = useMemo(() => {
    const completed = todos.filter(todo => todo.completed).length;
    const pending = todos.length - completed;
    
    return [
      { name: 'Concluídas', value: completed, color: '#10b981' },
      { name: 'Pendentes', value: pending, color: '#3b82f6' },
    ];
  }, [todos]);

  const totalCompleted = todos.filter(todo => todo.completed).length;
  const completionRate = todos.length > 0 ? (totalCompleted / todos.length * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Estatísticas</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <CalendarDays className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{todos.length}</div>
              <div className="text-xs text-muted-foreground">Total de Tarefas</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Award className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{completionRate.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Taxa de Conclusão</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Performance Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Desempenho Semanal</h3>
          <Badge variant="outline">Esta Semana</Badge>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Bar 
                dataKey="completed" 
                name="Concluídas"
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Bar 
                dataKey="created" 
                name="Criadas"
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      {todos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Distribuição</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}