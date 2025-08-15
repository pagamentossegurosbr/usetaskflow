'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, Star, Clock, Edit, Trash2, Check, X, Lock, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Todo } from '@/app/page';
import { useCooldown } from '@/hooks/useCooldown';
import { playDeleteSound, playClickSound, playErrorSound } from '@/lib/sounds';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  onTogglePriority?: (id: string) => void;
}

const TodoItemComponent = function TodoItem({ todo, onToggle, onDelete, onEdit, onTogglePriority }: TodoItemProps) {
  // Não renderizar tarefas sem ID válido
  if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
    return null;
  }
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [showEditTooltip, setShowEditTooltip] = useState(false);
  const [showPriorityTooltip, setShowPriorityTooltip] = useState(false);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);

  // Inicializar editText quando o componente montar
  useEffect(() => {
    setEditText(todo.text || '');
  }, [todo.text]);

  
  const buttonRefs = {
    blocked: useRef<HTMLButtonElement>(null),
    edit: useRef<HTMLButtonElement>(null),
    priority: useRef<HTMLButtonElement>(null),
    delete: useRef<HTMLButtonElement>(null),
  };
  
  const { isBlocked, canToggle, recordToggle, getBlockReason, getRemainingTime } = useCooldown();

  // Verificar se a tarefa está bloqueada - memoizado para evitar recálculos
  const isTaskBlocked = useMemo(() => isBlocked(todo.id, 'toggle'), [isBlocked, todo.id]);
  const isDeleteBlocked = useMemo(() => isBlocked(todo.id, 'delete'), [isBlocked, todo.id]);
  const isEditBlocked = useMemo(() => isBlocked(todo.id, 'edit'), [isBlocked, todo.id]);
  const isPriorityBlocked = useMemo(() => isBlocked(todo.id, 'priority'), [isBlocked, todo.id]);

  // Memoizar o estado de bloqueio para evitar re-renderizações
  const blockedStates = useMemo(() => ({
    task: isTaskBlocked,
    delete: isDeleteBlocked,
    edit: isEditBlocked,
    priority: isPriorityBlocked
  }), [isTaskBlocked, isDeleteBlocked, isEditBlocked, isPriorityBlocked]);

  // Atualizar tempo restante - otimizado para evitar loops infinitos
  useEffect(() => {
    const isAnyBlocked = isTaskBlocked || isDeleteBlocked || isEditBlocked || isPriorityBlocked;
    
    if (!isAnyBlocked) {
      setRemainingTime(prev => prev !== 0 ? 0 : prev); // Só atualiza se necessário
      return;
    }

    const updateRemainingTime = () => {
      const newTime = getRemainingTime(todo.id);
      setRemainingTime(prev => {
        // Só atualiza se o valor mudou significativamente (diferença > 100ms)
        if (Math.abs(prev - newTime) > 100) {
          return newTime;
        }
        return prev;
      });
    };

    // Executa imediatamente uma vez
    updateRemainingTime();
    
    // Configura intervalo apenas se ainda há bloqueio
    const interval = setInterval(() => {
      const stillBlocked = isBlocked(todo.id, 'toggle') || isBlocked(todo.id, 'delete') || 
                          isBlocked(todo.id, 'edit') || isBlocked(todo.id, 'priority');
      
      if (stillBlocked) {
        updateRemainingTime();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [todo.id, isTaskBlocked, isDeleteBlocked, isEditBlocked, isPriorityBlocked, isBlocked]); // Removido getRemainingTime das dependências

  // Handlers memoizados com useCallback - otimizado para performance
  const handleToggle = useCallback(() => {
    // Verificar se o ID é válido
    if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
      return;
    }

    // Verificação combinada e otimizada
    if (isTaskBlocked || !canToggle(todo.id, 'toggle')) {
      playErrorSound();
      const message = isTaskBlocked ? 'Ação bloqueada' : 'Muito rápido!';
      const description = isTaskBlocked 
        ? `Aguarde ${Math.ceil(remainingTime / 1000)} segundos antes de alternar esta tarefa novamente.`
        : 'Aguarde um momento antes de alternar esta tarefa novamente.';
      
      toast.error(message, {
        description,
        duration: isTaskBlocked ? 3000 : 2000,
      });
      return;
    }

    // Executar ações em paralelo para máxima responsividade
    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      recordToggle(todo.id, 'toggle');
      playClickSound();
      onToggle(todo.id);
    }, 0);
  }, [isTaskBlocked, remainingTime, canToggle, todo.id, recordToggle, onToggle]);

  const handleDelete = useCallback(() => {
    // Verificar se o ID é válido
    if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
      return;
    }

    if (isDeleteBlocked) {
      playErrorSound();
      toast.error('Ação bloqueada', {
        description: `Aguarde ${Math.ceil(remainingTime / 1000)} segundos antes de excluir esta tarefa novamente.`,
        duration: 3000,
      });
      return;
    }

    if (canToggle(todo.id, 'delete')) {
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        recordToggle(todo.id, 'delete');
        onDelete(todo.id);
        playClickSound();
      }, 0);
    } else {
      playErrorSound();
      toast.error('Muito rápido!', {
        description: 'Aguarde um momento antes de excluir esta tarefa novamente.',
        duration: 2000,
      });
    }
  }, [isDeleteBlocked, remainingTime, canToggle, todo.id, recordToggle, onDelete]);

  const handleEdit = useCallback(() => {
    // Verificar se o ID é válido
    if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
      return;
    }

    if (isEditBlocked) {
      playErrorSound();
      toast.error('Ação bloqueada', {
        description: `Aguarde ${Math.ceil(remainingTime / 1000)} segundos antes de editar esta tarefa novamente.`,
        duration: 3000,
      });
      return;
    }

    if (canToggle(todo.id, 'edit')) {
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        recordToggle(todo.id, 'edit');
        setIsEditing(true);
        playClickSound();
      }, 0);
    } else {
      playErrorSound();
      toast.error('Muito rápido!', {
        description: 'Aguarde um momento antes de editar esta tarefa novamente.',
        duration: 2000,
      });
    }
  }, [isEditBlocked, remainingTime, canToggle, todo.id, recordToggle]);

  const handleSaveEdit = useCallback(() => {
    // Verificar se o ID é válido
    if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
      return;
    }

    if (editText.trim() === '') {
      toast.error('Texto não pode estar vazio');
      return;
    }
    
    if (editText.trim() !== todo.text) {
      onEdit(todo.id, editText.trim());
    }
    
    setIsEditing(false);
    playClickSound();
  }, [editText, todo.text, todo.id, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditText(todo.text || '');
    setIsEditing(false);
  }, [todo.text]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleTogglePriority = useCallback(() => {
    // Verificar se o ID é válido
    if (!todo.id || todo.id === 'undefined' || todo.id === 'null') {
      return;
    }

    if (!onTogglePriority) return;
    
    if (isPriorityBlocked) {
      playErrorSound();
      toast.error('Ação bloqueada', {
        description: `Aguarde ${Math.ceil(remainingTime / 1000)} segundos antes de alterar a prioridade novamente.`,
        duration: 3000,
      });
      return;
    }

    if (canToggle(todo.id, 'priority')) {
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        recordToggle(todo.id, 'priority');
        onTogglePriority(todo.id);
        playClickSound();
      }, 0);
    } else {
      playErrorSound();
      toast.error('Muito rápido!', {
        description: 'Aguarde um momento antes de alterar a prioridade novamente.',
        duration: 2000,
      });
    }
  }, [isPriorityBlocked, remainingTime, canToggle, todo.id, recordToggle, onTogglePriority]);

  // Memoizar funções de formatação para evitar recriação a cada render
  const formatDate = useCallback((date: Date | string | undefined) => {
    if (!date) return 'Data não disponível';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);
    } catch (error) {
      // Log removido para melhorar performance
      return 'Data inválida';
    }
  }, []);

  const formatRemainingTime = useCallback((time: number) => {
    if (time <= 0) return '';
    
    const minutes = Math.ceil(time / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.ceil(time / (60 * 60 * 1000));
    return `${hours}h`;
  }, []);

  // Memoizar cores e ícones para evitar recálculos
  const priorityColor = useMemo(() => {
    if (todo.completed) {
      if (todo.priority) return 'border-yellow-500/50 bg-gradient-to-r from-green-500/10 to-yellow-500/10';
      return 'border-green-500/50 bg-green-500/10';
    }
    if (todo.priority) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-border/50 bg-card/30';
  }, [todo.priority, todo.completed]);

  const priorityIcon = useMemo(() => {
    if (todo.priority) return <Star className="h-4 w-4 text-yellow-500" />;
    if (todo.completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  }, [todo.priority, todo.completed]);



  return (
    <>
      <motion.div 
        className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md min-h-[80px] ${
          todo.completed 
            ? 'bg-black/90 border-green-500/30 text-green-400' 
            : 'bg-black/90 border-border hover:border-primary/30'
        } ${isTaskBlocked ? 'opacity-75' : ''} ${priorityColor}`}
        initial={{ opacity: 0, y: 5, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.1, ease: "easeOut" }
        }}
        whileTap={{ scale: 0.99 }}
      >
        
        {/* Grid Layout Principal */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
          
          {/* Coluna 1: Checkbox */}
          <motion.button
            ref={buttonRefs.blocked}
            onClick={handleToggle}
            disabled={!canToggle}
            onMouseEnter={() => isTaskBlocked && setShowBlockedTooltip(true)}
            onMouseLeave={() => setShowBlockedTooltip(false)}
            aria-label={todo.completed ? `Desmarcar tarefa: ${todo.text}` : `Marcar tarefa como concluída: ${todo.text}`}
            className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
              todo.completed 
                ? todo.priority 
                  ? 'bg-gradient-to-br from-green-500/20 to-yellow-500/20 text-green-400' 
                  : 'bg-green-500/20 text-green-400'
                : todo.priority
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary'
            } ${!canToggle ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <motion.div
              animate={{ 
                scale: todo.completed ? [1, 1.05, 1] : 1,
                rotate: todo.completed ? [0, 3, 0] : 0
              }}
              transition={{ 
                duration: 0.15,
                ease: "easeOut"
              }}
            >
              {isTaskBlocked ? (
                <Lock className="h-4 w-4 text-red-400" />
              ) : todo.completed ? (
                <CheckCircle className="h-4 w-4" />
              ) : todo.priority ? (
                <Circle className="h-4 w-4 text-yellow-400" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </motion.div>
          </motion.button>

          {/* Coluna 2: Conteúdo Principal */}
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-8 text-sm bg-background/50 border-border focus:border-primary"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit} className="h-8 px-2" aria-label="Salvar edição">
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 px-2" aria-label="Cancelar edição">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Linha 1: Texto da tarefa */}
                <div className="flex items-start gap-2">
                  <span className={`text-sm font-medium break-words leading-relaxed ${todo.completed ? 'line-through opacity-70' : ''} ${todo.priority ? 'text-yellow-100' : ''}`}>
                    {todo.text}
                  </span>
                </div>
                
                {/* Linha 2: Timestamps */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Criada: {formatDate(todo.createdAt)}</span>
                  {todo.completedAt && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 font-medium">Concluída: {formatDate(todo.completedAt)}</span>
                    </>
                  )}
                  {todo.scheduledFor && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-purple-400">
                        <Calendar className="h-3 w-3" />
                        <span>Agendada: {formatDate(todo.scheduledFor)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Coluna 3: Status e Ações */}
          <div className="flex flex-col items-end gap-2">
            
            {/* Status de bloqueio */}
            {isTaskBlocked && (
              <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                <Lock className="h-3 w-3" />
                <span className="whitespace-nowrap">{formatRemainingTime(remainingTime)}</span>
              </div>
            )}
            
            {/* Indicador de prioridade para tarefas concluídas */}
            {todo.completed && todo.priority && (
              <div className="text-xs text-yellow-400 font-medium bg-yellow-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Prioritária</span>
              </div>
            )}
            
            {/* Ações */}
            <motion.div 
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {!isEditing && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      ref={buttonRefs.edit}
                      size="sm"
                      variant="ghost"
                      onClick={handleEdit}
                      disabled={isEditBlocked}
                      onMouseEnter={() => setShowEditTooltip(true)}
                      onMouseLeave={() => setShowEditTooltip(false)}
                      aria-label={`Editar tarefa: ${todo.text}`}
                      className={`h-8 w-8 p-0 hover:bg-primary/20 ${isEditBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </motion.div>
                  {onTogglePriority && (
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        ref={buttonRefs.priority}
                        size="sm"
                        variant="ghost"
                        onClick={handleTogglePriority}
                        disabled={isPriorityBlocked}
                        onMouseEnter={() => setShowPriorityTooltip(true)}
                        onMouseLeave={() => setShowPriorityTooltip(false)}
                        aria-label={todo.priority ? `Remover prioridade da tarefa: ${todo.text}` : `Definir prioridade para tarefa: ${todo.text}`}
                        className={`h-8 w-8 p-0 ${
                          todo.priority 
                            ? 'text-yellow-500 hover:bg-yellow-500/20' 
                            : 'text-muted-foreground hover:bg-primary/20'
                        } ${isPriorityBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <motion.div
                          animate={{ rotate: todo.priority ? [0, 360] : 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <Star className="h-3 w-3" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          ref={buttonRefs.delete}
                          size="sm"
                          variant="ghost"
                          disabled={isDeleteBlocked}
                          onMouseEnter={() => setShowDeleteTooltip(true)}
                          onMouseLeave={() => setShowDeleteTooltip(false)}
                          aria-label={`Excluir tarefa: ${todo.text}`}
                          className={`h-8 w-8 p-0 text-red-500 hover:bg-red-500/20 ${isDeleteBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/95 backdrop-blur-sm border border-red-500/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                          <Trash2 className="h-5 w-5" />
                          Excluir Tarefa
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Tem certeza que deseja excluir a tarefa <strong>"{todo.text}"</strong>? 
                          Esta ação não pode ser desfeita e a tarefa será removida permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted hover:bg-muted/80">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete} 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir Tarefa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tooltips Customizados com Portal */}
      {showBlockedTooltip && buttonRefs.blocked.current && typeof window !== 'undefined' ? createPortal(
        (() => {
          const rect = buttonRefs.blocked.current.getBoundingClientRect();
          const tooltipHeight = 80;
          const tooltipWidth = 160;
          const margin = 10;
          
          let left = rect.left + rect.width / 2;
          let transformX = 'translateX(-50%)';
          
          if (left - tooltipWidth / 2 < margin) {
            left = tooltipWidth / 2 + margin;
            transformX = 'translateX(0)';
          } else if (left + tooltipWidth / 2 > window.innerWidth - margin) {
            left = window.innerWidth - tooltipWidth / 2 - margin;
            transformX = 'translateX(0)';
          }
          
          let top = rect.top - margin;
          let transformY = 'translateY(-100%)';
          let arrowClass = 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900/95';
          
          if (top - tooltipHeight < margin) {
            top = rect.bottom + margin;
            transformY = 'translateY(0)';
            arrowClass = 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-900/95';
          }
          
          return (
            <div
              className="fixed bg-red-900/95 backdrop-blur-sm border border-red-500/40 rounded-lg p-2 shadow-2xl"
              style={{
                top: top,
                left: left,
                transform: `${transformX} ${transformY}`,
                zIndex: 999999999,
                backgroundColor: 'rgba(0, 0, 0, 0.95)'
              }}
            >
              <div className="text-center">
                <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-red-400" />
                <p className="text-xs font-medium text-red-200">Tarefa Bloqueada</p>
                <p className="text-xs text-red-200/80">
                  {formatRemainingTime(remainingTime)} restante
                </p>
              </div>
              <div className={`absolute ${arrowClass}`} />
            </div>
          );
        })(),
        document.body
      ) : null}

      {showEditTooltip && buttonRefs.edit.current ? createPortal(
        (() => {
          const rect = buttonRefs.edit.current.getBoundingClientRect();
          const tooltipHeight = 40;
          const tooltipWidth = 80;
          const margin = 10;
          
          let left = rect.left + rect.width / 2;
          let transformX = 'translateX(-50%)';
          
          if (left - tooltipWidth / 2 < margin) {
            left = tooltipWidth / 2 + margin;
            transformX = 'translateX(0)';
          } else if (left + tooltipWidth / 2 > window.innerWidth - margin) {
            left = window.innerWidth - tooltipWidth / 2 - margin;
            transformX = 'translateX(0)';
          }
          
          let top = rect.top - margin;
          let transformY = 'translateY(-100%)';
          let arrowClass = 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95';
          
          if (top - tooltipHeight < margin) {
            top = rect.bottom + margin;
            transformY = 'translateY(0)';
            arrowClass = 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900/95';
          }
          
          return (
            <div
              className="fixed bg-slate-900/95 backdrop-blur-sm border border-slate-500/40 rounded-lg p-2 shadow-2xl"
              style={{
                top: top,
                left: left,
                transform: `${transformX} ${transformY}`,
                zIndex: 999999999
              }}
            >
              <p className="text-xs text-slate-200">Editar tarefa</p>
              <div className={`absolute ${arrowClass}`} />
            </div>
          );
        })(),
        document.body
      ) : null}

      {showPriorityTooltip && buttonRefs.priority.current ? createPortal(
        (() => {
          const rect = buttonRefs.priority.current.getBoundingClientRect();
          const tooltipHeight = 40;
          const tooltipWidth = 120;
          const margin = 10;
          
          let left = rect.left + rect.width / 2;
          let transformX = 'translateX(-50%)';
          
          if (left - tooltipWidth / 2 < margin) {
            left = tooltipWidth / 2 + margin;
            transformX = 'translateX(0)';
          } else if (left + tooltipWidth / 2 > window.innerWidth - margin) {
            left = window.innerWidth - tooltipWidth / 2 - margin;
            transformX = 'translateX(0)';
          }
          
          let top = rect.top - margin;
          let transformY = 'translateY(-100%)';
          let arrowClass = 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95';
          
          if (top - tooltipHeight < margin) {
            top = rect.bottom + margin;
            transformY = 'translateY(0)';
            arrowClass = 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900/95';
          }
          
          return (
            <div
              className="fixed bg-slate-900/95 backdrop-blur-sm border border-slate-500/40 rounded-lg p-2 shadow-2xl"
              style={{
                top: top,
                left: left,
                transform: `${transformX} ${transformY}`,
                zIndex: 999999999
              }}
            >
              <p className="text-xs text-slate-200">
                {todo.priority ? 'Remover prioridade' : 'Marcar como prioritária'}
              </p>
              <div className={`absolute ${arrowClass}`} />
            </div>
          );
        })(),
        document.body
      ) : null}

      {showDeleteTooltip && buttonRefs.delete.current ? createPortal(
        (() => {
          const rect = buttonRefs.delete.current.getBoundingClientRect();
          const tooltipHeight = 40;
          const tooltipWidth = 100;
          const margin = 10;
          
          let left = rect.left + rect.width / 2;
          let transformX = 'translateX(-50%)';
          
          if (left - tooltipWidth / 2 < margin) {
            left = tooltipWidth / 2 + margin;
            transformX = 'translateX(0)';
          } else if (left + tooltipWidth / 2 > window.innerWidth - margin) {
            left = window.innerWidth - tooltipWidth / 2 - margin;
            transformX = 'translateX(0)';
          }
          
          let top = rect.top - margin;
          let transformY = 'translateY(-100%)';
          let arrowClass = 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95';
          
          if (top - tooltipHeight < margin) {
            top = rect.bottom + margin;
            transformY = 'translateY(0)';
            arrowClass = 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900/95';
          }
          
          return (
            <div
              className="fixed bg-slate-900/95 backdrop-blur-sm border border-slate-500/40 rounded-lg p-2 shadow-2xl"
              style={{
                top: top,
                left: left,
                transform: `${transformX} ${transformY}`,
                zIndex: 999999999
              }}
            >
              <p className="text-xs text-slate-200">Excluir tarefa</p>
              <div className={`absolute ${arrowClass}`} />
            </div>
          );
        })(),
        document.body
      ) : null}
    </>
  );
};

// Otimização com React.memo e comparação personalizada para evitar re-renderizações desnecessárias
export const TodoItem = memo(TodoItemComponent, (prevProps, nextProps) => {
  // Comparar apenas propriedades essenciais que afetam a renderização
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.priority === nextProps.todo.priority &&
    prevProps.todo.scheduledFor?.getTime() === nextProps.todo.scheduledFor?.getTime() &&
    prevProps.onToggle === nextProps.onToggle &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onTogglePriority === nextProps.onTogglePriority
  );
});