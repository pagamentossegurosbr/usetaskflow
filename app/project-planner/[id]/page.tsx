'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, FileText, ChevronRight, Edit3, Trash2, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, Target, CheckCircle, Circle, GripVertical,
  ChevronUp, ChevronDown, Move, Save, X, Calendar, Clock, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  title: string;
  category: string;
  status: 'planning' | 'in-progress' | 'paused' | 'completed';
  progress: number;
  notes: string;
  description: string;
  steps: ProjectStep[];
  todos: Todo[];
  kanban: KanbanBoard;
  quickChecklist: QuickItem[];
  files: ProjectFile[];
}

interface ProjectStep {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  subtasks: { completed: number; total: number };
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanTask {
  id: string;
  text: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  timestamp?: string;
}

interface KanbanBoard {
  columns: KanbanColumn[];
}

interface QuickItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
}

// Componente SortableTask para drag and drop
function SortableTask({ task, columnId }: { task: KanbanTask; columnId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${columnId}-${task.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-200 cursor-move"
    >
      <p className="text-sm text-white mb-2 leading-relaxed">{task.text}</p>
      {task.priority && (
        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1">
          {task.priority}
        </Badge>
      )}
      {task.timestamp && (
        <div className="flex items-center gap-1 text-xs text-white/60 mt-2">
          <Clock className="h-3 w-3" />
          {task.timestamp}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const { subscriptionPlan, isExecutor } = useSubscription();
  
  const [project, setProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: '',
    status: 'planning' as const,
    description: '',
    notes: ''
  });
  const [newTodo, setNewTodo] = useState('');
  const [newQuickItem, setNewQuickItem] = useState('');
  const [newStep, setNewStep] = useState('');

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const statusConfig = {
    planning: { label: 'Planejando', color: 'bg-blue-600/20 text-blue-300 border-blue-500/30', icon: Clock },
    'in-progress': { label: 'Em andamento', color: 'bg-green-600/20 text-green-300 border-green-500/30', icon: Target },
    paused: { label: 'Pausado', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30', icon: Circle },
    completed: { label: 'Concluído', color: 'bg-purple-600/20 text-purple-300 border-purple-500/30', icon: CheckCircle }
  };

  const calculateProgress = (steps: ProjectStep[]) => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  useEffect(() => {
    if (!isExecutor) {
      toast.error('Apenas usuários do plano Executor podem acessar o Project Planner');
      router.push('/');
      return;
    }

    const mockProject: Project = {
      id: params.id as string,
      title: 'Construir um SaaS',
      category: 'SaaS',
      status: 'in-progress',
      progress: 30,
      notes: '**Projeto em desenvolvimento**\n\n*Foco principal:* Plataforma completa com autenticação e dashboard avançado.',
      description: 'Projeto para desenvolver uma plataforma SaaS completa com autenticação, dashboard e funcionalidades avançadas.',
      steps: [
        { id: '1', title: 'Planejamento e Arquitetura', completed: true, order: 1, subtasks: { completed: 3, total: 3 } },
        { id: '2', title: 'Desenvolvimento do Backend', completed: true, order: 2, subtasks: { completed: 5, total: 5 } },
        { id: '3', title: 'Implementação da Autenticação', completed: false, order: 3, subtasks: { completed: 2, total: 4 } },
        { id: '4', title: 'Desenvolvimento do Dashboard', completed: false, order: 4, subtasks: { completed: 0, total: 6 } },
        { id: '5', title: 'Testes e Deploy', completed: false, order: 5, subtasks: { completed: 0, total: 3 } }
      ],
      todos: [
        { id: '1', text: 'Configurar banco de dados', completed: true },
        { id: '2', text: 'Implementar API REST', completed: true },
        { id: '3', text: 'Criar sistema de autenticação', completed: false },
        { id: '4', text: 'Desenvolver interface do usuário', completed: false }
      ],
      kanban: {
        columns: [
          {
            id: 'todo',
            title: 'A Fazer',
            tasks: [
              { id: '1', text: 'Implementar autenticação JWT', priority: 'high', timestamp: '2024-01-20 10:30' },
              { id: '2', text: 'Criar componentes do dashboard', priority: 'medium', timestamp: '2024-01-20 11:15' }
            ]
          },
          {
            id: 'progress',
            title: 'Em Progresso',
            tasks: [
              { id: '3', text: 'Desenvolver API de usuários', priority: 'high', timestamp: '2024-01-19 14:20' },
              { id: '4', text: 'Configurar middleware de autenticação', priority: 'medium', timestamp: '2024-01-19 16:45' }
            ]
          },
          {
            id: 'review',
            title: 'Revisão',
            tasks: [
              { id: '5', text: 'Revisar arquitetura do banco', priority: 'low', timestamp: '2024-01-18 09:30' }
            ]
          },
          {
            id: 'done',
            title: 'Concluído',
            tasks: [
              { id: '6', text: 'Configurar ambiente de desenvolvimento', priority: 'medium', timestamp: '2024-01-17 15:20' },
              { id: '7', text: 'Criar estrutura do projeto', priority: 'low', timestamp: '2024-01-17 10:00' }
            ]
          }
        ]
      },
      quickChecklist: [
        { id: '1', text: 'Verificar dependências', completed: true },
        { id: '2', text: 'Atualizar documentação', completed: false },
        { id: '3', text: 'Revisar código de segurança', completed: false }
      ],
      files: [
        { id: '1', name: 'Documentação API', type: 'link', url: 'https://docs.example.com/api' },
        { id: '2', name: 'Mockups UI', type: 'file', url: '/files/mockups.pdf' }
      ]
    };

    setProject(mockProject);
    setProjectForm({
      title: mockProject.title,
      category: mockProject.category,
      status: mockProject.status,
      description: mockProject.description,
      notes: mockProject.notes
    });
  }, [params.id, isExecutor, router]);

  useEffect(() => {
    if (project) {
      const newProgress = calculateProgress(project.steps);
      setProject(prev => prev ? { ...prev, progress: newProgress } : null);
    }
  }, [project?.steps]);

  if (!project || !isExecutor) {
    return null;
  }

  const saveProject = () => {
    setProject(prev => prev ? {
      ...prev,
      title: projectForm.title,
      category: projectForm.category,
      status: projectForm.status,
      description: projectForm.description,
      notes: projectForm.notes
    } : null);
    setEditingProject(false);
    toast.success('Projeto atualizado');
  };

  const addStep = () => {
    if (newStep.trim() && project) {
      const newOrder = Math.max(...project.steps.map(s => s.order), 0) + 1;
      const step: ProjectStep = {
        id: Date.now().toString(),
        title: newStep.trim(),
        completed: false,
        order: newOrder,
        subtasks: { completed: 0, total: 0 }
      };
      setProject(prev => prev ? {
        ...prev,
        steps: [...prev.steps, step].sort((a, b) => a.order - b.order)
      } : null);
      setNewStep('');
      toast.success('Etapa adicionada');
    }
  };

  const toggleStep = (stepId: string) => {
    setProject(prev => prev ? {
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    } : null);
  };

  const addTodo = () => {
    if (newTodo.trim() && project) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false
      };
      setProject(prev => prev ? {
        ...prev,
        todos: [...prev.todos, todo]
      } : null);
      setNewTodo('');
      toast.success('Tarefa adicionada');
    }
  };

  const toggleTodo = (id: string) => {
    setProject(prev => prev ? {
      ...prev,
      todos: prev.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    } : null);
  };

  const addQuickItem = () => {
    if (newQuickItem.trim() && project) {
      const item: QuickItem = {
        id: Date.now().toString(),
        text: newQuickItem.trim(),
        completed: false
      };
      setProject(prev => prev ? {
        ...prev,
        quickChecklist: [...prev.quickChecklist, item]
      } : null);
      setNewQuickItem('');
      toast.success('Item adicionado');
    }
  };

  const toggleQuickItem = (id: string) => {
    setProject(prev => prev ? {
      ...prev,
      quickChecklist: prev.quickChecklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    } : null);
  };

  // Função para lidar com o fim do drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || !project) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extrair informações do ID (formato: columnId-taskId)
    const [activeColumnId, activeTaskId] = activeId.split('-');
    const [overColumnId, overTaskId] = overId.split('-');

    // Verificar se estamos arrastando para uma coluna válida
    const validColumns = ['todo', 'progress', 'review', 'done'];
    if (!validColumns.includes(overColumnId)) {
      return; // Não permitir arrastar para áreas inválidas
    }

    // Se a tarefa foi movida para uma coluna diferente
    if (activeColumnId !== overColumnId) {
      const newProject = { ...project };
      
      // Encontrar a tarefa na coluna de origem
      const sourceColumn = newProject.kanban.columns.find(col => col.id === activeColumnId);
      const targetColumn = newProject.kanban.columns.find(col => col.id === overColumnId);
      
      if (sourceColumn && targetColumn) {
        const taskIndex = sourceColumn.tasks.findIndex(task => task.id === activeTaskId);
        if (taskIndex !== -1) {
          const task = sourceColumn.tasks[taskIndex];
          
          // Remover da coluna de origem
          sourceColumn.tasks.splice(taskIndex, 1);
          
          // Adicionar à coluna de destino
          targetColumn.tasks.push(task);
          
          setProject(newProject);
          toast.success(`Tarefa movida para ${targetColumn.title}!`);
        }
      }
    } else {
      // Reordenar dentro da mesma coluna
      const column = project.kanban.columns.find(col => col.id === activeColumnId);
      if (column) {
        const oldIndex = column.tasks.findIndex(task => task.id === activeTaskId);
        const newIndex = column.tasks.findIndex(task => task.id === overTaskId);
        
        if (oldIndex !== newIndex) {
          const newProject = { ...project };
          const columnIndex = newProject.kanban.columns.findIndex(col => col.id === activeColumnId);
          
          if (columnIndex !== -1) {
            newProject.kanban.columns[columnIndex].tasks = arrayMove(
              column.tasks,
              oldIndex,
              newIndex
            );
            
            setProject(newProject);
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-32 pb-6 px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/project-planner" className="hover:text-white transition-colors">
            Planejador de Projetos
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{project.title}</span>
        </nav>

        {/* Cabeçalho do Projeto */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/project-planner">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 transition-colors">
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Voltar aos Projetos
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-400" />
                  <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                </div>
                <Badge className="bg-gray-600/20 text-gray-300 border-gray-500/30 text-sm whitespace-nowrap">
                  {project.category}
                </Badge>
                <Badge className={`${statusConfig[project.status].color} text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-current/20 hover:scale-105 whitespace-nowrap`}>
                  {React.createElement(statusConfig[project.status].icon, { className: "h-4 w-4" })}
                  <span className="whitespace-nowrap">{statusConfig[project.status].label}</span>
                </Badge>
              </div>
              <Dialog open={editingProject} onOpenChange={setEditingProject}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 transition-colors">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Editar Projeto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Título</label>
                        <Input
                          value={projectForm.title}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-slate-700 border-white/20 text-white focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Categoria</label>
                        <Input
                          value={projectForm.category}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                          className="bg-slate-700 border-white/20 text-white focus:border-white/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Status</label>
                      <select
                        value={projectForm.status}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-slate-700 border border-white/20 text-white rounded-md px-3 py-2 focus:border-white/40 focus:outline-none cursor-pointer hover:bg-slate-600/50 transition-colors"
                      >
                        <option value="planning">📋 Planejando</option>
                        <option value="in-progress">🚀 Em andamento</option>
                        <option value="paused">⏸️ Pausado</option>
                        <option value="completed">✅ Concluído</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Descrição</label>
                      <Textarea
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-slate-700 border-white/20 text-white min-h-[100px] focus:border-white/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Notas</label>
                      <Textarea
                        value={projectForm.notes}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="bg-slate-700 border-white/20 text-white min-h-[200px] focus:border-white/40"
                        placeholder="Adicionar notas do projeto..."
                      />
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-white/20">
                      <Button onClick={saveProject} className="bg-white text-black hover:bg-white/90 transition-colors border-0 shadow-lg">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Projeto
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProject(false)} className="border-white/20 text-white hover:bg-white/10 transition-colors">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                <span>Progresso Geral ({project.steps.filter(s => s.completed).length}/{project.steps.length} etapas)</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            {project.description && (
              <p className="text-sm text-white/70 mt-3 leading-relaxed">
                {project.description}
              </p>
            )}
            {project.notes && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-300 font-medium mb-1">Nota do Projeto</p>
                    <p className="text-sm text-white/80 leading-relaxed line-clamp-3">
                      {project.notes.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/~~(.*?)~~/g, '$1')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* Etapas */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-[550px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Target className="h-5 w-5" />
                Etapas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {project.steps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox
                      checked={step.completed}
                      onCheckedChange={() => toggleStep(step.id)}
                      className="border-white/30 data-[state=checked]:bg-purple-600 mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm leading-relaxed ${step.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                        <span className="font-medium text-purple-400">{step.order}.</span> {step.title}
                      </span>
                      {step.subtasks.total > 0 && (
                        <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs px-2 py-1 mt-1">
                          {step.subtasks.completed}/{step.subtasks.total}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Input
                  placeholder="Nova etapa..."
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStep()}
                  className="bg-slate-800/50 border-white/20 text-white flex-1 focus:border-white/40 placeholder:text-white/40"
                />
                <Button size="sm" onClick={addStep} className="bg-white text-black hover:bg-white/90 transition-colors border-0 shadow-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* To-Do */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-[550px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                To-Do
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {project.todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="border-white/30 data-[state=checked]:bg-green-600"
                    />
                    <span className={`text-sm flex-1 leading-relaxed ${todo.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Input
                  placeholder="Nova tarefa..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  className="bg-slate-800/50 border-white/20 text-white flex-1 focus:border-white/40 placeholder:text-white/40"
                />
                <Button size="sm" onClick={addTodo} className="bg-white text-black hover:bg-white/90 transition-colors border-0 shadow-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Rápido */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-[550px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Checklist Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {project.quickChecklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleQuickItem(item.id)}
                      className="border-white/30 data-[state=checked]:bg-blue-600"
                    />
                    <span className={`text-sm flex-1 leading-relaxed ${item.completed ? 'text-white/50 line-through' : 'text-white'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Input
                  placeholder="Item rápido..."
                  value={newQuickItem}
                  onChange={(e) => setNewQuickItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addQuickItem()}
                  className="bg-slate-800/50 border-white/20 text-white flex-1 focus:border-white/40 placeholder:text-white/40"
                />
                <Button size="sm" onClick={addQuickItem} className="bg-white text-black hover:bg-white/90 transition-colors border-0 shadow-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <GripVertical className="h-5 w-5" />
              Kanban Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-4 gap-4 h-[450px]">
                {project.kanban.columns.map((column) => (
                  <div key={column.id} className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white/80">{column.title}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                        {column.tasks.length}
                      </Badge>
                    </div>
                    <SortableContext
                      items={column.tasks.map(task => `${column.id}-${task.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className={`flex-1 space-y-2 pr-2 ${column.tasks.length > 4 ? 'overflow-y-auto' : ''}`}>
                        {column.tasks.map((task) => (
                          <SortableTask key={task.id} task={task} columnId={column.id} />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                ))}
              </div>
            </DndContext>
          </CardContent>
        </Card>

        {/* Arquivos / Links Importantes */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Arquivos / Links Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${file.type === 'link' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                      {file.type === 'link' ? '🔗' : '📄'}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{file.name}</p>
                      <p className="text-xs text-white/60">{file.type === 'link' ? 'Link externo' : 'Arquivo local'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    {file.type === 'link' ? 'Abrir' : 'Download'}
                  </Button>
                </div>
              ))}
              {project.files.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum arquivo ou link adicionado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
