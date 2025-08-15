'use client';

import { useState, useEffect } from 'react';
import { Loader2, Target, Zap, Star, Trophy, Rocket, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const MOTIVATIONAL_PHRASES = [
  "Preparando sua jornada de produtividade...",
  "Organizando seu espaço de trabalho...",
  "Carregando suas conquistas futuras...",
  "Preparando novos desafios...",
  "Iniciando sua transformação...",
  "Carregando ferramentas de sucesso...",
  "Preparando seu dashboard pessoal...",
  "Organizando sua nova rotina...",
  "Carregando seu potencial máximo...",
  "Preparando sua evolução..."
];

const LOADING_ICONS = [
  { icon: Target, color: 'text-blue-400' },
  { icon: Zap, color: 'text-yellow-400' },
  { icon: Star, color: 'text-purple-400' },
  { icon: Trophy, color: 'text-green-400' },
  { icon: Rocket, color: 'text-red-400' },
  { icon: Sparkles, color: 'text-pink-400' },
];

export function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Alternar frases a cada 2 segundos
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
    }, 2000);

    // Alternar ícones a cada 1.5 segundos
    const iconInterval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % LOADING_ICONS.length);
    }, 1500);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(iconInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setProgress(0);
      setCurrentPhrase(0);
      setCurrentIcon(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = LOADING_ICONS[currentIcon].icon;
  const iconColor = LOADING_ICONS[currentIcon].color;

  return (
    <div className="fixed inset-0 loading-screen-overlay z-[9999] flex items-center justify-center">
      <div className="text-center space-y-8 p-8 loading-screen-content rounded-3xl">
        {/* Logo/Ícone Principal */}
        <div className="relative animate-float">
          {/* Ícone girando principal */}
          <div className="w-24 h-24 mx-auto mb-6 relative animate-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-full animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
          </div>

          {/* Ícones orbitando */}
          <div className="absolute inset-0 w-24 h-24 mx-auto loading-icon-orbit">
            {LOADING_ICONS.map((iconData, index) => {
              const Icon = iconData.icon;
              const angle = (index * 60) + (Date.now() / 20) % 360;
              const radius = 40;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <div
                  key={index}
                  className="absolute w-6 h-6 animate-pulse"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Icon className={`w-6 h-6 ${iconData.color}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-text-glow">
            TaskFlow Notch
          </h1>
          <p className="text-emerald-300/80 text-lg font-medium animate-pulse">
            Reiniciando sua jornada...
          </p>
        </div>

        {/* Frase motivacional */}
        <div className="max-w-md mx-auto">
          <div className="min-h-[3rem] flex items-center justify-center">
            <p className="text-emerald-200/90 text-center text-sm leading-relaxed animate-fade-in">
              {MOTIVATIONAL_PHRASES[currentPhrase]}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-64 mx-auto space-y-2">
          <div className="flex justify-between text-xs text-emerald-300/70">
            <span>Carregando...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-emerald-900/30 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full loading-progress-bar rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Ícone atual */}
        <div className="flex items-center justify-center space-x-2">
          <CurrentIcon className={`w-5 h-5 ${iconColor} animate-bounce`} />
          <span className="text-emerald-300/60 text-sm">
            Preparando ferramentas...
          </span>
        </div>

        {/* Efeitos visuais */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Partículas flutuantes */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-particle-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
          
          {/* Efeitos de brilho */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        </div>
      </div>
    </div>
  );
} 