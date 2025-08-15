import dynamic from 'next/dynamic';

// Lazy load de componentes pesados
export const LazyMiniGame = dynamic(() => import('@/components/MiniGame').then(mod => ({ default: mod.MiniGame })), {
  ssr: false
});

export const LazySnakeGame = dynamic(() => import('@/components/SnakeGame').then(mod => ({ default: mod.SnakeGame })), {
  ssr: false
});

export const LazyFocusMode = dynamic(() => import('@/components/FocusMode').then(mod => ({ default: mod.FocusMode })), {
  ssr: false
});

export const LazyCalendar = dynamic(() => import('@/components/Calendar').then(mod => ({ default: mod.Calendar })), {
  ssr: false
});

export const LazyAdvancedTrackingChart = dynamic(() => import('@/components/AdvancedTrackingChart').then(mod => ({ default: mod.AdvancedTrackingChart })), {
  ssr: false
});

// Temporarily removing lazy loading for ProgressChart to avoid Radix UI build issues
// export const LazyProgressChart = dynamic(() => import('@/components/ProgressChart').then(mod => ({ default: mod.ProgressChart })), {
//   ssr: false
// });

export const LazyAchievementsModal = dynamic(() => import('@/components/AchievementsModal').then(mod => ({ default: mod.AchievementsModal })), {
  ssr: false
});

export const LazyTutorial = dynamic(() => import('@/components/Tutorial').then(mod => ({ default: mod.Tutorial })), {
  ssr: false
}); 