'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  X, 
  Edit3, 
  Save, 
  Trash2, 
  CalendarIcon, 
  Clock, 
  Target, 
  FileText, 
  Award, 
  Tag,
  CheckCircle,
  Circle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Todo } from '@/app/page';
import { toast } from 'sonner';
import { playClickSound, playSuccessSound, playErrorSound } from '@/lib/sounds';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Todo | null;
  onUpdateTask: (id: string, updates: Partial<Todo>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleTask: (id: string) => Promise<void>;
}

export function TaskDetailModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdateTask, 
  onDeleteTask, 
  onToggleTask 
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Todo>>({});

  useEffect(() => {
    if (task) {
      setEditData({
        text: task.text,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority,
        deadline: task.deadline,
        estimatedTime: task.estimatedTime,
        tags: task.tags || [],
        reward: task.reward || ''
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;

    try {
      await onUpdateTask(task.id, editData);
      setIsEditing(false);
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        toast.success('Tarefa atualizada com sucesso!');
        playSuccessSound();
      }, 0);
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
      playErrorSound();
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    try {
      await onDeleteTask(task.id);
      onClose();
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        toast.success('Tarefa removida com sucesso!');
        playSuccessSound();
      }, 0);
    } catch (error) {
      toast.error('Erro ao remover tarefa');
      playErrorSound();
    }
  };

  const handleToggle = async () => {
    if (!task) return;

    try {
      await onToggleTask(task.id);
      // Usar setTimeout para evitar setState durante render
      setTimeout(() => {
        playClickSound();
      }, 0);
    } catch (error) {
      toast.error('Erro ao alterar status da tarefa');
      playErrorSound();
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editData.tags?.includes(tag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!task) return null;

  return (
         <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
       <DialogContent className="max-w-lg max-h-[80vh] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl overflow-hidden">
                 <DialogHeader className="space-y-3">
           <div className="flex items-center justify-between">
             <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
               <Target className="h-4 w-4 text-purple-400" />
               Detalhes da Tarefa
             </DialogTitle>
             <div className="flex items-center gap-3">
               {!isEditing && (
                 <Button
                   onClick={() => setIsEditing(true)}
                   variant="ghost"
                   size="sm"
                   className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30"
                 >
                   <Edit3 className="h-4 w-4 text-purple-400" />
                 </Button>
               )}
             </div>
           </div>
         </DialogHeader>

                 <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
                     {/* Status da Tarefa */}
           <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggle}
                variant="ghost"
                size="sm"
                className="p-2 bg-white/10 hover:bg-white/20"
              >
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-purple-400" />
                )}
              </Button>
              <div>
                <h3 className="font-semibold text-white">
                  {task.completed ? 'Concluída' : 'Pendente'}
                </h3>
                <p className="text-sm text-gray-400">
                  {task.completed 
                    ? `Concluída em ${task.completedAt ? format(new Date(task.completedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'agora'}`
                    : `Criada em ${format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`
                  }
                </p>
              </div>
            </div>
            {task.priority && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Prioritária
              </Badge>
            )}
          </div>

                     {/* Título */}
           <div className="space-y-1.5">
             <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
               <FileText className="h-3 w-3 text-purple-400" />
               Título
             </label>
            {isEditing ? (
              <Input
                value={editData.text || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, text: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white"
                placeholder="Título da tarefa..."
              />
                         ) : (
               <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                 <p className="text-white text-sm">{task.text}</p>
               </div>
             )}
           </div>

                     {/* Descrição */}
           {(task.description || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <FileText className="h-3 w-3 text-blue-400" />
                 Descrição
               </label>
              {isEditing ? (
                                 <Textarea
                   value={editData.description || ''}
                   onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                   className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white min-h-[60px] text-sm"
                   placeholder="Descrição da tarefa..."
                 />
               ) : (
                 <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                   <p className="text-gray-300 text-sm">{task.description}</p>
                 </div>
               )}
            </div>
          )}

                     {/* Categoria */}
           {(task.category || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <Target className="h-3 w-3 text-green-400" />
                 Categoria
               </label>
              {isEditing ? (
                <Input
                  value={editData.category || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white"
                  placeholder="Categoria da tarefa..."
                />
              ) : (
                               <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                 <p className="text-gray-300 text-sm">{task.category}</p>
               </div>
              )}
            </div>
          )}

                     {/* Prazo */}
           {(task.deadline || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <CalendarIcon className="h-3 w-3 text-orange-400" />
                 Prazo
               </label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editData.deadline ? format(new Date(editData.deadline), 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                                     <PopoverContent className="w-auto p-0 bg-black border-purple-500/30 shadow-2xl">
                     <Calendar
                       mode="single"
                       selected={editData.deadline ? new Date(editData.deadline + 'T12:00:00') : undefined}
                       onSelect={(date) => {
                         if (date) {
                           const year = date.getFullYear();
                           const month = String(date.getMonth() + 1).padStart(2, '0');
                           const day = String(date.getDate()).padStart(2, '0');
                           setEditData(prev => ({ ...prev, deadline: `${year}-${month}-${day}` }));
                         } else {
                           setEditData(prev => ({ ...prev, deadline: undefined }));
                         }
                       }}
                       initialFocus
                       className="bg-black text-white"
                       locale={ptBR}
                     />
                   </PopoverContent>
                </Popover>
              ) : (
                                 <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                   <p className="text-gray-300 text-sm">
                     {format(parseISO(task.deadline!), 'dd/MM/yyyy', { locale: ptBR })}
                   </p>
                 </div>
              )}
            </div>
          )}

                     {/* Tempo Estimado */}
           {(task.estimatedTime || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <Clock className="h-3 w-3 text-cyan-400" />
                 Tempo Estimado
               </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editData.estimatedTime || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || undefined }))}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white"
                  placeholder="Tempo em minutos..."
                />
              ) : (
                                 <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                   <p className="text-gray-300 text-sm">{task.estimatedTime} minutos</p>
                 </div>
              )}
            </div>
          )}

                     {/* Tags */}
           {(task.tags?.length || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <Tag className="h-3 w-3 text-purple-400" />
                 Tags
               </label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Adicionar tag (pressione Enter)"
                    className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {editData.tags?.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        #{tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto ml-1 text-purple-300 hover:text-red-400"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {task.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

                     {/* Recompensa */}
           {(task.reward || isEditing) && (
             <div className="space-y-1.5">
               <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                 <Award className="h-3 w-3 text-yellow-400" />
                 Recompensa
               </label>
              {isEditing ? (
                <Input
                  value={editData.reward || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, reward: e.target.value }))}
                  className="bg-white/5 border-white/10 focus:border-purple-500/50 text-white"
                  placeholder="Recompensa pela tarefa..."
                />
              ) : (
                                 <div className="p-2 bg-white/5 border border-white/10 rounded-md">
                   <p className="text-gray-300 text-sm">{task.reward}</p>
                 </div>
              )}
            </div>
          )}

                     {/* Ações */}
           <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-500/30"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border-purple-500/30"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
