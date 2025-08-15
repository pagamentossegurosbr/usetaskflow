'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Target, 
  BookOpen, 
  Timer, 
  Shield,
  Calendar as CalendarIcon,
  FileText
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProductivityLevel } from '@/hooks/useProductivityLevel';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useLanguage } from '@/hooks/useLanguage';

const NAVIGATION_ITEMS = [
  {
    nameKey: 'nav.dashboard',
    href: '/',
    icon: Home,
    requiredPlan: 'free'
  },
  {
    nameKey: 'nav.habits',
    href: '/habit-tracker',
    icon: Target,
    requiredPlan: 'executor'
  },
  {
    nameKey: 'nav.readingLibrary',
    href: '/reading-library',
    icon: BookOpen,
    requiredPlan: 'executor'
  },
  {
    nameKey: 'nav.pomodoro',
    href: '/pomodoro-focus',
    icon: Timer,
    requiredPlan: 'executor'
  },
  {
    nameKey: 'nav.caveMode',
    href: '/cave-mode',
    icon: Shield,
    requiredPlan: 'executor'
  },
  {
    nameKey: 'nav.projectPlanner',
    href: '/project-planner',
    icon: FileText,
    requiredPlan: 'executor'
  }
];

export function MainNavigation() {
  const pathname = usePathname();
  const { translations } = useLanguage();
  
  // Verificar se deve mostrar a navegação ANTES de chamar os hooks
  const shouldShowNavigation = !(pathname === '/landing' || pathname.startsWith('/auth') || pathname.startsWith('/admin'));
  
  const { canAccessFeature } = useSubscription();
  const { stats } = useProductivityLevel();
  const [currentDate, setCurrentDate] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Sistema de upgrade
  const {
    isOpen: isUpgradeModalOpen,
    targetPlan,
    blockedFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    canAccessFeature: canAccessFeatureUpgrade,
    handleFeatureClick,
  } = useUpgradeModal({
    onUpgrade: async (plan) => {
      console.log(`Upgrading to ${plan} plan`);
      // Aqui você pode implementar a lógica de upgrade
      // Por exemplo, redirecionar para o Stripe
    }
  });

  // Refs para controlar duplo clique
  const clickTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const clickCounts = useRef<{ [key: string]: number }>({});

  // Controlar hidratação para evitar mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Atualizar data atual
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Função para verificar acesso (memoizada)
  const canAccess = useCallback((requiredPlan: string) => {
    if (!isHydrated) {
      // Durante SSR, assumir acesso básico para evitar mismatch
      return requiredPlan === 'free';
    }
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'executor') {
      const hasAccess = canAccessFeature('habitTracker');
      return hasAccess;
    }
    return false;
  }, [isHydrated, canAccessFeature]);

  // Função para lidar com duplo clique em itens bloqueados (otimizada)
  const handleItemClick = useCallback((item: typeof NAVIGATION_ITEMS[0], e: React.MouseEvent) => {
    const hasAccess = canAccess(item.requiredPlan);
    
    if (!hasAccess) {
      e.preventDefault();
      
      const itemKey = item.nameKey;
      const itemName = translations.nav[item.nameKey.replace('nav.', '') as keyof typeof translations.nav] || item.nameKey;
      
      // Incrementar contador de cliques
      clickCounts.current[itemKey] = (clickCounts.current[itemKey] || 0) + 1;
      
      // Limpar timeout anterior se existir
      if (clickTimeouts.current[itemKey]) {
        clearTimeout(clickTimeouts.current[itemKey]);
      }
      
      // Se for o segundo clique (duplo clique)
      if (clickCounts.current[itemKey] === 2) {
        // Abrir modal de upgrade
        if (item.requiredPlan === 'executor') {
          openUpgradeModal('executor', itemName);
                  } else if (item.requiredPlan === 'aspirante') {
            openUpgradeModal('aspirante', itemName);
        }
        
        // Resetar contadores
        clickCounts.current[itemKey] = 0;
        if (clickTimeouts.current[itemKey]) {
          clearTimeout(clickTimeouts.current[itemKey]);
        }
      } else {
        // Configurar timeout para resetar o contador
        clickTimeouts.current[itemKey] = setTimeout(() => {
          clickCounts.current[itemKey] = 0;
        }, 300); // 300ms para detectar duplo clique
      }
    }
  }, [canAccess, openUpgradeModal]);

  // Memoizar o progresso para evitar recálculos desnecessários
  const progressPercentage = useMemo(() => {
    if (!isHydrated || !stats.xpToNextLevel || stats.xpToNextLevel <= 0) return 0;
    return (stats.xpInCurrentLevel / (stats.xpInCurrentLevel + stats.xpToNextLevel)) * 100;
  }, [isHydrated, stats.xpInCurrentLevel, stats.xpToNextLevel]);

  // Não mostrar navegação na landing page, auth pages, ou admin pages
  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-br from-background/80 via-background/80 to-muted/16 border-b border-border shadow-2xl">
        <div className="container mx-auto px-6 h-20">
          <div className="flex items-center justify-between h-full">
            {/* Data e Ícone */}
            <div className="flex items-center gap-3 text-foreground/90">
              <div className="p-2 bg-muted/20 rounded-full backdrop-blur-sm">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium capitalize">{currentDate}</p>
              </div>
            </div>

            {/* Navigation Links - Centro */}
            <div className="flex items-center gap-2 bg-muted/10 backdrop-blur-sm rounded-full p-1 border border-border">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const hasAccess = canAccess(item.requiredPlan);
                const isPremium = item.requiredPlan === 'executor';
                const itemName = translations.nav[item.nameKey.replace('nav.', '') as keyof typeof translations.nav] || item.nameKey;
                
                return (
                  <div key={item.nameKey} className="relative">
                    <Link
                      href={isHydrated && hasAccess ? item.href : '/'}
                      onClick={(e) => handleItemClick(item, e)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                        ${isActive 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
                          : hasAccess 
                            ? 'text-foreground/70 hover:text-foreground hover:bg-muted/20' 
                            : 'text-foreground/40 cursor-not-allowed'
                        }
                        ${!hasAccess && isHydrated ? 'hover:bg-red-500/10 hover:text-red-400' : ''}
                      `}
                      title={!hasAccess && isHydrated ? `Duplo clique para fazer upgrade e acessar ${itemName}` : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{itemName}</span>
                      {!hasAccess && isHydrated && (
                        <span className="text-xs opacity-60">🔒</span>
                      )}
                    </Link>
                    {isPremium && isHydrated && !hasAccess && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar Section - Direita */}
            <div className="flex items-center gap-4">
              {isHydrated && (
                <div className="hidden md:flex items-center gap-3 bg-muted/10 backdrop-blur-sm rounded-full px-4 py-2.5 border border-border">
                  <span className="text-xs font-semibold text-foreground/90">
                    Level {stats.currentLevel || 1}
                  </span>
                  <div className="w-28 h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/60 font-medium">
                    {stats.xpInCurrentLevel || 0}/{(stats.xpInCurrentLevel || 0) + (stats.xpToNextLevel || 100)} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Upgrade */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentLevel={stats.currentLevel || 1}
        blockedFeature={blockedFeature}
        targetPlan={targetPlan}
      />
    </>
  );
}
