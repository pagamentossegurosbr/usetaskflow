'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trophy, Lock, Unlock, Star, Award, Zap, Target, Calendar } from 'lucide-react';
import { Achievement } from '@/hooks/useProductivityLevel';

interface AchievementsPanelProps {
  achievements: Achievement[];
  nextAchievement?: Achievement & { progress: { current: number; required: number; percentage: number } };
}

export function AchievementsPanel({ achievements, nextAchievement }: AchievementsPanelProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card className="p-4 border-yellow-500/30 bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-sm animate-fade-in w-full overflow-y-auto max-h-[calc(100vh-400px)] hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/20 hover:from-black hover:via-gray-800 hover:to-black transition-all duration-300 relative group before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-yellow-500/0 before:via-yellow-500/5 before:to-yellow-500/0 before:opacity-0 before:group-hover:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none rounded-2xl">
      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-all duration-300">
               <Trophy className="h-4 w-4 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300" />
             </div>
            <div>
                             <h2 className="text-lg font-semibold text-foreground group-hover:text-yellow-100 transition-colors duration-300">Conquistas</h2>
              <p className="text-xs text-muted-foreground">
                {unlockedCount} de {totalCount} desbloqueadas
              </p>
            </div>
          </div>
                     <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/30 transition-all duration-300">
             <Star className="h-3 w-3 group-hover:text-yellow-400 transition-colors duration-300" />
             {unlockedCount}/{totalCount}
           </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium text-foreground">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
                     <div className="w-full bg-muted rounded-full h-2 group-hover:bg-muted/80 transition-colors duration-300">
             <div 
               className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500 group-hover:from-yellow-400 group-hover:to-yellow-500"
               style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
             />
           </div>
        </div>

        {/* Next Achievement */}
        {nextAchievement ? (
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-foreground mb-1">Próxima Conquista</h3>
              <p className="text-xs text-muted-foreground">Continue assim para desbloquear!</p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                                     <div className="p-3 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-black/60 via-gray-900/60 to-black/60 hover:border-yellow-500/50 hover:from-black/80 hover:via-gray-800/80 hover:to-black/80 transition-all duration-300 cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl text-2xl bg-yellow-500/20 animate-pulse">
                          {nextAchievement.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {nextAchievement.name}
                            </h3>
                            <Lock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {nextAchievement.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium text-foreground">
                            {nextAchievement.progress.current} / {nextAchievement.progress.required}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${nextAchievement.progress.percentage}%` }}
                          />
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-muted-foreground">
                            {nextAchievement.progress.percentage.toFixed(1)}% completo
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Badge 
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        >
                          <Trophy className="h-3 w-3" />
                          +{nextAchievement.xpReward} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-sm">
                  <div className="space-y-2">
                    <p className="font-medium">{nextAchievement.name}</p>
                    <p className="text-sm text-muted-foreground">{nextAchievement.description}</p>
                    <p className="text-xs text-yellow-400">
                      Falta {nextAchievement.progress.required - nextAchievement.progress.current} para desbloquear!
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm font-semibold text-foreground">
              Parabéns! Você desbloqueou todas as conquistas!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você é um verdadeiro mestre da produtividade!
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-yellow-500 font-medium">
                Mestre da Produtividade
              </span>
            </div>
          </div>
        )}

        {/* Motivation Message */}
        {unlockedCount === 0 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm text-muted-foreground font-medium">
              Complete tarefas para desbloquear suas primeiras conquistas!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cada conquista te dará pontos de XP e motivação extra!
            </p>
          </div>
        )}

        {unlockedCount > 0 && unlockedCount < totalCount && !nextAchievement && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-sm text-muted-foreground font-medium">
              Continue assim! Você está no caminho certo!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCount - unlockedCount} conquistas restantes para desbloquear
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 