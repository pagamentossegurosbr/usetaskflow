import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

interface MemoryOptimizationOptions {
  maxItems?: number;
  cleanupInterval?: number; // milliseconds
  enableAutoCleanup?: boolean;
}

export function useMemoryOptimization(options: MemoryOptimizationOptions = {}) {
  const {
    maxItems = 1000,
    cleanupInterval = 5 * 60 * 1000, // 5 minutes
    enableAutoCleanup = true
  } = options;

  const cleanupRef = useRef<NodeJS.Timeout | null>(null);
  const itemsRef = useRef<Set<string>>(new Set());

  const addItem = useCallback((id: string) => {
    itemsRef.current.add(id);
    
    // Auto-cleanup if we exceed maxItems
    if (itemsRef.current.size > maxItems) {
      const itemsArray = Array.from(itemsRef.current);
      const itemsToRemove = itemsArray.slice(0, itemsArray.length - maxItems);
      itemsToRemove.forEach(item => itemsRef.current.delete(item));
    }
  }, [maxItems]);

  const removeItem = useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    itemsRef.current.clear();
  }, []);

  const getItemCount = useCallback(() => {
    return itemsRef.current.size;
  }, []);

  // Auto-cleanup effect
  useEffect(() => {
    if (!enableAutoCleanup) return;

    const cleanup = () => {
      // Remove items older than cleanupInterval
      const now = Date.now();
      const itemsArray = Array.from(itemsRef.current);
      
      // For simplicity, we'll just clear half of the items
      // In a real implementation, you'd track timestamps
      if (itemsArray.length > maxItems / 2) {
        const itemsToRemove = itemsArray.slice(0, itemsArray.length / 2);
        itemsToRemove.forEach(item => itemsRef.current.delete(item));
      }
    };

    cleanupRef.current = setInterval(cleanup, cleanupInterval);

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [cleanupInterval, enableAutoCleanup, maxItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
      itemsRef.current.clear();
    };
  }, []);

  return {
    addItem,
    removeItem,
    clearAll,
    getItemCount
  };
}

// Hook para otimizar listas grandes
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    containerRef
  };
}

// Hook para otimizar re-renderizações de listas
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string,
  options: {
    maxVisibleItems?: number;
    enableVirtualization?: boolean;
  } = {}
) {
  const { maxVisibleItems = 50, enableVirtualization = false } = options;
  
  const [visibleCount, setVisibleCount] = useState(maxVisibleItems);
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (isExpanded || !enableVirtualization) {
      return items;
    }
    return items.slice(0, visibleCount);
  }, [items, visibleCount, isExpanded, enableVirtualization]);

  const hasMore = useMemo(() => {
    return enableVirtualization && !isExpanded && items.length > visibleCount;
  }, [items.length, visibleCount, isExpanded, enableVirtualization]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + maxVisibleItems, items.length));
  }, [maxVisibleItems, items.length]);

  const expandAll = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const keys = useMemo(() => {
    return visibleItems.map((item, index) => keyExtractor(item, index));
  }, [visibleItems, keyExtractor]);

  return {
    visibleItems,
    keys,
    hasMore,
    loadMore,
    expandAll,
    isExpanded
  };
} 