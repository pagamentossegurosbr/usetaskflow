'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  FileText, 
  ChevronRight,
  Edit3,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  Circle,
  Image as ImageIcon,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

interface Project {
  id: string;
  title: string;
  category: string;
  status: 'planning' | 'in-progress' | 'paused' | 'completed';
  progress: number;
  notes: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
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

export default function ProjectPlanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscriptionPlan, isExecutor } = useSubscription();
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Construir um SaaS',
      category: 'SaaS',
      status: 'planning',
      progress: 30,
      notes: '',
      description: 'Projeto para desenvolver uma plataforma SaaS completa com autenticação, dashboard e funcionalidades avançadas.',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      steps: [
        { id: '1', title: 'Pesquisa de mercado e análise de concorrência', completed: false, order: 1, subtasks: { completed: 2, total: 3 } },
        { id: '2', title: 'Design da interface e experiência do usuário', completed: false, order: 2, subtasks: { completed: 0, total: 0 } },
        { id: '3', title: 'Desenvolvimento do backend e integração com banco de dados', completed: false, order: 3, subtasks: { completed: 1, total: 4 } },
        { id: '4', title: 'Lançamento beta e coleta de feedback dos usuários', completed: false, order: 4, subtasks: { completed: 0, total: 0 } }
      ],
      todos: [
        { id: '1', text: 'Definir requisitos funcionais e não funcionais', completed: false },
        { id: '2', text: 'Criar wireframes e protótipos', completed: true },
        { id: '3', text: 'Configurar ambiente de desenvolvimento', completed: false },
        { id: '4', text: 'Implementar sistema de autenticação', completed: false }
      ],
      kanban: {
        columns: [
          {
            id: 'todo',
            title: 'A Fazer',
            tasks: [
              { id: '1', text: 'Criar protótipo de alta fidelidade', priority: 'high', dueDate: '2024-01-15' },
              { id: '2', text: 'Definir arquitetura do sistema', priority: 'medium' },
              { id: '3', text: 'Configurar ambiente de desenvolvimento', priority: 'low' }
            ]
          },
          {
            id: 'progress',
            title: 'Em Progresso',
            tasks: [
              { id: '4', text: 'Desenvolver API REST', priority: 'high' },
              { id: '5', text: 'Implementar autenticação JWT', priority: 'medium' }
            ]
          },
          {
            id: 'review',
            title: 'Revisão',
            tasks: [
              { id: '6', text: 'Revisar documentação técnica', priority: 'medium' },
              { id: '7', text: 'Testar funcionalidades críticas', priority: 'low' }
            ]
          },
          {
            id: 'done',
            title: 'Concluído',
            tasks: [
              { id: '8', text: 'Pesquisa de mercado', priority: 'high' },
              { id: '9', text: 'Definir personas do usuário', priority: 'medium' },
              { id: '10', text: 'Criar wireframes iniciais', priority: 'high' }
            ]
          }
        ]
      },
      quickChecklist: [
        { id: '1', text: 'Enviar e-mail para designer', completed: true },
        { id: '2', text: 'Agendar reunião com equipe de desenvolvimento', completed: false },
        { id: '3', text: 'Atualizar documentação do projeto', completed: false }
      ],
      files: []
    },
    {
      id: '2',
      title: 'App Mobile de Produtividade',
      category: 'Mobile',
      status: 'in-progress',
      progress: 65,
      notes: '',
      description: 'Desenvolvimento de um aplicativo mobile para aumentar a produtividade pessoal e profissional.',
      coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
      steps: [
        { id: '1', title: 'Definir funcionalidades principais', completed: true, order: 1, subtasks: { completed: 3, total: 3 } },
        { id: '2', title: 'Criar design system', completed: true, order: 2, subtasks: { completed: 5, total: 5 } },
        { id: '3', title: 'Desenvolver MVP', completed: false, order: 3, subtasks: { completed: 2, total: 8 } },
        { id: '4', title: 'Testes com usuários', completed: false, order: 4, subtasks: { completed: 0, total: 0 } }
      ],
      todos: [],
      kanban: { columns: [] },
      quickChecklist: [],
      files: []
    },
    {
      id: '3',
      title: 'Sistema de E-commerce',
      category: 'E-commerce',
      status: 'paused',
      progress: 25,
      notes: '',
      description: 'Plataforma completa de e-commerce com gestão de produtos, carrinho de compras e pagamentos.',
      coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12',
      steps: [
        { id: '1', title: 'Análise de requisitos', completed: true, order: 1, subtasks: { completed: 4, total: 4 } },
        { id: '2', title: 'Arquitetura do sistema', completed: false, order: 2, subtasks: { completed: 1, total: 3 } },
        { id: '3', title: 'Desenvolvimento do backend', completed: false, order: 3, subtasks: { completed: 0, total: 0 } },
        { id: '4', title: 'Interface do usuário', completed: false, order: 4, subtasks: { completed: 0, total: 0 } }
      ],
      todos: [],
      kanban: { columns: [] },
      quickChecklist: [],
      files: []
    }
  ]);

  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    category: '',
    description: '',
    coverImage: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const statusConfig = {
    planning: { label: 'Planejando', color: 'bg-blue-600/20 text-blue-300 border-blue-500/30', icon: Clock },
    'in-progress': { label: 'Em andamento', color: 'bg-green-600/20 text-green-300 border-green-500/30', icon: Target },
    paused: { label: 'Pausado', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30', icon: Circle },
    completed: { label: 'Concluído', color: 'bg-purple-600/20 text-purple-300 border-purple-500/30', icon: CheckCircle }
  };

  // Verificar se o usuário tem acesso ao Project Planner
  useEffect(() => {
    if (session && !isExecutor) {
      toast.error('Apenas usuários do plano Executor podem acessar o Project Planner');
      router.push('/');
    }
  }, [session, isExecutor, router]);

  // Se não tem acesso, não renderiza nada
  if (!session || !isExecutor) {
    return null;
  }

  const createNewProject = () => {
    if (!newProjectForm.title.trim() || !newProjectForm.category.trim()) {
      toast.error('Título e categoria são obrigatórios');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      title: newProjectForm.title.trim(),
      category: newProjectForm.category.trim(),
      status: 'planning',
      progress: 0,
      notes: '',
      description: newProjectForm.description.trim(),
      coverImage: newProjectForm.coverImage.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      steps: [],
      todos: [],
      kanban: {
        columns: [
          { id: 'todo', title: 'A Fazer', tasks: [] },
          { id: 'progress', title: 'Em Progresso', tasks: [] },
          { id: 'review', title: 'Revisão', tasks: [] },
          { id: 'done', title: 'Concluído', tasks: [] }
        ]
      },
      quickChecklist: [],
      files: []
    };

    setProjects(prev => [newProject, ...prev]);
    setNewProjectForm({ title: '', category: '', description: '', coverImage: '' });
    setShowNewProjectModal(false);
    toast.success('Projeto criado com sucesso!');
  };

  // Função para calcular progresso real baseado nos dados do projeto
  const calculateRealProgress = (project: Project): number => {
    let totalItems = 0;
    let completedItems = 0;

    // Etapas
    totalItems += project.steps.length;
    completedItems += project.steps.filter(step => step.completed).length;

    // To-dos
    totalItems += project.todos.length;
    completedItems += project.todos.filter(todo => todo.completed).length;

    // Kanban tasks - apenas tarefas na coluna "done" são consideradas completadas
    const totalKanbanTasks = project.kanban.columns.reduce((total, col) => total + col.tasks.length, 0);
    const completedKanbanTasks = project.kanban.columns
      .filter(col => col.id === 'done')
      .reduce((total, col) => total + col.tasks.length, 0);
    
    totalItems += totalKanbanTasks;
    completedItems += completedKanbanTasks;

    // Quick checklist
    totalItems += project.quickChecklist.length;
    completedItems += project.quickChecklist.filter(item => item.completed).length;

    // Garantir que o progresso seja entre 0 e 100
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return Math.max(0, Math.min(100, progress));
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast.success('Projeto removido');
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-32 pb-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-white/60">
          <Link href="/" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Planejador de Projetos</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Planejador de Projetos</h1>
            <p className="text-white/60">Gerencie seus projetos de forma organizada e eficiente</p>
          </div>
          <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Projeto</DialogTitle>
                <DialogDescription className="text-white/60">
                  Preencha os campos abaixo para criar um novo projeto.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Título do Projeto</label>
                  <Input
                    value={newProjectForm.title}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título do projeto"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Categoria</label>
                  <Input
                    value={newProjectForm.category}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: SaaS, Mobile, E-commerce"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Descrição</label>
                  <Textarea
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva brevemente o projeto"
                    className="bg-slate-700 border-white/20 text-white min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">URL da Imagem de Capa (opcional)</label>
                  <Input
                    value={newProjectForm.coverImage}
                    onChange={(e) => setNewProjectForm(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-slate-700 border-white/20 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createNewProject} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewProjectModal(false)} className="border-white/20 text-white hover:bg-white/10">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white pl-10 placeholder:text-white/40 focus:border-white/20"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 text-white rounded-md px-4 py-2 pr-10 focus:border-white/20 focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="">Todos os Status</option>
              <option value="planning">Planejando</option>
              <option value="in-progress">Em andamento</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
          </div>
          <Button 
            onClick={() => setShowNewProjectModal(true)}
            className="bg-white text-black hover:bg-white/90 transition-colors border-0 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
              {/* Cover Image */}
              {project.coverImage && (
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className="bg-gray-600/20 text-gray-300 border-gray-500/30 text-xs whitespace-nowrap">
                        {project.category}
                      </Badge>
                      <Badge className={`${statusConfig[project.status].color} text-xs flex items-center gap-1 whitespace-nowrap`}>
                        {React.createElement(statusConfig[project.status].icon, { className: "h-3 w-3" })}
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProject(project.id)}
                      className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {project.description && (
                    <CardDescription className="text-white/70 text-sm line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                    <span>Progresso</span>
                    <span>{calculateRealProgress(project)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateRealProgress(project)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-4">
                  <div className="text-center">
                    <div className="font-medium text-white">
                      {project.steps.filter(step => step.completed).length}/{project.steps.length}
                    </div>
                    <div>Etapas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-white">
                      {project.todos.filter(todo => todo.completed).length}/{project.todos.length}
                    </div>
                    <div>Tarefas</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-4">
                  <div className="text-center">
                    <div className="font-medium text-white">
                      {project.kanban.columns.filter(col => col.id === 'done')[0]?.tasks.length || 0}/{project.kanban.columns.reduce((total, col) => total + col.tasks.length, 0)}
                    </div>
                    <div>Kanban</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-white">
                      {project.quickChecklist.filter(item => item.completed).length}/{project.quickChecklist.length}
                    </div>
                    <div>Checklist</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/project-planner/${project.id}`} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Abrir Projeto
                    </Button>
                  </Link>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-white/40 mt-3 text-center">
                  Atualizado em {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado'}
              </h3>
              <p className="text-white/60 text-center mb-6 max-w-md">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca para encontrar seus projetos.'
                  : 'Comece criando seu primeiro projeto para organizar suas tarefas e acompanhar o progresso.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowNewProjectModal(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Projeto
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
