'use client';

import { Lock, Crown, Sparkles } from 'lucide-react';
import { QuickUpgradeButton } from './QuickUpgradeButton';

interface FeatureLockOverlayProps {
  requiredPlan: 'aspirante' | 'executor';
  featureName: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FeatureLockOverlay({ 
  requiredPlan, 
  featureName, 
  description,
  className = '',
  children 
}: FeatureLockOverlayProps) {
  const getPlanIcon = () => {
    return requiredPlan === 'executor' ? <Crown className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />;
  };

  const getPlanColor = () => {
    return requiredPlan === 'executor' 
      ? 'from-yellow-500 to-orange-500' 
      : 'from-purple-500 to-pink-500';
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Conteúdo original (bloqueado) */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>

      {/* Overlay de bloqueio */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          {/* Ícone do plano */}
          <div className={`w-16 h-16 bg-gradient-to-r ${getPlanColor()} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            {getPlanIcon()}
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-white mb-2">
            🔒 {featureName} Bloqueado
          </h3>

          {/* Descrição */}
          <p className="text-gray-300 text-sm mb-6">
            {description || `Faça upgrade para o plano ${requiredPlan === 'executor' ? 'Executor' : 'Aspirante'} para acessar ${featureName} e muito mais!`}
          </p>

          {/* Botão de upgrade */}
          <QuickUpgradeButton
            requiredPlan={requiredPlan}
            featureName={featureName}
            variant="default"
            className="w-full"
          />

          {/* Indicador de plano */}
          <div className="mt-4 text-xs text-gray-400">
            Requer plano {requiredPlan === 'executor' ? 'Executor' : 'Aspirante'}
          </div>
        </div>
      </div>
    </div>
  );
}
