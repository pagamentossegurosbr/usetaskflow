'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Sparkles, AlertTriangle, Clock, Calendar, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Todo } from '@/app/page';
import { playClickSound, playErrorSound, playNotificationSound } from '@/lib/sounds';
import { validateTask, TaskValidationResult } from '@/lib/taskValidation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCooldown } from '@/hooks/useCooldown';

interface AddTodoFormProps {
  onAddTodo: (text: string, priority?: boolean, scheduledFor?: Date) => void;
  existingTodos: Todo[];
  currentLevel: number;
  onOpenFocusMode?: () => void;
}

export const AddTodoForm = memo(function AddTodoForm({ onAddTodo, existingTodos, currentLevel, onOpenFocusMode }: AddTodoFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateTaskName, setDuplicateTaskName] = useState('');
  const [validationResult, setValidationResult] = useState<TaskValidationResult | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledHour, setScheduledHour] = useState<string>('');
  const [scheduledMinute, setScheduledMinute] = useState<string>('');
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inputError, setInputError] = useState(false);
  const { isBlocked, recordToggle, getRemainingTime } = useCooldown();

  // Verificar se está bloqueado para criar tarefas
  const isCreateBlocked = useMemo(() => isBlocked('create-tasks', 'create'), [isBlocked]);

  // Arrays para opções de hora e minuto - memoizados para evitar recriação
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')), []);

  // Encontrar a próxima tarefa prioritária - memoizado
  const nextPriorityTask = useMemo(() => {
    return existingTodos
      .filter(todo => todo.priority && !todo.completed)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  }, [existingTodos]);

  // Handlers para spotlight que segue o cursor - memoizados com useCallback
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
  }, []);

  // Efeito spotlight que segue o cursor
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Validação em tempo real - otimizada com debounce
  useEffect(() => {
    if (!text.trim()) {
      setValidationResult(null);
      setInputError(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const result = validateTask(text.trim());
      setValidationResult(result);
      setInputError(!result.isValid);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [text, existingTodos]);

  // Verificar se deve mostrar o botão de modo foco - memoizado para evitar re-renderizações
  const showFocusModeButton = useMemo(() => {
    return existingTodos.some(todo => todo.priority && !todo.completed);
  }, [existingTodos]);

  // Handlers memoizados com useCallback
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreateBlocked) {
      playErrorSound();
      toast.error('Criação bloqueada', {
        description: 'Aguarde um momento antes de criar uma nova tarefa.',
        duration: 3000,
      });
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setInputError(true);
      toast.error('Texto da tarefa é obrigatório');
      return;
    }

    // Verificar duplicatas
    const isDuplicate = existingTodos.some(todo => 
      todo.text && todo.text.toLowerCase() === trimmedText.toLowerCase() && !todo.completed
    );

    if (isDuplicate) {
      setDuplicateTaskName(trimmedText);
      setShowDuplicateDialog(true);
      return;
    }

    // Validar tarefa
    const validation = validateTask(trimmedText);
    if (!validation.isValid) {
      setInputError(true);
      toast.error(validation.reason || 'Tarefa inválida');
      return;
    }

    // Criar data agendada se especificada
    let scheduledFor: Date | undefined;
    if (scheduledDate && scheduledHour && scheduledMinute) {
      scheduledFor = new Date(scheduledDate);
      scheduledFor.setHours(parseInt(scheduledHour), parseInt(scheduledMinute), 0, 0);
    }

    // Adicionar tarefa
    onAddTodo(trimmedText, priority, scheduledFor);
    
    // Resetar formulário
    setText('');
    setPriority(false);
    setScheduledDate(undefined);
    setScheduledHour('');
    setScheduledMinute('');
    setInputError(false);
    
    // Registrar ação
    recordToggle('create-tasks', 'create');
    
    playClickSound();
    playNotificationSound();
    
    toast.success('Tarefa criada com sucesso! 🎉', {
      description: priority ? 'Tarefa prioritária adicionada!' : 'Nova tarefa adicionada à sua lista.',
      duration: 3000,
    });
  }, [text, priority, scheduledDate, scheduledHour, scheduledMinute, existingTodos, isCreateBlocked, onAddTodo, recordToggle]);

  const handleConfirmDuplicate = useCallback(() => {
    const trimmedText = text.trim();
    let scheduledFor: Date | undefined;
    
    if (scheduledDate && scheduledHour && scheduledMinute) {
      scheduledFor = new Date(scheduledDate);
      scheduledFor.setHours(parseInt(scheduledHour), parseInt(scheduledMinute), 0, 0);
    }

    onAddTodo(trimmedText, priority, scheduledFor);
    
    setText('');
    setPriority(false);
    setScheduledDate(undefined);
    setScheduledHour('');
    setScheduledMinute('');
    setShowDuplicateDialog(false);
    setDuplicateTaskName('');
    
    recordToggle('create-tasks', 'create');
    playClickSound();
    playNotificationSound();
  }, [text, priority, scheduledDate, scheduledHour, scheduledMinute, onAddTodo, recordToggle]);

  const togglePriority = useCallback(() => {
    setPriority(prev => !prev);
    playClickSound();
  }, []);

  const handleOpenFocusMode = useCallback(() => {
    if (onOpenFocusMode) {
      onOpenFocusMode();
      playClickSound();
    }
  }, [onOpenFocusMode]);

  // Memoizar classes CSS para evitar recálculos
  const inputClassName = useMemo(() => {
    return `h-14 text-base bg-slate-800/60 border-slate-600/50 focus:border-purple-400/80 transition-all duration-500 ease-out hover:border-purple-400/60 hover:bg-slate-800/80 focus:bg-slate-800/90 focus:shadow-xl focus:shadow-purple-500/25 rounded-xl backdrop-blur-sm ${
      inputError ? 'border-red-500/80 focus:border-red-400 hover:border-red-400/80' : ''
    }`;
  }, [inputError]);

  const cardClassName = useMemo(() => {
    return `relative bg-black/90 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 shadow-2xl hover:shadow-purple-500/10 transition-all duration-700 ease-out group rounded-2xl ${
      priority ? 'ring-2 ring-amber-500/40 ring-offset-2 ring-offset-slate-900' : ''
    }`;
  }, [priority]);

  const formatRemainingTime = useCallback((time: number) => {
    if (time <= 0) return '';
    
    const minutes = Math.ceil(time / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.ceil(time / (60 * 60 * 1000));
    return `${hours}h`;
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* Próxima Tarefa Prioritária */}
        <AnimatePresence>
          {nextPriorityTask && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-4 border-amber-500/30 bg-black/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Clock className="h-4 w-4 text-amber-400" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      <span className="text-sm font-medium text-amber-200">Próxima Tarefa Prioritária</span>
                    </div>
                    <p className="text-sm text-amber-100/80 line-clamp-2">
                      {nextPriorityTask.text}
                    </p>
                    <p className="text-xs text-amber-200/60 mt-1">
                      Criada em {new Date(nextPriorityTask.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulário de Adicionar Tarefa */}
        <motion.div 
          ref={cardRef}
          className={`${cardClassName} add-todo-card`}
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Efeito de spotlight que segue o cursor */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
               style={{
                 '--mouse-x': '50%',
                 '--mouse-y': '50%',
                 background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(147, 51, 234, 0.08) 0%, rgba(168, 85, 247, 0.04) 25%, transparent 50%)'
               } as React.CSSProperties} />
          
          {/* Efeito de borda luminosa sutil */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Efeito de profundidade com gradiente interno */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/5 via-transparent to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          {/* Efeito de brilho superior */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="content relative z-10 space-y-6 p-8">
            {/* Header */}
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center gap-2 flex-1">
                  <motion.div 
                    className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-violet-500/20 backdrop-blur-md border border-purple-400/30 group-hover:shadow-xl group-hover:shadow-purple-500/25 group-hover:border-purple-300/50 transition-all duration-500 ease-out"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Sparkles className="h-6 w-6 text-purple-300 group-hover:text-purple-200 transition-all duration-500" />
                  </motion.div>
                </div>
                
                {/* Botão Modo de Foco */}
                <AnimatePresence>
                  {onOpenFocusMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenFocusMode}
                        aria-label="Abrir modo de foco - Visualizar tarefas agendadas para hoje"
                        className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/15 to-violet-500/10 backdrop-blur-md border border-purple-400/25 text-purple-300 hover:bg-purple-500/25 hover:border-purple-300/40 hover:text-purple-200 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 ease-out"
                        title="Modo de Foco - Visualizar tarefas agendadas para hoje"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.h2 
                className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-purple-200 to-violet-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:via-purple-100 group-hover:to-violet-200 transition-all duration-500 ease-out"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Adicionar Tarefa
              </motion.h2>
              <motion.p 
                className="text-sm text-purple-200/70 group-hover:text-purple-100/80 transition-colors duration-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Organize suas atividades
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="space-y-3">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Input
                    type="text"
                    placeholder="Digite sua nova tarefa..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className={`${inputClassName} add-todo-input`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {validationResult && !validationResult.isValid ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        </motion.div>
                      ) : validationResult && validationResult.isValid ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="h-4 w-4 text-green-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="h-4 w-4 text-purple-300" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Botão da estrela para prioridade */}
                    <motion.button
                      type="button"
                      onClick={togglePriority}
                      aria-label={priority ? "Remover prioridade da tarefa" : "Marcar tarefa como prioritária"}
                      className={`p-2 rounded-xl transition-all duration-500 ease-out hover:shadow-xl backdrop-blur-sm ${
                        priority 
                          ? 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 border border-amber-400/40 text-amber-300 hover:shadow-amber-500/25 hover:border-amber-300/50' 
                          : 'bg-gradient-to-br from-purple-500/15 to-violet-500/10 border border-purple-400/25 text-purple-300 hover:bg-gradient-to-br hover:from-amber-500/20 hover:to-orange-500/15 hover:border-amber-400/30 hover:text-amber-300 hover:shadow-purple-500/25'
                      }`}
                      title={priority ? "Remover prioridade" : "Marcar como prioritária"}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <motion.div
                        animate={{ rotate: priority ? 360 : 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Star className={`h-4 w-4 transition-all duration-500 ${priority ? 'fill-current' : ''}`} />
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>
                
                {/* Feedback de validação */}
                <AnimatePresence>
                  {validationResult && !validationResult.isValid && (
                    <motion.div 
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="flex items-start gap-2">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
                        >
                          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <div className="text-sm">
                          <p className="text-red-300 font-medium">{validationResult.reason}</p>
                          {validationResult.suggestion && (
                            <p className="text-red-200/80 text-xs mt-1">{validationResult.suggestion}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Agendamento de Tarefas - Nível 2+ */}
                <AnimatePresence>
                  {currentLevel >= 2 && (
                    <motion.div 
                      className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-violet-900/30 backdrop-blur-md border border-purple-600/40 group-hover:bg-gradient-to-br group-hover:from-purple-900/40 group-hover:via-purple-800/30 group-hover:to-violet-900/40 group-hover:border-purple-500/50 transition-all duration-500 ease-out"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <motion.button
                        type="button"
                        className="flex items-center gap-2 mb-2 w-full cursor-pointer hover:bg-purple-500/10 p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-purple-500/10"
                        onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
                        aria-label={`${isScheduleExpanded ? 'Recolher' : 'Expandir'} seção de agendamento`}
                        aria-expanded={isScheduleExpanded}
                        aria-controls="schedule-content"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={{ rotate: isScheduleExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Calendar className="h-4 w-4 text-purple-300" />
                        </motion.div>
                        <span className="text-sm font-medium text-purple-200">Agendar Tarefa (Nível {currentLevel})</span>
                        <motion.div 
                          className="ml-auto"
                          animate={{ rotate: isScheduleExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="h-4 w-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </motion.button>
                      
                      {/* Conteúdo expansível */}
                      <AnimatePresence>
                        {isScheduleExpanded && (
                          <motion.div 
                            id="schedule-content"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            aria-hidden={!isScheduleExpanded}
                          >
                            <motion.div 
                              className="grid grid-cols-2 gap-3 mb-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <div>
                                <label className="text-xs text-purple-200/90 mb-1 block font-medium" htmlFor="date-selector">Data</label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id="date-selector"
                                      variant="outline"
                                      className={`h-9 w-full justify-start text-left font-normal backdrop-blur-sm border-purple-600/40 bg-purple-900/30 hover:bg-purple-800/40 focus:bg-purple-800/40 focus:border-purple-400/60 text-purple-100 ${
                                        !scheduledDate && "text-purple-300/60"
                                      }`}
                                      aria-label={scheduledDate ? `Data selecionada: ${scheduledDate.toLocaleDateString('pt-BR')}` : "Selecionar data"}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {scheduledDate ? (
                                        scheduledDate.toLocaleDateString('pt-BR')
                                      ) : (
                                        <span>Selecione uma data</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 bg-card border-purple-600/40" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={scheduledDate}
                                      onSelect={setScheduledDate}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                      captionLayout="dropdown"
                                      className="rounded-md border shadow-sm"
                                      locale="pt-BR"
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div>
                                <label className="text-xs text-purple-200/90 mb-1 block font-medium">Hora</label>
                                <div className="flex gap-1" role="group" aria-label="Selecionar hora e minuto">
                                  <Select value={scheduledHour} onValueChange={setScheduledHour}>
                                    <SelectTrigger className="h-9 text-sm backdrop-blur-sm border-purple-600/40 bg-purple-900/30 focus:bg-purple-800/40 focus:border-purple-400/60 text-purple-100" aria-label="Selecionar hora">
                                      <SelectValue placeholder="--" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-purple-600/40 max-h-48">
                                      {hours.map((hour) => (
                                        <SelectItem key={hour} value={hour} className="text-purple-100 hover:bg-purple-800/40">
                                          {hour}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span className="flex items-center text-purple-300/60 text-sm">:</span>
                                  <Select value={scheduledMinute} onValueChange={setScheduledMinute}>
                                    <SelectTrigger className="h-9 text-sm backdrop-blur-sm border-purple-600/40 bg-purple-900/30 focus:bg-purple-800/40 focus:border-purple-400/60 text-purple-100" aria-label="Selecionar minuto">
                                      <SelectValue placeholder="--" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-purple-600/40 max-h-48">
                                      {minutes.map((minute) => (
                                        <SelectItem key={minute} value={minute} className="text-purple-100 hover:bg-purple-800/40">
                                          {minute}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </motion.div>
                            
                            <AnimatePresence>
                              {scheduledDate && (
                                <motion.div 
                                  className="flex items-center gap-2 mt-3"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Agendada
                                  </Badge>
                                  <span className="text-xs text-purple-300/80">
                                    {scheduledDate.toLocaleDateString('pt-BR')}
                                    {scheduledHour && scheduledMinute && ` às ${scheduledHour}:${scheduledMinute}`}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <motion.button 
                    type="submit" 
                    size="lg"
                    onClick={() => playClickSound()}
                    disabled={!text.trim() || (validationResult ? !validationResult.isValid : false)}
                    className={`w-full h-14 text-lg font-semibold text-white transition-all duration-700 ease-out hover:shadow-2xl add-todo-button rounded-xl backdrop-blur-sm ${
                      validationResult && !validationResult.isValid
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-500/60 cursor-not-allowed opacity-50 hover:shadow-red-500/30'
                        : validationResult && validationResult.isValid
                        ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-700 hover:via-violet-700 hover:to-purple-700 border-purple-400/60 hover:border-purple-300/80 hover:shadow-purple-500/40 shadow-lg'
                        : 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-700 hover:via-violet-700 hover:to-purple-700 border-purple-400/60 hover:border-purple-300/80 hover:shadow-purple-500/40 shadow-lg'
                    }`}
                    aria-label="Adicionar nova tarefa"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    whileInView={{ 
                      scale: [0.95, 1],
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 12, 0] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }}
                      >
                        <Sparkles className="h-6 w-6 mr-3 text-white" />
                      </motion.div>
                      <span>Adicionar</span>
                    </motion.div>
                  </motion.button>
                </motion.div>
              </div>
            </motion.form>

            {/* Dicas */}
            <motion.div 
              className="text-center space-y-2 pt-4 border-t border-purple-600/40 group-hover:border-purple-500/50 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
              >
                <p className="text-xs text-purple-200/80 group-hover:text-purple-100/90 transition-colors duration-500">
                  ⭐ Clique na estrela para marcar como prioritária
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 }}
              >
                <p className="text-xs text-purple-200/80 group-hover:text-purple-100/90 transition-colors duration-500">
                  ✨ Complete tarefas para ganhar XP
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <p className="text-xs text-purple-200/80 group-hover:text-purple-100/90 transition-colors duration-500">
                  🔍 Cada tarefa deve ter um nome único
                </p>
              </motion.div>
              <AnimatePresence>
                {currentLevel >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, delay: 1.3 }}
                  >
                    <p className="text-xs text-purple-200/80 group-hover:text-purple-100/90 transition-colors duration-500">
                      📅 Nível {currentLevel}: Agende tarefas para o futuro
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Tarefa Duplicada */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-sm border border-orange-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
              Tarefa Duplicada
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-3">
              <p>
                Já existe uma tarefa com o nome <strong>"{duplicateTaskName}"</strong> em sua lista.
              </p>
              <p className="text-sm">
                Para manter sua lista organizada, considere usar um nome diferente ou verificar se a tarefa já foi concluída.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleConfirmDuplicate}
              className="bg-muted hover:bg-muted/80"
            >
              Entendi
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDuplicate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});