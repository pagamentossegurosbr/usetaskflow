'use client';

import { useState } from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

interface QuickUpgradeButtonProps {
  requiredPlan: 'aspirante' | 'executor';
  featureName?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
  children?: React.ReactNode;
}

export function QuickUpgradeButton({ 
  requiredPlan, 
  featureName, 
  className = '',
  variant = 'default',
  children 
}: QuickUpgradeButtonProps) {
  const { openUpgradeModal } = useUpgradeModal();

  const handleClick = () => {
    openUpgradeModal(requiredPlan, featureName);
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <>
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm">Upgrade</span>
          </>
        );
      case 'icon':
        return (
          <div className="relative">
            <Lock className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </div>
        );
      default:
        return (
          <>
            <Crown className="h-4 w-4 mr-2" />
            <span>Fazer Upgrade</span>
            {featureName && (
              <span className="text-xs opacity-80 ml-1">
                para {featureName}
              </span>
            )}
          </>
        );
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 hover:scale-105';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl ${className}`;
      case 'icon':
        return `${baseClasses} p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl ${className}`;
      default:
        return `${baseClasses} px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 shadow-lg hover:shadow-xl ${className}`;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={getButtonClasses()}
      title={featureName ? `Fazer upgrade para acessar ${featureName}` : 'Fazer upgrade'}
    >
      {children || getButtonContent()}
    </button>
  );
}
