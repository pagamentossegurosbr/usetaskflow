'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  Star, 
  Award, 
  Zap, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Achievement } from '@/hooks/useProductivityLevel';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  currentLevel: number;
  nextAchievement?: Achievement & { progress: { current: number; required: number; percentage: number } };
}

export function AchievementsModal({ 
  isOpen, 
  onClose, 
  achievements, 
  currentLevel,
  nextAchievement 
}: AchievementsModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Get level-specific theme and design
  const getLevelTheme = (level: number) => {
    const themes = {
      1: {
        primary: 'from-blue-500 to-cyan-500',
        secondary: 'bg-blue-500/10',
        accent: 'text-blue-500',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20',
        icon: '🌱',
        title: 'Iniciante',
        description: 'Seus primeiros passos na produtividade'
      },
      2: {
        primary: 'from-green-500 to-emerald-500',
        secondary: 'bg-green-500/10',
        accent: 'text-green-500',
        border: 'border-green-500/30',
        glow: 'shadow-green-500/20',
        icon: '🌿',
        title: 'Praticante',
        description: 'Desenvolvendo bons hábitos'
      },
      3: {
        primary: 'from-purple-500 to-violet-500',
        secondary: 'bg-purple-500/10',
        accent: 'text-purple-500',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20',
        icon: '🌸',
        title: 'Constante',
        description: 'Mantendo a consistência'
      },
      4: {
        primary: 'from-orange-500 to-amber-500',
        secondary: 'bg-orange-500/10',
        accent: 'text-orange-500',
        border: 'border-orange-500/30',
        glow: 'shadow-orange-500/20',
        icon: '🔥',
        title: 'Comprometido',
        description: 'Compromisso com a excelência'
      },
      5: {
        primary: 'from-red-500 to-pink-500',
        secondary: 'bg-red-500/10',
        accent: 'text-red-500',
        border: 'border-red-500/30',
        glow: 'shadow-red-500/20',
        icon: '⚡',
        title: 'Disciplinado',
        description: 'Disciplina é liberdade'
      },
      6: {
        primary: 'from-indigo-500 to-purple-500',
        secondary: 'bg-indigo-500/10',
        accent: 'text-indigo-500',
        border: 'border-indigo-500/30',
        glow: 'shadow-indigo-500/20',
        icon: '💎',
        title: 'Produtivo',
        description: 'Alta produtividade'
      },
      7: {
        primary: 'from-teal-500 to-cyan-500',
        secondary: 'bg-teal-500/10',
        accent: 'text-teal-500',
        border: 'border-teal-500/30',
        glow: 'shadow-teal-500/20',
        icon: '🌟',
        title: 'Focado',
        description: 'Foco total nos objetivos'
      },
      8: {
        primary: 'from-emerald-500 to-green-500',
        secondary: 'bg-emerald-500/10',
        accent: 'text-emerald-500',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
        icon: '🚀',
        title: 'Acelerado',
        description: 'Velocidade máxima'
      },
      9: {
        primary: 'from-violet-500 to-purple-500',
        secondary: 'bg-violet-500/10',
        accent: 'text-violet-500',
        border: 'border-violet-500/30',
        glow: 'shadow-violet-500/20',
        icon: '👑',
        title: 'Mestre',
        description: 'Mestre da produtividade'
      },
      10: {
        primary: 'from-yellow-500 to-orange-500',
        secondary: 'bg-yellow-500/10',
        accent: 'text-yellow-500',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-500/20',
        icon: '🏆',
        title: 'Lendário',
        description: 'Lenda da produtividade'
      }
    };
    return themes[level as keyof typeof themes] || themes[1];
  };

  const theme = getLevelTheme(currentLevel);

  // Get the 3 closest achievements (next to unlock)
  const getClosestAchievements = () => {
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    
    // Sort locked achievements by their order in the array (closest to unlock)
    const sortedLocked = lockedAchievements.sort((a, b) => {
      const aIndex = achievements.findIndex(ach => ach.id === a.id);
      const bIndex = achievements.findIndex(ach => ach.id === b.id);
      return aIndex - bIndex;
    });
    
    // Return the 3 closest locked achievements
    return sortedLocked.slice(0, 3);
  };

  const closestAchievements = getClosestAchievements();
  const totalSlides = Math.ceil(closestAchievements.length / 1); // 1 achievement per slide

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 overflow-hidden">
        <DialogHeader className="relative pb-4">
          <div className="text-center space-y-3">
            {/* Level-specific header */}
            <div className="flex items-center justify-center gap-3">
              <div className={`p-2 rounded-full bg-gradient-to-r ${theme.primary} ${theme.glow}`}>
                <span className="text-xl">{theme.icon}</span>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">
                  Conquistas - {theme.title}
                </h2>
                <p className="text-xs text-gray-300">
                  {theme.description}
                </p>
              </div>
            </div>

            {/* Progress overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="text-2xl font-bold text-white">{unlockedCount}</div>
                </div>
                <div className="text-xs text-gray-400 font-medium">Desbloqueadas</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <div className="text-2xl font-bold text-white">{totalCount}</div>
                </div>
                <div className="text-xs text-gray-400 font-medium">Total</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div className="text-2xl font-bold text-white">{progressPercentage}%</div>
                </div>
                <div className="text-xs text-gray-400 font-medium">Progresso</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${theme.primary} h-2 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content with overflow */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)] pr-2 space-y-4">
          {/* Next Achievement Preview */}
          {nextAchievement && (
            <Card className={`p-3 ${theme.secondary} border ${theme.border} backdrop-blur-sm`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className={`h-4 w-4 ${theme.accent}`} />
                  <h3 className="font-semibold text-white text-sm">Próxima Conquista</h3>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="text-xl">{nextAchievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white text-sm truncate">{nextAchievement.name}</h4>
                      <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2">{nextAchievement.description}</p>
                  </div>
                  <Badge className={`${theme.secondary} ${theme.accent} border ${theme.border} text-xs`}>
                    +{nextAchievement.xpReward} XP
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white font-medium">
                      {nextAchievement.progress.current} / {nextAchievement.progress.required}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`bg-gradient-to-r ${theme.primary} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${nextAchievement.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Achievements Carousel */}
          {closestAchievements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className={`h-4 w-4 ${theme.accent}`} />
                <h3 className="font-semibold text-white text-sm">Próximas Conquistas</h3>
              </div>
              
              <Card className={`${theme.secondary} border ${theme.border} backdrop-blur-sm relative`}>
                {/* Carousel Container */}
                <div className="overflow-hidden rounded-lg">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {closestAchievements.map((achievement, index) => (
                      <div key={achievement.id} className="w-full flex-shrink-0">
                        <div className="p-4 text-center">
                          {/* Achievement Icon */}
                          <div className="text-3xl mb-3">
                            {achievement.icon}
                          </div>
                          
                          {/* Achievement Title */}
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <h4 className="font-medium text-white text-sm">
                              {achievement.name}
                            </h4>
                            <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          </div>
                          
                          {/* Achievement Description */}
                          <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                            {achievement.description}
                          </p>
                          
                          {/* Reward Badge */}
                          <Badge 
                            variant="secondary"
                            className={`${theme.secondary} ${theme.accent} border ${theme.border} text-xs`}
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            +{achievement.xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons - Inside the card */}
                {totalSlides > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600/50 h-8 w-8 p-0 rounded-full z-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600/50 h-8 w-8 p-0 rounded-full z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Dots Indicator - Outside the card */}
                {totalSlides > 1 && (
                  <div className="flex justify-center gap-1 mt-3">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentSlide 
                            ? `bg-gradient-to-r ${theme.primary}` 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Level-specific motivation */}
          {unlockedCount === 0 && (
            <Card className="p-4 text-center bg-[#010101]/80 border border-gray-700/50">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Comece sua jornada!
              </h3>
              <p className="text-xs text-gray-300">
                Complete tarefas para desbloquear suas primeiras conquistas e ganhar XP.
              </p>
            </Card>
          )}

          {unlockedCount > 0 && unlockedCount < totalCount && (
            <Card className="p-4 text-center bg-[#010101]/80 border border-gray-700/50">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Continue assim!
              </h3>
              <p className="text-xs text-gray-300">
                Você está no caminho certo! {totalCount - unlockedCount} conquistas restantes.
              </p>
            </Card>
          )}

          {unlockedCount === totalCount && (
            <Card className="p-4 text-center bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Parabéns! Mestre da Produtividade!
              </h3>
              <p className="text-xs text-gray-300">
                Você desbloqueou todas as conquistas disponíveis. Você é um verdadeiro mestre!
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 