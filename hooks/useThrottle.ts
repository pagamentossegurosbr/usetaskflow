import { useCallback, useRef, useState, useEffect } from 'react';

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        callback(...args);
        lastCall.current = now;
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        lastCallTimer.current = setTimeout(() => {
          callback(...args);
          lastCall.current = Date.now();
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdate.current >= delay) {
      setThrottledValue(value);
      lastUpdate.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdate.current = Date.now();
      }, delay - (now - lastUpdate.current));

      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);

  return throttledValue;
} 