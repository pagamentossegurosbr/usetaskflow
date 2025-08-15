'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  SubscriptionService, 
  UserSubscription, 
  SubscriptionPlan, 
  PlanFeatures 
} from '@/lib/subscription';

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<UserSubscription>(
    SubscriptionService.getUserSubscription()
  );
  const [loading, setLoading] = useState(false);

  // Sincronizar com o servidor quando a sessão estiver disponível (otimizado)
  useEffect(() => {
    if (session?.user?.email && !subscription.lastSync) {
      // Só sincronizar se não foi sincronizado recentemente
      syncWithServer();
    }
  }, [session?.user?.email]);

  const syncWithServer = useCallback(async () => {
    setLoading(true);
    try {
      const serverSubscription = await SubscriptionService.syncSubscriptionWithServer();
      setSubscription(serverSubscription);
    } catch (error) {
      console.error('Error syncing subscription:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback((newSubscription: Partial<UserSubscription>) => {
    const updated = { ...subscription, ...newSubscription };
    setSubscription(updated);
    SubscriptionService.setUserSubscription(updated);
  }, [subscription]);

  const upgradeSubscription = useCallback(async (targetPlan: SubscriptionPlan) => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.paymentUrl) {
          // Redirecionar para o checkout do Stripe
          window.location.href = result.paymentUrl;
        }
      } else {
        throw new Error('Failed to create upgrade session');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        await syncWithServer();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [syncWithServer]);

  // Métodos de conveniência
  const canAccessFeature = useCallback((feature: keyof PlanFeatures): boolean => {
    return SubscriptionService.canAccessFeature(subscription.plan, feature);
  }, [subscription.plan]);

  const canReachLevel = useCallback((level: number): boolean => {
    return SubscriptionService.canReachLevel(subscription.plan, level);
  }, [subscription.plan]);

  const getXpMultiplier = useCallback((): number => {
    return SubscriptionService.getXpMultiplier(subscription.plan);
  }, [subscription.plan]);

  const shouldShowUpgrade = useCallback((currentLevel: number): boolean => {
    return SubscriptionService.shouldShowUpgrade(subscription.plan, currentLevel);
  }, [subscription.plan]);

  const getUpgradeMessage = useCallback((targetLevel: number): string => {
    return SubscriptionService.getUpgradeMessage(subscription.plan, targetLevel);
  }, [subscription.plan]);

  const getNextPlan = useCallback((): SubscriptionPlan | null => {
    return SubscriptionService.getNextPlan(subscription.plan);
  }, [subscription.plan]);

  const getPlanFeatures = useCallback((): PlanFeatures => {
    return SubscriptionService.getPlanFeatures(subscription.plan);
  }, [subscription.plan]);

  const isPremium = subscription.plan !== 'free';
  const isExecutor = subscription.plan === 'executor';
  const isAspirante = subscription.plan === 'aspirante';

  return {
    // Estado
    subscription,
    loading,
    isPremium,
    isExecutor,
    isAspirante,

    // Ações
    syncWithServer,
    updateSubscription,
    upgradeSubscription,
    cancelSubscription,

    // Métodos de verificação
    canAccessFeature,
    canReachLevel,
    getXpMultiplier,
    shouldShowUpgrade,
    getUpgradeMessage,
    getNextPlan,
    getPlanFeatures,

    // Utilitários
    planName: SubscriptionService.getPlanName(subscription.plan),
    planColor: SubscriptionService.getPlanColor(subscription.plan),
    planBenefits: SubscriptionService.getPlanBenefits(subscription.plan),
    
    // Conveniência para compatibilidade
    subscriptionPlan: subscription.plan,
  };
}
