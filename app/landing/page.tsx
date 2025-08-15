'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  Users, 
  Star, 
  ArrowRight, 
  Play,
  Trophy,
  Target,
  Brain,
  Rocket,
  Sparkles,
  Award,
  Clock,
  BarChart3,
  Shield,
  Heart,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Eye,
  Timer,
  CheckSquare,
  TrendingDown,
  Calendar,
  Activity,
  Crown,
  Check,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function LandingPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState<number | null>(null);
  const [demoTimeElapsed, setDemoTimeElapsed] = useState(0);
  const [showConvictionSection, setShowConvictionSection] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoTaskCompleted, setDemoTaskCompleted] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [demoTimeReduced, setDemoTimeReduced] = useState(false);
  const [congratulationsSkipped, setCongratulationsSkipped] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const section = Math.floor(scrollY / windowHeight);
      setCurrentSection(section);
      
      if (scrollY > 100) {
        setShowScrollIndicator(false);
      }

      // Efeito de scroll para navbar
      if (scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitoramento do tempo na demonstração
  useEffect(() => {
    if (showDemo && demoStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - demoStartTime) / 1000);
        setDemoTimeElapsed(elapsed);
        setDemoProgress(Math.min((elapsed / 60) * 100, 100));

        // Redirecionar após 60 segundos
        if (elapsed >= 60) {
          setShowConvictionSection(true);
          setShowDemo(false);
          playSound();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showDemo, demoStartTime]);

  const playSound = () => {
    // Efeito sonoro sutil
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignora erros se o arquivo não existir
  };

  const startDemo = () => {
    setShowDemo(true);
    setDemoStartTime(Date.now());
    setDemoTimeElapsed(0);
    setDemoProgress(0);
    setShowConvictionSection(false);
    setDemoTaskCompleted(false);
    setShowCompletedTasks(false);
    setShowCongratulations(false);
    setDemoTimeReduced(false);
    playSound();
  };

  const closeDemo = () => {
    setShowDemo(false);
    setDemoStartTime(null);
    setDemoTimeElapsed(0);
    setDemoProgress(0);
    setDemoTaskCompleted(false);
    setShowCompletedTasks(false);
    setShowCongratulations(false);
    setDemoTimeReduced(false);
    setCongratulationsSkipped(false);
  };

  const completeDemoTask = () => {
    setDemoTaskCompleted(true);
    setShowCompletedTasks(true);
    setShowCongratulations(true);
    setDemoTimeReduced(true);
    
    // Acelerar o tempo de demonstração - adicionar 30 segundos ao tempo decorrido
    if (demoStartTime) {
      const acceleratedTime = demoTimeElapsed + 30;
      const newStartTime = Date.now() - (acceleratedTime * 1000);
      setDemoStartTime(newStartTime);
    }
    
    // Tocar som de conquista
    try {
      const audio = new Audio('/sounds/click.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Erro ao tocar som:', error);
    }
  };

  const skipToExclusiveFeatures = () => {
    setCongratulationsSkipped(true);
    setShowCongratulations(false);
    setShowDemo(false);
    setShowConvictionSection(true);
    playSound();
  };

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Produtividade Inteligente",
      description: "IA que aprende seus padrões e otimiza seu fluxo de trabalho"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Sistema de Conquistas",
      description: "Gamificação avançada para manter você motivado"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Detalhados",
      description: "Insights profundos sobre sua produtividade"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Desenvolvedora Senior",
      content: "O Pomodoro Focus e Planejador de Projetos transformaram minha produtividade. Nunca fui tão eficiente!",
      rating: 5,
      improvement: 280,
      metric: "Produtividade"
    },
    {
      name: "João Santos",
      role: "Empreendedor",
      content: "O Cave Mode e Habit Tracker me ajudaram a construir rotinas duradouras e focar no que realmente importa.",
      rating: 5,
      improvement: 320,
      metric: "Motivação"
    },
    {
      name: "Ana Costa",
      role: "Estudante",
      content: "A Biblioteca de Leitura e analytics detalhados me ajudaram a organizar meus estudos perfeitamente.",
      rating: 5,
      improvement: 250,
      metric: "Organização"
    }
  ];

  const exclusiveFeatures = [
    {
      icon: <Timer className="h-6 w-6" />,
      title: "Pomodoro Focus",
      description: "Técnica Pomodoro avançada com analytics e personalização",
      locked: true
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Planejador de Projetos",
      description: "Gerencie projetos complexos com timeline e dependências",
      locked: true
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Cave Mode",
      description: "Conteúdos exclusivos e modo foco extremo",
      locked: true
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Biblioteca de Leitura",
      description: "Organize e acompanhe seu progresso de leitura",
      locked: true
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Habit Tracker",
      description: "Construa hábitos duradouros com tracking avançado",
      locked: true
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Profundos",
      description: "Insights detalhados sobre seus padrões de produtividade",
      locked: true
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Aumente sua produtividade em 300%",
      description: "Usuários relatam triplicar sua eficiência em apenas 2 semanas"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Economize 2 horas por dia",
      description: "Automação inteligente que elimina tarefas repetitivas"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Alcance 95% dos seus objetivos",
      description: "Sistema de gamificação que mantém você focado e motivado"
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Reduza o estresse em 60%",
      description: "Organização automática que elimina a sobrecarga mental"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects com Spotlight */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-purple-900/10"></div>
        
        {/* Spotlight Effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/15 via-purple-500/8 to-transparent rounded-full blur-3xl animate-spotlight"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400/40 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-float-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-float-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/6 right-1/6 w-0.5 h-0.5 bg-yellow-400/40 rounded-full animate-float-slow-reverse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-1 h-1 bg-cyan-400/30 rounded-full animate-float-slow-reverse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-0.5 h-0.5 bg-emerald-400/40 rounded-full animate-float-slow" style={{ animationDelay: '5s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b shadow-2xl transition-all duration-500 ${
          scrolled 
            ? 'bg-black/80 border-white/20 shadow-black/40' 
            : 'bg-black/40 border-white/10 shadow-black/20'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Efeito de partículas sutil */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Linha de destaque sutil */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <motion.div 
                className="p-2.5 bg-white/10 rounded-xl border border-white/20 group-hover:bg-white/20 group-hover:border-white/40 group-hover:shadow-lg group-hover:shadow-white/10 transition-all duration-300 relative overflow-hidden"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Rocket className="h-6 w-6 text-white group-hover:text-purple-300 transition-colors duration-300 relative z-10" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                TaskFlow Notch
              </motion.span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <Link href="/auth/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    className="text-white hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/40 rounded-xl px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 text-white">Entrar</span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 rounded-xl px-6 py-2 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 backdrop-blur-sm relative overflow-hidden group"
                    onClick={playSound}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="flex items-center relative z-10 text-white">
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - ATTENTION */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge com animação */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="bg-white/10 text-white border-white/20 mb-4 hover:border-purple-500/40 transition-all duration-300">
                <Sparkles className="h-3 w-3 mr-1" />
                Revolução na Produtividade
              </Badge>
            </motion.div>
            
            {/* Título Principal com Animações */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <motion.span 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Transforme
                </motion.span>
                <br />
                <motion.span 
                  className="text-white"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  sua produtividade
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                >
                  hoje mesmo
                </motion.span>
              </h1>
              
              {/* Subtítulo Persuasivo */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                A plataforma mais avançada de gestão de tarefas com 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> IA inteligente</span>, 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> gamificação</span> e 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> analytics detalhados</span>.
              </motion.p>
            </motion.div>
            
            {/* Estatísticas Persuasivas */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              <motion.div 
                className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                >
                  50K+
                </motion.div>
                <div className="text-xs text-gray-400">Usuários ativos</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                >
                  300%
                </motion.div>
                <div className="text-xs text-gray-400">Aumento na produtividade</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 2.0 }}
                >
                  4.9★
                </motion.div>
                <div className="text-xs text-gray-400">Avaliação média</div>
              </motion.div>
            </motion.div>
            
                        {/* Botões de Ação */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/auth/signup">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 text-white font-semibold transition-all duration-300"
                    onClick={playSound}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-purple-500/50 text-white hover:bg-purple-500/20 hover:text-white text-lg px-8 py-4 transition-all duration-300"
                  onClick={startDemo}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Benefícios Rápidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400"
            >
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-white mr-2" />
                <span>Sem cartão de crédito</span>
              </motion.div>
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-white mr-2" />
                <span>Setup em 30 segundos</span>
              </motion.div>
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="h-4 w-4 text-white mr-2" />
                <span>Suporte 24/7</span>
              </motion.div>
            </motion.div>
            
            {/* Call-to-Action Secundário */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm max-w-xl mx-auto"
            >
              <p className="text-sm text-gray-300">
                Junte-se a milhares de produtores de alto desempenho. Comece gratuitamente hoje.
              </p>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator Melhorado */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-purple-400 cursor-pointer hover:text-purple-300 transition-colors duration-300"
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                  });
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium">Descubra mais</span>
                  <ChevronDown className="h-6 w-6 animate-bounce" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Timer e Progress Bar */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <Timer className="h-4 w-4" />
                    <span>Tempo na demonstração: {demoTimeElapsed}s</span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${demoProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {/* Porcentagem de carregamento abaixo da barra */}
                <div className="flex justify-center">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
                    {Math.floor(demoProgress)}%
                  </Badge>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeDemo}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Demo Content */}
              <div className="mt-16 space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Demonstração Interativa
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Explore as funcionalidades do TaskFlow Notch. Após 60 segundos, você verá recursos exclusivos disponíveis apenas para usuários cadastrados.
                  </p>
                </div>

                {/* Interactive Demo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tarefa de Exemplo */}
                  <div className="bg-black/50 border border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <CheckSquare className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold">Tarefa de Exemplo</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-gray-300 text-sm mb-2">Clique no ícone para completar a tarefa:</p>
                        <div 
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                            demoTaskCompleted 
                              ? 'bg-green-500/20 border border-green-500/30' 
                              : 'bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600/50 hover:border-purple-500/50'
                          }`}
                          onClick={completeDemoTask}
                        >
                          <div className={`p-2 rounded-lg ${
                            demoTaskCompleted 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          }`}>
                            {demoTaskCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <CheckSquare className="h-5 w-5" />
                            )}
                          </div>
                          <span className={`text-sm ${
                            demoTaskCompleted ? 'text-green-300 line-through' : 'text-gray-300'
                          }`}>
                            Organizar meu quarto
                          </span>
                        </div>
                      </div>
                      {demoTaskCompleted && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-green-400 text-sm font-semibold">
                            ✓ Tarefa concluída! +10 XP
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="bg-black/50 border border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold">Progresso</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Nível 3</span>
                        <span>{demoTaskCompleted ? '85%' : '75%'}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: demoTaskCompleted ? '85%' : '75%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {demoTaskCompleted ? '100 XP para o próximo nível' : '150 XP para o próximo nível'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tarefas Concluídas */}
                {showCompletedTasks && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 border border-green-500/20 rounded-xl p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-300">Tarefas Concluídas</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-300 line-through">Organizar meu quarto</span>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs hover:border-green-400/80 hover:shadow-lg hover:shadow-green-500/30 hover:bg-green-500/30 transition-all duration-300">
                          +10 XP
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mensagem de Parabéns */}
                <AnimatePresence>
                  {showCongratulations && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center"
                    >
                      <div className="flex items-center justify-center space-x-3 mb-3">
                        <Trophy className="h-8 w-8 text-green-400" />
                        <h3 className="text-xl font-bold text-green-300">Parabéns!</h3>
                      </div>
                      <p className="text-green-200 mb-3">
                        Você concluiu sua primeira tarefa! 🎉
                      </p>
                      <p className="text-sm text-green-300/80 mb-4">
                        Tempo de demonstração acelerado em 30 segundos como recompensa!
                      </p>
                      <Button 
                        onClick={skipToExclusiveFeatures}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Ver Recursos Desbloqueados
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Motivational Message */}
                <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                  <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-purple-300 mb-2">
                    Continue explorando!
                  </p>
                  <p className="text-gray-300">
                    Em alguns segundos você descobrirá recursos exclusivos que transformarão sua produtividade.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conviction Section */}
      <AnimatePresence>
        {showConvictionSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-black/95 border border-purple-500/30 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowConvictionSection(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-12">
                {/* Header */}
                <div className="text-center">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
                    <Eye className="h-3 w-3 mr-1" />
                    Recursos Exclusivos Desbloqueados
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Você está perdendo
                    </span>
                    <br />
                    <span className="text-white">oportunidades incríveis!</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Descubra os recursos premium que estão esperando por você. 
                    <span className="text-purple-400 font-semibold"> Cadastre-se agora e desbloqueie todo o potencial!</span>
                  </p>
                </div>

                {/* Benefits Section */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Benefícios Reais e Objetivos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-black/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-2 text-purple-300">
                              {benefit.title}
                            </h4>
                            <p className="text-gray-300">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Exclusive Features */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    Recursos Exclusivos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exclusiveFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-black/50 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden group"
                      >
                        {/* Lock Overlay */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-center">
                            <Lock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                            <p className="text-purple-300 font-semibold">Cadastre-se para desbloquear</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-purple-500/20 rounded-lg">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-2 text-purple-300">
                              {feature.title}
                            </h4>
                            <p className="text-gray-300">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Social Proof */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    O que nossos usuários dizem
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-black/50 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300"
                      >
                        {/* Gráfico de melhoria no modal */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-purple-300 font-medium">{testimonial.metric}</span>
                            <span className="text-xs text-green-400 font-bold">+{testimonial.improvement}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(testimonial.improvement / 4, 100)}%` }}
                              transition={{ duration: 1.5, delay: index * 0.2 }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                        <div>
                          <p className="font-semibold text-white">{testimonial.name}</p>
                          <p className="text-sm text-purple-400">{testimonial.role}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                    <Award className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                      Oportunidade Limitada!
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Cadastre-se agora e receba acesso gratuito por 30 dias a todos os recursos premium.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link href="/auth/signup">
                        <Button 
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 text-white"
                          onClick={playSound}
                        >
                          <Rocket className="mr-2 h-5 w-5" />
                          Desbloquear Agora - Grátis
                          <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <p className="text-sm text-gray-400">
                        Não requer cartão de crédito • Cancelamento a qualquer momento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Section - INTEREST */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
              <Target className="h-3 w-3 mr-1" />
              Recursos Exclusivos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Por que escolher o <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">TaskFlow Notch</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubra as funcionalidades que fazem nossa plataforma ser única no mercado
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                  <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4 group-hover:bg-purple-500/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plano Executor Features Section */}
      <section className="relative py-16 bg-gradient-to-b from-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-white/10 text-white border-white/20 mb-4 hover:border-purple-500/40 transition-all duration-300">
              <Crown className="h-3 w-3 mr-1" />
              Plano Executor
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Funcionalidades <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Premium</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Desbloqueie todo o potencial da sua produtividade com recursos exclusivos
            </p>
            
            {/* Destaque do Novo Preço */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white font-medium mb-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-base">R$ 24,90 no 1º mês</span>
              <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                50% OFF
              </Badge>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Timer className="h-6 w-6" />,
                title: "Pomodoro Focus",
                description: "Técnica Pomodoro avançada com analytics detalhados, personalização de intervalos e tracking de produtividade por sessão."
              },
              {
                icon: <Target className="h-6 w-6" />,
                title: "Planejador de Projetos",
                description: "Gerencie projetos complexos com timeline visual, dependências entre tarefas e milestones automáticos."
              },
              {
                icon: <Eye className="h-6 w-6" />,
                title: "Cave Mode",
                description: "Modo foco extremo com conteúdos exclusivos, bloqueio de distrações e ambiente imersivo para máxima produtividade."
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Biblioteca de Leitura",
                description: "Organize sua biblioteca pessoal, acompanhe progresso de leitura e gerencie suas anotações em um só lugar."
              },
              {
                icon: <Activity className="h-6 w-6" />,
                title: "Habit Tracker",
                description: "Construa hábitos duradouros com tracking avançado, streaks, recompensas e insights sobre seus padrões."
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Analytics Profundos",
                description: "Insights detalhados sobre produtividade, padrões de trabalho e otimizações personalizadas baseadas em IA."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group relative"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/30 hover:bg-white/10 transition-all duration-300 group-hover:scale-[1.02] animate-card-float">
                  <motion.div 
                    className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-purple-500/20 transition-all duration-300 animate-icon-pulse"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <motion.div 
                    className="mt-4 pt-3 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Exclusivo Executor
                    </Badge>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparação de Preços */}
      <section className="relative py-16 bg-gradient-to-b from-yellow-500/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Economia <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Real</span>
            </h3>
            <p className="text-gray-300">
              Veja quanto você economiza com nossos novos preços
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-md border border-gray-500/20 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-gray-400 mb-2">R$ 129,90</div>
              <div className="text-sm text-gray-500 mb-4">Preço Anterior</div>
              <div className="text-xs text-gray-600">Mensal</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 text-center relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-3 py-1 text-xs">
                  NOVO PREÇO
                </Badge>
              </div>
              <div className="text-4xl font-bold text-green-400 mb-2">R$ 49,90</div>
              <div className="text-sm text-green-300 mb-4">Preço Atual</div>
              <div className="text-xs text-green-400">Mensal</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-purple-400 mb-2">R$ 80,00</div>
              <div className="text-sm text-purple-300 mb-4">Você Economiza</div>
              <div className="text-xs text-purple-400">Por mês</div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-purple-300 font-semibold">
              <TrendingDown className="h-5 w-5 mr-2 text-purple-400" />
              <span className="text-lg">62% de economia no primeiro ano!</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section - DESIRE */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
              <Heart className="h-3 w-3 mr-1" />
              Depoimentos Reais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que nossos usuários <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">dizem</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
                  {/* Gráfico de melhoria */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-purple-300 font-medium">{testimonial.metric}</span>
                      <span className="text-xs text-green-400 font-bold">+{testimonial.improvement}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(testimonial.improvement / 4, 100)}%` }}
                        transition={{ duration: 1.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-purple-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
              <Crown className="h-3 w-3 mr-1" />
              Planos e Preços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Escolha o plano ideal para <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">você</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comece gratuitamente e evolua conforme suas necessidades crescem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Gratuito */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-black/40 backdrop-blur-md border border-gray-500/20 rounded-2xl p-8 hover:border-gray-500/40 transition-all duration-300 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/20 rounded-full mb-4">
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Gratuito</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">R$ 0</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-300 text-sm">Para começar sua jornada</p>
                </div>
                
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Até Level 3</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Sistema de tarefas básico</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Calendário e heatmap</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Conquistas básicas</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span className="text-gray-500">Mini-games premium</span>
                    </li>
                  </ul>
                </div>
                
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Plano Aspirante */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">Mais Popular</Badge>
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Aspirante</h3>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-purple-400">R$ 9,90</span>
                    <span className="text-gray-400 text-sm">/1º mês</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">R$ 24,90</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-300 text-sm">Para usuários dedicados</p>
                </div>
                
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Até Level 10</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Mini-games desbloqueados</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Gráficos avançados</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Recursos extras de produtividade</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Suporte prioritário</span>
                    </li>
                  </ul>
                </div>
                
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    Escolher Aspirante
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Plano Executor */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8 hover:border-yellow-500/50 transition-all duration-300 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
                    <Crown className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Executor</h3>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-yellow-400">R$ 24,90</span>
                    <span className="text-gray-400 text-sm">/1º mês</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">R$ 49,90</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-gray-300 text-sm">Para máxima produtividade</p>
                </div>
                
                <div className="flex-1 mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Níveis ilimitados</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">XP extra por tarefa (1.5x)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Pomodoro Focus</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Planejador de Projetos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Cave Mode</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Biblioteca de Leitura</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Habit Tracker</span>
                    </li>
                  </ul>
                </div>
                
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold">
                    <Crown className="h-4 w-4 mr-2" />
                    Escolher Executor
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section - Melhorada com Animações */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
                <Shield className="h-3 w-3 mr-1" />
                Suporte e Garantias
              </Badge>
              <h3 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Tire suas dúvidas sobre nossa plataforma e planos
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {[
                {
                  question: "Posso cancelar a qualquer momento?",
                  answer: "Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais ou penalidades.",
                  icon: <X className="h-5 w-5" />
                },
                {
                  question: "Há garantia de reembolso?",
                  answer: "Oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos 100% do seu dinheiro.",
                  icon: <Shield className="h-5 w-5" />
                },
                {
                  question: "O que acontece se eu mudar de plano?",
                  answer: "Você pode fazer upgrade ou downgrade a qualquer momento. Os valores são ajustados proporcionalmente.",
                  icon: <TrendingUp className="h-5 w-5" />
                },
                {
                  question: "Os dados ficam seguros?",
                  answer: "Sim! Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança da indústria.",
                  icon: <Lock className="h-5 w-5" />
                },
                {
                  question: "Posso usar em múltiplos dispositivos?",
                  answer: "Sim! Sua conta funciona em Desktop e Tablet.",
                  icon: <Users className="h-5 w-5" />
                },
                {
                  question: "Há limite de tarefas?",
                  answer: "Não! Com o plano Executor você pode criar quantas tarefas quiser, sem limites.",
                  icon: <CheckSquare className="h-5 w-5" />
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-black/50 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-all duration-300">
                        {faq.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                          {faq.question}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - ACTION */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 hover:bg-purple-500/30 transition-all duration-300">
              <Award className="h-3 w-3 mr-1" />
              Oportunidade Limitada
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">transformar</span> sua produtividade?
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já aumentaram sua produtividade em 300%. 
              Comece gratuitamente hoje mesmo!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 text-white"
                  onClick={playSound}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Começar Agora - Grátis
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <p className="text-sm text-gray-400">
                Não requer cartão de crédito • Setup em 30 segundos
              </p>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                Criptografia de ponta
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-green-400 mr-2" />
                Suporte 24/7
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                Atualizações gratuitas
              </div>
            </div>
            
            {/* Urgência */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-center justify-center gap-2 text-red-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Oferta por tempo limitado - Preços especiais de lançamento!</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Rocket className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TaskFlow Notch
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                Privacidade
              </Link>
              <Link href="/terms" className="hover:text-purple-400 transition-colors">
                Termos
              </Link>
              <Link href="/support" className="hover:text-purple-400 transition-colors">
                Suporte
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-purple-500/10 text-center text-sm text-gray-500">
            <p>&copy; 2024 TaskFlow Notch. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 