'use client';

import React, { useState, useCallback } from 'react';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuLabel,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { 
  Plus, 
  Star, 
  Calendar, 
  Target, 
  Gamepad2, 
  Trophy, 
  Settings, 
  HelpCircle,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  BarChart3,
  User,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalContextMenuProps {
  onAddTodo?: (priority?: boolean) => void;
  onOpenFocusMode?: () => void;
  onOpenMiniGame?: () => void;
  onOpenSnakeGame?: () => void;
  onOpenTutorial?: () => void;
  onOpenAchievements?: () => void;
  onOpenCalendar?: () => void;
  onOpenStats?: () => void;
  onOpenProfile?: () => void;
  onClearCompleted?: () => void;
  currentLevel?: number;
  hasCompletedTasks?: boolean;
  hasScheduledTasks?: boolean;
  isFocusModeAvailable?: boolean;
  isMiniGameAvailable?: boolean;
  isSnakeGameAvailable?: boolean;
  isAdvancedFeaturesAvailable?: boolean;
}

export function GlobalContextMenu({ 
  children,
  onAddTodo,
  onOpenFocusMode,
  onOpenMiniGame,
  onOpenSnakeGame,
  onOpenTutorial,
  onOpenAchievements,
  onOpenCalendar,
  onOpenStats,
  onOpenProfile,
  onClearCompleted,
  currentLevel = 1,
  hasCompletedTasks = false,
  hasScheduledTasks = false,
  isFocusModeAvailable = true,
  isMiniGameAvailable = true,
  isSnakeGameAvailable = false,
  isAdvancedFeaturesAvailable = false
}: React.PropsWithChildren<GlobalContextMenuProps>) {

  const handleQuickAddTodo = useCallback((priority: boolean = false) => {
    if (onAddTodo) {
      onAddTodo(priority);
      toast.success(priority ? 'Tarefa prioritária criada!' : 'Tarefa criada!', {
        description: priority ? 'Tarefa marcada como prioritária' : 'Nova tarefa adicionada à lista'
      });
    }
  }, [onAddTodo]);

  const handleOpenFocusMode = useCallback(() => {
    if (onOpenFocusMode) {
      onOpenFocusMode();
      toast.success('Modo Foco ativado!', {
        description: 'Concentre-se nas suas tarefas mais importantes'
      });
    }
  }, [onOpenFocusMode]);

  const handleOpenMiniGame = useCallback(() => {
    if (onOpenMiniGame) {
      onOpenMiniGame();
      toast.success('Mini-game aberto!', {
        description: 'Divirta-se enquanto ganha XP'
      });
    }
  }, [onOpenMiniGame]);

  const handleOpenSnakeGame = useCallback(() => {
    if (onOpenSnakeGame) {
      onOpenSnakeGame();
      toast.success('Snake Game aberto!', {
        description: 'Teste seus reflexos e ganhe XP'
      });
    }
  }, [onOpenSnakeGame]);

  const handleOpenTutorial = useCallback(() => {
    if (onOpenTutorial) {
      onOpenTutorial();
      toast.info('Tutorial aberto!', {
        description: 'Aprenda a usar todas as funcionalidades'
      });
    }
  }, [onOpenTutorial]);

  const handleOpenAchievements = useCallback(() => {
    if (onOpenAchievements) {
      onOpenAchievements();
      toast.info('Conquistas abertas!', {
        description: 'Veja suas conquistas e progresso'
      });
    }
  }, [onOpenAchievements]);

  const handleOpenCalendar = useCallback(() => {
    if (onOpenCalendar) {
      onOpenCalendar();
      toast.info('Calendário aberto!', {
        description: 'Visualize suas tarefas agendadas'
      });
    }
  }, [onOpenCalendar]);

  const handleOpenStats = useCallback(() => {
    if (onOpenStats) {
      onOpenStats();
      toast.info('Estatísticas abertas!', {
        description: 'Analise seu progresso e produtividade'
      });
    }
  }, [onOpenStats]);

  const handleOpenProfile = useCallback(() => {
    if (onOpenProfile) {
      onOpenProfile();
      toast.info('Perfil aberto!', {
        description: 'Edite suas informações pessoais'
      });
    }
  }, [onOpenProfile]);

  const handleClearCompleted = useCallback(() => {
    if (onClearCompleted) {
      onClearCompleted();
      toast.success('Tarefas concluídas removidas!', {
        description: 'Lista limpa e organizada'
      });
    }
  }, [onClearCompleted]);

  const levelBasedFeatures = React.useMemo(() => {
    const features = [];
    
    if (currentLevel >= 1) {
      features.push('Tarefas básicas');
    }
    if (currentLevel >= 2) {
      features.push('Tarefas agendadas');
    }
    if (currentLevel >= 3) {
      features.push('Estatísticas avançadas');
    }
    if (currentLevel >= 4) {
      features.push('Mini-games');
    }
    if (currentLevel >= 5) {
      features.push('Snake Game');
    }
    
    return features;
  }, [currentLevel]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-64">
        {/* Seção: Ações Rápidas */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Ações Rápidas
          </ContextMenuLabel>
          
          <ContextMenuItem onClick={() => handleQuickAddTodo(false)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
            <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => handleQuickAddTodo(true)}>
            <Star className="mr-2 h-4 w-4" />
            Tarefa Prioritária
            <ContextMenuShortcut>Ctrl+Shift+N</ContextMenuShortcut>
          </ContextMenuItem>
          
          {isFocusModeAvailable && (
            <ContextMenuItem onClick={handleOpenFocusMode}>
              <Target className="mr-2 h-4 w-4" />
              Modo Foco
              <ContextMenuShortcut>Ctrl+F</ContextMenuShortcut>
            </ContextMenuItem>
          )}
        </ContextMenuGroup>

        <ContextMenuSeparator />

        {/* Seção: Jogos e Entretenimento */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Jogos e Entretenimento
          </ContextMenuLabel>
          
          {isMiniGameAvailable && (
            <ContextMenuItem onClick={handleOpenMiniGame}>
              <Gamepad2 className="mr-2 h-4 w-4" />
              Mini-Game
              <ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          
          {isSnakeGameAvailable && (
            <ContextMenuItem onClick={handleOpenSnakeGame}>
              <Zap className="mr-2 h-4 w-4" />
              Snake Game
              <ContextMenuShortcut>Ctrl+S</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          
          <ContextMenuItem onClick={handleOpenAchievements}>
            <Trophy className="mr-2 h-4 w-4" />
            Conquistas
            <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuSeparator />

        {/* Seção: Visualização e Análise */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Visualização e Análise
          </ContextMenuLabel>
          
          {hasScheduledTasks && (
            <ContextMenuItem onClick={handleOpenCalendar}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendário
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
          )}
          
          {isAdvancedFeaturesAvailable && (
            <ContextMenuItem onClick={handleOpenStats}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Estatísticas
              <ContextMenuShortcut>Ctrl+E</ContextMenuShortcut>
            </ContextMenuItem>
          )}
        </ContextMenuGroup>

        <ContextMenuSeparator />

        {/* Seção: Gerenciamento */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Gerenciamento
          </ContextMenuLabel>
          
          <ContextMenuItem onClick={handleOpenProfile}>
            <User className="mr-2 h-4 w-4" />
            Editar Perfil
            <ContextMenuShortcut>Ctrl+P</ContextMenuShortcut>
          </ContextMenuItem>
          
          {hasCompletedTasks && (
            <ContextMenuItem onClick={handleClearCompleted}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Concluídas
              <ContextMenuShortcut>Ctrl+L</ContextMenuShortcut>
            </ContextMenuItem>
          )}
        </ContextMenuGroup>

        <ContextMenuSeparator />

        {/* Seção: Ajuda e Informações */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Ajuda e Informações
          </ContextMenuLabel>
          
          <ContextMenuItem onClick={handleOpenTutorial}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Tutorial
            <ContextMenuShortcut>F1</ContextMenuShortcut>
          </ContextMenuItem>
          
          <ContextMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
            <ContextMenuShortcut>Ctrl+,</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuSeparator />

        {/* Seção: Informações do Nível */}
        <ContextMenuGroup>
          <ContextMenuLabel className="text-xs font-medium text-muted-foreground">
            Nível {currentLevel} - Funcionalidades Disponíveis
          </ContextMenuLabel>
          
          {levelBasedFeatures.map((feature, index) => (
            <ContextMenuItem key={index} disabled>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              {feature}
            </ContextMenuItem>
          ))}
          
          {currentLevel < 5 && (
            <ContextMenuItem disabled>
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Mais funcionalidades no nível {currentLevel + 1}
            </ContextMenuItem>
          )}
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
} 