'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Coins, 
  Target, 
  Zap, 
  Star, 
  Trophy, 
  X,
  Timer,
  Coffee,
  Brain,
  Heart,
  MousePointer,
  Keyboard
} from 'lucide-react';
import { toast } from 'sonner';
import { playGameCoinSound, playClickSound, playNotificationSound, playErrorSound } from '@/lib/sounds';

interface MiniGameProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnXP: (xp: number) => void;
  currentLevel: number;
  dailyPlayTime: number;
  maxDailyPlayTime: number;
}

interface GameState {
  coins: number;
  totalCoins: number;
  focusTime: number;
  isPlaying: boolean;
  multiplier: number;
  upgrades: {
    autoClicker: number;
    coinMultiplier: number;
    timeBonus: number;
  };
  achievements: string[];
}

const UPGRADES = {
  autoClicker: { name: 'Auto Clicker', cost: 10, effect: 'Gera 1 moeda/seg', icon: Zap },
  coinMultiplier: { name: 'Multiplicador', cost: 25, effect: '+50% moedas', icon: Star },
  timeBonus: { name: 'Bônus de Tempo', cost: 15, effect: '+30s por sessão', icon: Clock }
};

const ACHIEVEMENTS = [
  { id: 'first_coin', name: 'Primeira Moeda', description: 'Ganhe sua primeira moeda', requirement: 1 },
  { id: 'coin_collector', name: 'Colecionador', description: 'Acumule 50 moedas', requirement: 50 },
  { id: 'rich_player', name: 'Jogador Rico', description: 'Acumule 200 moedas', requirement: 200 },
  { id: 'focus_master', name: 'Mestre do Foco', description: 'Complete 10 sessões', requirement: 10 },
  { id: 'speed_clicker', name: 'Clicker Rápido', description: 'Clique 100 vezes', requirement: 100 }
];

const MOTIVATIONAL_PHRASES = [
  "Cada clique é um passo para o sucesso! 🚀",
  "Foco + Persistência = Resultados Incríveis! 💪",
  "Você está construindo seu futuro, um clique de cada vez! ✨",
  "A disciplina de hoje é o sucesso de amanhã! 🎯",
  "Mantenha o foco, os resultados virão! 🌟",
  "Cada segundo focado te aproxima dos seus objetivos! 🎉",
  "Você é mais forte do que pensa! 💎",
  "A consistência é a chave do sucesso! 🔑",
  "Seu futuro eu agradece por cada esforço! 🙏",
  "Transforme cada clique em progresso! 📈"
];

export function MiniGame({ 
  isOpen, 
  onClose, 
  onEarnXP, 
  currentLevel, 
  dailyPlayTime, 
  maxDailyPlayTime 
}: MiniGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    totalCoins: 0,
    focusTime: 0,
    isPlaying: false,
    multiplier: 1,
    upgrades: {
      autoClicker: 0,
      coinMultiplier: 0,
      timeBonus: 0
    },
    achievements: []
  });

  const [sessionTime, setSessionTime] = useState(0);
  const [sessionDuration] = useState(30); // 30 segundos por sessão
  const [clickCount, setClickCount] = useState(0);
  const [showMotivational, setShowMotivational] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  // Verificar se o jogo está desbloqueado (Level 3+)
  const isUnlocked = currentLevel >= 3;

  // Verificar se ainda há tempo disponível
  const hasTimeLeft = dailyPlayTime < maxDailyPlayTime;

  // Carregar estado do jogo do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minigame-state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGameState(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Erro ao carregar estado do jogo:', error);
        }
      }
    }
  }, []);

  // Salvar estado do jogo no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minigame-state', JSON.stringify(gameState));
    }
  }, [gameState]);

  // Auto clicker effect
  useEffect(() => {
    if (!gameState.isPlaying || !hasTimeLeft) return;

    const interval = setInterval(() => {
      if (gameState.upgrades.autoClicker > 0) {
        const autoCoins = gameState.upgrades.autoClicker * gameState.multiplier;
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + autoCoins,
          totalCoins: prev.totalCoins + autoCoins
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.upgrades.autoClicker, gameState.multiplier, hasTimeLeft]);

  // Timer da sessão
  useEffect(() => {
    if (!gameState.isPlaying || !hasTimeLeft) return;

    const interval = setInterval(() => {
      setSessionTime(prev => {
        if (prev >= sessionDuration) {
          // Sessão completa
          completeSession();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, sessionDuration, hasTimeLeft]);

  // Event listener para tecla espaço
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && gameState.isPlaying && hasTimeLeft) {
        event.preventDefault(); // Prevenir scroll da página
        handleClick();
        
        // Efeito visual de pressionar
        setIsButtonPressed(true);
        setTimeout(() => setIsButtonPressed(false), 100);
      }
    };

    if (gameState.isPlaying) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState.isPlaying, hasTimeLeft]);

  // Verificar conquistas
  useEffect(() => {
    const newAchievements: string[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!gameState.achievements.includes(achievement.id)) {
        let earned = false;
        
        switch (achievement.id) {
          case 'first_coin':
            earned = gameState.totalCoins >= 1;
            break;
          case 'coin_collector':
            earned = gameState.totalCoins >= 50;
            break;
          case 'rich_player':
            earned = gameState.totalCoins >= 200;
            break;
          case 'focus_master':
            earned = gameState.focusTime >= 10;
            break;
          case 'speed_clicker':
            earned = clickCount >= 100;
            break;
        }
        
        if (earned) {
          newAchievements.push(achievement.id);
          toast.success(`🏆 Conquista Desbloqueada: ${achievement.name}!`, {
            description: achievement.description
          });
        }
      }
    });
    
    if (newAchievements.length > 0) {
      setGameState(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
    }
  }, [gameState.totalCoins, gameState.focusTime, clickCount, gameState.achievements]);

  const handleClick = useCallback(() => {
    if (!gameState.isPlaying || !hasTimeLeft) return;

    const coinsEarned = gameState.multiplier;
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      totalCoins: prev.totalCoins + coinsEarned
    }));
    setClickCount(prev => prev + 1);
    
    // Tocar som de moeda
    playGameCoinSound();
  }, [gameState.isPlaying, gameState.multiplier, hasTimeLeft]);

  const startSession = () => {
    if (!hasTimeLeft) {
      playErrorSound();
      toast.error('Tempo de jogo diário esgotado!', {
        description: 'Volte amanhã ou suba de nível para mais tempo!'
      });
      return;
    }

    playNotificationSound();
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setSessionTime(0);
    toast.success('Sessão iniciada! Clique ou pressione ESPAÇO para ganhar moedas! 🎯', {
      description: 'Dica: Use a tecla ESPAÇO para clicar mais rapidamente!'
    });
  };

  const completeSession = () => {
    const sessionCoins = Math.floor(gameState.coins * 0.1); // 10% das moedas como XP
    const xpEarned = Math.max(1, sessionCoins); // Mínimo 1 XP
    
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      focusTime: prev.focusTime + 1
    }));
    
    playNotificationSound();
    onEarnXP(xpEarned);
    
    toast.success(`Sessão completa! +${xpEarned} XP ganho! 🎉`, {
      description: `Você ganhou ${gameState.coins} moedas nesta sessão!`
    });
  };

  const buyUpgrade = (upgradeType: keyof typeof gameState.upgrades) => {
    const upgrade = UPGRADES[upgradeType];
    const currentLevel = gameState.upgrades[upgradeType];
    const cost = upgrade.cost * (currentLevel + 1);
    
    if (gameState.coins >= cost) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeType]: prev.upgrades[upgradeType] + 1
        },
        multiplier: prev.upgrades.coinMultiplier > 0 ? 1 + (prev.upgrades.coinMultiplier * 0.5) : 1
      }));
      
      playNotificationSound();
      toast.success(`Upgrade comprado: ${upgrade.name}! 🚀`);
    } else {
      playErrorSound();
      toast.error('Moedas insuficientes! 💰', {
        description: `Você precisa de ${cost} moedas para este upgrade.`
      });
    }
  };

  const showMotivationalPhrase = () => {
    const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
    setCurrentPhrase(phrase);
    setShowMotivational(true);
  };

  const resetGame = () => {
    setGameState({
      coins: 0,
      totalCoins: 0,
      focusTime: 0,
      isPlaying: false,
      multiplier: 1,
      upgrades: {
        autoClicker: 0,
        coinMultiplier: 0,
        timeBonus: 0
      },
      achievements: []
    });
    setClickCount(0);
    playClickSound();
    toast.success('Jogo resetado! 🎮');
  };

  const remainingTime = maxDailyPlayTime - dailyPlayTime;
  const progressPercentage = (dailyPlayTime / maxDailyPlayTime) * 100;

  if (!isUnlocked) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Focus Break - Bloqueado
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold">Jogo Bloqueado</h3>
            <p className="text-muted-foreground">
              Desbloqueie este mini-game ao atingir o <strong>Level 3</strong>!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Seu nível atual: {currentLevel}</span>
            </div>
            <div className="mt-4">
              <Button onClick={onClose} className="w-full">
                Entendi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Focus Break
            <Badge variant="secondary" className="ml-auto">
              Level {currentLevel}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status do Jogo */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Moedas</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">{gameState.coins}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{gameState.totalCoins}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Timer className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Sessões</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{gameState.focusTime}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Multiplicador</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-500">x{gameState.multiplier}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tempo Restante */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tempo de Jogo Diário</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')} restante
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {hasTimeLeft ? 'Você ainda pode jogar!' : 'Tempo esgotado para hoje. Volte amanhã!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Área Principal do Jogo */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {gameState.isPlaying ? (
                  <>
                    <div className="text-4xl mb-4">🎯</div>
                    <div className="text-2xl font-bold mb-2">
                      Tempo: {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}
                    </div>
                    <Progress 
                      value={(sessionTime / sessionDuration) * 100} 
                      className="h-3 mb-4" 
                    />
                    
                    {/* Botão de Clique Melhorado */}
                    <div className="relative">
                      <Button
                        size="lg"
                        onClick={handleClick}
                        disabled={!hasTimeLeft}
                        className={`
                          w-40 h-40 rounded-full text-3xl font-bold 
                          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 
                          hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 
                          transition-all duration-200 
                          ${isButtonPressed ? 'scale-95 shadow-inner' : 'hover:scale-105 shadow-2xl'}
                          ${isButtonPressed ? 'animate-pulse' : ''}
                          border-4 border-white/20
                          relative overflow-hidden
                        `}
                        style={{
                          background: isButtonPressed 
                            ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
                        }}
                      >
                        {/* Efeito de brilho interno */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                        
                        {/* Texto do botão */}
                        <span className="relative z-10 text-white drop-shadow-lg">
                          CLIQUE!
                        </span>
                        
                        {/* Efeito de partículas quando pressionado */}
                        {isButtonPressed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full animate-ping" />
                          </div>
                        )}
                      </Button>
                      
                      {/* Indicador de tecla espaço */}
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Keyboard className="h-4 w-4" />
                        <span>ou pressione</span>
                        <Badge variant="outline" className="px-2 py-1 text-xs font-mono">
                          ESPAÇO
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Clique para ganhar moedas! {gameState.upgrades.autoClicker > 0 && `(+${gameState.upgrades.autoClicker}/s)`}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          <span>Mouse</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Keyboard className="h-3 w-3" />
                          <span>Teclado</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-xl font-semibold mb-2">Focus Break</h3>
                    <p className="text-muted-foreground mb-4">
                      Clique para ganhar moedas e melhorar seu foco! Cada sessão te dá XP.
                    </p>
                    
                    {/* Dica sobre controles */}
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-400 mb-1">
                        <Keyboard className="h-4 w-4" />
                        <span className="font-medium">Dica de Controle</span>
                      </div>
                      <p className="text-xs text-blue-300">
                        Durante o jogo, você pode usar o <strong>mouse</strong> ou pressionar <strong>ESPAÇO</strong> para clicar mais rapidamente!
                      </p>
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      <Button onClick={startSession} disabled={!hasTimeLeft}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Sessão
                      </Button>
                      <Button variant="outline" onClick={() => {
                        playClickSound();
                        showMotivationalPhrase();
                      }}>
                        <Brain className="h-4 w-4 mr-2" />
                        Frase Motivacional
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upgrades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Upgrades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(UPGRADES).map(([key, upgrade]) => {
                  const Icon = upgrade.icon;
                  const currentLevel = gameState.upgrades[key as keyof typeof gameState.upgrades];
                  const cost = upgrade.cost * (currentLevel + 1);
                  
                  return (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{upgrade.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{upgrade.effect}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Nível {currentLevel}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            playClickSound();
                            buyUpgrade(key as keyof typeof gameState.upgrades);
                          }}
                          disabled={gameState.coins < cost}
                        >
                          {cost} 🪙
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Conquistas ({gameState.achievements.length}/{ACHIEVEMENTS.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ACHIEVEMENTS.map(achievement => {
                  const earned = gameState.achievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`p-2 rounded-lg border text-sm ${
                        earned 
                          ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' 
                          : 'bg-muted/30 border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {earned ? <Trophy className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        <span className="font-medium">{achievement.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => {
              playClickSound();
              resetGame();
            }}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar Jogo
            </Button>
            <Button onClick={() => {
              playClickSound();
              onClose();
            }}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>

        {/* Modal de Frase Motivacional */}
        <Dialog open={showMotivational} onOpenChange={setShowMotivational}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Frase Motivacional
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4 py-6">
              <div className="text-4xl mb-4">💭</div>
              <p className="text-lg italic text-muted-foreground">
                "{currentPhrase}"
              </p>
              <Button onClick={() => setShowMotivational(false)}>
                Inspirador! ✨
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
} 