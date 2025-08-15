import { useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL, 100 entries max
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    // Clean up expired entries first
    const now = Date.now();
    const entries = Array.from(cache.current.entries());
    for (const [cacheKey, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        cache.current.delete(cacheKey);
      }
    }

    // Check if we need to remove oldest entries
    if (cache.current.size >= maxSize) {
      const oldestKey = cache.current.keys().next().value;
      cache.current.delete(oldestKey);
    }

    cache.current.set(key, {
      data,
      timestamp: now,
      ttl: customTtl || ttl
    });
  }, [ttl, maxSize]);

  const clear = useCallback((): void => {
    cache.current.clear();
  }, []);

  const has = useCallback((key: string): boolean => {
    return get(key) !== null;
  }, [get]);

  const remove = useCallback((key: string): boolean => {
    return cache.current.delete(key);
  }, []);

  const size = useCallback((): number => {
    return cache.current.size;
  }, []);

  return {
    get,
    set,
    clear,
    has,
    remove,
    size
  };
}

// Hook para cache de funções computacionalmente pesadas
export function useMemoizedFunction<T extends (...args: any[]) => any>(
  fn: T,
  dependencies: any[] = [],
  cacheKey?: string
): T {
  const cache = useCache<ReturnType<T>>();
  const lastArgs = useRef<any[]>([]);
  const lastResult = useRef<ReturnType<T> | null>(null);

  const memoizedFn = useCallback(
    (...args: Parameters<T>): ReturnType<T> => {
      // Check if arguments are the same
      const argsEqual = args.length === lastArgs.current.length &&
        args.every((arg, index) => arg === lastArgs.current[index]);

      if (argsEqual && lastResult.current !== null) {
        return lastResult.current;
      }

      // Check cache if cacheKey is provided
      if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached !== null) {
          lastArgs.current = args;
          lastResult.current = cached;
          return cached;
        }
      }

      // Compute new result
      const result = fn(...args);
      lastArgs.current = args;
      lastResult.current = result;

      // Cache result if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, result);
      }

      return result;
    },
    [fn, cacheKey, cache, ...dependencies]
  ) as T;

  return memoizedFn;
} 