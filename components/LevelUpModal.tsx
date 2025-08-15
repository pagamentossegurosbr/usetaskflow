'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Crown, Sparkles, X, Gift, ArrowRight } from 'lucide-react';
import { playLevelUpSound, playAchievementSound } from '@/lib/sounds';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionService } from '@/lib/subscription';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  previousLevel: number;
  levelName: string;
  xpGained: number;
}

export function LevelUpModal({ 
  isOpen, 
  onClose, 
  newLevel, 
  previousLevel, 
  levelName, 
  xpGained 
}: LevelUpModalProps) {
  const { subscription, canReachLevel, shouldShowUpgrade, getUpgradeMessage } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showUpgradeButton, setShowUpgradeButton] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Play level up sound
      playLevelUpSound();
      
      // Start animation sequence
      setAnimationPhase(0);
      setShowConfetti(true);
      
      // Play achievement sound after a delay
      const achievementTimer = setTimeout(() => {
        playAchievementSound();
      }, 1000);
      
      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => {
        clearTimeout(achievementTimer);
        clearTimeout(autoCloseTimer);
      };
    } else {
      setShowConfetti(false);
      setAnimationPhase(0);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Animation phases
      const phase1 = setTimeout(() => setAnimationPhase(1), 500);
      const phase2 = setTimeout(() => setAnimationPhase(2), 1000);
      const phase3 = setTimeout(() => setAnimationPhase(3), 1500);
      
      return () => {
        clearTimeout(phase1);
        clearTimeout(phase2);
        clearTimeout(phase3);
      };
    }
  }, [isOpen]);

  const getLevelColor = (level: number) => {
    if (level >= 4 && level <= 10) {
      const colors = [
        'from-orange-400 to-red-500', // Level 4
        'from-red-400 to-pink-500',   // Level 5
        'from-pink-400 to-purple-500', // Level 6
        'from-purple-400 to-indigo-500', // Level 7
        'from-indigo-400 to-blue-500', // Level 8
        'from-blue-400 to-cyan-500',   // Level 9
        'from-cyan-400 to-teal-500',   // Level 10
      ];
      return colors[Math.min(level - 4, colors.length - 1)];
    }
    return 'from-emerald-400 to-cyan-500'; // Default for levels 1-3
  };

  const getLevelIcon = (level: number) => {
    if (level >= 4 && level <= 10) {
      const icons = [
        <Zap key="zap" className="h-8 w-8" />,      // Level 4
        <Target key="target" className="h-8 w-8" />, // Level 5
        <Star key="star" className="h-8 w-8" />,     // Level 6
        <Trophy key="trophy" className="h-8 w-8" />, // Level 7
        <Crown key="crown" className="h-8 w-8" />,   // Level 8
        <Sparkles key="sparkles" className="h-8 w-8" />, // Level 9
        <Trophy key="trophy2" className="h-8 w-8" />, // Level 10
      ];
      return icons[Math.min(level - 4, icons.length - 1)];
    }
    return <Star className="h-8 w-8" />; // Default
  };

  const getLevelAnimation = (level: number) => {
    if (level >= 4 && level <= 10) {
      const animations = [
        'animate-bounce',           // Level 4
        'animate-pulse',            // Level 5
        'animate-spin',             // Level 6
        'animate-ping',             // Level 7
        'animate-bounce',           // Level 8
        'animate-pulse',            // Level 9
        'animate-spin',             // Level 10
      ];
      return animations[Math.min(level - 4, animations.length - 1)];
    }
    return 'animate-pulse'; // Default
  };

  const levelColor = getLevelColor(newLevel);
  const levelIcon = getLevelIcon(newLevel);
  const levelAnimation = getLevelAnimation(newLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-hidden">
        {/* Adicionar DialogTitle e DialogDescription para acessibilidade */}
        <DialogTitle className="sr-only">Parabéns! Nível {newLevel} Alcançado!</DialogTitle>
        <DialogDescription className="sr-only">Você desbloqueou novos recursos incríveis!</DialogDescription>
        
        <div className="relative">
          {/* Background with gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${levelColor} rounded-2xl opacity-90`} />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {showConfetti && (
              <>
                {/* Confetti particles */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-white rounded-full animate-bounce opacity-80`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
                
                {/* Sparkles */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={`sparkle-${i}`}
                    className="absolute text-yellow-300 animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 1}s`
                    }}
                  >
                    ✨
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 text-center text-white">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-white/80 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Level up animation */}
            <div className={`mb-6 transition-all duration-1000 ${
              animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 ${levelAnimation}`}>
                {levelIcon}
              </div>
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold mb-2 transition-all duration-1000 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {newLevel > previousLevel ? '🎉 Parabéns! 🎉' : '📊 Mudança de Nível 📊'}
            </h2>

            {/* Level info */}
            <div className={`mb-4 transition-all duration-1000 delay-300 ${
              animationPhase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-lg font-semibold mb-1">
                {newLevel > previousLevel 
                  ? `Você alcançou o Nível ${newLevel}!`
                  : `Você agora está no Nível ${newLevel}!`
                }
              </p>
              <p className="text-sm opacity-90">
                {levelName}
              </p>
              {newLevel !== previousLevel && (
                <p className="text-xs opacity-75 mt-1">
                  {newLevel > previousLevel 
                    ? `Subiu do nível ${previousLevel} para ${newLevel}`
                    : `Mudou do nível ${previousLevel} para ${newLevel}`
                  }
                </p>
              )}
            </div>

            {/* XP info - only show if xpGained is provided */}
            {xpGained !== 0 && (
              <div className={`mb-6 transition-all duration-1000 delay-500 ${
                animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              }`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                  <Star className="h-4 w-4 text-yellow-300" />
                  <span className="font-semibold">
                    {xpGained > 0 ? `+${xpGained} XP ganhos!` : `${xpGained} XP`}
                  </span>
                </div>
              </div>
            )}

            {/* Progress indicator */}
            <div className={`mb-6 transition-all duration-1000 delay-700 ${
              animationPhase >= 3 ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div 
                  className={`bg-gradient-to-r ${levelColor} h-2 rounded-full transition-all duration-2000`}
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs opacity-80">
                Continue assim para o próximo nível!
              </p>
            </div>

            {/* Plan Benefits and Upgrade Info */}
            {(newLevel === 4 && subscription.plan === 'free') && (
              <div className={`mb-6 transition-all duration-1000 delay-800 ${
                animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold text-yellow-300">Limite do Plano Gratuito Atingido!</h3>
                  </div>
                  <p className="text-sm text-white/90 mb-3">
                    Você atingiu o nível máximo do plano gratuito. Faça upgrade para continuar evoluindo!
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      Aspirante: Até Level 10
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Executor: Sem Limites
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Level Benefits */}
            {newLevel >= 5 && subscription.plan !== 'free' && (
              <div className={`mb-6 transition-all duration-1000 delay-800 ${
                animationPhase >= 3 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-green-400" />
                    <h3 className="font-semibold text-green-300">Novos Benefícios Desbloqueados!</h3>
                  </div>
                  <div className="space-y-1 text-sm text-white/90">
                    {subscription.plan === 'executor' && (
                      <>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-blue-400" />
                          <span>XP extra por tarefa (1.5x multiplicador)</span>
                        </div>
                        {newLevel >= 5 && (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-purple-400" />
                            <span>Acesso ao Habit Tracker e recursos premium</span>
                          </div>
                        )}
                      </>
                    )}
                    {subscription.plan === 'aspirante' && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-green-400" />
                        <span>Mini-games e gráficos avançados desbloqueados</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action button */}
            <div className={`transition-all duration-1000 delay-1000 ${
              animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              {(newLevel === 4 && subscription.plan === 'free') ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      // Disparar evento para abrir modal de upgrade
                      window.dispatchEvent(new CustomEvent('show-upgrade-modal', {
                        detail: { 
                          currentLevel: newLevel,
                          targetLevel: newLevel + 1,
                          plan: subscription.plan 
                        }
                      }));
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold border-0 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Fazer Upgrade Agora
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Continuar Mais Tarde
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={onClose}
                  className={`bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 