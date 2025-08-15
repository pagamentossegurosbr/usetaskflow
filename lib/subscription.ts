'use client';

export type SubscriptionPlan = 'free' | 'aspirante' | 'executor';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  maxLevel: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStartedAt?: Date;
  subscriptionExpiresAt?: Date;
}

export interface PlanFeatures {
  maxLevel: number;
  miniGames: boolean;
  advancedCharts: boolean;
  habitTracker: boolean;
  readingLibrary: boolean;
  pomodoroFocus: boolean;
  caveMode: boolean;
  extraXpMultiplier: number;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  free: {
    maxLevel: 3,
    miniGames: false,
    advancedCharts: false,
    habitTracker: false,
    readingLibrary: false,
    pomodoroFocus: false,
    caveMode: false,
    extraXpMultiplier: 1,
  },
  aspirante: {
    maxLevel: 10,
    miniGames: true,
    advancedCharts: true,
    habitTracker: false,
    readingLibrary: false,
    pomodoroFocus: false,
    caveMode: false,
    extraXpMultiplier: 1,
  },
  executor: {
    maxLevel: 999,
    miniGames: true,
    advancedCharts: true,
    habitTracker: true,
    readingLibrary: true,
    pomodoroFocus: true,
    caveMode: true,
    extraXpMultiplier: 1.5,
  },
};

export const PLAN_PRICES = {
  aspirante: {
    firstMonth: 990, // R$ 9,90
    recurring: 2490, // R$ 24,90
  },
  executor: {
    firstMonth: 9700, // R$ 97,00
    recurring: 12990, // R$ 129,90
  },
};

export const STRIPE_PRODUCT_IDS = {
  aspirante: 'prod_SpfaLlvKo0MhND',
  executor: 'prod_SpfaMuTz5LfKlR',
};

export const STRIPE_PRICE_IDS = {
  aspirante: {
    firstMonth: 'price_1Ru0F5DY8STDZSZWNZaukwiu',
    recurring: 'price_1Ru0F9DY8STDZSZWdEHYfYFo',
  },
  executor: {
    firstMonth: 'price_1Ru0FCDY8STDZSZWz6KEmH5L', // R$ 24,90 - 1º mês
    recurring: 'price_1Ru0FGDY8STDZSZWL6ArBwl2', // R$ 49,90 - mensal
  },
};

export class SubscriptionService {
  static getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
    return PLAN_FEATURES[plan];
  }

  static canAccessFeature(userPlan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
    const features = this.getPlanFeatures(userPlan);
    return features[feature] as boolean;
  }

  static canReachLevel(userPlan: SubscriptionPlan, level: number): boolean {
    const features = this.getPlanFeatures(userPlan);
    return level <= features.maxLevel;
  }

  static getXpMultiplier(userPlan: SubscriptionPlan): number {
    const features = this.getPlanFeatures(userPlan);
    return features.extraXpMultiplier;
  }

  static getPlanName(plan: SubscriptionPlan): string {
    const names = {
      free: 'Gratuito',
      aspirante: 'Aspirante',
      executor: 'Executor',
    };
    return names[plan];
  }

  static getPlanColor(plan: SubscriptionPlan): string {
    const colors = {
      free: 'gray',
      aspirante: 'purple',
      executor: 'gold',
    };
    return colors[plan];
  }

  static getPlanBenefits(plan: SubscriptionPlan): string[] {
    const benefits = {
      free: [
        'Evolução até o Level 3',
        'Sistema básico de tarefas',
        'Progresso e estatísticas básicas',
      ],
      aspirante: [
        'Evolução até o Level 10',
        'Desbloqueio de mini-jogos',
        'Gráficos avançados de desempenho',
        'Recursos extras de produtividade',
      ],
      executor: [
        'Níveis ilimitados',
        'XP extra por tarefa (1.5x)',
        'Habit Tracker completo',
        'Biblioteca de Leitura',
        'Pomodoro Focus',
        'Modo Caverna exclusivo',
        'Todos os recursos premium',
      ],
    };
    return benefits[plan];
  }

  static formatPrice(amountInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amountInCents / 100);
  }

  static getUpgradeMessage(currentPlan: SubscriptionPlan, targetLevel: number): string {
    if (currentPlan === 'free' && targetLevel > 3) {
      return `Para continuar evoluindo além do Level 3, você precisa escolher um plano premium! 🚀`;
    }
    if (currentPlan === 'aspirante' && targetLevel > 10) {
      return `Para continuar evoluindo além do Level 10, faça upgrade para o Plano Executor! 💎`;
    }
    return '';
  }

  static shouldShowUpgrade(currentPlan: SubscriptionPlan, currentLevel: number): boolean {
    const features = this.getPlanFeatures(currentPlan);
    return currentLevel >= features.maxLevel;
  }

  static getNextPlan(currentPlan: SubscriptionPlan): SubscriptionPlan | null {
    if (currentPlan === 'free') return 'aspirante';
    if (currentPlan === 'aspirante') return 'executor';
    return null;
  }

  static getStorageKey(key: string): string {
    if (typeof window !== 'undefined') {
      const userEmail = localStorage.getItem('userEmail') || 'default';
      return `taskflow_${userEmail}_${key}`;
    }
    return `taskflow_default_${key}`;
  }

  static getUserSubscription(): UserSubscription {
    if (typeof window === 'undefined') {
      return {
        plan: 'free',
        status: 'active',
        maxLevel: 3,
      };
    }

    const stored = localStorage.getItem(this.getStorageKey('subscription'));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          subscriptionStartedAt: parsed.subscriptionStartedAt 
            ? new Date(parsed.subscriptionStartedAt) 
            : undefined,
          subscriptionExpiresAt: parsed.subscriptionExpiresAt 
            ? new Date(parsed.subscriptionExpiresAt) 
            : undefined,
        };
      } catch (error) {
        console.error('Error parsing stored subscription:', error);
      }
    }

    return {
      plan: 'free',
      status: 'active',
      maxLevel: 3,
    };
  }

  static setUserSubscription(subscription: UserSubscription): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        this.getStorageKey('subscription'),
        JSON.stringify(subscription)
      );
    }
  }

  static async syncSubscriptionWithServer(): Promise<UserSubscription> {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const subscription = await response.json();
        this.setUserSubscription(subscription);
        return subscription;
      }
    } catch (error) {
      console.error('Error syncing subscription with server:', error);
    }
    
    return this.getUserSubscription();
  }
}
