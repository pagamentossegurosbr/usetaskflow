'use client';

import { useState } from 'react';
import { 
  Crown, 
  Zap, 
  Star, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Timer, 
  Shield,
  X,
  Check,
  Sparkles,
  Rocket,
  Diamond,
  BarChart3,
  Award,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Users,
  TrendingDown
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useProductivityLevel } from '@/hooks/useProductivityLevel';
import { useSession } from 'next-auth/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  blockedFeature?: string;
  targetPlan?: 'free' | 'aspirante' | 'executor';
}

const SubscriptionService = {
  formatPrice: (price: number) => `R$ ${(price / 100).toFixed(2).replace('.', ',')}`
};

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  currentLevel, 
  blockedFeature,
  targetPlan 
}: UpgradeModalProps) {
  const { subscription } = useSubscription();
  const { stats } = useProductivityLevel();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'aspirante' | 'executor'>(
    targetPlan || (subscription.plan === 'free' ? 'aspirante' : 'executor')
  );
  const [currentFAQIndex, setCurrentFAQIndex] = useState(0);
  const { data: session } = useSession();

  const handleUpgrade = async (plan: 'aspirante' | 'executor') => {
    if (!session?.user) {
      alert('Faça login para fazer upgrade do seu plano');
      return;
    }
    
    setLoading(true);
    try {
      // Determinar o price ID baseado no plano
      let priceId = '';
      if (plan === 'aspirante') {
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ASPIRANTE_TRIAL || 'price_1RtRajDY8STDZSZW20MfXqqi';
      } else if (plan === 'executor') {
        priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_EXECUTOR_TRIAL || 'price_1RtRakDY8STDZSZW2CTVrsXA';
      }

      // Criar payment link usando URL relativa
      const response = await fetch('/api/stripe/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Falha ao criar link de pagamento: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('URL de pagamento não recebida');
      }
      
      // Redirecionar para o Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      
      // Mensagem de erro mais específica
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        alert('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        alert('Erro ao processar upgrade. Tente novamente ou entre em contato com o suporte.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: 'free' | 'aspirante' | 'executor') => {
    const icons = {
      free: <Star className="h-6 w-6" />,
      aspirante: <Crown className="h-6 w-6" />,
      executor: <Diamond className="h-6 w-6" />,
    };
    return icons[plan];
  };

  const aspiranteFeatures = [
    'Evolução até o Level 10',
    'Desbloqueio de mini-jogos',
    'Gráficos avançados de desempenho',
    'Recursos extras de produtividade',
    'Suporte prioritário',
  ];

  const executorFeatures = [
    'Níveis ilimitados',
    'XP extra por tarefa (1.5x)',
    'Pomodoro Focus',
    'Planejador de Projetos',
    'Cave Mode exclusivo',
    'Biblioteca de Leitura',
    'Habit Tracker completo',
    'Todos os recursos premium',
    'Suporte VIP',
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Desenvolvedora',
      avatar: 'AS',
      rating: 5,
      text: 'O Pomodoro Focus e Planejador de Projetos transformaram minha produtividade. Consigo gerenciar projetos complexos com facilidade!'
    },
    {
      name: 'Carlos Santos',
      role: 'Empreendedor',
      avatar: 'CS',
      rating: 5,
      text: 'O Cave Mode e Habit Tracker são incríveis! ROI incrível para meu negócio e rotinas duradouras.'
    },
    {
      name: 'Marina Costa',
      role: 'Estudante',
      avatar: 'MC',
      rating: 5,
      text: 'A Biblioteca de Leitura e analytics detalhados me ajudaram a organizar meus estudos perfeitamente.'
    }
  ];

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Seu acesso continuará até o final do período pago.'
    },
    {
      question: 'Há garantia de satisfação?',
      answer: 'Oferecemos garantia de 7 dias. Se não estiver satisfeito, devolvemos 100% do seu dinheiro.'
    },
    {
      question: 'Os dados são seguros?',
      answer: 'Absolutamente! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança da indústria.'
    },
    {
      question: 'Posso usar em múltiplos dispositivos?',
      answer: 'Sim! Sua conta funciona em todos os seus dispositivos - desktop, tablet e mobile.'
    },
    {
      question: 'Há limite de tarefas?',
      answer: 'Não! Com o plano Executor você pode criar quantas tarefas quiser, sem limites.'
    }
  ];

  const nextFAQ = () => {
    setCurrentFAQIndex((prev) => (prev + 1) % faqs.length);
  };

  const prevFAQ = () => {
    setCurrentFAQIndex((prev) => (prev - 1 + faqs.length) % faqs.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Glassmorphism Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Enhanced Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-3xl"></div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-6">
          {/* Header Compacto */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">
              {blockedFeature 
                ? `Desbloqueie ${blockedFeature}`
                : currentLevel >= subscription.maxLevel 
                  ? `Parabéns! Level ${currentLevel}`
                  : 'Desbloqueie Todo Seu Potencial'
              }
            </h2>
            
            <p className="text-gray-300 text-base mb-4 max-w-xl mx-auto">
              {blockedFeature
                ? `Faça upgrade para acessar ${blockedFeature} e muito mais.`
                : currentLevel >= subscription.maxLevel
                  ? 'Para continuar evoluindo e acessar recursos exclusivos, escolha seu plano premium.'
                  : 'Acesse recursos exclusivos e acelere sua produtividade com nossos planos premium.'
              }
            </p>
          </div>

          {/* Comparativo de Recursos - Mais Compacto */}
          <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white text-center mb-4 flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              Comparativo de Recursos
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Productivity Chart */}
              <div className="text-center group">
                <div className="relative w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.2)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                      strokeDasharray="75, 100"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">75%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300">Produtividade</p>
                <p className="text-xs text-purple-400">Free vs Premium</p>
              </div>

              {/* Resources Chart */}
              <div className="text-center group">
                <div className="space-y-1 mb-2 group-hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Free</span>
                    <span className="text-white">3/10</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-gray-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '30%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400">Premium</span>
                    <span className="text-white">10/10</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-gray-300">Recursos Disponíveis</p>
              </div>

              {/* XP Chart */}
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-xs text-gray-300">XP Acelerado</p>
                <p className="text-xs text-purple-400">1.5x mais rápido</p>
              </div>
            </div>
          </div>

          {/* Depoimentos - Mini Gráficos Melhorados */}
          <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white text-center mb-4 flex items-center justify-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Depoimentos de Usuários
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 group hover:border-purple-500/50 transition-all duration-300 hover:bg-white/10">
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <div className="mb-2">
                    <Quote className="h-3 w-3 text-purple-400 mb-1" />
                    <p className="text-xs text-gray-300 italic leading-relaxed">"{testimonial.text}"</p>
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500/30 to-pink-500/20 rounded-full flex items-center justify-center text-xs font-medium text-purple-300 mr-2">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{testimonial.name}</p>
                      <p className="text-xs text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planos - Mais Compactos */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Aspirante Plan */}
            <div 
              className={`relative cursor-pointer transition-all duration-300 bg-white/5 backdrop-blur-sm border rounded-xl p-4 group hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] ${
                selectedPlan === 'aspirante' 
                  ? 'border-purple-500/50 bg-white/10' 
                  : 'border-white/10'
              }`}
              onClick={() => setSelectedPlan('aspirante')}
            >
              {/* Popular Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full text-xs flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Popular
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg border border-white/20 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Crown className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Plano Aspirante</h3>
                  <p className="text-gray-300 text-sm">Para quem quer começar</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {SubscriptionService.formatPrice(990)}
                  </span>
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded text-xs">
                    60% OFF
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Depois {SubscriptionService.formatPrice(2490)}/mês
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {aspiranteFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('aspirante')}
                disabled={loading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 text-sm rounded-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="flex items-center justify-center">
                  {loading ? 'Processando...' : (
                    <>
                      Escolher Aspirante
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Executor Plan - Design Minimalista */}
            <div 
              className={`relative cursor-pointer transition-all duration-300 bg-white/5 backdrop-blur-sm border rounded-xl p-4 group hover:border-purple-500/40 hover:bg-white/10 hover:scale-[1.02] ${
                selectedPlan === 'executor' 
                  ? 'border-purple-500/50 bg-white/10' 
                  : 'border-white/10'
              }`}
              onClick={() => setSelectedPlan('executor')}
            >
              {/* Badge Recomendado */}
              <div className="absolute top-3 right-3">
                <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full text-xs flex items-center">
                  <Diamond className="h-3 w-3 mr-1" />
                  RECOMENDADO
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg border border-white/20 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Plano Executor</h3>
                  <p className="text-gray-300 text-sm">Máximo desempenho</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {SubscriptionService.formatPrice(2490)}
                  </span>
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded text-xs">
                    50% OFF
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Depois {SubscriptionService.formatPrice(4990)}/mês
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {executorFeatures.map((feature, index) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('executor')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="flex items-center justify-center">
                  {loading ? 'Processando...' : (
                    <>
                      Escolher Executor
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* FAQ Carrossel - Mais Compacto */}
          <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-lg font-semibold text-white text-center mb-4 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              Perguntas Frequentes
            </h3>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 min-h-[100px]">
                <div className="text-center">
                  <h4 className="text-base font-semibold text-white mb-2">
                    {faqs[currentFAQIndex].question}
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {faqs[currentFAQIndex].answer}
                  </p>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={prevFAQ}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex gap-1.5">
                  {faqs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFAQIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index === currentFAQIndex 
                          ? 'bg-purple-500' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextFAQ}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Garantias e Benefícios - Mais Compacto */}
          <div className="text-center space-y-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex justify-center items-center gap-2 text-green-400">
              <div className="p-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Garantia de 7 dias - Satisfação total ou seu dinheiro de volta</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center justify-center gap-1.5 text-gray-300">
                <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Check className="h-2.5 w-2.5 text-blue-400" />
                </div>
                Sem compromisso
              </div>
              <div className="flex items-center justify-center gap-1.5 text-gray-300">
                <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Check className="h-2.5 w-2.5 text-blue-400" />
                </div>
                Cancele a qualquer momento
              </div>
              <div className="flex items-center justify-center gap-1.5 text-gray-300">
                <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Check className="h-2.5 w-2.5 text-blue-400" />
                </div>
                Suporte prioritário
              </div>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-sm font-medium">
                <Award className="h-4 w-4 mr-2 text-yellow-400" />
                Maximize seus resultados hoje mesmo!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}