'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle,
  Coffee
} from 'lucide-react';

interface PomodoroSession {
  id: string;
  taskName?: string;
  duration: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

const TIMER_PRESETS = [
  { name: 'Foco', duration: 25 * 60, color: 'from-purple-500 to-pink-500' },
  { name: 'Pausa Curta', duration: 5 * 60, color: 'from-green-500 to-blue-500' },
  { name: 'Pausa Longa', duration: 15 * 60, color: 'from-orange-500 to-red-500' }
] as const;

const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const;

export function SidebarPomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [timerState, setTimerState] = useState<typeof TIMER_STATES[keyof typeof TIMER_STATES]>(TIMER_STATES.IDLE);
  const [selectedPreset, setSelectedPreset] = useState<typeof TIMER_PRESETS[number]>(TIMER_PRESETS[0]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (error) {
        console.error('Erro ao carregar sessões do Pomodoro:', error);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    if (timerState === TIMER_STATES.RUNNING) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState(TIMER_STATES.COMPLETED);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, currentSession]);

  const startTimer = () => {
    const session: PomodoroSession = {
      id: Date.now().toString(),
      duration: selectedPreset.duration,
      completed: false,
      startedAt: new Date()
    };
    setCurrentSession(session);
    setTimeLeft(selectedPreset.duration);
    setTimerState(TIMER_STATES.RUNNING);
  };

  const completeSession = async () => {
    if (!currentSession) return;
    
    const completedSession = {
      ...currentSession,
      completed: true,
      completedAt: new Date()
    };
    
    // Adicionar à lista de sessões
    setSessions(prev => [completedSession, ...prev]);
    
    // Salvar no localStorage
    const storageKey = `pomodoro-sessions-${new Date().toDateString()}`;
    const todaySessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
    todaySessions.push(completedSession);
    localStorage.setItem(storageKey, JSON.stringify(todaySessions));
    
    // Adicionar XP baseado na duração da sessão
    try {
      const xpGain = Math.min(5, Math.max(1, Math.floor(selectedPreset.duration / 300))); // 1-5 XP baseado na duração
      await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xpGain,
          reason: `Sessão Pomodoro "${selectedPreset.name}" completada!`,
        }),
      });
      
      // Mostrar toast de XP ganho
      toast.success(`+${xpGain} XP`, {
        description: `Sessão "${selectedPreset.name}" completada!`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
    }
    
    setTimerState(TIMER_STATES.COMPLETED);
    setCurrentSession(null);
  };

  const pauseTimer = () => {
    setTimerState(TIMER_STATES.PAUSED);
  };

  const resumeTimer = () => {
    setTimerState(TIMER_STATES.RUNNING);
  };

  const resetTimer = () => {
    setTimeLeft(selectedPreset.duration);
    setTimerState(TIMER_STATES.IDLE);
    setCurrentSession(null);
  };

  const selectPreset = (preset: typeof TIMER_PRESETS[number]) => {
    setSelectedPreset(preset);
    setTimeLeft(preset.duration);
    setTimerState(TIMER_STATES.IDLE);
    setCurrentSession(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((selectedPreset.duration - timeLeft) / selectedPreset.duration) * 100;
  };

  const getTimerColor = () => {
    if (timerState === TIMER_STATES.RUNNING) return 'text-white';
    if (timerState === TIMER_STATES.PAUSED) return 'text-white/80';
    if (timerState === TIMER_STATES.COMPLETED) return 'text-white';
    return 'text-white/70';
  };

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(session => 
      new Date(session.startedAt).toDateString() === today
    );
  };

  return (
    <div className="space-y-4">
      {/* Timer Display */}
      <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="text-center space-y-3">
          {/* Timer */}
          <div className="relative">
            <div className={`text-3xl font-mono font-bold ${getTimerColor()} transition-colors duration-300`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress Ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-white/10"
                />
                                 <circle
                   cx="50"
                   cy="50"
                   r="45"
                   stroke="currentColor"
                   strokeWidth="2"
                   fill="none"
                   strokeDasharray={`${2 * Math.PI * 45}`}
                   strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                   className={`transition-all duration-1000 ${timerState === TIMER_STATES.RUNNING ? 'text-purple-400' : 'text-purple-500'}`}
                 />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div className="text-xs text-white/60">
            {timerState === TIMER_STATES.IDLE && 'Pronto para focar'}
            {timerState === TIMER_STATES.RUNNING && 'Focando...'}
            {timerState === TIMER_STATES.PAUSED && 'Pausado'}
            {timerState === TIMER_STATES.COMPLETED && 'Sessão concluída!'}
          </div>
        </div>
      </Card>

      {/* Presets */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/80">Tipo de Sessão</h4>
        <div className="grid grid-cols-3 gap-2">
          {TIMER_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => selectPreset(preset)}
              className={`
                p-2 rounded-lg text-xs font-medium transition-all duration-200 border
                ${selectedPreset.name === preset.name
                  ? 'bg-black text-white border-white shadow-lg'
                  : 'bg-transparent text-white/70 border-white/20 hover:bg-black/20 hover:border-white/40 hover:text-white'
                }
              `}
            >
              {preset.name === 'Foco' && <Timer className="w-3 h-3 mx-auto mb-1" />}
              {preset.name === 'Pausa Curta' && <Coffee className="w-3 h-3 mx-auto mb-1" />}
              {preset.name === 'Pausa Longa' && <CheckCircle className="w-3 h-3 mx-auto mb-1" />}
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {timerState === TIMER_STATES.IDLE && (
          <Button
            onClick={startTimer}
            className="flex-1 bg-black text-white border border-white hover:bg-black/80"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Iniciar
          </Button>
        )}

        {timerState === TIMER_STATES.RUNNING && (
          <>
            <Button
              onClick={pauseTimer}
              variant="outline"
              className="flex-1 bg-black text-white border border-white hover:bg-black/80"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pausar
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="bg-black text-white border border-white hover:bg-black/80"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {timerState === TIMER_STATES.PAUSED && (
          <>
            <Button
              onClick={resumeTimer}
              className="flex-1 bg-black text-white border border-white hover:bg-black/80"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Continuar
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className="bg-black text-white border border-white hover:bg-black/80"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {timerState === TIMER_STATES.COMPLETED && (
          <Button
            onClick={resetTimer}
            className="flex-1 bg-black text-white border border-white hover:bg-black/80"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Nova Sessão
          </Button>
        )}
      </div>

      {/* Today's Stats */}
      {getTodaySessions().length > 0 && (
        <Card className="p-3 bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-center space-y-2">
            <h4 className="text-xs font-medium text-white/80">Hoje</h4>
            <div className="flex justify-center items-center gap-4 text-xs">
              <div>
                <div className="text-white/60">Sessões</div>
                <div className="text-white font-medium">{getTodaySessions().length}</div>
              </div>
              <div>
                <div className="text-white/60">Tempo</div>
                <div className="text-white font-medium">
                  {Math.round(getTodaySessions().reduce((acc, session) => acc + session.duration / 60, 0))}min
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
