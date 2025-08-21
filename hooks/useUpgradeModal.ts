'use client';

import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';

interface UseUpgradeModalOptions {
  onUpgrade?: (plan: 'aspirante' | 'executor') => void;
}

export function useUpgradeModal(options: UseUpgradeModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'aspirante' | 'executor' | undefined>(undefined);
  const [blockedFeature, setBlockedFeature] = useState<string | null>(null);
  const { subscription } = useSubscription();

  const openUpgradeModal = useCallback((plan: 'aspirante' | 'executor', feature?: string) => {
    setTargetPlan(plan);
    setBlockedFeature(feature || null);
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsOpen(false);
    setTargetPlan(undefined);
    setBlockedFeature(null);
  }, []);

  const handleUpgrade = useCallback(async (plan: 'aspirante' | 'executor') => {
    try {
      if (options.onUpgrade) {
        await options.onUpgrade(plan);
      }
      closeUpgradeModal();
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
    }
  }, [options.onUpgrade, closeUpgradeModal]);

  const canAccessFeature = useCallback((requiredPlan: 'free' | 'aspirante' | 'executor') => {
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'aspirante') return subscription.plan === 'aspirante' || subscription.plan === 'executor';
    if (requiredPlan === 'executor') return subscription.plan === 'executor';
    return false;
  }, [subscription.plan]);

  const handleFeatureClick = useCallback((requiredPlan: 'free' | 'aspirante' | 'executor', featureName?: string) => {
    if (!canAccessFeature(requiredPlan)) {
      if (requiredPlan === 'aspirante') {
        openUpgradeModal('aspirante', featureName);
      } else if (requiredPlan === 'executor') {
        openUpgradeModal('executor', featureName);
      }
      return false;
    }
    return true;
  }, [canAccessFeature, openUpgradeModal]);

  return {
    isOpen,
    targetPlan,
    blockedFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    canAccessFeature,
    handleFeatureClick,
    currentPlan: subscription.plan,
  };
}
