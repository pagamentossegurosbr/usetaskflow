'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BarChart3, Gamepad2 } from 'lucide-react';
import { LevelTracker } from './LevelTracker';
import { WeeklyChart } from './WeeklyChart';
import { ProductivityStats, Task } from '@/hooks/useProductivityLevel';

interface RightSidebarProps {
  stats: ProductivityStats;
  tasks: Task[];
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
  showPulseAnimation: boolean;
  onOpenMiniGame: () => void;
  onOpenSnakeGame?: () => void;
  currentLevel: number;
}

export function RightSidebar({ 
  stats, 
  tasks, 
  sidebarExpanded, 
  onToggleSidebar,
  showPulseAnimation,
  onOpenMiniGame,
  onOpenSnakeGame,
  currentLevel
}: RightSidebarProps) {
  const isUnlocked = currentLevel >= 3;

  return (
    <div 
      className={`
        hidden xl:block border-l border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out
        ${sidebarExpanded ? 'w-[420px]' : 'w-20'} 
      `}
    >
      <div className="relative h-full">
        {/* Botão de toggle */}
        <div className="absolute -left-3 top-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            className={`h-6 w-6 rounded-full p-0 shadow-lg border border-border bg-card hover:bg-purple-500/20 transition-all duration-200 sidebar-hover-effect ${
              showPulseAnimation ? 'animate-pulse-glow' : ''
            }`}
            onClick={onToggleSidebar}
          >
            {sidebarExpanded ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className={`h-full transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-5 space-y-8 overflow-y-auto h-full">
            {/* Botão do Mini-Game */}
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 sidebar-hover-effect" data-tutorial="minigame">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gamepad2 className="h-5 w-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-300">Relaxar Jogando</h3>
                </div>
                
                {isUnlocked ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Mini-game desbloqueado! Ganhe XP enquanto relaxa.
                    </p>
                    <Button
                      onClick={onOpenMiniGame}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white sidebar-line-hover"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Focus Break 🎮
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-2">🔒</div>
                    <p className="text-xs text-muted-foreground">
                      Desbloqueie no Level 3
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Nível atual: {currentLevel}/3
                    </div>
                  </>
                )}
              </div>
            </Card>



            {/* Botão do Snake Game - Desbloqueado no nível 5 */}
            {currentLevel >= 5 && onOpenSnakeGame && (
              <Card className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 sidebar-hover-effect">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-lg">🐍</div>
                    <h3 className="text-sm font-semibold text-red-300">Snake Game</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Novo mini-game desbloqueado! Colete maçãs para ganhar XP.
                  </p>
                  <Button
                    onClick={onOpenSnakeGame}
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white sidebar-line-hover"
                  >
                    <div className="text-sm mr-2">🐍</div>
                    Jogar Snake
                  </Button>
                </div>
              </Card>
            )}

            {/* Nível de Produtividade */}
            <div data-tutorial="level-tracker">
              <LevelTracker stats={stats} />
            </div>

            {/* Dashboard Semanal */}
            <div data-tutorial="weekly-chart">
              <WeeklyChart stats={stats} tasks={tasks} />
            </div>
          </div>
        </div>

        {/* Ícone quando recolhido */}
        {!sidebarExpanded && (
          <div className={`absolute inset-0 flex items-center justify-center opacity-100 transition-opacity ${
            showPulseAnimation ? 'animate-pulse-glow' : ''
          }`}>
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-muted-foreground font-medium">Dashboard</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 