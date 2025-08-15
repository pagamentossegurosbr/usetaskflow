'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PricingPlanFormProps {
  plan: any;
  onSave: (data: any) => void;
}

export default function PricingPlanForm({ plan, onSave }: PricingPlanFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    slug: plan?.slug || '',
    description: plan?.description || '',
    originalPrice: plan?.originalPrice || '',
    promotionalPrice: plan?.promotionalPrice || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      originalPrice: parseFloat(formData.originalPrice) || 0,
      promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
      id: plan?.id
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Nome do Plano</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
          required
        />
      </div>
      <div>
        <Label htmlFor="slug" className="text-white">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
          required
        />
      </div>
      <div>
        <Label htmlFor="description" className="text-white">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalPrice" className="text-white">Preço Original</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="promotionalPrice" className="text-white">Preço Promocional (opcional)</Label>
          <Input
            id="promotionalPrice"
            type="number"
            step="0.01"
            value={formData.promotionalPrice}
            onChange={(e) => setFormData({ ...formData, promotionalPrice: e.target.value })}
            className="bg-slate-800 border-white/20 text-white"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
          {plan ? 'Atualizar' : 'Criar'} Plano
        </Button>
      </div>
    </form>
  );
}
