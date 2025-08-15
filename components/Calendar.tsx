'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, CheckCircle, Clock, Download, Upload, BarChart3, TrendingUp, Users, Target, Star, Zap, BookOpen, Briefcase, Plane, Home, Heart, Coffee, Bookmark, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, isSameWeek, isSameYear, getWeek, eachWeekOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCalendarData, Appointment, APPOINTMENT_CATEGORIES } from '@/hooks/useCalendarData';
import { debug } from '@/lib/debug';

interface CalendarProps {
  completedTasks: Array<{ id: string; text: string; completedAt: string }>;
  scheduledTasks?: Array<{ id: string; text: string; scheduledFor: string; priority?: boolean }>;
  currentLevel: number;
  showScheduledTasks?: boolean;
  onToggleScheduledTasks?: () => void;
}

// Categorias de dia personalizadas
const DAY_CATEGORIES = [
  { id: 'study', name: 'Estudo', icon: BookOpen, color: 'bg-blue-500', textColor: 'text-blue-500' },
  { id: 'work', name: 'Trabalho', icon: Briefcase, color: 'bg-green-500', textColor: 'text-green-500' },
  { id: 'travel', name: 'Viagem', icon: Plane, color: 'bg-purple-500', textColor: 'text-purple-500' },
  { id: 'home', name: 'Casa', icon: Home, color: 'bg-orange-500', textColor: 'text-orange-500' },
  { id: 'health', name: 'Saúde', icon: Heart, color: 'bg-red-500', textColor: 'text-red-500' },
  { id: 'break', name: 'Pausa', icon: Coffee, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { id: 'personal', name: 'Pessoal', icon: Bookmark, color: 'bg-pink-500', textColor: 'text-pink-500' },
];

// Sugestões de título por categoria
const TITLE_SUGGESTIONS = {
  study: [
    "Estudar React - Capítulo 3",
    "Revisar conceitos de TypeScript",
    "Fazer exercícios de lógica",
    "Ler documentação do Next.js",
    "Praticar algoritmos",
    "Estudar design patterns"
  ],
  work: [
    "Reunião com cliente",
    "Revisar código do projeto",
    "Planejamento semanal",
    "Atualizar documentação",
    "Code review",
    "Standup diário"
  ],
  travel: [
    "Viagem para São Paulo",
    "Reservar hotel",
    "Comprar passagens",
    "Organizar documentos",
    "Fazer checklist de viagem",
    "Reunião com equipe remota"
  ],
  home: [
    "Limpeza da casa",
    "Organizar armários",
    "Manutenção doméstica",
    "Decorar ambiente",
    "Planejar refeições",
    "Arrumar quarto"
  ],
  health: [
    "Consulta médica",
    "Exercícios físicos",
    "Exame de sangue",
    "Sessão de fisioterapia",
    "Meditação",
    "Consulta nutricionista"
  ],
  break: [
    "Pausa para café",
    "Almoço com amigos",
    "Descanso mental",
    "Pausa para alongamento",
    "Momento de lazer",
    "Pausa para respirar"
  ],
  personal: [
    "Conversa com família",
    "Hobby favorito",
    "Momento de reflexão",
    "Atividade pessoal",
    "Tempo com amigos",
    "Autocuidado"
  ],
  other: [
    "Compromisso importante",
    "Reunião",
    "Evento",
    "Tarefa pendente",
    "Lembrete",
    "Atividade"
  ]
};

export function Calendar({ 
  completedTasks, 
  scheduledTasks = [], 
  currentLevel, 
  showScheduledTasks = true,
  onToggleScheduledTasks 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    time: '',
    description: '',
    category: 'other'
  });
  const [dayCategories, setDayCategories] = useState<Record<string, string>>({});

  const {
    appointments,
    addAppointment,
    removeAppointment,
    getAppointmentsByDate,
    hasAppointmentsOnDate,
    getAppointmentCategoriesOnDate,
    exportAppointments,
    importAppointments,
  } = useCalendarData();

  // Calcular semanas do mês atual
  const monthWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachWeekOfInterval({ start, end });
  }, [currentDate]);

  // Verificar se um dia é produtivo (tem tarefas completadas)
  const isProductiveDay = useCallback((date: Date) => {
    return completedTasks.some(task => 
      isSameDay(new Date(task.completedAt), date)
    );
  }, [completedTasks]);

  // Verificar se um dia tem tarefas agendadas
  const hasScheduledTasks = useCallback((date: Date) => {
    return scheduledTasks.some(task => 
      isSameDay(new Date(task.scheduledFor), date)
    );
  }, [scheduledTasks]);

  // Obter tarefas agendadas de um dia específico
  const getDayScheduledTasks = useCallback((date: Date) => {
    return scheduledTasks.filter(task => 
      isSameDay(new Date(task.scheduledFor), date)
    );
  }, [scheduledTasks]);

  // Obter nível de produtividade de um dia
  const getProductivityLevel = useCallback((date: Date) => {
    const dayTasks = completedTasks.filter(task => 
      isSameDay(new Date(task.completedAt), date)
    );
    const count = dayTasks.length;
    
    if (count === 0) return 0;
    if (count <= 3) return 1;
    return 2;
  }, [completedTasks]);

  // Obter classe de cor baseada na produtividade
  const getProductivityColor = useCallback((level: number) => {
    switch (level) {
      case 0: return 'bg-transparent';
      case 1: return 'bg-green-500/20 hover:bg-green-500/30';
      case 2: return 'bg-green-600/30 hover:bg-green-600/40';
      default: return 'bg-transparent';
    }
  }, []);

  // Verificar se um dia tem compromissos
  const hasAppts = useCallback((date: Date) => {
    return hasAppointmentsOnDate(date);
  }, [hasAppointmentsOnDate]);

  // Obter compromissos de um dia específico
  const getDayAppointments = useCallback((date: Date) => {
    return getAppointmentsByDate(date);
  }, [getAppointmentsByDate]);

  // Obter tarefas completadas de um dia específico
  const getDayCompletedTasks = useCallback((date: Date) => {
    return completedTasks.filter(task => 
      isSameDay(new Date(task.completedAt), date)
    );
  }, [completedTasks]);

  // Obter tarefas pendentes de um dia específico
  const getDayPendingTasks = useCallback((date: Date) => {
    // Simular tarefas pendentes (você pode adaptar conforme sua lógica)
    return [];
  }, []);

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Abrir modal de detalhes do dia
  const openDayDetails = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  // Fechar modal e limpar dados
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setNewAppointment({
      title: '',
      time: '',
      description: '',
      category: 'other'
    });
  };

  // Selecionar semana
  const selectWeek = (weekStart: Date) => {
    setSelectedWeek(selectedWeek && isSameWeek(selectedWeek, weekStart) ? null : weekStart);
  };

  // Adicionar categoria ao dia
  const addDayCategory = (date: Date, categoryId: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setDayCategories(prev => ({
      ...prev,
      [dateKey]: categoryId
    }));
  };

  // Remover categoria do dia
  const removeDayCategory = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setDayCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[dateKey];
      return newCategories;
    });
  };

  // Obter categoria do dia
  const getDayCategory = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return dayCategories[dateKey];
  };

  // Obter sugestão de título baseada na categoria
  const getTitleSuggestion = (category: string) => {
    const suggestions = TITLE_SUGGESTIONS[category as keyof typeof TITLE_SUGGESTIONS] || TITLE_SUGGESTIONS.other;
    const randomIndex = Math.floor(Math.random() * suggestions.length);
    return suggestions[randomIndex];
  };

  // Atualizar categoria e sugerir título
  const updateCategory = (category: string) => {
    setNewAppointment(prev => ({
      ...prev,
      category,
      title: prev.title || getTitleSuggestion(category)
    }));
  };

  // Adicionar novo compromisso
  const handleAddAppointment = () => {
    if (!selectedDate || !newAppointment.title || !newAppointment.time) return;

    const appointment: Omit<Appointment, 'id'> = {
      title: newAppointment.title,
      time: newAppointment.time,
      description: newAppointment.description,
      category: newAppointment.category,
      date: selectedDate.toISOString()
    };

    addAppointment(appointment);
    closeDialog();
  };

  // Remover compromisso
  const handleRemoveAppointment = (appointmentId: string) => {
    removeAppointment(appointmentId);
  };

  // Calcular total de tarefas completadas na semana atual
  const weeklyCompletedTasks = useMemo(() => {
    return completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt);
      return isSameWeek(taskDate, new Date());
    }).length;
  }, [completedTasks]);

  // Estatísticas da semana selecionada
  const selectedWeekStats = useMemo(() => {
    if (!selectedWeek) return null;
    
    const weekEnd = endOfWeek(selectedWeek);
    const weekTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt);
      return isSameWeek(taskDate, selectedWeek);
    });
    
    const weekAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameWeek(appointmentDate, selectedWeek);
    });

    return {
      tasks: weekTasks.length,
      appointments: weekAppointments.length,
      productiveDays: weekTasks.length > 0 ? 1 : 0,
      totalDays: 7
    };
  }, [selectedWeek, completedTasks, appointments]);

  // Obter frase motivacional baseada no nível de produtividade
  const getMotivationalPhrase = (date: Date) => {
    const dayTasks = getDayCompletedTasks(date);
    const dayAppointments = getDayAppointments(date);
    
    if (dayTasks.length === 0 && dayAppointments.length === 0) {
      return "Um novo dia para conquistar! 💪";
    }
    
    if (dayTasks.length >= 4) {
      return "Dia incrível! Você está arrasando! 🚀";
    }
    
    if (dayTasks.length > 0) {
      return "Bom trabalho! Continue assim! ✨";
    }
    
    return "Compromissos organizados! 📅";
  };

  // Verificar se todas as tarefas do dia foram completadas
  const isDayComplete = useCallback((date: Date) => {
    const dayTasks = getDayCompletedTasks(date);
    const dayAppointments = getDayAppointments(date);
    
    if (dayTasks.length === 0 && dayAppointments.length === 0) {
      return false;
    }
    
    if (dayAppointments.length > 0) {
      return dayTasks.length > 0;
    }
    
    return dayTasks.length >= 3;
  }, [getDayCompletedTasks, getDayAppointments]);

  // Obter cor da categoria
  const getCategoryColor = (categoryId: string) => {
    const category = APPOINTMENT_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.color || 'gray';
  };

  // Obter ícone da categoria
  const getCategoryIcon = (categoryId: string) => {
    const category = APPOINTMENT_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.icon || '📌';
  };

  // Obter nome da categoria
  const getCategoryName = (categoryId: string) => {
    const category = APPOINTMENT_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.name || 'Outro';
  };

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importAppointments(file)
        .then(() => {
          debug.log('Compromissos importados com sucesso!');
        })
        .catch((error) => {
          console.error('Erro ao importar compromissos:', error);
        });
    }
  };

  return (
    <div className="h-full flex flex-col p-3">
      {/* Badge de produtividade semanal */}
      <div className="mb-3">
        <Badge variant="secondary" className="w-full justify-center py-1.5 text-xs bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
          {weeklyCompletedTasks} tarefas esta semana
        </Badge>
      </div>

      {/* Estatísticas da Semana Selecionada */}
      {selectedWeekStats && (
        <Card className="mb-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 animate-fade-in">
          <CardContent className="p-3">
            <div className="text-center mb-2">
              <h4 className="text-sm font-semibold text-purple-300">Semana Selecionada</h4>
              <p className="text-xs text-muted-foreground">
                {format(selectedWeek!, 'dd/MM', { locale: ptBR })} - {format(endOfWeek(selectedWeek!), 'dd/MM', { locale: ptBR })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-1.5 rounded-lg bg-green-500/20">
                <div className="text-sm font-bold text-green-400">{selectedWeekStats.tasks}</div>
                <div className="text-xs text-muted-foreground">Tarefas</div>
              </div>
              <div className="text-center p-1.5 rounded-lg bg-blue-500/20">
                <div className="text-sm font-bold text-blue-400">{selectedWeekStats.appointments}</div>
                <div className="text-xs text-muted-foreground">Compromissos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cabeçalho do calendário */}
      <Card className="mb-3 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              className="h-6 w-6 p-0 hover:bg-primary/20 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            
            <div className="flex flex-col items-center">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              
              {/* Botão para mostrar/ocultar tarefas agendadas - Nível 2+ */}
              {currentLevel >= 2 && onToggleScheduledTasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleScheduledTasks}
                  className="h-5 px-2 text-xs hover:bg-purple-500/20 transition-all duration-200"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {showScheduledTasks ? 'Ocultar' : 'Mostrar'} Agendadas
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="h-6 w-6 p-0 hover:bg-primary/20 transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grade do calendário */}
      <Card className="flex-1 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border-border/50">
        <CardContent className="p-2">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Semanas do mês */}
          <div className="space-y-0.5">
            {monthWeeks.map((weekStart, weekIndex) => {
              const weekDays = eachDayOfInterval({
                start: weekStart,
                end: endOfWeek(weekStart)
              });
              
              const isWeekSelected = selectedWeek && isSameWeek(selectedWeek, weekStart);
              
              return (
                <div 
                  key={weekIndex}
                  className={`grid grid-cols-7 gap-0.5 p-0.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isWeekSelected 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'hover:bg-muted/20'
                  }`}
                  onClick={() => selectWeek(weekStart)}
                >
                  {weekDays.map((day, dayIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);
                    const productivityLevel = getProductivityLevel(day);
                    const hasAppts = hasAppointmentsOnDate(day);
                    const complete = isDayComplete(day);
                    const appointmentCategories = getAppointmentCategoriesOnDate(day);
                    const dayCategory = getDayCategory(day);
                    const categoryData = dayCategory ? DAY_CATEGORIES.find(cat => cat.id === dayCategory) : null;
                    
                    return (
                      <TooltipProvider key={dayIndex}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`
                                h-8 w-full p-0 text-xs font-medium relative
                                transition-all duration-200 hover:scale-105
                                ${!isCurrentMonth ? 'text-muted-foreground/30' : ''}
                                ${isCurrentDay ? 'ring-2 ring-blue-400 bg-blue-500/20 text-blue-100 shadow-lg' : ''}
                                ${getProductivityColor(productivityLevel)}
                                ${hasAppts ? 'ring-1 ring-blue-500/50' : ''}
                                ${complete ? 'ring-1 ring-yellow-500/50' : ''}
                                ${selectedDate && isSameDay(selectedDate, day) ? 'ring-2 ring-purple-400 bg-purple-500/20' : ''}
                                hover:bg-accent/50
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDayDetails(day);
                              }}
                            >
                              {format(day, 'd')}
                              
                              {/* Indicadores visuais */}
                              <div className="absolute -top-0.5 -right-0.5 flex gap-0.5">
                                {productivityLevel > 0 && (
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                )}
                                
                                {hasAppts && productivityLevel === 0 && (
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                )}

                                {complete && (
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                                )}
                                
                                {showScheduledTasks && hasScheduledTasks(day) && (
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                                )}
                              </div>

                              {/* Categoria do dia */}
                              {categoryData && (
                                <div className="absolute -bottom-0.5 left-0.5">
                                  <div className={`w-2 h-2 ${categoryData.color} rounded-full`} />
                                </div>
                              )}

                              {/* Categorias de compromissos */}
                              {appointmentCategories.length > 0 && (
                                <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
                                  {appointmentCategories.slice(0, 2).map((categoryId, catIndex) => (
                                    <div
                                      key={catIndex}
                                      className={`w-1 h-1 rounded-full bg-${getCategoryColor(categoryId)}-500 animate-pulse`}
                                      title={getCategoryName(categoryId)}
                                    />
                                  ))}
                                  {appointmentCategories.length > 2 && (
                                    <div className="w-1 h-1 rounded-full bg-gray-500 animate-pulse" title="Mais categorias" />
                                  )}
                                </div>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <div className="text-sm space-y-2">
                              <div className="font-medium">{format(day, 'EEEE, d MMMM', { locale: ptBR })}</div>
                              <div className="text-xs text-muted-foreground">
                                {getMotivationalPhrase(day)}
                              </div>
                              
                              {/* Resumo do dia */}
                              <div className="space-y-1 text-xs">
                                {getDayCompletedTasks(day).length > 0 && (
                                  <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle className="h-3 w-3" />
                                    {getDayCompletedTasks(day).length} tarefa(s) concluída(s)
                                  </div>
                                )}
                                
                                {getDayPendingTasks(day).length > 0 && (
                                  <div className="flex items-center gap-2 text-yellow-400">
                                    <Clock className="h-3 w-3" />
                                    {getDayPendingTasks(day).length} tarefa(s) pendente(s)
                                  </div>
                                )}
                                
                                {getDayAppointments(day).length > 0 && (
                                  <div className="flex items-center gap-2 text-blue-400">
                                    <CalendarIcon className="h-3 w-3" />
                                    {getDayAppointments(day).length} compromisso(s)
                                  </div>
                                )}
                                
                                {showScheduledTasks && getDayScheduledTasks(day).length > 0 && (
                                  <div className="flex items-center gap-2 text-purple-400">
                                    <Clock className="h-3 w-3" />
                                    {getDayScheduledTasks(day).length} tarefa(s) agendada(s)
                                  </div>
                                )}
                                
                                {categoryData && (
                                  <div className="flex items-center gap-2 text-purple-400">
                                    <categoryData.icon className="h-3 w-3" />
                                    {categoryData.name}
                                  </div>
                                )}
                              </div>
                              
                              {complete && (
                                <div className="text-xs text-yellow-400 font-medium">
                                  🎉 Dia completo!
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Botões de exportar/importar */}
      <div className="mt-3 flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={exportAppointments}
          className="flex-1 h-6 text-xs hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200"
        >
          <Download className="h-3 w-3 mr-1" />
          Exportar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('import-file')?.click()}
          className="flex-1 h-6 text-xs hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200"
        >
          <Upload className="h-3 w-3 mr-1" />
          Importar
        </Button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />
      </div>

      {/* Legenda Interativa */}
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-2 font-medium">Legenda:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex items-center gap-1 hover:bg-muted/30 p-1 rounded transition-colors">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Produtivo</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-muted/30 p-1 rounded transition-colors">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-muted-foreground">Compromissos</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-muted/30 p-1 rounded transition-colors">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-muted-foreground">Completo</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-muted/30 p-1 rounded transition-colors">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-muted-foreground">Categoria</span>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do dia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>

          {selectedDate && (
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
              {/* Categoria do dia */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center">
                  <Bookmark className="h-4 w-4 mr-2 text-purple-600" />
                  Categoria do Dia
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DAY_CATEGORIES.map((category) => {
                    const isSelected = getDayCategory(selectedDate) === category.id;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            removeDayCategory(selectedDate);
                          } else {
                            addDayCategory(selectedDate, category.id);
                          }
                        }}
                        className={`text-xs ${isSelected ? category.color : ''}`}
                      >
                        <category.icon className="h-3 w-3 mr-1" />
                        {category.name}
                        {isSelected && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tarefas completadas */}
              {getDayCompletedTasks(selectedDate).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Tarefas Concluídas
                  </h4>
                  <div className="space-y-1">
                    {getDayCompletedTasks(selectedDate).map(task => (
                      <div key={task.id} className="text-sm p-2 bg-green-500/10 rounded-md hover:bg-green-500/20 transition-colors">
                        {task.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tarefas Agendadas - Nível 2+ */}
              {currentLevel >= 2 && showScheduledTasks && getDayScheduledTasks(selectedDate).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Tarefas Agendadas
                  </h4>
                  <div className="space-y-2">
                    {getDayScheduledTasks(selectedDate).map(task => (
                      <div key={task.id} className="text-sm p-3 bg-purple-500/10 rounded-md hover:bg-purple-500/20 transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">📅</span>
                              <div className="font-medium">{task.text}</div>
                              {task.priority && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Prioritária
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Agendada para {new Date(task.scheduledFor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compromissos */}
              {getDayAppointments(selectedDate).length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Compromissos
                  </h4>
                  <div className="space-y-2">
                    {getDayAppointments(selectedDate).map(appointment => (
                      <div key={appointment.id} className="text-sm p-3 bg-blue-500/10 rounded-md hover:bg-blue-500/20 transition-all duration-200 hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getCategoryIcon(appointment.category)}</span>
                              <div className="font-medium">{appointment.title}</div>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs bg-${getCategoryColor(appointment.category)}-500/20 text-${getCategoryColor(appointment.category)}-400 border-${getCategoryColor(appointment.category)}-500/30`}
                              >
                                {getCategoryName(appointment.category)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{appointment.time}</div>
                            {appointment.description && (
                              <div className="text-xs mt-1">{appointment.description}</div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAppointment(appointment.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/20 transition-all duration-200"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar compromisso */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Compromisso
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-xs">Título</Label>
                    <Input
                      id="title"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={getTitleSuggestion(newAppointment.category)}
                      className="h-8 text-sm focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="time" className="text-xs">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                        className="h-8 text-sm focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-xs">Categoria</Label>
                      <Select 
                        value={newAppointment.category} 
                        onValueChange={updateCategory}
                      >
                        <SelectTrigger className="h-8 text-sm focus:ring-2 focus:ring-primary/50 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPOINTMENT_CATEGORIES.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-xs">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={newAppointment.description}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detalhes do compromisso..."
                      className="h-16 text-sm resize-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={closeDialog}
                      className="flex-1 h-8 text-sm"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAddAppointment}
                      disabled={!newAppointment.title || !newAppointment.time}
                      className="flex-1 h-8 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition-all duration-200 hover:scale-105"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 