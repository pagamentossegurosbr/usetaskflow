'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Target, 
  CheckCircle,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
    priority?: boolean;
    scheduledFor?: Date;
  }>;
  onAddTodo?: (text: string, priority?: boolean, scheduledFor?: Date) => void;
}

interface DayTasks {
  date: Date;
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    priority?: boolean;
    scheduledFor?: Date;
  }>;
}

export function CalendarModal({ isOpen, onClose, todos, onAddTodo }: CalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterMode, setFilterMode] = useState<'all' | 'scheduled' | 'completed' | 'pending'>('all');

  const scheduledTodos = todos.filter(todo => todo.scheduledFor);
  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  const getTasksForDate = (date: Date) => {
    return todos.filter(todo => {
      if (todo.scheduledFor) {
        return isSameDay(new Date(todo.scheduledFor), date);
      }
      return isSameDay(new Date(todo.createdAt), date);
    });
  };

  const getMonthTasks = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.map(day => ({
      date: day,
      tasks: getTasksForDate(day)
    }));
  };

  const getWeekTasks = () => {
    const weekStart = new Date(currentMonth);
    weekStart.setDate(currentMonth.getDate() - currentMonth.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return days.map(day => ({
      date: day,
      tasks: getTasksForDate(day)
    }));
  };

  const getFilteredTasks = (tasks: DayTasks[]) => {
    return tasks.map(day => ({
      ...day,
      tasks: day.tasks.filter(task => {
        switch (filterMode) {
          case 'scheduled':
            return task.scheduledFor;
          case 'completed':
            return task.completed;
          case 'pending':
            return !task.completed;
          default:
            return true;
        }
      })
    })).filter(day => day.tasks.length > 0);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleAddTaskForDate = () => {
    if (!selectedDate || !onAddTodo) return;
    
    const text = prompt('Digite o nome da tarefa:');
    if (text && text.trim()) {
      const priority = confirm('Marcar como prioritária?');
      onAddTodo(text.trim(), priority, selectedDate);
    }
  };

  const getTaskStats = () => {
    const totalScheduled = scheduledTodos.length;
    const completedScheduled = scheduledTodos.filter(todo => todo.completed).length;
    const pendingScheduled = totalScheduled - completedScheduled;
    
    return {
      total: totalScheduled,
      completed: completedScheduled,
      pending: pendingScheduled,
      completionRate: totalScheduled > 0 ? (completedScheduled / totalScheduled) * 100 : 0
    };
  };

  const stats = getTaskStats();
  const monthTasks = getFilteredTasks(getMonthTasks());
  const weekTasks = getFilteredTasks(getWeekTasks());
  const currentTasks = viewMode === 'month' ? monthTasks : weekTasks;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário de Tarefas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Agendadas</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-purple-600">{Math.round(stats.completionRate)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtro:</span>
                <select 
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">Todas</option>
                  <option value="scheduled">Agendadas</option>
                  <option value="completed">Concluídas</option>
                  <option value="pending">Pendentes</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Visualização:</span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Mês
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Semana
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTaskForDate}
                disabled={!selectedDate}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(currentMonth.getMonth() - 1);
                          setCurrentMonth(newMonth);
                        }}
                      >
                        ←
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMonth = new Date(currentMonth);
                          newMonth.setMonth(currentMonth.getMonth() + 1);
                          setCurrentMonth(newMonth);
                        }}
                      >
                        →
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    disabled={(date) => !isSameMonth(date, currentMonth)}
                    modifiers={{
                      today: (date) => isToday(date),
                      hasTasks: (date) => getTasksForDate(date).length > 0,
                      hasCompleted: (date) => getTasksForDate(date).some(task => task.completed),
                      hasPending: (date) => getTasksForDate(date).some(task => !task.completed)
                    }}
                    modifiersStyles={{
                      today: { backgroundColor: '#3b82f6', color: 'white' },
                      hasTasks: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
                      hasCompleted: { backgroundColor: '#dcfce7' },
                      hasPending: { backgroundColor: '#fef3c7' }
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Lista de Tarefas do Dia Selecionado */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? (
                      <span>
                        Tarefas de {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                        {isToday(selectedDate) && (
                          <Badge variant="secondary" className="ml-2">Hoje</Badge>
                        )}
                      </span>
                    ) : (
                      'Selecione uma data'
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma tarefa para este dia</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleAddTaskForDate}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Tarefa
                          </Button>
                        </div>
                      ) : (
                        getTasksForDate(selectedDate).map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${
                              task.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  task.completed ? 'line-through text-gray-500' : ''
                                }`}>
                                  {task.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {task.priority && (
                                    <Badge variant="destructive" className="text-xs">
                                      Prioritária
                                    </Badge>
                                  )}
                                  {task.completed && (
                                    <Badge variant="secondary" className="text-xs">
                                      Concluída
                                    </Badge>
                                  )}
                                  {task.scheduledFor && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Agendada
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Clique em uma data para ver as tarefas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lista de Tarefas do Período */}
          {currentTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Tarefas {viewMode === 'month' ? 'do Mês' : 'da Semana'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTasks.map((day) => (
                    <div key={day.date.toISOString()} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {format(day.date, 'EEEE, dd/MM', { locale: ptBR })}
                        {isToday(day.date) && (
                          <Badge variant="secondary">Hoje</Badge>
                        )}
                      </h4>
                      <div className="space-y-2">
                        {day.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-2 rounded border ${
                              task.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${
                                task.completed ? 'line-through text-gray-500' : ''
                              }`}>
                                {task.text}
                              </span>
                              <div className="flex items-center gap-1">
                                {task.priority && (
                                  <Badge variant="destructive" className="text-xs">
                                    P
                                  </Badge>
                                )}
                                {task.completed && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
