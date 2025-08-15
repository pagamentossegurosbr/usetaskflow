'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Play, 
  X, 
  Clock, 
  Zap, 
  Trophy,
  AlertTriangle,
  Info,
  RotateCcw,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { playClickSound, playErrorSound, playNotificationSound, playGameCoinSound } from '@/lib/sounds';

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnXP: (xp: number) => void;
  currentLevel: number;
  dailyPlayTime: number;
  maxDailyPlayTime: number;
}

interface Position {
  x: number;
  y: number;
}

interface GameState {
  snake: Position[];
  food: Position;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isPlaying: boolean;
  score: number;
  timeRemaining: number;
  gameOver: boolean;
  highScore: number;
  hasProcessedGameOver: boolean;
  hasPlayedOnce: boolean;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 150; // ms
const TIME_LIMIT = 5 * 60; // 5 minutos em segundos
const XP_PER_FOOD = 1; // Reduzido para 1 XP por maçã
const XP_COST_PER_MINUTE = 500; // Custo em XP para adicionar 1 minuto

export function SnakeGame({ 
  isOpen, 
  onClose, 
  onEarnXP, 
  currentLevel, 
  dailyPlayTime, 
  maxDailyPlayTime 
}: SnakeGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT',
    isPlaying: false,
    score: 0,
    timeRemaining: TIME_LIMIT,
    gameOver: false,
    highScore: 0,
    hasProcessedGameOver: false,
    hasPlayedOnce: false
  });

  const [showTutorial, setShowTutorial] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const timeRef = useRef<NodeJS.Timeout>();
  const hasProcessedGameOverRef = useRef(false);

  // Carregar high score do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHighScore = localStorage.getItem('snake-high-score');
      if (savedHighScore) {
        setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
      }
    }
  }, []);

  // Salvar high score no localStorage
  const saveHighScore = (score: number) => {
    if (typeof window !== 'undefined') {
      const currentHighScore = localStorage.getItem('snake-high-score');
      if (!currentHighScore || score > parseInt(currentHighScore)) {
        localStorage.setItem('snake-high-score', score.toString());
        setGameState(prev => ({ ...prev, highScore: score }));
        return true;
      }
    }
    return false;
  };

  // Gerar posição aleatória para comida
  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [gameState.snake]);

  // Verificar colisão
  const checkCollision = useCallback((head: Position): boolean => {
    // Colisão com paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Colisão com o próprio corpo
    return gameState.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  }, [gameState.snake]);

  // Mover a cobra
  const moveSnake = useCallback(() => {
    setGameState(prev => {
      const newSnake = [...prev.snake];
      const head = { ...newSnake[0] };

      // Mover a cabeça
      switch (prev.direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Verificar colisão
      if (checkCollision(head)) {
        return { ...prev, gameOver: true, isPlaying: false };
      }

      newSnake.unshift(head);

      // Verificar se comeu a comida
      if (head.x === prev.food.x && head.y === prev.food.y) {
        playGameCoinSound();
        const newScore = prev.score + 1;
        const newFood = generateFood();
        
        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore
        };
      } else {
        newSnake.pop(); // Remover a cauda se não comeu
      }

      return { ...prev, snake: newSnake };
    });
  }, [checkCollision, generateFood]);

  // Processar Game Over uma única vez
  const processGameOver = useCallback((score: number) => {
    if (hasProcessedGameOverRef.current) return;
    
    hasProcessedGameOverRef.current = true;
    const isNewHighScore = saveHighScore(score);
    const xpEarned = score * XP_PER_FOOD;
    
    // Usar setTimeout para evitar problemas de renderização
    setTimeout(() => {
      onEarnXP(xpEarned);
      toast.success('Game Over!', {
        description: `Você ganhou ${xpEarned} XP! ${isNewHighScore ? 'Novo recorde!' : ''}`,
      });
    }, 100);
  }, [onEarnXP]);

  // Iniciar jogo
  const startGame = () => {
    // Verificar se ainda há tempo
    if (gameState.timeRemaining <= 0) {
      playErrorSound();
      toast.error('Tempo esgotado!', {
        description: 'Use o botão +1 Min para adicionar mais tempo antes de jogar.',
      });
      return;
    }

    playNotificationSound();
    hasProcessedGameOverRef.current = false;
    setGameState(prev => ({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT',
      isPlaying: true,
      score: prev.hasPlayedOnce ? prev.score : 0, // Manter score se já jogou antes
      timeRemaining: prev.hasPlayedOnce ? prev.timeRemaining : TIME_LIMIT, // Só reinicia se for a primeira vez
      gameOver: false,
      highScore: prev.highScore,
      hasProcessedGameOver: false,
      hasPlayedOnce: true
    }));
  };

  // Jogar novamente após game over
  const playAgain = () => {
    // Verificar se ainda há tempo
    if (gameState.timeRemaining <= 0) {
      playErrorSound();
      toast.error('Tempo esgotado!', {
        description: 'Use o botão +1 Min para adicionar mais tempo antes de jogar.',
      });
      return;
    }

    playClickSound();
    hasProcessedGameOverRef.current = false;
    setGameState(prev => ({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT',
      isPlaying: true,
      score: prev.score, // Manter o score atual
      timeRemaining: prev.timeRemaining, // Manter o tempo atual, não reiniciar
      gameOver: false,
      highScore: prev.highScore,
      hasProcessedGameOver: false,
      hasPlayedOnce: true
    }));
  };

  // Trocar XP por mais tempo
  const exchangeXPForTime = () => {
    const currentGameXP = gameState.score * XP_PER_FOOD;
    const xpNeeded = XP_COST_PER_MINUTE;
    
    // Se o usuário não tem XP suficiente no jogo, mostrar mensagem explicativa
    if (currentGameXP < xpNeeded) {
      playErrorSound();
      toast.error('XP insuficiente no jogo!', {
        description: `Você precisa coletar pelo menos ${xpNeeded} maçãs (${xpNeeded} XP) no jogo para adicionar 1 minuto. Continue jogando para ganhar mais XP!`,
      });
      return;
    }

    playClickSound();
    
    // Deduzir XP do jogo
    const xpToDeduct = xpNeeded;
    onEarnXP(-xpToDeduct);
    
    // Adicionar tempo
    setGameState(prev => ({ 
      ...prev, 
      timeRemaining: prev.timeRemaining + 60, // Adiciona 1 minuto
      score: Math.max(0, prev.score - (xpToDeduct / XP_PER_FOOD)) // Ajustar score baseado no XP perdido
    }));
    
    toast.success('Tempo adicionado!', {
      description: `Você trocou ${xpToDeduct} XP por 1 minuto extra!`,
    });
  };

  // Controles do teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.gameOver) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          setGameState(prev => ({ ...prev, direction: 'UP' }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          setGameState(prev => ({ ...prev, direction: 'DOWN' }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          setGameState(prev => ({ ...prev, direction: 'LEFT' }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          setGameState(prev => ({ ...prev, direction: 'RIGHT' }));
          break;
        case ' ':
          event.preventDefault();
          if (gameState.gameOver) {
            playAgain();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, gameState.isPlaying, gameState.gameOver]);

  // Loop do jogo
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, moveSnake]);

  // Timer - Modificado para continuar até o tempo acabar
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && gameState.timeRemaining > 0) {
      timeRef.current = setInterval(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            // Tempo acabou - Game Over
            processGameOver(prev.score);
            return { ...prev, timeRemaining: 0, isPlaying: false, gameOver: true };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    } else {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = undefined;
      }
    }

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = undefined;
      }
    };
  }, [gameState.isPlaying, gameState.gameOver, processGameOver]);

  // Game Over - Processado uma única vez
  useEffect(() => {
    if (gameState.gameOver && !hasProcessedGameOverRef.current) {
      processGameOver(gameState.score);
    }
  }, [gameState.gameOver, gameState.score, processGameOver]);

  // Limpar timers quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = undefined;
      }
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = undefined;
      }
      hasProcessedGameOverRef.current = false;
    }
  }, [isOpen]);

  // Renderizar célula do grid com cores destacadas
  const renderCell = (x: number, y: number) => {
    const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;
    const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = gameState.food.x === x && gameState.food.y === y;

    let cellClass = 'w-3 h-3 border border-gray-300/20';
    
    if (isSnakeHead) {
      cellClass += ' bg-green-500 rounded-sm shadow-lg';
    } else if (isSnakeBody) {
      cellClass += ' bg-green-400 rounded-sm';
    } else if (isFood) {
      cellClass += ' bg-red-500 rounded-full animate-pulse shadow-lg';
    } else {
      cellClass += ' bg-gray-100/10';
    }

    return <div key={`${x}-${y}`} className={cellClass} />;
  };

  // Renderizar grid
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push(renderCell(x, y));
      }
      grid.push(
        <div key={y} className="flex">
          {row}
        </div>
      );
    }
    return grid;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Verificar se o jogo está bloqueado
  const isGameBlocked = currentLevel < 5;

  if (isGameBlocked) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-gray-200">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-red-500" />
              Snake Game Bloqueado
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Você precisa estar no nível 5 ou superior para jogar o Snake Game.
            </DialogDescription>
          </DialogHeader>

          <div className="text-center space-y-4 py-6">
            <div className="text-6xl mb-4">🐍</div>
            <p className="text-gray-700">
              Continue completando tarefas para subir de nível e desbloquear este mini-game!
            </p>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg">
              <p className="font-semibold">Nível Atual: {currentLevel}</p>
              <p className="text-sm">Nível Necessário: 5</p>
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 hover:from-gray-600 hover:via-slate-600 hover:to-gray-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 snake-game-button gradient-button-glow"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-gray-200">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-gray-800">
            🐍 Snake Game - Nível 5
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Colete as maçãs vermelhas para ganhar XP. Tempo limitado a 5 minutos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estatísticas do Jogo */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
              <div className="text-lg font-bold text-green-700">{gameState.score}</div>
              <div className="text-xs text-green-600">Pontuação</div>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <div className="text-lg font-bold text-orange-700">{formatTime(gameState.timeRemaining)}</div>
              <div className="text-xs text-orange-600">Tempo</div>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
              <div className="text-lg font-bold text-yellow-700">{gameState.highScore}</div>
              <div className="text-xs text-yellow-600">Recorde</div>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <div className="text-lg font-bold text-blue-700">{gameState.score * XP_PER_FOOD}</div>
              <div className="text-xs text-blue-600">XP Ganho</div>
            </div>
          </div>

          {/* Barra de Tempo com Cores Quentes */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Tempo Restante</span>
              <span className="font-bold text-orange-600">{Math.round((gameState.timeRemaining / TIME_LIMIT) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(gameState.timeRemaining / TIME_LIMIT) * 100}%` }}
              />
            </div>
          </div>

          {/* Grid do Jogo */}
          <div className="flex justify-center">
            <div className="border-2 border-gray-300 rounded-lg p-2 bg-gray-50 shadow-lg">
              {renderGrid()}
            </div>
          </div>

          {/* Controles Melhorados */}
          <div className="flex justify-center gap-3">
            {!gameState.hasPlayedOnce ? (
              <Button
                onClick={startGame}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 snake-game-button gradient-button-glow"
                disabled={gameState.timeRemaining <= 0}
              >
                <Play className="h-5 w-5" />
                {gameState.timeRemaining <= 0 ? 'Tempo Esgotado' : 'Jogar'}
              </Button>
            ) : gameState.gameOver ? (
              <Button
                onClick={playAgain}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 snake-game-button gradient-button-glow"
                disabled={gameState.timeRemaining <= 0}
              >
                <Play className="h-5 w-5" />
                {gameState.timeRemaining <= 0 ? 'Tempo Esgotado' : 'Jogar Novamente'}
              </Button>
            ) : (
              <Button
                onClick={startGame}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 hover:from-gray-600 hover:via-slate-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-0 snake-game-button gradient-button-glow"
                disabled={gameState.isPlaying || gameState.timeRemaining <= 0}
              >
                <RotateCcw className="h-5 w-5" />
                Reiniciar
              </Button>
            )}
            
            {/* Botão de trocar XP sempre ativo para usuários Level 5+ */}
            <Button
              onClick={exchangeXPForTime}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-400 hover:border-orange-500 text-orange-700 hover:text-orange-800 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <Clock className="h-4 w-4" />
              +1 Min (500 XP)
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="h-4 w-4" />
              Fechar
            </Button>
          </div>

          {/* Instruções Compactas */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Como Jogar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
              <div>• Use as setas ou WASD para mover</div>
              <div>• Colete as maçãs vermelhas para crescer</div>
              <div>• Evite bater nas paredes ou no corpo</div>
              <div>• Cada maçã = 1 XP</div>
              <div>• Tempo limitado: 5 minutos</div>
              <div>• Troque 500 XP por +1 minuto extra!</div>
            </div>
          </div>

          {/* Game Over */}
          {gameState.gameOver && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-center">
              <div className="text-2xl font-bold text-red-700 mb-2">Game Over!</div>
              <div className="text-sm text-red-600">
                Pontuação final: {gameState.score} | XP ganho: {gameState.score * XP_PER_FOOD}
              </div>
              {gameState.score >= gameState.highScore && (
                <div className="text-yellow-600 text-sm mt-1 font-semibold">✨ Novo recorde!</div>
              )}
            </div>
          )}

          {/* Tempo Esgotado */}
          {gameState.timeRemaining <= 0 && !gameState.isPlaying && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 text-center">
              <div className="text-xl font-bold text-orange-700 mb-2">⏰ Tempo Esgotado!</div>
              <div className="text-sm text-orange-600 mb-3">
                Use o botão "+1 Min" para adicionar mais tempo e continuar jogando!
              </div>
              <div className="text-xs text-orange-500">
                Colete 500 maçãs (500 XP) no jogo para adicionar 1 minuto extra.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 