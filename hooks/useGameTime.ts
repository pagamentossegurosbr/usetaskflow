import { useState, useEffect } from 'react';

interface UseGameTimeReturn {
  dailyPlayTime: number;
  maxDailyPlayTime: number;
  addPlayTime: (seconds: number) => void;
  resetDailyTime: () => void;
  hasTimeLeft: boolean;
  remainingTime: number;
}

export function useGameTime(): UseGameTimeReturn {
  // Função para gerar chave única baseada no domínio
  const getStorageKey = (key: string) => {
    if (typeof window === 'undefined') return key;
    const domain = window.location.hostname;
    return `${domain}-${key}`;
  };

  const [dailyPlayTime, setDailyPlayTime] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(getStorageKey('daily-play-time'));
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        if (data.date === today) {
          return data.time;
        }
      }
    }
    return 0;
  });

  const maxDailyPlayTime = 300; // 5 minutos por dia

  // Salvar tempo de jogo no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = {
        time: dailyPlayTime,
        date: new Date().toDateString(),
      };
      localStorage.setItem(getStorageKey('daily-play-time'), JSON.stringify(data));
    }
  }, [dailyPlayTime]);

  const addPlayTime = (seconds: number) => {
    setDailyPlayTime((prev: number) => Math.min(prev + seconds, maxDailyPlayTime));
  };

  const resetDailyTime = () => {
    setDailyPlayTime(0);
  };

  const hasTimeLeft = dailyPlayTime < maxDailyPlayTime;
  const remainingTime = maxDailyPlayTime - dailyPlayTime;

  return {
    dailyPlayTime,
    maxDailyPlayTime,
    addPlayTime,
    resetDailyTime,
    hasTimeLeft,
    remainingTime
  };
} 