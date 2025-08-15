'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Trophy, 
  BarChart3, 
  Target, 
  HelpCircle, 
  SkipForward,
  Gamepad2,
  Shield,
  User,
  X,
  Timer,
  BookOpen,
  Settings,
  Crown
} from 'lucide-react';
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

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  tips?: string[];
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Bem-vindo ao TaskFlow Notch! 🎉',
    description: 'Vamos explorar todas as funcionalidades desta aplicação de produtividade gamificada.',
    icon: <Target className="h-6 w-6 text-blue-500" />,
    tips: [
      'Esta aplicação combina organização de tarefas com gamificação',
      'Complete tarefas para ganhar XP e subir de nível',
      'Desbloqueie conquistas e recursos especiais',
      'Explore todas as funcionalidades disponíveis'
    ]
  },
  {
    id: 2,
    title: 'Navegação Principal',
    description: 'Explore o menu lateral esquerdo com todas as funcionalidades disponíveis.',
    icon: <User className="h-6 w-6 text-purple-500" />,
    highlight: 'left-sidebar',
    tips: [
      'Clique em "Tarefas" para gerenciar suas atividades',
      'Acesse "Hábitos" para rastrear seus hábitos diários',
      'Use "Pomodoro Focus" para sessões de foco (Plano Executor)',
      'Explore "Biblioteca de Leitura" para organizar seus livros',
      'Acesse "Modo Caverna" para conteúdo exclusivo'
    ]
  },
  {
    id: 3,
    title: 'Sistema de Gamificação',
    description: 'Entenda como ganhar XP e subir de nível através de diferentes atividades.',
    icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    highlight: 'profile-header',
    tips: [
      'Complete tarefas para ganhar 5 XP (10 XP se prioritária)',
      'Complete hábitos diários para ganhar 3 XP cada',
      'Complete sessões Pomodoro para ganhar 1-5 XP',
      'Jogue mini-games para ganhar XP extra',
      'Mantenha streaks para bônus de XP'
    ]
  },
  {
    id: 4,
    title: 'Adicionar Tarefas',
    description: 'Crie tarefas com o sistema inteligente de sugestões e priorização.',
    icon: <Plus className="h-6 w-6 text-purple-500" />,
    highlight: 'add-todo-form',
    tips: [
      'Use o efeito spotlight interativo no card',
      'Clique na estrela ⭐ para marcar como prioritária',
      'Veja sua próxima tarefa prioritária no topo',
      'Cada tarefa deve ter um nome único',
      'Agende tarefas para datas futuras'
    ]
  },
  {
    id: 5,
    title: 'Gerenciar Tarefas',
    description: 'Organize, edite e complete suas tarefas para ganhar XP.',
    icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
    highlight: 'todo-list',
    tips: [
      'Tarefas prioritárias aparecem primeiro',
      'Complete tarefas para ganhar XP',
      'Use o sistema anti-farming para evitar abusos',
      'Edite e delete tarefas conforme necessário',
      'Veja estatísticas de produtividade'
    ]
  },
  {
    id: 6,
    title: 'Rastreador de Hábitos',
    description: 'Monitore seus hábitos diários e ganhe XP por consistência.',
    icon: <Target className="h-6 w-6 text-green-500" />,
    highlight: 'habit-tracker',
    tips: [
      'Crie hábitos personalizados com frequências diferentes',
      'Complete hábitos diários para ganhar 3 XP cada',
      'Acompanhe streaks e estatísticas',
      'Visualize progresso em gráficos',
      'Mantenha consistência para bônus'
    ]
  },
  {
    id: 7,
    title: 'Pomodoro Focus',
    description: 'Use a técnica Pomodoro para sessões de foco produtivas.',
    icon: <Timer className="h-6 w-6 text-red-500" />,
    highlight: 'pomodoro-focus',
    tips: [
      'Disponível no sidebar (Plano Executor) e página dedicada',
      'Complete sessões para ganhar 1-5 XP baseado na duração',
      'Escolha entre Foco, Pausa Curta e Pausa Longa',
      'Acompanhe estatísticas de produtividade',
      'Mantenha foco e consistência'
    ]
  },
  {
    id: 8,
    title: 'Mini-Games',
    description: 'Jogue para relaxar e ganhar XP extra.',
    icon: <Gamepad2 className="h-6 w-6 text-blue-500" />,
    highlight: 'mini-games',
    tips: [
      'Acesse através do menu lateral direito',
      'Jogue Snake Game para ganhar XP baseado na pontuação',
      'Use Mini Game para ganhar moedas e XP',
      'Tempo de jogo limitado por dia',
      'Relaxe e ganhe recompensas'
    ]
  },
  {
    id: 9,
    title: 'Biblioteca de Leitura',
    description: 'Organize seus livros e acompanhe seu progresso de leitura.',
    icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
    highlight: 'reading-library',
    tips: [
      'Adicione livros à sua biblioteca',
      'Marque status: Para ler, Lendo, Concluído',
      'Avalie livros com sistema de estrelas',
      'Adicione notas e comentários',
      'Acompanhe estatísticas de leitura'
    ]
  },
  {
    id: 10,
    title: 'Modo Caverna',
    description: 'Acesse conteúdo exclusivo e recursos especiais.',
    icon: <Shield className="h-6 w-6 text-orange-500" />,
    highlight: 'cave-mode',
    tips: [
      'Conteúdo exclusivo para usuários avançados',
      'Ebooks, vídeos e artigos especiais',
      'Recursos de produtividade avançados',
      'Acesso baseado no nível do usuário',
      'Conteúdo atualizado regularmente'
    ]
  },
  {
    id: 11,
    title: 'Calendário Interativo',
    description: 'Visualize sua produtividade diária e gerencie compromissos.',
    icon: <Calendar className="h-6 w-6 text-green-500" />,
    highlight: 'calendar',
    tips: [
      'Clique nos dias para adicionar compromissos',
      'Veja seu histórico de produtividade',
      'Categorize seus dias para melhor organização',
      'Visualize padrões de produtividade',
      'Gerencie agenda pessoal'
    ]
  },
  {
    id: 12,
    title: 'Estatísticas e Conquistas',
    description: 'Acompanhe seu progresso e desbloqueie conquistas.',
    icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
    highlight: 'stats-achievements',
    tips: [
      'Veja estatísticas detalhadas de produtividade',
      'Desbloqueie conquistas por marcos específicos',
      'Acompanhe XP ganho e nível atual',
      'Visualize gráficos de progresso',
      'Compartilhe conquistas'
    ]
  },
  {
    id: 13,
    title: 'Configurações e Perfil',
    description: 'Personalize sua experiência e gerencie seu perfil.',
    icon: <Settings className="h-6 w-6 text-gray-500" />,
    highlight: 'settings-profile',
    tips: [
      'Personalize seu avatar e informações',
      'Configure preferências de notificação',
      'Gerencie data de nascimento (limitado a 2 mudanças)',
      'Exporte seus dados',
      'Acesse configurações avançadas'
    ]
  },
  {
    id: 14,
    title: 'Suporte e Ajuda',
    description: 'Acesse suporte quando precisar de ajuda.',
    icon: <HelpCircle className="h-6 w-6 text-blue-500" />,
    highlight: 'floating-help',
    tips: [
      'Botão flutuante no canto inferior direito',
      'Suporte via WhatsApp e Email',
      'Contatos configuráveis pelo admin',
      'Disponível para todos os usuários',
      'Resposta rápida e eficiente'
    ]
  },
  {
    id: 15,
    title: 'Upgrade de Plano',
    description: 'Desbloqueie recursos avançados e continue evoluindo.',
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    highlight: 'upgrade-plan',
    tips: [
      'Plano Aspirante: Nível 10 e recursos avançados',
      'Plano Executor: Nível ilimitado e Pomodoro no sidebar',
      'Acesso a todas as funcionalidades',
      'Suporte prioritário',
      'Continue sua jornada de produtividade'
    ]
  }
];

export function Tutorial({ isOpen, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const currentStepData = tutorialSteps.find(step => step.id === currentStep);
  const progress = (currentStep / tutorialSteps.length) * 100;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setShowSkipDialog(true);
  };

  const completeTutorial = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorial-completed', 'true');
    }
    onComplete();
    
    // Mostrar modal de upgrade após completar o tutorial
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-upgrade-modal', {
        detail: { 
          currentLevel: 1,
          targetLevel: 10,
          plan: 'free',
          reason: 'tutorial-completed'
        }
      }));
    }, 1000);
  };

  const handleSkipConfirm = () => {
    setShowSkipDialog(false);
    completeTutorial();
  };

  if (!currentStepData) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Tutorial - Passo {currentStep} de {tutorialSteps.length}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Content */}
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                {currentStepData.icon}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Tips */}
              {currentStepData.tips && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2 text-left">💡 Dicas:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 text-left">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={skipTutorial}
                className="text-xs"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Pular
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 1}
                  size="sm"
                >
                  Anterior
                </Button>
                
                <Button
                  onClick={nextStep}
                  size="sm"
                >
                  {currentStep === tutorialSteps.length ? 'Finalizar' : 'Próximo'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pular Tutorial?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja pular o tutorial? Você pode sempre acessá-lo novamente através do menu de ajuda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSkipConfirm}>
              Pular Tutorial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 