'use client';

import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Calendar } from 'lucide-react';

interface LevelProgressBarProps {
  currentLevel: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  levelName: string;
}

export function LevelProgressBar({ 
  currentLevel, 
  totalXP, 
  xpInCurrentLevel, 
  xpToNextLevel, 
  levelName 
}: LevelProgressBarProps) {
  const progressPercentage = xpToNextLevel > 0 
    ? (xpInCurrentLevel / (xpInCurrentLevel + xpToNextLevel)) * 100 
    : 100;

  const getLevelIcon = (level: number) => {
    if (level >= 8) return '👑';
    if (level >= 6) return '⭐';
    if (level >= 4) return '🔥';
    if (level >= 2) return '⚡';
    return '🌱';
  };

  const getProgressBarGradient = (level: number, percentage: number) => {
    // Para níveis 7-10, usar gradiente verde-laranja-vermelho
    if (level >= 7 && level <= 10) {
      if (percentage <= 33) {
        // Verde para laranja (0-33%)
        return 'bg-gradient-to-r from-green-400 via-green-500 to-orange-500';
      } else if (percentage <= 66) {
        // Laranja para vermelho (33-66%)
        return 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500';
      } else {
        // Vermelho intenso (66-100%)
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700';
      }
    }
    
    // Para outros níveis, manter o gradiente verde padrão
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="w-full bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md border-b border-border/50 sticky top-0 z-50" data-tutorial="level-progress">
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex items-center justify-between gap-6">
          {/* Data de Hoje - Esquerda */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Hoje</div>
              <div className="text-sm font-medium text-foreground capitalize">
                {getCurrentDate()}
              </div>
            </div>
          </div>

          {/* Progress Bar - Centro */}
          <div className="flex-1 max-w-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Progresso para Level {currentLevel + 1}</span>
              <span className="font-medium">
                {xpInCurrentLevel} / {xpInCurrentLevel + xpToNextLevel} XP
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted/50 rounded-full h-2">
                <div 
                  className={`${getProgressBarGradient(currentLevel, progressPercentage)} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {/* Porcentagem minimalista ao lado direito */}
              <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 