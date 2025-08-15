'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingStatsProps {
  count?: number;
}

export function LoadingStats({ count = 4 }: LoadingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface LoadingTodoListProps {
  count?: number;
}

export function LoadingTodoList({ count = 5 }: LoadingTodoListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface LoadingChartProps {
  height?: number;
}

export function LoadingChart({ height = 300 }: LoadingChartProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div 
            className="flex items-center justify-center bg-gray-50 rounded-lg"
            style={{ height: `${height}px` }}
          >
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingProfileProps {}

export function LoadingProfile({}: LoadingProfileProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingModalProps {
  title?: string;
}

export function LoadingModal({ title = 'Carregando...' }: LoadingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto carregamos os dados...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = 'Carregando...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function LoadingButton({ 
  children, 
  loading = false, 
  className = '',
  onClick,
  disabled = false
}: LoadingButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
        loading || disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
}

export function LoadingTable({ rows = 5, columns = 4 }: LoadingTableProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 p-4 bg-gray-50 rounded-t-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-20" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}
