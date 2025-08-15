'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  User, 
  Edit, 
  BookOpen, 
  RotateCcw, 
  TrendingUp, 
  Shield, 
  HelpCircle,
  CheckCircle,
  Sparkles,
  Info,
  Star,
  Calendar,
  Gamepad2,
  BarChart3,
  Crown,
  Trophy,
  Medal,
  Award,
  Zap,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  Target,
  Clock,
  Flame,
  Gem,
  Heart,
  Moon,
  Sun,
  Palette,
  Music,
  Bell,
  Gift,
  Rocket
} from 'lucide-react';
import { ProfileEditDialog } from './ProfileEditDialog';
import { LoadingScreen } from './LoadingScreen';
import { playHoverSound, playClickSound } from '@/lib/sounds';
import { Achievement } from '@/hooks/useProductivityLevel';
import { UserAchievements } from './UserAchievements';
import { validateAndFormatName, validateAndFormatTitle } from '@/lib/profileValidation';
import { debug } from '@/lib/debug';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  title: string;
  badges: string[];
  theme: string;
  hideProfileEffects?: boolean;
}

interface ProductivityStats {
  currentLevel: number;
  levelName: string;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  productivityStats?: ProductivityStats;
  completed: number;
  total: number;
  percentage: number;
  onOpenTutorial?: () => void;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  achievements?: Achievement[];
  nextAchievement?: Achievement & { progress: { current: number; required: number; percentage: number } };
}

export const ProfileHeader = memo(function ProfileHeader({ 
  profile, 
  onUpdateProfile, 
  productivityStats, 
  completed, 
  total, 
  percentage,
  onOpenTutorial,
  isExpanded,
  onToggleExpansion,
  achievements,
  nextAchievement,

}: ProfileHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLevelInfoModal, setShowLevelInfoModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUserSuspended, setIsUserSuspended] = useState(false);
  const [showLevelInfo, setShowLevelInfo] = useState(true);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // New state for dynamic modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{level: number, previousLevel: number} | null>(null);
  
  const avatarRef = useRef<HTMLDivElement>(null);

  const displayLevel = productivityStats?.currentLevel || 1;

  // Check for level change on mount and when level changes (up or down)
  useEffect(() => {
    const previousLevel = localStorage.getItem('previous-level');
    const currentLevel = productivityStats?.currentLevel || 1;
    
    // Se há um nível anterior armazenado e é diferente do atual
    if (previousLevel && parseInt(previousLevel) !== currentLevel) {
      // Verificar se a mudança é real (não apenas um reload)
      const lastLevelChange = localStorage.getItem('last-level-change');
      const now = Date.now();
      
      // Só mostrar modal se a mudança foi recente (últimos 5 segundos) ou se não há registro de mudança
      if (!lastLevelChange || (now - parseInt(lastLevelChange)) < 5000) {
        setLevelUpData({
          level: currentLevel,
          previousLevel: parseInt(previousLevel)
        });
        setShowLevelUpModal(true);
      }
      
      localStorage.setItem('previous-level', currentLevel.toString());
    } else if (!previousLevel) {
      // Primeira vez - armazenar nível atual
      localStorage.setItem('previous-level', currentLevel.toString());
    }
  }, [productivityStats?.currentLevel]);

  const getNextLevelInfo = (currentLevel: number) => {
    switch (currentLevel) {
      case 1:
        return {
          title: "Nível 2 - Agendamento de Tarefas",
          description: "Desbloqueie a capacidade de programar suas tarefas para datas futuras!",
          features: [
            "📅 Agendar tarefas para qualquer data",
            "📱 Visualização no calendário lateral",
            "⏰ Lembretes automáticos",
            "🎯 Melhor organização temporal"
          ],
          icon: <Calendar className="h-8 w-8 text-blue-400" />
        };
      case 2:
        return {
          title: "Nível 3 - Mini-Games e Efeitos",
          description: "Adicione diversão ao seu progresso com mini-games e efeitos visuais!",
          features: [
            "🎮 Mini-game de produtividade",
            "✨ Efeitos visuais no avatar",
            "🌟 Partículas animadas",
            "🎵 Efeitos sonoros"
          ],
          icon: <Gamepad2 className="h-8 w-8 text-purple-400" />
        };
      default:
        return {
          title: "Nível Máximo Atingido!",
          description: "Parabéns! Você alcançou o nível máximo!",
          features: [
            "🎉 Todos os recursos desbloqueados",
            "🌟 Efeitos máximos ativos",
            "🏆 Status de mestre",
            "💎 Experiência completa"
          ],
          icon: <Crown className="h-8 w-8 text-yellow-400" />
        };
    }
  };

  // Dynamic theme functions for level-up modal
  const getLevelTheme = (level: number) => {
    
    if (level <= 3) {
      return {
        background: 'bg-purple-900/20',
        blur: 'backdrop-blur-md',
        particles: 'from-purple-400/20 to-pink-400/20',
        glow: 'shadow-purple-500/30',
        icon: <Sparkles className="h-12 w-12 text-purple-400" />
      };
    } else if (level <= 5) {
      return {
        background: 'bg-blue-900/20',
        blur: 'backdrop-blur-md',
        particles: 'from-blue-400/20 to-cyan-400/20',
        glow: 'shadow-blue-500/30',
        icon: <Zap className="h-12 w-12 text-blue-400" />
      };
    } else if (level <= 7) {
      return {
        background: 'bg-green-900/20',
        blur: 'backdrop-blur-md',
        particles: 'from-green-400/20 to-emerald-400/20',
        glow: 'shadow-green-500/30',
        icon: <Star className="h-12 w-12 text-green-400" />
      };
    } else if (level <= 9) {
      return {
        background: 'bg-orange-900/20',
        blur: 'backdrop-blur-md',
        particles: 'from-orange-400/20 to-red-400/20',
        glow: 'shadow-orange-500/30',
        icon: <Trophy className="h-12 w-12 text-orange-400" />
      };
    } else {
      return {
        background: 'bg-yellow-900/20',
        blur: 'backdrop-blur-md',
        particles: 'from-yellow-400/20 to-orange-400/20',
        glow: 'shadow-yellow-500/30',
        icon: <Crown className="h-12 w-12 text-yellow-400" />
      };
    }
  };

  const getLevelBenefits = (level: number) => {
    switch (level) {
      case 2:
        return [
          { icon: <Calendar className="h-5 w-5" />, text: "Agendamento de tarefas", description: "Programe suas tarefas para datas futuras" },
          { icon: <Clock className="h-5 w-5" />, text: "Lembretes automáticos", description: "Receba notificações de tarefas agendadas" },
          { icon: <Target className="h-5 w-5" />, text: "Melhor organização", description: "Visualize suas tarefas no calendário" }
        ];
      case 3:
        return [
          { icon: <Gamepad2 className="h-5 w-5" />, text: "Mini-games", description: "Jogue e ganhe XP enquanto relaxa" },
          { icon: <Sparkles className="h-5 w-5" />, text: "Efeitos visuais", description: "Partículas e animações especiais" },
          { icon: <Music className="h-5 w-5" />, text: "Efeitos sonoros", description: "Feedback auditivo para suas ações" }
        ];
      case 4:
        return [
          { icon: <Flame className="h-5 w-5" />, text: "Modo foco avançado", description: "Interface minimalista para máxima produtividade" },
          { icon: <Gem className="h-5 w-5" />, text: "Temas personalizados", description: "Personalize a aparência da aplicação" },
          { icon: <Bell className="h-5 w-5" />, text: "Notificações avançadas", description: "Configurações detalhadas de alertas" }
        ];
      case 5:
        return [
          { icon: <Rocket className="h-5 w-5" />, text: "Modo turbo", description: "Acelere seu progresso com bônus especiais" },
          { icon: <Gem className="h-5 w-5" />, text: "Recursos premium", description: "Acesso a funcionalidades exclusivas" },
          { icon: <Heart className="h-5 w-5" />, text: "Modo bem-estar", description: "Foco na saúde mental e equilíbrio" }
        ];
      case 6:
        return [
          { icon: <Crown className="h-5 w-5" />, text: "Status premium", description: "Acesso a recursos exclusivos" },
          { icon: <Gem className="h-5 w-5" />, text: "Temas especiais", description: "Personalização avançada" },
          { icon: <Bell className="h-5 w-5" />, text: "Notificações premium", description: "Alertas personalizados" }
        ];
      case 7:
        return [
          { icon: <Gem className="h-5 w-5" />, text: "Recursos exclusivos", description: "Funcionalidades únicas" },
          { icon: <Sparkles className="h-5 w-5" />, text: "Efeitos especiais", description: "Animações avançadas" },
          { icon: <Zap className="h-5 w-5" />, text: "Modo ultrarrápido", description: "Produtividade máxima" }
        ];
      case 8:
        return [
          { icon: <Trophy className="h-5 w-5" />, text: "Conquistas master", description: "Desafios exclusivos" },
          { icon: <Star className="h-5 w-5" />, text: "Recursos master", description: "Funcionalidades avançadas" },
          { icon: <Crown className="h-5 w-5" />, text: "Status master", description: "Reconhecimento especial" }
        ];
      case 9:
        return [
          { icon: <Zap className="h-5 w-5" />, text: "Recursos ilimitados", description: "Acesso total a tudo" },
          { icon: <Gem className="h-5 w-5" />, text: "Funcionalidades únicas", description: "Recursos exclusivos" },
          { icon: <Trophy className="h-5 w-5" />, text: "Conquistas especiais", description: "Desafios únicos" }
        ];
      case 10:
        return [
          { icon: <Crown className="h-5 w-5" />, text: "Mestre da produtividade", description: "Status máximo alcançado" },
          { icon: <Zap className="h-5 w-5" />, text: "Recursos ilimitados", description: "Acesso total a todas as funcionalidades" },
          { icon: <Trophy className="h-5 w-5" />, text: "Conquistas especiais", description: "Desbloqueie conquistas únicas" }
        ];
      default:
        return [
          { icon: <Crown className="h-5 w-5" />, text: "Mestre da produtividade", description: "Status máximo alcançado" },
          { icon: <Zap className="h-5 w-5" />, text: "Recursos ilimitados", description: "Acesso total a todas as funcionalidades" },
          { icon: <Trophy className="h-5 w-5" />, text: "Conquistas especiais", description: "Desbloqueie conquistas únicas" }
        ];
    }
  };

  const getNextLevelPreview = (level: number) => {
    switch (level) {
      case 1:
        return { level: 2, feature: "Agendamento de tarefas", icon: <Calendar className="h-4 w-4" /> };
      case 2:
        return { level: 3, feature: "Mini-games", icon: <Gamepad2 className="h-4 w-4" /> };
      case 3:
        return { level: 4, feature: "Temas personalizados", icon: <Palette className="h-4 w-4" /> };
      case 4:
        return { level: 5, feature: "Modo turbo", icon: <Rocket className="h-4 w-4" /> };
      case 5:
        return { level: 6, feature: "Recursos avançados", icon: <Star className="h-4 w-4" /> };
      case 6:
        return { level: 7, feature: "Funcionalidades premium", icon: <Crown className="h-4 w-4" /> };
      case 7:
        return { level: 8, feature: "Recursos exclusivos", icon: <Gem className="h-4 w-4" /> };
      case 8:
        return { level: 9, feature: "Recursos master", icon: <Trophy className="h-4 w-4" /> };
      case 9:
        return { level: 10, feature: "Nível máximo", icon: <Zap className="h-4 w-4" /> };
      case 10:
        return { level: 10, feature: "Nível máximo alcançado", icon: <Crown className="h-4 w-4" /> };
      default:
        return { level: Math.min(level + 1, 10), feature: "Recursos avançados", icon: <Star className="h-4 w-4" /> };
    }
  };

  // Modal handlers
  const handleProfileClick = useCallback(() => {
    setShowProfileModal(true);
    playClickSound();
  }, []);

  const handleLevelUpClose = useCallback(() => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
    playClickSound();
    
    // Verificar se deve mostrar tutorial após level up
    const shouldShowTutorial = sessionStorage.getItem('show-tutorial-after-levelup');
    if (shouldShowTutorial && onOpenTutorial) {
      sessionStorage.removeItem('show-tutorial-after-levelup');
      // Pequeno delay para garantir que o modal foi fechado
      setTimeout(() => {
        onOpenTutorial();
      }, 100);
    }
  }, [onOpenTutorial]);

  const handleResetAll = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = async () => {
    setShowResetConfirmation(false);
    setShowLoadingScreen(true);
    
    try {
      // Primeiro, resetar dados no banco de dados
      const response = await fetch('/api/user/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao resetar dados no servidor');
      }

      const result = await response.json();
      debug.log('Dados resetados no servidor:', result);
      
      // Função para obter a chave de storage com prefixo do hostname
      const getStorageKey = (key: string) => {
        if (typeof window !== 'undefined') {
          return `${window.location.hostname}-${key}`;
        }
        return key;
      };
      
      // Salvar o perfil atual antes de resetar (usando chave correta)
      const currentProfile = localStorage.getItem(getStorageKey('user-profile'));
      
      // Limpar TODOS os dados de progresso e estado do localStorage
      // Dados com prefixo do hostname
      localStorage.removeItem(getStorageKey('user-todos'));
      localStorage.removeItem(getStorageKey('productivity-stats'));
      localStorage.removeItem(getStorageKey('task-history'));
      localStorage.removeItem(getStorageKey('minigame-daily-time'));
      localStorage.removeItem(getStorageKey('cooldown-data'));
      localStorage.removeItem(getStorageKey('global-actions'));
      localStorage.removeItem(getStorageKey('onboarding-completed'));
      
      // Dados sem prefixo (globais)
      localStorage.removeItem('level-3-modal-shown');
      localStorage.removeItem('level-4-modal-shown');
      localStorage.removeItem('level-5-modal-shown');
      localStorage.removeItem('level-6-modal-shown');
      localStorage.removeItem('level-7-modal-shown');
      localStorage.removeItem('level-8-modal-shown');
      localStorage.removeItem('level-9-modal-shown');
      localStorage.removeItem('level-10-modal-shown');
      localStorage.removeItem('previous-level');
      localStorage.removeItem('snake-high-score');
      localStorage.removeItem('user-session');
      
      // Limpar dados de sessão temporários
      sessionStorage.removeItem('just-completed-onboarding');
      
      // Limpeza adicional: procurar e remover qualquer chave relacionada ao progresso
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('achievement') || 
          key.includes('level') || 
          key.includes('xp') || 
          key.includes('progress') ||
          key.includes('stats') ||
          key.includes('minigame') ||
          key.includes('cooldown') ||
          key.includes('task') ||
          key.includes('productivity')
        )) {
          // Não remover o user-profile
          if (!key.includes('user-profile') && !key.includes('tutorial-completed')) {
            keysToRemove.push(key);
          }
        }
      }
      
      // Remover as chaves encontradas
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Restaurar o perfil se existia (usando chave correta)
      if (currentProfile) {
        localStorage.setItem(getStorageKey('user-profile'), currentProfile);
      }
      
      // Mostrar feedback ao usuário
      debug.log('Reset completo realizado. Dados limpos:', {
        serverReset: true,
        profileRestored: !!currentProfile,
        keysRemoved: keysToRemove.length + 15, // +15 das chaves manuais
        reloadingIn: '2 segundos'
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      setShowLoadingScreen(false);
      setShowResetConfirmation(false);
      
      // Mostrar erro ao usuário (você pode adicionar um toast aqui se tiver)
      alert('Erro ao resetar dados. Tente novamente.');
    }
  };

  return (
    <>
      <LoadingScreen isVisible={showLoadingScreen} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.div 
                  ref={avatarRef}
                  className="relative cursor-pointer"
                  onMouseEnter={() => {
                    setShowTooltip(true);
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={handleProfileClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Avatar className="h-32 w-32 shadow-lg">
                    <AvatarImage src={profile.avatar} alt="Profile" />
                    <AvatarFallback className="text-2xl font-semibold">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>

                  <TooltipProvider>
                    <Tooltip open={showTooltip}>
                      <TooltipTrigger asChild>
                        <div className="absolute inset-0" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-blue-900/95 border-blue-500/50 text-white p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="font-semibold">Nível {displayLevel}</span>
                          </div>
                          <p className="text-sm opacity-90">{productivityStats?.levelName || 'Iniciante'}</p>
                          <div className="text-xs opacity-75">
                            Clique para ver o próximo nível!
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>

              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h1 className="text-2xl font-bold text-foreground">
                      {(() => {
                        const nameValidation = validateAndFormatName(profile.name);
                        return nameValidation.isValid ? nameValidation.formatted : 'Usuário';
                      })()}
                    </h1>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4, type: "spring", stiffness: 500 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-purple-500/20 text-purple-200 border border-purple-400/30 relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-50 animate-pulse"></div>
                        <span className="relative z-10">
                          {(() => {
                            const titleValidation = validateAndFormatTitle(profile.title);
                            return titleValidation.isValid ? titleValidation.formatted : 'Profissional';
                          })()}
                        </span>
                      </Badge>
                    </motion.div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-muted-foreground text-sm line-clamp-2 bio-selectable italic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    title={profile.bio} // Tooltip com texto completo
                  >
                    {profile.bio && profile.bio.length > 80 
                      ? `${profile.bio.substring(0, 80)}...` 
                      : profile.bio || "Sem biografia"
                    }
                  </motion.p>
                  
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {Array.isArray(profile.badges) && profile.badges.slice(0, 3).map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.6 + (index * 0.1),
                          type: "spring", 
                          stiffness: 500 
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      </motion.div>
                    ))}
                    {Array.isArray(profile.badges) && profile.badges.length > 3 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: 0.9,
                          type: "spring", 
                          stiffness: 500 
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          +{profile.badges.length - 3} mais
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="text-right space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Progresso de Hoje
              </motion.div>
              <motion.div 
                className="text-2xl font-bold text-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 300 }}
              >
                {completed}/{total}
              </motion.div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              >
                <Progress value={percentage} className="w-24 h-2" />
              </motion.div>
              <motion.div 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {percentage.toFixed(0)}% completo
              </motion.div>
            </motion.div>
          </div>

          {/* Informações de Nível com Toggle */}
          {productivityStats && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center justify-between">
                <motion.h2 
                  className="text-sm font-medium text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  Informações de Nível
                </motion.h2>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLevelInfo(!showLevelInfo)}
                    className="h-6 w-6 p-0"
                  >
                    <motion.div
                      animate={{ rotate: showLevelInfo ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {showLevelInfo ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
              
              <AnimatePresence>
                {showLevelInfo && (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg"
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-primary">
                        {productivityStats.currentLevel}
                      </div>
                      <div className="text-sm text-muted-foreground">Nível Atual</div>
                    </motion.div>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-primary">
                        {productivityStats.totalXP}
                      </div>
                      <div className="text-sm text-muted-foreground">XP Total</div>
                    </motion.div>
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-primary">
                        {productivityStats.xpInCurrentLevel}/{productivityStats.xpToNextLevel}
                      </div>
                      <div className="text-sm text-muted-foreground">XP no Nível</div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Button>
              </motion.div>
              
              {onOpenTutorial && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenTutorial}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Tutorial
                  </Button>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAll}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Tudo
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpDialog(true)}
                className="flex items-center gap-2 rounded-full w-10 h-10 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </Card>
      </motion.div>

      <ProfileEditDialog
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <UserAchievements
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />

      {/* Central de Ajuda - Design Minimalista */}
      {showHelpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHelpDialog(false)} />
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative z-10 h-full flex flex-col">
              <button
                onClick={() => setShowHelpDialog(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center space-y-3 p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Central de Ajuda
                </h2>
                <p className="text-gray-600 text-sm">
                  Tudo que você precisa saber sobre o TaskFlow Notch
                </p>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Sobre as Tarefas
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">📝 Criação de Tarefas</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Cada tarefa deve ter um nome único</li>
                          <li>Use a estrela ⭐ para marcar como prioritária</li>
                          <li>Tarefas prioritárias aparecem no topo da lista</li>
                          <li>Nível 2+: Agende tarefas para datas futuras</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">⏰ Duração das Tarefas</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li><strong>Tarefas normais:</strong> Permanecem na lista até serem completadas ou deletadas</li>
                          <li><strong>Tarefas agendadas:</strong> Aparecem automaticamente na data programada</li>
                          <li><strong>Tarefas completadas:</strong> Ficam visíveis na seção "Concluídas"</li>
                          <li><strong>Não há exclusão automática:</strong> Você controla quando remover tarefas</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">🗑️ Exclusão de Tarefas</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Exclusão manual: Clique no ícone de lixeira</li>
                          <li>Exclusão em lote: Selecione múltiplas tarefas</li>
                          <li>Exclusão de concluídas: Botão "Limpar Concluídas"</li>
                          <li>Não há exclusão automática por data</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Sistema de XP e Níveis
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">🎯 Como Ganhar XP</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Completar tarefas: +10 XP por tarefa</li>
                          <li>Desbloquear conquistas: XP variável</li>
                          <li>Jogar mini-games: XP por tempo jogado</li>
                          <li>Manter consistência: Bônus por dias consecutivos</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">📈 Níveis e Desbloqueios</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li><strong>Nível 1:</strong> Funcionalidades básicas</li>
                          <li><strong>Nível 2:</strong> Agendamento de tarefas</li>
                          <li><strong>Nível 3:</strong> Mini-games e efeitos especiais</li>
                          <li><strong>Nível 4+:</strong> Efeitos visuais avançados</li>
                          <li><strong>Nível 10:</strong> Mestre da Produtividade</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Funcionalidades Especiais
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">🎮 Mini-Games</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Disponível a partir do Nível 3</li>
                          <li>5 minutos de jogo por dia</li>
                          <li>Ganhe XP enquanto relaxa</li>
                          <li>Sistema de upgrades e conquistas</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">🛡️ Sistema Anti-Farming</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Proteção contra abuso do sistema</li>
                          <li>Cooldown de 5 minutos entre ações</li>
                          <li>Detecção automática de comportamento suspeito</li>
                          <li>Bloqueio temporário de tarefas se necessário</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">📊 Estatísticas</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 ml-4">
                          <li>Progresso semanal e mensal</li>
                          <li>Histórico de produtividade</li>
                          <li>Conquistas e recordes</li>
                          <li>Análise de padrões de produtividade</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                      <Info className="h-5 w-5 text-gray-600" />
                      Dicas Importantes
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <ul className="list-disc list-inside space-y-2 text-xs text-gray-600 ml-4">
                        <li><strong>Dados são salvos localmente:</strong> Seus dados ficam no seu navegador</li>
                        <li><strong>Conta por porta:</strong> Cada porta do localhost tem dados separados</li>
                        <li><strong>Backup automático:</strong> Dados são salvos automaticamente</li>
                        <li><strong>Reset disponível:</strong> Você pode resetar dados quando quiser</li>
                        <li><strong>Tutorial sempre disponível:</strong> Acesse através do botão "Tutorial"</li>
                        <li><strong>Efeitos podem ser desativados:</strong> Em "Editar Perfil" se preferir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1 - Perfil do Usuário */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setShowProfileModal(false)} 
          />
          <div className="relative bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              {/* Avatar com efeito de brilho */}
              <div className="relative mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" />
                <Avatar className="h-32 w-32 shadow-2xl ring-4 ring-purple-500/30 mx-auto">
                  <AvatarImage src={profile.avatar} alt="Profile" />
                  <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Informações do usuário */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
                <p className="text-purple-300 text-lg">{profile.title}</p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                    Nível {displayLevel}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                    {productivityStats?.levelName || 'Iniciante'}
                  </Badge>
                </div>
              </div>

              {/* Barra de progresso */}
              {productivityStats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>XP: {productivityStats.totalXP}</span>
                    <span>{productivityStats.xpInCurrentLevel}/{productivityStats.xpToNextLevel} XP</span>
                  </div>
                  <Progress 
                    value={(productivityStats.xpInCurrentLevel / productivityStats.xpToNextLevel) * 100} 
                    className="h-3 bg-gray-700/50"
                  />
                  <p className="text-xs text-gray-400">
                    {productivityStats.xpToNextLevel - productivityStats.xpInCurrentLevel} XP para o próximo nível
                  </p>
                </div>
              )}

              {/* Estatísticas rápidas */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Tarefas Concluídas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{completed}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <span className="text-sm font-medium text-gray-300">Dias Produtivos</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{Math.floor(completed / 3)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">XP Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productivityStats?.totalXP || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">Conquistas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{Array.isArray(profile.badges) ? profile.badges.length : 0}</p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  className="flex-1 bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowAchievementsModal(true);
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Conquistas
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowEditDialog(true);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                  onClick={() => setShowProfileModal(false)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 - Parabéns por Subir de Nível */}
      {showLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          
          {/* Partículas de fundo */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          <div className={`relative ${getLevelTheme(levelUpData.level).background} ${getLevelTheme(levelUpData.level).blur} border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-in fade-in-0 slide-in-from-bottom-8 duration-500`}>
            <div className="text-center space-y-6">
              {/* Ícone animado do nível */}
              <div className="relative mx-auto">
                <div className={`absolute inset-0 ${getLevelTheme(levelUpData.level).particles} rounded-full blur-2xl animate-pulse`} />
                <div className={`relative p-6 rounded-full ${getLevelTheme(levelUpData.level).glow} bg-white/10 backdrop-blur-sm`}>
                  {(() => {
                    const theme = getLevelTheme(levelUpData.level);
                    try {
                      return React.isValidElement(theme.icon) ? React.cloneElement(theme.icon as React.ReactElement) : <Star className="h-12 w-12 text-yellow-400" />;
                    } catch (error) {
                      console.error('Error rendering theme icon:', error);
                      return <Star className="h-12 w-12 text-yellow-400" />;
                    }
                  })()}
                </div>
              </div>

              {/* Texto principal */}
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-white animate-in fade-in-0 slide-in-from-top-4 duration-700">
                  {levelUpData.level > levelUpData.previousLevel 
                    ? `🎉 Nível ${levelUpData.level} Alcançado!`
                    : `📊 Nível ${levelUpData.level} Ativo!`
                  }
                </h2>
                <p className="text-xl text-gray-300 animate-in fade-in-0 slide-in-from-top-4 duration-700 delay-200">
                  {levelUpData.level > levelUpData.previousLevel 
                    ? 'Parabéns! Você desbloqueou novos recursos incríveis!'
                    : `Você agora está no nível ${levelUpData.level}! Aproveite todos os recursos disponíveis.`
                  }
                </p>
                {levelUpData.level !== levelUpData.previousLevel && (
                  <p className="text-sm text-gray-400 animate-in fade-in-0 slide-in-from-top-4 duration-700 delay-300">
                    {levelUpData.level > levelUpData.previousLevel 
                      ? `Subiu do nível ${levelUpData.previousLevel} para ${levelUpData.level}`
                      : `Mudou do nível ${levelUpData.previousLevel} para ${levelUpData.level}`
                    }
                  </p>
                )}
              </div>

              {/* Benefícios desbloqueados */}
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
                <h3 className="text-lg font-semibold text-white">✨ Novos Benefícios:</h3>
                <div className="grid gap-3">
                  {(() => {
                    const benefits = getLevelBenefits(levelUpData.level);
                    return benefits.map((benefit, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                        >
                          <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
                            {(() => {
                              try {
                                return React.isValidElement(benefit.icon) ? (
                                  React.cloneElement(benefit.icon as React.ReactElement)
                                ) : (
                                  <Star className="h-5 w-5" />
                                );
                              } catch (error) {
                                console.error('Error rendering benefit icon:', error);
                                return <Star className="h-5 w-5" />;
                              }
                            })()}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-white">{benefit.text}</p>
                            <p className="text-sm text-gray-400">{benefit.description}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Preview do próximo nível */}
              {(() => {
                if (levelUpData.level < 10) {
                  const nextPreview = getNextLevelPreview(levelUpData.level);
                  
                  return (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Próximo Nível:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                          try {
                            return React.isValidElement(nextPreview.icon) ? (
                              React.cloneElement(nextPreview.icon as React.ReactElement)
                            ) : (
                              <Star className="h-4 w-4" />
                            );
                          } catch (error) {
                            console.error('Error rendering nextPreview icon:', error);
                            return <Star className="h-4 w-4" />;
                          }
                        })()}
                        <span className="text-white">
                          Nível {nextPreview.level} - {nextPreview.feature}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-300">Nível Máximo Alcançado!</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-400" />
                        <span className="text-white">
                          Parabéns! Você alcançou o nível máximo de produtividade!
                        </span>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Botão continuar */}
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-600"
                onClick={handleLevelUpClose}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Reset */}
      {showResetConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirmation(false)} />
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <RotateCcw className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Reset
              </h2>
              <p className="text-gray-600 text-sm">
                Tem certeza que deseja resetar todos os dados? Esta ação irá:
              </p>
              <div className="text-left space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  <span>Apagar todas as tarefas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  <span>Resetar nível e XP para 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">•</span>
                  <span>Limpar histórico e conquistas</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                  <span className="text-green-500">✓</span>
                  <span className="text-green-600 font-medium">Manter informações do perfil (nome, email, foto, bio)</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirmation(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmReset}
                  className="flex-1"
                >
                  Confirmar Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conquistas */}
      <UserAchievements
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </>
  );
}); 