'use client';

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Edit, 
  Trash2, 
  Plus,
  X,
  Focus,
  Zap,
  Star
} from 'lucide-react';
import { Todo } from '@/app/page';
import { toast } from 'sonner';
import { validateTask, TaskValidationResult } from '@/lib/taskValidation';
import { useCooldown } from '@/hooks/useCooldown';

interface FocusModeProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onRescheduleTodo: (id: string, newDate: Date) => void;
  onAddTodo: (text: string, priority?: boolean, scheduledFor?: Date) => void;
  onClose: () => void;
  currentLevel: number;
}

export function FocusMode({ 
  todos, 
  onToggleTodo, 
  onDeleteTodo, 
  onEditTodo, 
  onRescheduleTodo,
  onAddTodo,
  onClose,
  currentLevel
}: FocusModeProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [isPriority, setIsPriority] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isBlocked, recordToggle, getRemainingTime } = useCooldown();

  // Verificar bloqueios para diferentes ações
  const isCreateBlocked = isBlocked('focus-create', 'create');
  const isToggleBlocked = (taskId: string) => isBlocked(taskId, 'toggle');
  const isDeleteBlocked = (taskId: string) => isBlocked(taskId, 'delete');
  const isEditBlocked = (taskId: string) => isBlocked(taskId, 'edit');

  // Filtrar tarefas - apenas tarefas não completadas
  const activeTodos = todos.filter(todo => !todo.completed);

  // Ordenar tarefas por prioridade e data de criação
  const sortedTodos = [...activeTodos].sort((a, b) => {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskText.trim()) {
      toast.error('Digite uma tarefa válida.');
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }

    // Verificar se está bloqueado para criar tarefas
    if (isCreateBlocked) {
      const remainingTime = getRemainingTime('focus-create');
      toast.error('Criação de Tarefas Bloqueada', {
        description: `Aguarde ${formatRemainingTime(remainingTime)} para criar mais tarefas.`,
        duration: 4000,
      });
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }

    // Validação da tarefa usando o sistema anti-farming
    const validation: TaskValidationResult = validateTask(newTaskText.trim());
    if (!validation.isValid) {
      toast.error(validation.reason || 'Tarefa inválida.');
      if (validation.suggestion) {
        toast.info(validation.suggestion);
      }
      setInputError(true);
      setTimeout(() => setInputError(false), 600);
      return;
    }
    
    // Registrar a criação de tarefa
    recordToggle('focus-create', 'create');
    
    onAddTodo(newTaskText.trim(), isPriority);
    setNewTaskText('');
    setIsPriority(false);
    
    // Focar no input novamente
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    toast.success('Tarefa adicionada! ✨');
  };

  // Função para formatar tempo restante
  const formatRemainingTime = useCallback((time: number) => {
    if (time <= 0) return '';
    
    const minutes = Math.ceil(time / (60 * 1000));
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.ceil(minutes / 60);
      return `${hours} h`;
    }
  }, []);

  const handleToggle = useCallback((todo: Todo) => {
    if (isToggleBlocked(todo.id)) {
      const remainingTime = getRemainingTime(todo.id);
      toast.error('Tarefa Bloqueada', {
        description: `Aguarde ${formatRemainingTime(remainingTime)} para completar esta tarefa.`,
        duration: 4000,
      });
      return;
    }

    recordToggle(todo.id, 'toggle');
    onToggleTodo(todo.id);
    
    // Toast em microtask para não bloquear a UI
    queueMicrotask(() => {
      toast.success('Tarefa concluída! 🎉', {
        description: 'Parabéns! Você está um passo mais próximo de seus objetivos!',
      duration: 3000,
      });
    });
  }, [isToggleBlocked, getRemainingTime, formatRemainingTime, recordToggle, onToggleTodo]);

  const handleDelete = (todo: Todo) => {
    if (isDeleteBlocked(todo.id)) {
      const remainingTime = getRemainingTime(todo.id);
      toast.error('Exclusão Bloqueada', {
        description: `Aguarde ${formatRemainingTime(remainingTime)} para excluir esta tarefa.`,
        duration: 4000,
      });
      return;
    }

    recordToggle(todo.id, 'delete');
    onDeleteTodo(todo.id);
    toast.success('Tarefa removida');
  };

  const handleEdit = (todo: Todo) => {
    if (isEditBlocked(todo.id)) {
      const remainingTime = getRemainingTime(todo.id);
      toast.error('Edição Bloqueada', {
        description: `Aguarde ${formatRemainingTime(remainingTime)} para editar esta tarefa.`,
        duration: 4000,
      });
      return;
    }

    setEditingTodo(todo);
    setEditText(todo.text || '');
  };

  const handleSaveEdit = () => {
    if (!editingTodo || !editText.trim()) return;
    
    const validation: TaskValidationResult = validateTask(editText.trim());
    if (!validation.isValid) {
      toast.error(validation.reason || 'Tarefa inválida.');
      return;
    }

      recordToggle(editingTodo.id, 'edit');
      onEditTodo(editingTodo.id, editText.trim());
      setEditingTodo(null);
      setEditText('');
    toast.success('Tarefa atualizada!');
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Header Minimalista */}
      <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
          className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-300"
            >
          <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo Centralizado */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 overflow-y-auto">
                {/* Header com Ícone */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm border border-white/10">
              <Focus className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-light text-white mb-1 tracking-wide">Focus Mode</h1>
          <p className="text-white/50 text-xs">Concentre-se no que realmente importa</p>
        </div>

                    {/* Input para Nova Tarefa */}
        <div className="w-full max-w-sm mb-10">
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Digite sua próxima tarefa..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-2 focus:ring-white/20 h-10 text-center pr-10 rounded-full backdrop-blur-sm transition-all duration-300 text-sm ${
                  inputError ? 'animate-shake border-red-500/50' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setIsPriority(!isPriority)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 ${
                  isPriority 
                    ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                    : 'text-white/30 hover:text-white/60 hover:bg-white/10'
                }`}
                title={isPriority ? 'Remover prioridade' : 'Marcar como prioridade'}
              >
                <Star className={`h-3.5 w-3.5 ${isPriority ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900/60 hover:bg-gray-800/80 text-white/90 hover:text-white font-medium border border-gray-700/50 hover:border-gray-600/70 h-9 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100 text-sm"
              disabled={!newTaskText.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Adicionar Tarefa
            </Button>
          </form>
        </div>

        {/* Lista de Tarefas */}
        {sortedTodos.length > 0 && (
          <div className="w-full max-w-md space-y-3">
            <div className="text-center mb-6">
              <h2 className="text-white/70 text-sm font-light">
                {sortedTodos.length} {sortedTodos.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'}
              </h2>
              </div>

            {sortedTodos.map((todo) => (
                          <Card 
                            key={todo.id} 
                className="group p-4 border border-white/10 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm hover:from-white/10 hover:to-white/5 transition-all duration-300 hover:scale-[1.02] rounded-2xl"
                          >
                <div className="flex items-center gap-4">
                                  <button
                    onClick={() => handleToggle(todo)}
                    className="flex-shrink-0 p-2 rounded-full transition-all duration-300 text-white/60 hover:text-green-400 hover:bg-green-400/10 group-hover:scale-110"
                    disabled={isToggleBlocked(todo.id)}
                                  >
                    <CheckCircle className="h-5 w-5" />
                                  </button>
                  
                        <div className="flex-1 min-w-0">
                          {editingTodo?.id === todo.id ? (
                      <div className="space-y-3">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="bg-white/10 border-white/20 text-white rounded-xl"
                          placeholder="Editar tarefa..."
                                autoFocus
                              />
                              <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30 rounded-xl"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                          <div className="flex-1">
                          <p className="text-white text-sm font-light leading-relaxed">{todo.text}</p>
                          {todo.priority && (
                            <div className="flex items-center gap-1 mt-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-yellow-400/80 text-xs font-light">Prioritária</span>
                              </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(todo)}
                            className="text-white/40 hover:text-blue-400 hover:bg-blue-400/10 p-2 rounded-full transition-all duration-300"
                            disabled={isEditBlocked(todo.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(todo)}
                            className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition-all duration-300"
                            disabled={isDeleteBlocked(todo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            {/* Estado Vazio */}
        {sortedTodos.length === 0 && (
          <div className="text-center text-white/40 mt-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Focus className="h-6 w-6" />
            </div>
            <p className="text-sm font-light mb-2">Nenhuma tarefa pendente</p>
            <p className="text-xs">Adicione uma nova tarefa para começar</p>
              </div>
            )}
          </div>
        </div>
  );
} 