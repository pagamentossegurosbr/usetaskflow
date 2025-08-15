'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Target, Star, Clock, CheckCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle } from 'lucide-react';
import { TodoItem } from './TodoItem';
import { Todo } from '@/app/page';
import { useCooldown } from '@/hooks/useCooldown';
import { toast } from 'sonner';
import { playDeleteSound, playErrorSound } from '@/lib/sounds';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onDeleteMultipleTodos: (ids: string[]) => void;
  onEditTodo: (id: string, newText: string) => void;
  onTogglePriority?: (id: string) => void;
  currentLevel: number;
  showScheduledTasks?: boolean;
}

export const TodoList = memo(function TodoList({ 
  todos, 
  onToggleTodo, 
  onDeleteTodo, 
  onDeleteMultipleTodos, 
  onEditTodo, 
  onTogglePriority,
  currentLevel,
  showScheduledTasks = true
}: TodoListProps) {
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [showCompletedTooltip, setShowCompletedTooltip] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const completedHeaderRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isBlocked } = useCooldown();
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);
  
  // Separar tarefas por tipo - memoizado para evitar recálculos
  const {
    priorityTodos,
    normalTodos,
    scheduledTodos,
    completedTodos,
    displayedCompletedTodos,
    hasMoreCompleted
  } = useMemo(() => {
    const priorityTodos = todos.filter(todo => todo.priority && !todo.completed && !todo.scheduledFor);
    const normalTodos = todos.filter(todo => !todo.priority && !todo.completed && !todo.scheduledFor);
    const scheduledTodos = todos.filter(todo => !todo.completed && todo.scheduledFor);
    const completedTodos = todos.filter(todo => todo.completed);
    
    // Mostrar apenas 4 tarefas concluídas por padrão
    const displayedCompletedTodos = showAllCompleted ? completedTodos : completedTodos.slice(0, 4);
    const hasMoreCompleted = completedTodos.length > 4;

    return {
      priorityTodos,
      normalTodos,
      scheduledTodos,
      completedTodos,
      displayedCompletedTodos,
      hasMoreCompleted
    };
  }, [todos, showAllCompleted]);

  // Handlers memoizados com useCallback
  const handleDeleteCompletedTodos = useCallback(() => {
    if (completedTodos.length === 0) {
      playErrorSound();
      toast.error('Nenhuma tarefa pode ser excluída', {
        description: 'Não há tarefas concluídas para excluir.',
        duration: 4000,
      });
      return;
    }
    
    // Obter todos os IDs das tarefas concluídas
    const completedTodoIds = completedTodos.map(todo => todo.id);
    
    // Excluir todas as tarefas concluídas de uma vez
    onDeleteMultipleTodos(completedTodoIds);
    
    playDeleteSound();
    
    // Mostrar mensagem de sucesso
    toast.success('Tarefas concluídas removidas! 🗑️', {
      description: `${completedTodos.length} tarefa${completedTodos.length > 1 ? 's' : ''} removida${completedTodos.length > 1 ? 's' : ''} com sucesso.`,
      duration: 4000,
    });
    
    setShowDeleteDialog(false);
  }, [completedTodos, onDeleteMultipleTodos]);

  const handleToggleShowCompleted = useCallback(() => {
    setShowAllCompleted(prev => !prev);
  }, []);

  const handleCompletedHeaderClick = useCallback(() => {
    if (hasMoreCompleted) {
      setShowAllCompleted(prev => !prev);
    }
  }, [hasMoreCompleted]);

  const handleCompletedHeaderMouseEnter = useCallback(() => {
    if (hasMoreCompleted) {
      setShowCompletedTooltip(true);
    }
  }, [hasMoreCompleted]);

  const handleCompletedHeaderMouseLeave = useCallback(() => {
    setShowCompletedTooltip(false);
  }, []);

  // Memoizar estatísticas para evitar recálculos
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = completedTodos.length;
    const pending = total - completed;
    const priority = priorityTodos.length;
    const scheduled = scheduledTodos.length;
    
    return {
      total,
      completed,
      pending,
      priority,
      scheduled
    };
  }, [todos, completedTodos, priorityTodos, scheduledTodos]);

  // Memoizar se deve mostrar seções
  const shouldShowPriority = useMemo(() => priorityTodos.length > 0, [priorityTodos]);
  const shouldShowNormal = useMemo(() => normalTodos.length > 0, [normalTodos]);
  const shouldShowScheduled = useMemo(() => scheduledTodos.length > 0 && showScheduledTasks, [scheduledTodos, showScheduledTasks]);
  const shouldShowCompleted = useMemo(() => completedTodos.length > 0, [completedTodos]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📝</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma tarefa ainda</h3>
        <p className="text-sm text-muted-foreground">
          Adicione sua primeira tarefa para começar a organizar seu dia!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tarefas Prioritárias */}
      {shouldShowPriority && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="p-3 border-yellow-500/30 bg-black/90 backdrop-blur-sm">
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.div 
                      className="p-1.5 rounded-lg bg-yellow-500/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Star className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                    <h3 className="text-sm font-semibold text-foreground">Tarefas Prioritárias</h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2, type: "spring", stiffness: 500 }}
                    >
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        {priorityTodos.length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {priorityTodos.map((todo, index) => (
                      <motion.div
                        key={`priority-${todo.id || `temp-${index}`}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.4 + (index * 0.1),
                          ease: "easeOut"
                        }}
                      >
                        <TodoItem
                          todo={todo}
                          onToggle={onToggleTodo}
                          onDelete={onDeleteTodo}
                          onEdit={onEditTodo}
                          onTogglePriority={onTogglePriority}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-2">
                <p className="font-medium">Tarefas Prioritárias</p>
                <p className="text-sm text-muted-foreground">
                  Estas tarefas são mais importantes e aparecem no topo da lista. 
                  Complete-as primeiro para maximizar sua produtividade!
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Tarefas Agendadas - Nível 2+ */}
      {currentLevel >= 2 && shouldShowScheduled && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.1
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="p-3 border-purple-500/30 bg-black/90 backdrop-blur-sm">
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div 
                      className="p-1.5 rounded-lg bg-purple-500/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Clock className="h-4 w-4 text-purple-500" />
                    </motion.div>
                    <h3 className="text-sm font-semibold text-foreground">Tarefas Agendadas</h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3, type: "spring", stiffness: 500 }}
                    >
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                        {scheduledTodos.length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {scheduledTodos.map((todo, index) => (
                      <motion.div
                        key={`scheduled-${todo.id || `temp-${index}`}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.5 + (index * 0.1),
                          ease: "easeOut"
                        }}
                      >
                        <TodoItem
                          todo={todo}
                          onToggle={onToggleTodo}
                          onDelete={onDeleteTodo}
                          onEdit={onEditTodo}
                          onTogglePriority={onTogglePriority}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-2">
                <p className="font-medium">Tarefas Agendadas</p>
                <p className="text-sm text-muted-foreground">
                  Estas tarefas foram agendadas para datas futuras. Elas aparecerão 
                  automaticamente quando chegar a data programada.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Tarefas Normais */}
      {shouldShowNormal && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.2
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card className="p-3 border-border bg-black/90 backdrop-blur-sm">
                  <motion.div 
                    className="flex items-center gap-2 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <motion.div 
                      className="p-1.5 rounded-lg bg-blue-500/20"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Clock className="h-4 w-4 text-blue-500" />
                    </motion.div>
                    <h3 className="text-sm font-semibold text-foreground">Tarefas Pendentes</h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4, type: "spring", stiffness: 500 }}
                    >
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                        {normalTodos.length}
                      </Badge>
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {normalTodos.map((todo, index) => (
                      <motion.div
                        key={`normal-${todo.id || `temp-${index}`}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.6 + (index * 0.1),
                          ease: "easeOut"
                        }}
                      >
                        <TodoItem
                          todo={todo}
                          onToggle={onToggleTodo}
                          onDelete={onDeleteTodo}
                          onEdit={onEditTodo}
                          onTogglePriority={onTogglePriority}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-2">
                <p className="font-medium">Tarefas Pendentes</p>
                <p className="text-sm text-muted-foreground">
                  Estas são suas tarefas regulares. Você pode marcá-las como prioritárias 
                  clicando no ícone de estrela para destacá-las.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Tarefas Concluídas */}
      {shouldShowCompleted && (
                        <Card className="p-4 border-green-500/30 bg-black/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <div 
            ref={completedHeaderRef}
            className="flex items-center justify-between mb-3"
            onClick={handleCompletedHeaderClick}
            onMouseEnter={handleCompletedHeaderMouseEnter}
            onMouseLeave={handleCompletedHeaderMouseLeave}
          >
            <div 
              className="flex items-center gap-3 cursor-help"
            >
              <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-green-100 transition-colors duration-300">Tarefas Concluídas</h3>
                <p className="text-xs text-muted-foreground">Parabéns pelo progresso!</p>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-green-500/30 group-hover:bg-green-500/30 transition-colors duration-300">
                {completedTodos.length}
              </Badge>
            </div>
            
            {/* Botão de excluir tarefas concluídas */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-green-500/60 hover:text-green-500 hover:bg-green-500/10 transition-colors"
                  title="Excluir Tarefas Concluídas"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/95 backdrop-blur-sm border border-destructive/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Excluir Tarefas Concluídas
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    <div className="space-y-3">
                      <p>
                        Você está prestes a excluir <strong>{completedTodos.length} tarefa{completedTodos.length !== 1 ? 's' : ''} concluída{completedTodos.length !== 1 ? 's' : ''}</strong> da sua lista.
                      </p>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-1">⚠️ Atenção</p>
                        <p className="text-xs text-muted-foreground">
                          Esta ação é <strong>irreversível</strong>. As tarefas excluídas não poderão ser recuperadas.
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Esta ação irá excluir todas as tarefas concluídas da sua lista.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-muted hover:bg-muted/80">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteCompletedTodos}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Excluir Tarefas
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="space-y-3">
            {displayedCompletedTodos.map((todo, index) => (
              <TodoItem
                key={`completed-${todo.id || `temp-${index}`}`}
                todo={todo}
                onToggle={onToggleTodo}
                onDelete={onDeleteTodo}
                onEdit={onEditTodo}
                onTogglePriority={onTogglePriority}
              />
            ))}
          </div>
          
          {/* Botão para expandir/recolher */}
          {hasMoreCompleted && (
            <div className="mt-4 pt-3 border-t border-green-500/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleShowCompleted}
                className="w-full text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 rounded-lg"
              >
                {showAllCompleted ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Mostrar menos ({completedTodos.length - 4} ocultas)
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Ver mais ({completedTodos.length - 4} tarefas)
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Tooltip Customizado para Tarefas Concluídas */}
      {showCompletedTooltip && completedHeaderRef.current && typeof window !== 'undefined' ? createPortal(
        (() => {
          const rect = completedHeaderRef.current.getBoundingClientRect();
          const tooltipHeight = 60;
          const tooltipWidth = 200;
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
          let arrowClass = 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-900/95';
          
          if (top - tooltipHeight < margin) {
            top = rect.bottom + margin;
            transformY = 'translateY(0)';
            arrowClass = 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-green-900/95';
          }
          
          return (
            <div
              className="fixed bg-green-900/95 backdrop-blur-sm border border-green-500/40 rounded-lg p-3 shadow-2xl"
              style={{
                top: top,
                left: left,
                transform: `${transformX} ${transformY}`,
                zIndex: 999999999
              }}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-200">Tarefas Concluídas</p>
                <p className="text-xs text-green-200/80">
                  {hasMoreCompleted && !showAllCompleted 
                    ? `Clique em "Ver mais" para ver todas as ${completedTodos.length} tarefas concluídas.`
                    : "Parabéns! Estas tarefas foram concluídas com sucesso."
                  }
                </p>
              </div>
              <div className={`absolute ${arrowClass}`} />
            </div>
          );
        })(),
        document.body
      ) : null}
    </div>
  );
});