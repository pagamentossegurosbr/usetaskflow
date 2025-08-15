'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface ProgressSectionProps {
  completed: number;
  total: number;
  percentage: number;
}

export function ProgressSection({ completed, total, percentage }: ProgressSectionProps) {
  return (
    <Card className="p-6 border-border bg-card/50 backdrop-blur-sm animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Progresso de Hoje</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{percentage.toFixed(0)}% completo</span>
          </div>
        </div>

        <div className="space-y-4">
          <Progress value={percentage} className="h-3" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
              <div className="p-2 rounded-xl bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{completed}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{total - completed}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}