'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Users, 
  Zap, 
  Target, 
  TrendingUp,
  ArrowRight,
  Play,
  Shield,
  Globe,
  Award,
  Clock,
  BarChart3,
  BookOpen,
  Headphones,
  Mountain
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  originalPrice: number;
  promotionalPrice: number | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
}

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pricingPlan: PricingPlan | null;
  customPricing: any;
  inviteCode: string | null;
}

export default function LandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        const inviteCode = searchParams.get('invite');
        const url = inviteCode 
          ? `/api/landing/${params.slug}?invite=${inviteCode}`
          : `/api/landing/${params.slug}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setLandingPage(data);
        } else {
          console.error('Landing page não encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar landing page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPage();
  }, [params.slug, searchParams]);

  const handleUpgrade = async (planSlug: string) => {
    try {
      const inviteCode = searchParams.get('invite');
      const url = inviteCode 
        ? `/subscription/upgrade?plan=${planSlug}&invite=${inviteCode}`
        : `/subscription/upgrade?plan=${planSlug}`;
      
      window.location.href = url;
    } catch (error) {
      toast.error('Erro ao processar upgrade');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Landing Page não encontrada</h1>
          <p className="text-white/60">A página que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  // Renderizar template baseado no tipo
  if (landingPage.template === 'alternative') {
    return <AlternativeTemplate landingPage={landingPage} onUpgrade={handleUpgrade} formatPrice={formatPrice} />;
  }

  // Template padrão
  return <DefaultTemplate landingPage={landingPage} onUpgrade={handleUpgrade} formatPrice={formatPrice} />;
}

// Template Padrão
function DefaultTemplate({ landingPage, onUpgrade, formatPrice }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-500/30">
              ✨ Nova versão disponível
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {landingPage.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              {landingPage.subtitle}
            </p>
            
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              {landingPage.description}
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                onClick={() => onUpgrade('aspirante')}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">10k+</div>
                <div className="text-white/60">Usuários ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">300%</div>
                <div className="text-white/60">Aumento na produtividade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">4.9/5</div>
                <div className="text-white/60">Avaliação média</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tudo que você precisa para ser mais produtivo
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Ferramentas avançadas de produtividade com gamificação e insights inteligentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      {landingPage.pricingPlan && (
        <section className="py-24 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Escolha seu plano
              </h2>
              <p className="text-xl text-white/60">
                Comece grátis e evolua conforme suas necessidades
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/5 border-purple-500/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white">
                    Plano {landingPage.pricingPlan.name}
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    {landingPage.pricingPlan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-8">
                    {landingPage.pricingPlan.promotionalPrice ? (
                      <div>
                        <div className="text-4xl font-bold text-purple-400">
                          {formatPrice(landingPage.pricingPlan.promotionalPrice)}
                        </div>
                        <div className="text-lg text-white/60 line-through">
                          {formatPrice(landingPage.pricingPlan.originalPrice)}
                        </div>
                        <div className="text-sm text-green-400 mt-2">
                          Promoção por tempo limitado
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-purple-400">
                        {formatPrice(landingPage.pricingPlan.originalPrice)}
                      </div>
                    )}
                    <div className="text-white/60">por mês</div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-4"
                    onClick={() => onUpgrade(landingPage.pricingPlan.slug)}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">
            © 2024 Notch. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Template Alternativo
function AlternativeTemplate({ landingPage, onUpgrade, formatPrice }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Header Alternativo */}
      <header className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">
              🚀 Transforme sua produtividade
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {landingPage.title}
            </h1>
            
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              {landingPage.subtitle}
            </p>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                onClick={() => onUpgrade('executor')}
              >
                Teste Grátis por 7 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span>4.9/5 (2.5k+ avaliações)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>10k+ usuários ativos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features em Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Por que escolher o Notch?
              </h2>
              <div className="space-y-6">
                {alternativeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-400 mb-4">
                    {landingPage.pricingPlan?.promotionalPrice ? 
                      formatPrice(landingPage.pricingPlan.promotionalPrice) : 
                      formatPrice(landingPage.pricingPlan?.originalPrice || 0)
                    }
                  </div>
                  <div className="text-white/60 mb-6">por mês</div>
                  <Button 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4"
                    onClick={() => onUpgrade(landingPage.pricingPlan?.slug || 'executor')}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-white/50 mt-4">
                    Cancelamento a qualquer momento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">
            © 2024 Notch. Transforme sua produtividade hoje mesmo.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Target,
    title: 'Gamificação Inteligente',
    description: 'Transforme suas tarefas em missões e ganhe XP conforme progride'
  },
  {
    icon: BarChart3,
    title: 'Insights Avançados',
    description: 'Analise seus padrões de produtividade e otimize seu tempo'
  },
  {
    icon: Mountain,
    title: 'Modo Caverna',
    description: 'Foco profundo com ambiente imersivo para máxima concentração'
  },
  {
    icon: BookOpen,
    title: 'Biblioteca de Leitura',
    description: 'Organize e acompanhe seu progresso de leitura'
  },
  {
    icon: Headphones,
    title: 'Sons Imersivos',
    description: 'Playlists curadas para diferentes tipos de trabalho'
  },
  {
    icon: Award,
    title: 'Sistema de Conquistas',
    description: 'Desbloqueie badges e conquistas conforme evolui'
  }
];

const alternativeFeatures = [
  {
    title: 'Gamificação Avançada',
    description: 'Sistema de níveis, XP e conquistas que tornam a produtividade divertida'
  },
  {
    title: 'Foco Profundo',
    description: 'Modo caverna com ambiente imersivo para máxima concentração'
  },
  {
    title: 'Insights Inteligentes',
    description: 'Analytics detalhados sobre seus padrões de produtividade'
  },
  {
    title: 'Integração Completa',
    description: 'Sincronização automática com suas ferramentas favoritas'
  }
];
