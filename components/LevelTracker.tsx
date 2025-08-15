'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { ProductivityStats } from '@/hooks/useProductivityLevel';

interface LevelTrackerProps {
  stats: ProductivityStats;
}

export function LevelTracker({ stats }: LevelTrackerProps) {
  const progressPercentage = stats.xpToNextLevel > 0 
    ? (stats.xpInCurrentLevel / (stats.xpInCurrentLevel + stats.xpToNextLevel)) * 100 
    : 100;

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-400';
    if (level >= 6) return 'text-blue-400';
    if (level >= 4) return 'text-green-400';
    if (level >= 2) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 8) return '👑';
    if (level >= 6) return '⭐';
    if (level >= 4) return '🔥';
    if (level >= 2) return '⚡';
    return '🌱';
  };

  const getLevelName = (level: number) => {
    const levelNames: { [key: number]: string } = {
      2: 'Praticante',
      3: 'Constante',
      4: 'Comprometido',
      5: 'Disciplinado',
      6: 'Produtivo',
      7: 'Focado',
      8: 'Autônomo',
      9: 'Alta Performance',
      10: 'Mestre da Produtividade',
    };
    return levelNames[level] || 'Desconhecido';
  };

  return (
    <Card className="p-4 border-border bg-card/50 backdrop-blur-sm animate-fade-in w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Trophy className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Nível de Produtividade</h2>
              <p className="text-xs text-muted-foreground">Acompanhe seu progresso</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
            <Star className="h-3 w-3" />
            Level {stats.currentLevel}
          </Badge>
        </div>

        {/* Level Display */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{getLevelIcon(stats.currentLevel)}</span>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    Level {stats.currentLevel}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {getLevelName(stats.currentLevel)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                <span>{stats.totalXP} XP total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso para o próximo nível</span>
            <span className="font-medium text-foreground">
              {stats.xpInCurrentLevel} / {stats.xpInCurrentLevel + stats.xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.currentLevel >= 8 
                  ? 'bg-gradient-to-r from-red-500 to-red-700' 
                  : stats.currentLevel >= 6 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                  : stats.currentLevel >= 5 
                  ? 'bg-gradient-to-r from-green-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-400 to-green-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              {progressPercentage.toFixed(1)}% completo
            </span>
          </div>
        </div>

        {/* Next Level Preview */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLevelIcon(stats.currentLevel + 1)}</span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Próximo: Level {stats.currentLevel + 1}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getLevelName(stats.currentLevel + 1)}
                </p>
              </div>
            </div>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
        </div>

        {/* Stats Grid - Mini Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-foreground">
                  {stats.totalTasksCompleted}
                </div>
                <div className="text-xs text-muted-foreground font-medium truncate">Tarefas Concluídas</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-foreground">
                  {stats.totalXP}
                </div>
                <div className="text-xs text-muted-foreground font-medium truncate">XP Total</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-foreground">
                  {stats.consecutiveDays}
                </div>
                <div className="text-xs text-muted-foreground font-medium truncate">Dias Consecutivos</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Award className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-foreground">
                  {stats.currentLevel}
                </div>
                <div className="text-xs text-muted-foreground font-medium truncate">Nível Atual</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 