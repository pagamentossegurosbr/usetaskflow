'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Brain,
  BarChart3,
  Lightbulb,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Coffee,
  Rocket,
  Heart,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Timer,
  Trophy,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface InviteLink {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  campaign: string | null;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const [link, setLink] = useState<InviteLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingLeadId, setTrackingLeadId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const code = params.code as string;

  useEffect(() => {
    if (code) {
      trackLinkClick();
    }
  }, [code]);

  const trackLinkClick = async () => {
    try {
      const response = await fetch('/api/track/link-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkCode: code,
          referrer: document.referrer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingLeadId(data.leadId);
        
        // Buscar informações do link
        const linkResponse = await fetch(`/api/admin/invite-links?code=${code}`);
        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          if (linkData.links && linkData.links.length > 0) {
            setLink(linkData.links[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Registrar atividade de interesse
    if (trackingLeadId) {
      fetch('/api/track/lead-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: trackingLeadId,
          type: 'click',
          action: 'Clicou em "Começar Agora"',
          details: {
            linkCode: code,
            linkName: link?.name,
          },
        }),
      });
    }

    // Redirecionar para cadastro com parâmetros UTM
    const utmParams = new URLSearchParams({
      utm_source: 'invite_link',
      utm_medium: link?.type.toLowerCase() || 'general',
      utm_campaign: link?.campaign || 'invite',
      invite_code: code,
    });

    router.push(`/auth/signup?${utmParams.toString()}`);
  };

  const faqData = [
    {
      question: "O TaskFlow Notch é realmente gratuito?",
      answer: "Sim! Oferecemos uma versão gratuita completa com todas as funcionalidades essenciais. Você pode começar a usar imediatamente sem cartão de crédito."
    },
    {
      question: "Posso usar em múltiplos dispositivos?",
      answer: "Absolutamente! O TaskFlow Notch funciona perfeitamente em desktop, tablet e smartphone. Suas tarefas sincronizam automaticamente entre todos os dispositivos."
    },
    {
      question: "Como funciona o sistema de monetização?",
      answer: "Você pode ganhar dinheiro recomendando o TaskFlow para outros usuários. Cada pessoa que se cadastrar através do seu link de convite gera uma comissão para você."
    },
    {
      question: "Posso cancelar minha conta a qualquer momento?",
      answer: "Sim! Você tem total controle sobre sua conta. Pode cancelar a qualquer momento sem taxas ou complicações."
    },
    {
      question: "Os dados são seguros?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger seus dados."
    }
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Designer UX/UI",
      avatar: "👩‍🎨",
      content: "O TaskFlow transformou completamente minha produtividade. Agora consigo focar no que realmente importa e entregar projetos no prazo!",
      rating: 5
    },
    {
      name: "Carlos Mendes",
      role: "Desenvolvedor Full-Stack",
      avatar: "👨‍💻",
      content: "A interface é incrível e as funcionalidades são exatamente o que eu precisava. Recomendo para todos os meus colegas!",
      rating: 5
    },
    {
      name: "Mariana Costa",
      role: "Empreendedora",
      avatar: "👩‍💼",
      content: "Comecei a usar o TaskFlow e já ganhei mais de R$ 2.000 recomendando para outros empreendedores. É uma ferramenta essencial!",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white/80">Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-red-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Link Inválido</CardTitle>
            <CardDescription className="text-white/70">
              Este link de convite não foi encontrado ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!link.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-orange-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-orange-400">Link Inativo</CardTitle>
            <CardDescription className="text-white/70">
              Este link de convite está temporariamente inativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-red-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Link Expirado</CardTitle>
            <CardDescription className="text-white/70">
              Este link de convite expirou em {new Date(link.expiresAt).toLocaleDateString()}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (link.maxUses && link.currentUses >= link.maxUses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-red-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Limite Atingido</CardTitle>
            <CardDescription className="text-white/70">
              Este link de convite atingiu o limite máximo de usos.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header - ATTENTION */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-6">
                <Sparkles className="h-3 w-3 mr-1" />
                Convite Exclusivo
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Transforme sua
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Produtividade</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                {link.description || 'Junte-se a milhares de usuários que já revolucionaram sua forma de trabalhar com o TaskFlow Notch'}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                  {link.type}
                </Badge>
                {link.campaign && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                    {link.campaign}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats - INTEREST */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 text-center p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">50k+</div>
                <div className="text-white/70">Usuários Ativos</div>
              </Card>
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20 text-center p-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
                <div className="text-white/70">Taxa de Satisfação</div>
              </Card>
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20 text-center p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">5x</div>
                <div className="text-white/70">Mais Produtividade</div>
              </Card>
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-orange-500/20 text-center p-6">
                <div className="text-3xl font-bold text-orange-400 mb-2">R$ 2M+</div>
                <div className="text-white/70">Ganhos dos Usuários</div>
              </Card>
            </div>

            {/* Features - DESIRE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 p-8 text-center hover:border-purple-500/40 transition-all duration-300">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Foco Inteligente</h3>
                <p className="text-white/70">
                  Algoritmos avançados que identificam suas tarefas mais importantes e eliminam distrações automaticamente
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-blue-500/20 p-8 text-center hover:border-blue-500/40 transition-all duration-300">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Ganhe Dinheiro</h3>
                <p className="text-white/70">
                  Recomende o TaskFlow e ganhe comissões por cada pessoa que se cadastrar através do seu link
                </p>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20 p-8 text-center hover:border-green-500/40 transition-all duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Resultados Rápidos</h3>
                <p className="text-white/70">
                  Veja resultados em apenas 7 dias. Usuários relatam aumento de 300% na produtividade
                </p>
              </Card>
            </div>

            {/* Demo Section */}
            <div className="mb-16">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Veja o TaskFlow em Ação</h2>
                  <p className="text-white/70 mb-6">Descubra como nossa plataforma pode transformar sua produtividade</p>
                  <Button 
                    onClick={() => setShowDemo(!showDemo)}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {showDemo ? 'Ocultar Demo' : 'Ver Demo'}
                  </Button>
                </div>
                
                {showDemo && (
                  <div className="bg-black/50 rounded-lg p-6 border border-purple-500/30">
                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                        <p className="text-white/70">Demo Interativo do TaskFlow</p>
                        <p className="text-white/50 text-sm">Interface moderna e intuitiva</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Testimonials */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">O que nossos usuários dizem</h2>
                <p className="text-white/70">Milhares de pessoas já transformaram sua produtividade</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{testimonial.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                        <p className="text-white/60 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-white/80 mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Monetization Section */}
            <div className="mb-16">
              <Card className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-green-500/20 p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="h-10 w-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Ganhe Dinheiro Recomendando</h2>
                  <p className="text-white/70 mb-6">Transforme sua rede em uma fonte de renda extra</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">R$ 50</div>
                    <p className="text-white/70">Por cada cadastro</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">R$ 2.000+</div>
                    <p className="text-white/70">Ganhos médios mensais</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">24h</div>
                    <p className="text-white/70">Para receber pagamento</p>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-lg p-6 border border-green-500/20">
                  <h3 className="text-xl font-semibold text-white mb-4">Como funciona:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-400 font-bold">1</span>
                      </div>
                      <span className="text-white/80">Crie sua conta gratuita</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-400 font-bold">2</span>
                      </div>
                      <span className="text-white/80">Compartilhe seu link de convite</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-400 font-bold">3</span>
                      </div>
                      <span className="text-white/80">Ganhe R$ 50 por cada pessoa que se cadastrar</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h2>
                <p className="text-white/70">Tire suas dúvidas sobre o TaskFlow Notch</p>
              </div>
              
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <Card key={index} className="bg-gradient-to-br from-slate-900/50 via-slate-800/40 to-slate-900/50 backdrop-blur-xl border border-purple-500/20">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-purple-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-400" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-white/70">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA - ACTION */}
            <Card className="bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-blue-600/20 backdrop-blur-xl border border-purple-500/30 text-center p-12 mb-16">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-white mb-6">
                  Pronto para transformar sua produtividade?
                </CardTitle>
                <CardDescription className="text-purple-200 text-xl">
                  Junte-se a milhares de usuários que já revolucionaram sua forma de trabalhar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-12 py-4 text-xl font-semibold"
                  onClick={handleGetStarted}
                >
                  Começar Agora - É Grátis!
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <div className="flex items-center justify-center gap-6 mt-6 text-purple-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Conta gratuita</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Cancelamento a qualquer momento</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-white/50">
              <p className="text-sm">
                Convite válido até {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'indefinidamente'}
                {link.maxUses && (
                  <span> • {link.maxUses - link.currentUses} convites restantes</span>
                )}
              </p>
              <p className="text-xs mt-2">
                © 2024 TaskFlow Notch. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
