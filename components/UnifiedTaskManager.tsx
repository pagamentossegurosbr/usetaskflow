'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Star, 
  Clock, 
  CheckSquare, 
  Play, 
  ChevronDown,
  Sparkles,
  CheckCircle,
  Circle,
  Trash2,
  Edit3,
  Target,
  FileText,
  Calendar as CalendarIcon,
  Tag,
  Award,
  Settings,
  Pause,
  RotateCcw,
  AlertTriangle,
  Plus,
  Minus,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Todo } from '@/app/page';
import { playClickSound, playErrorSound, playSuccessSound } from '@/lib/sounds';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCooldown } from '@/hooks/useCooldown';
import { useProductivityLevel } from '@/hooks/useProductivityLevel';
import { TaskDetailModal } from '@/components/TaskDetailModal';

interface UnifiedTaskManagerProps {
  onAddTodo: (taskData: any) => void;
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onUpdateTodo?: (id: string, updates: Partial<Todo>) => Promise<any>;
  onTogglePriority?: (id: string) => void;
  currentLevel: number;
}

export const UnifiedTaskManager = memo(function UnifiedTaskManager({
  onAddTodo,
  todos,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  onUpdateTodo,
  onTogglePriority,
  currentLevel
}: UnifiedTaskManagerProps) {
  // CSS customizado para melhorar os dropdowns
  useEffect(() => {
    const styleId = 'unified-task-manager-styles';
    
    // Verificar se o estilo já existe para evitar duplicação
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .custom-select option {
        background-color: rgb(30 41 59) !important;
        color: rgb(248 250 252) !important;
        padding: 8px 12px !important;
      }
      
      .custom-select option:hover {
        background-color: rgb(51 65 85) !important;
      }
      
      .custom-select option:checked {
        background-color: rgb(59 130 246) !important;
      }
      
      .custom-select:focus {
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.3) !important;
      }
      
      .glassmorphism-input {
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      
      .glassmorphism-input:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
      
      .glassmorphism-input:focus {
        background-color: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(147, 51, 234, 0.5) !important;
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.2) !important;
      }
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('media');
  const [deadline, setDeadline] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');
  const [reward, setReward] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutos em segundos
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const { isBlocked, canToggle, recordToggle } = useCooldown();
  const { addXP } = useProductivityLevel();

  // Organizar tarefas por prioridade
  const organizedTodos = useMemo(() => {
    const pending = todos.filter(todo => !todo.completed);
    const completed = todos.filter(todo => todo.completed);
    
    // Ordenar por prioridade: Alta > Média > Baixa
    const sortByPriority = (a: Todo, b: Todo) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return 0;
    };
    
    return {
      pendingTodos: pending.sort(sortByPriority),
      completedTodos: completed.sort(sortByPriority)
    };
  }, [todos]);

  // Usar tarefas organizadas por prioridade
  const { pendingTodos, completedTodos } = organizedTodos;

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      playErrorSound();
      return;
    }

    if (isBlocked('create-tasks', 'create')) {
      playErrorSound();
      toast.error('Aguarde um momento antes de criar outra tarefa');
      return;
    }

    recordToggle('create-tasks', 'create');
    
    // Preparar dados da tarefa
    const taskData = {
      title: title.trim(),
      priority: priority === 'alta',
      priorityLevel: priority,
      // Campos opcionais apenas se expandido e preenchidos
      ...(isExpanded && description.trim() && { description: description.trim() }),
      ...(isExpanded && category && { category }),
      ...(isExpanded && deadline && { deadline: new Date(deadline) }),
      ...(isExpanded && estimatedTime && { estimatedTime: parseInt(estimatedTime) }),
      ...(isExpanded && tags.trim() && { tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) }),
      ...(isExpanded && reward.trim() && { reward: reward.trim() })
    };
    
    onAddTodo(taskData);
    
    // Resetar formulário
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('media');
    setDeadline('');
    setEstimatedTime('');
    setTags('');
    setReward('');
    setIsExpanded(false);
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      playSuccessSound();
      toast.success('Tarefa criada com sucesso!');
    }, 0);
  }, [title, priority, isExpanded, description, category, deadline, estimatedTime, tags, reward, onAddTodo, isBlocked, recordToggle]);

  const handleStartPomodoro = useCallback(() => {
    if (!title.trim()) {
      toast.error('Adicione um título antes de iniciar o Pomodoro');
      playErrorSound();
      return;
    }
    
    setIsPomodoroActive(true);
    setPomodoroTime(25 * 60); // 25 minutos
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      toast.success('Pomodoro iniciado! Foque na tarefa: ' + title.trim());
      playSuccessSound();
    }, 0);
  }, [title]);

  const handlePausePomodoro = useCallback(() => {
    setIsPomodoroActive(false);
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      toast.info('Pomodoro pausado');
      playClickSound();
    }, 0);
  }, []);

  const handleResetPomodoro = useCallback(() => {
    setIsPomodoroActive(false);
    setPomodoroTime(25 * 60);
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      toast.info('Pomodoro resetado');
      playClickSound();
    }, 0);
  }, []);

  // Timer do Pomodoro
  useEffect(() => {
    if (!isPomodoroActive || pomodoroTime <= 0) return;
    
    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          setIsPomodoroActive(false);
          // Usar setTimeout para evitar setState durante render
          setTimeout(() => {
            toast.success('Pomodoro concluído! Parabéns pelo foco!');
            playSuccessSound();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroTime, playSuccessSound]);

  const handleToggleTodo = useCallback((id: string) => {
    if (isBlocked(id, 'toggle')) {
      playErrorSound();
      toast.error('Aguarde um momento antes de alterar esta tarefa');
      return;
    }

    recordToggle(id, 'toggle');
    
    // Encontrar a tarefa para verificar se está sendo completada
    const todo = todos.find(t => t.id === id);
    const isCompleting = todo && !todo.completed;
    
    onToggleTodo(id);
    playClickSound();
    
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      // Adicionar ou remover XP baseado na ação
      if (todo) {
        const baseXP = 10; // XP base por tarefa
        const priorityBonus = todo.priority ? 5 : 0; // Bônus para tarefas prioritárias
        const totalXP = baseXP + priorityBonus;
        
        if (isCompleting) {
          addXP(totalXP, todo.priority ? 'Tarefa prioritária completada!' : 'Tarefa completada!', todo.id);
          
          // Toast informativo detalhado
          if (todo.priority) {
            toast.success(`🎉 +${totalXP} XP! Tarefa prioritária completada! (${baseXP} + ${priorityBonus} bônus)`, {
              description: 'Parabéns! Tarefas prioritárias dão mais XP!'
            });
          } else {
            toast.success(`🎉 +${totalXP} XP! Tarefa completada!`, {
              description: 'Continue assim! Cada tarefa te aproxima do próximo nível!'
            });
          }
        } else {
          addXP(-totalXP, 'XP removido - Tarefa desmarcada', todo.id);
          
          // Toast informativo para remoção de XP
          toast.info(`📉 -${totalXP} XP removido - Tarefa desmarcada`, {
            description: todo.priority ? 'Tarefa prioritária desmarcada' : 'Tarefa desmarcada'
          });
        }
      }
    }, 0);
  }, [isBlocked, recordToggle, onToggleTodo, todos, addXP]);

  const handleDeleteTodo = useCallback((id: string) => {
    if (isBlocked(id, 'delete')) {
      playErrorSound();
      toast.error('Aguarde um momento antes de deletar esta tarefa');
      return;
    }

    recordToggle(id, 'delete');
    onDeleteTodo(id);
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      playClickSound();
      toast.success('Tarefa removida!');
    }, 0);
  }, [isBlocked, recordToggle, onDeleteTodo]);

  const handleEditTodo = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingId(id);
      setEditText(todo.text);
    }
  }, [todos]);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editText.trim()) {
      onEditTodo(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        playSuccessSound();
        toast.success('Tarefa atualizada!');
      }, 0);
    }
  }, [editingId, editText, onEditTodo]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const handleDeleteAllTodos = useCallback(() => {
    todos.forEach(todo => {
      onDeleteTodo(todo.id);
    });
    setShowDeleteAllModal(false);
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      toast.success('Todas as tarefas foram removidas!');
      playSuccessSound();
    }, 0);
  }, [todos, onDeleteTodo]);

  // Funções para o modal de detalhes
  const handleOpenTaskDetail = useCallback((task: Todo) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseTaskDetail = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      // Se apenas o texto foi alterado, usar a função existente
      if (updates.text && Object.keys(updates).length === 1) {
        await onEditTodo(id, updates.text);
        return;
      }
      
      // Para outras atualizações, usar a função onUpdateTodo se disponível
      if (onUpdateTodo) {
        await onUpdateTodo(id, updates);
      } else {
        // Fallback para API direta
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates })
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar tarefa');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }, [onEditTodo, onUpdateTodo]);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      await onDeleteTodo(id);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  }, [onDeleteTodo]);

  const handleToggleTask = useCallback(async (id: string) => {
    try {
      await onToggleTodo(id);
    } catch (error) {
      console.error('Erro ao alternar tarefa:', error);
      throw error;
    }
  }, [onToggleTodo]);

  return (
    <div className="space-y-6">
      {/* Formulário Unificado */}
      <motion.div 
        ref={cardRef}
        className="relative bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-700 ease-out group rounded-3xl overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Glassmorphism Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="content relative z-10 p-6">
          {/* Header Compacto */}
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Nova Tarefa
                </h2>
                <p className="text-xs text-muted-foreground">Organize suas atividades</p>
              </div>
            </div>
            
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4 text-purple-400" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Campos Básicos - Sempre Visíveis */}
          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                Título *
              </label>
                             <div className="relative">
                 <Input
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder="Digite o título da tarefa..."
                                              className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm transition-all duration-200"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                   <FileText className="h-4 w-4 text-purple-400" />
                 </div>
               </div>
            </div>

            {/* Campos Expandidos */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Descrição */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      Descrição
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva detalhes da tarefa..."
                                             className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm min-h-[80px] resize-none transition-all duration-200"
                    />
                  </div>

                  {/* Categoria e Prioridade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-400" />
                        Categoria
                      </label>
                                             <div className="relative">
                         <select 
                           value={category} 
                           onChange={(e) => setCategory(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white appearance-none cursor-pointer transition-all duration-200"
                         >
                           <option value="" className="bg-slate-800 text-white">Selecione uma categoria</option>
                           <option value="trabalho" className="bg-slate-800 text-white">Trabalho</option>
                           <option value="pessoal" className="bg-slate-800 text-white">Pessoal</option>
                           <option value="estudo" className="bg-slate-800 text-white">Estudo</option>
                           <option value="saude" className="bg-slate-800 text-white">Saúde</option>
                           <option value="financas" className="bg-slate-800 text-white">Finanças</option>
                           <option value="casa" className="bg-slate-800 text-white">Casa</option>
                           <option value="projetos" className="bg-slate-800 text-white">Projetos</option>
                           <option value="outros" className="bg-slate-800 text-white">Outros</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                           <ChevronDown className="h-4 w-4 text-white/60" />
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        Prioridade
                      </label>
                                             <div className="relative">
                         <select 
                           value={priority} 
                           onChange={(e) => setPriority(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white appearance-none cursor-pointer transition-all duration-200"
                         >
                           <option value="baixa" className="bg-slate-800 text-white">Baixa</option>
                           <option value="media" className="bg-slate-800 text-white">Média</option>
                           <option value="alta" className="bg-slate-800 text-white">Alta</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                           <ChevronDown className="h-4 w-4 text-white/60" />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Prazo e Tempo Estimado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-orange-400" />
                        Prazo
                      </label>
                                             <Popover>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white transition-all duration-200 justify-start text-left font-normal"
                           >
                             <CalendarIcon className="mr-2 h-4 w-4 text-white/60" />
                             {deadline ? (() => {
                               const [year, month, day] = deadline.split('-');
                               return `${day}/${month}/${year}`;
                             })() : 'Selecione uma data'}
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0 bg-black border border-white/20 shadow-2xl rounded-lg">
                           <Calendar
                             mode="single"
                             selected={deadline ? new Date(deadline + 'T12:00:00') : undefined}
                             onSelect={(date) => {
                               if (date) {
                                 // Criar data no meio do dia para evitar problemas de timezone
                                 const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
                                 const year = selectedDate.getFullYear();
                                 const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                 const day = String(selectedDate.getDate()).padStart(2, '0');
                                 
                                 // Formatar como YYYY-MM-DD
                                 const formattedDate = `${year}-${month}-${day}`;
                                 setDeadline(formattedDate);
                               } else {
                                 setDeadline('');
                               }
                             }}
                             initialFocus
                             className="bg-black text-white p-4"
                             locale={ptBR}
                             classNames={{
                               months: "flex flex-col space-y-4",
                               month: "space-y-4",
                               caption: "flex justify-center pt-1 relative items-center",
                               caption_label: "text-sm font-medium text-white",
                               nav: "space-x-1 flex items-center",
                               nav_button: "h-8 w-8 bg-transparent p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors",
                               nav_button_previous: "absolute left-1",
                               nav_button_next: "absolute right-1",
                               table: "w-full border-collapse space-y-1",
                               head_row: "flex",
                               head_cell: "text-white/60 rounded-md w-9 font-normal text-[0.8rem]",
                               row: "flex w-full mt-2",
                               cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                               day: "h-9 w-9 p-0 font-normal text-white hover:bg-white/10 focus:bg-white/10 rounded-md transition-colors",
                               day_selected: "bg-transparent text-white border-2 border-white hover:bg-white/10 focus:bg-white/10 font-medium",
                               day_today: "bg-transparent text-white border border-white/50",
                               day_outside: "text-white/40 opacity-50",
                               day_disabled: "text-white/20 opacity-30",
                               day_range_middle: "aria-selected:bg-white/10",
                               day_hidden: "invisible"
                             }}
                           />
                         </PopoverContent>
                       </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cyan-400" />
                        Tempo Estimado (min)
                      </label>
                                             <div className="relative">
                                                    <input
                             type="number"
                             value={estimatedTime}
                             onChange={(e) => setEstimatedTime(e.target.value)}
                             placeholder="Ex: 30"
                             className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white transition-all duration-200"
                           />
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                           <Clock className="h-4 w-4 text-cyan-400" />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-400" />
                      Tags
                    </label>
                                         <div className="relative">
                                              <input
                         value={tags}
                         onChange={(e) => setTags(e.target.value)}
                         placeholder="Ex: urgente, projeto, reunião"
                         className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white transition-all duration-200"
                       />
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                         <Tag className="h-4 w-4 text-purple-400" />
                       </div>
                     </div>
                  </div>

                                     {/* Recompensa */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-foreground flex items-center gap-2">
                       <Award className="h-4 w-4 text-yellow-400" />
                       Recompensa
                     </label>
                     <div className="relative">
                                              <input
                         value={reward}
                         onChange={(e) => setReward(e.target.value)}
                         placeholder="Ex: Comprar algo especial"
                         className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 backdrop-blur-sm rounded-lg p-3 text-sm text-white transition-all duration-200"
                       />
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                         <Award className="h-4 w-4 text-yellow-400" />
                       </div>
                     </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

                         {/* Botões de Ação */}
             <motion.div 
               className="flex flex-col sm:flex-row gap-3 pt-4"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.4 }}
             >
               <Button
                 onClick={handleSubmit}
                 className="flex-1 bg-gradient-to-r from-purple-600/80 to-violet-600/80 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
                 disabled={!title.trim()}
               >
                 <Sparkles className="mr-2 h-5 w-5" />
                 Criar Tarefa
               </Button>
               
               {!isPomodoroActive ? (
                 <Button
                   onClick={handleStartPomodoro}
                   variant="outline"
                   className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 text-green-400 border-green-500/30 hover:border-green-400/50 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 backdrop-blur-sm"
                   disabled={!title.trim()}
                 >
                   <Play className="mr-2 h-5 w-5" />
                   Iniciar Pomodoro
                 </Button>
               ) : (
                 <div className="flex gap-2">
                   <Button
                     onClick={handlePausePomodoro}
                     variant="outline"
                     className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 text-yellow-400 border-yellow-500/30 hover:border-yellow-400/50 font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 backdrop-blur-sm"
                   >
                     <Pause className="mr-2 h-4 w-4" />
                     Pausar
                   </Button>
                   <Button
                     onClick={handleResetPomodoro}
                     variant="outline"
                     className="bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 text-red-400 border-red-500/30 hover:border-red-400/50 font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 backdrop-blur-sm"
                   >
                     <RotateCcw className="mr-2 h-4 w-4" />
                     Reset
                   </Button>
                 </div>
               )}
             </motion.div>

             {/* Timer do Pomodoro */}
             {isPomodoroActive && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="mt-4 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl backdrop-blur-sm"
               >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Clock className="h-5 w-5 text-green-400" />
                     <span className="text-lg font-bold text-green-400">
                       {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, '0')}
                     </span>
                   </div>
                   <div className="text-sm text-green-300">
                     Focando em: {title.trim()}
                   </div>
                 </div>
               </motion.div>
             )}
          </div>
        </div>
      </motion.div>

             {/* Lista de Tarefas */}
       <div className="space-y-4">
         {/* Header com botão de excluir todas */}
         {todos.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="flex items-center justify-between"
           >
             <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
               <Target className="h-5 w-5 text-purple-400" />
               Gerenciar Tarefas
             </h3>
             <Button
               onClick={() => setShowDeleteAllModal(true)}
               variant="outline"
               size="sm"
               className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 hover:border-red-400/50 backdrop-blur-sm"
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Excluir Todas
             </Button>
           </motion.div>
         )}

         {/* Tarefas Pendentes */}
         {pendingTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 border-blue-500/20 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-xl rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-foreground">Tarefas Pendentes</h3>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm">
                  {pendingTodos.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {pendingTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                  >
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm group">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTodo(todo.id);
                          }}
                          className="flex-shrink-0 p-2 rounded-lg bg-white/10 text-white/70 hover:bg-purple-500/20 hover:text-purple-400 transition-all duration-200 backdrop-blur-sm"
                        >
                          <Circle className="h-4 w-4" />
                        </button>
                        <div className="flex-1 min-w-0">
                          {editingId === todo.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-purple-500/50 backdrop-blur-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleSaveEdit} size="sm" className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 backdrop-blur-sm">
                                  Salvar
                                </Button>
                                <Button onClick={handleCancelEdit} size="sm" variant="outline" className="bg-white/5 border-white/10 backdrop-blur-sm">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-foreground mb-1 truncate" title={todo.text}>
                                {todo.text.length > 50 ? `${todo.text.substring(0, 50)}...` : todo.text}
                              </h4>
                              
                              {/* Campos opcionais da tarefa */}
                              {(todo.description || todo.category || todo.deadline || todo.estimatedTime || todo.tags || todo.reward) && (
                                <div className="mt-2 space-y-1">
                                  {/* Descrição */}
                                  {todo.description && (
                                    <p className="text-xs text-blue-300/80 flex items-center gap-1 line-clamp-2" title={todo.description}>
                                      <FileText className="h-3 w-3 flex-shrink-0" />
                                      {todo.description.length > 60 ? `${todo.description.substring(0, 60)}...` : todo.description}
                                    </p>
                                  )}
                                  
                                  {/* Categoria */}
                                  {todo.category && (
                                    <p className="text-xs text-green-300/80 flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {todo.category}
                                    </p>
                                  )}
                                  
                                                                     {/* Prazo */}
                                   {todo.deadline && (
                                     <p className="text-xs text-orange-300/80 flex items-center gap-1">
                                       <CalendarIcon className="h-3 w-3" />
                                       Prazo: {(() => {
                                         const [year, month, day] = todo.deadline.split('-');
                                         return `${day}/${month}/${year}`;
                                       })()}
                                     </p>
                                   )}
                                  
                                  {/* Tempo estimado */}
                                  {todo.estimatedTime && (
                                    <p className="text-xs text-cyan-300/80 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {todo.estimatedTime} min
                                    </p>
                                  )}
                                  
                                  {/* Tags */}
                                  {todo.tags && todo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {todo.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Recompensa */}
                                  {todo.reward && (
                                    <p className="text-xs text-yellow-300/80 flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      {todo.reward}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-sm text-muted-foreground mt-2">
                                Criada: {new Date(todo.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {todo.priority && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-sm">
                              Prioritária
                            </Badge>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskDetail(todo);
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-8 w-8 bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-sm"
                              title="Ver detalhes"
                            >
                              <Eye className="h-3 w-3 text-blue-400" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTodo(todo.id);
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-8 w-8 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                              title="Editar"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTodo(todo.id);
                              }}
                              size="sm"
                              variant="ghost"
                              className="p-1 h-8 w-8 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm"
                              title="Excluir"
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tarefas Concluídas */}
        {completedTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 border-green-500/20 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-foreground">Tarefas Concluídas</h3>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
                    {completedTodos.length}
                  </Badge>
                </div>
                <Button
                  onClick={() => setShowCompleted(!showCompleted)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                >
                  {showCompleted ? 'Ocultar' : 'Ver mais'}
                </Button>
              </div>
              
              <AnimatePresence>
                {showCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {completedTodos.map((todo, index) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="p-4 bg-white/5 border border-green-500/20 rounded-2xl backdrop-blur-sm group">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-green-500/20 text-green-400 backdrop-blur-sm">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-green-400 mb-1 truncate" title={todo.text}>
                                {todo.text.length > 50 ? `${todo.text.substring(0, 50)}...` : todo.text}
                              </h4>
                              
                              {/* Campos opcionais da tarefa concluída */}
                              {(todo.description || todo.category || todo.deadline || todo.estimatedTime || todo.tags || todo.reward) && (
                                <div className="mt-2 space-y-1">
                                  {/* Descrição */}
                                  {todo.description && (
                                    <p className="text-xs text-blue-300/60 flex items-center gap-1 line-clamp-2" title={todo.description}>
                                      <FileText className="h-3 w-3 flex-shrink-0" />
                                      {todo.description.length > 60 ? `${todo.description.substring(0, 60)}...` : todo.description}
                                    </p>
                                  )}
                                  
                                  {/* Categoria */}
                                  {todo.category && (
                                    <p className="text-xs text-green-300/60 flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {todo.category}
                                    </p>
                                  )}
                                  
                                                                     {/* Prazo */}
                                   {todo.deadline && (
                                     <p className="text-xs text-orange-300/60 flex items-center gap-1">
                                       <CalendarIcon className="h-3 w-3" />
                                       Prazo: {(() => {
                                         const [year, month, day] = todo.deadline.split('-');
                                         return `${day}/${month}/${year}`;
                                       })()}
                                     </p>
                                   )}
                                  
                                  {/* Tempo estimado */}
                                  {todo.estimatedTime && (
                                    <p className="text-xs text-cyan-300/60 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {todo.estimatedTime} min
                                    </p>
                                  )}
                                  
                                  {/* Tags */}
                                  {todo.tags && todo.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {todo.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className="text-xs bg-purple-500/10 text-purple-300/60 px-1.5 py-0.5 rounded-md">
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Recompensa */}
                                  {todo.reward && (
                                    <p className="text-xs text-yellow-300/60 flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      {todo.reward}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              <p className="text-sm text-muted-foreground mt-2">
                                Criada: {new Date(todo.createdAt).toLocaleDateString('pt-BR')} • 
                                Concluída: {todo.completedAt ? new Date(todo.completedAt).toLocaleDateString('pt-BR') : 'Agora'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {todo.priority && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-sm">
                                  Prioritária
                                </Badge>
                              )}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTaskDetail(todo);
                                  }}
                                  size="sm"
                                  variant="ghost"
                                  className="p-1 h-8 w-8 bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-sm"
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-3 w-3 text-blue-400" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
                 )}

         {/* Modal de Detalhes da Tarefa */}
         <TaskDetailModal
           isOpen={isDetailModalOpen}
           onClose={handleCloseTaskDetail}
           task={selectedTask}
           onUpdateTask={handleUpdateTask}
           onDeleteTask={handleDeleteTask}
           onToggleTask={handleToggleTask}
         />

         {/* Modal de Confirmação para Excluir Todas */}
         <Dialog open={showDeleteAllModal} onOpenChange={setShowDeleteAllModal}>
           <DialogContent className="bg-slate-800/90 border-white/10 backdrop-blur-xl">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-red-400">
                 <AlertTriangle className="h-5 w-5" />
                 Confirmar Exclusão
               </DialogTitle>
               <DialogDescription className="text-muted-foreground">
                 Tem certeza que deseja excluir todas as tarefas? Esta ação não pode ser desfeita.
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="flex gap-2">
               <Button
                 variant="outline"
                 onClick={() => setShowDeleteAllModal(false)}
                 className="bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm"
               >
                 Cancelar
               </Button>
               <Button
                 onClick={handleDeleteAllTodos}
                 className="bg-red-600/80 hover:bg-red-600 text-white border-red-500/30 backdrop-blur-sm"
               >
                 <Trash2 className="mr-2 h-4 w-4" />
                 Excluir Todas
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
     </div>
   );
 });
