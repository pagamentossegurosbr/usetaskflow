'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LandingPageFormProps {
  landingPage: any;
  pricingPlans: any[];
  onSave: (data: any) => void;
}

export default function LandingPageForm({ landingPage, pricingPlans, onSave }: LandingPageFormProps) {
  const [formData, setFormData] = useState({
    name: landingPage?.name || '',
    slug: landingPage?.slug || '',
    template: landingPage?.template || 'default',
    title: landingPage?.title || '',
    subtitle: landingPage?.subtitle || '',
    description: landingPage?.description || '',
    pricingPlanId: landingPage?.pricingPlanId || '',
    inviteCode: landingPage?.inviteCode || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: landingPage?.id
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white">Nome</Label>
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
      </div>
      <div>
        <Label htmlFor="template" className="text-white">Template</Label>
        <Select value={formData.template} onValueChange={(value) => setFormData({ ...formData, template: value })}>
          <SelectTrigger className="bg-slate-800 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="alternative">Alternativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="title" className="text-white">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
          required
        />
      </div>
      <div>
        <Label htmlFor="subtitle" className="text-white">Subtítulo</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
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
      <div>
        <Label htmlFor="pricingPlanId" className="text-white">Plano de Preço</Label>
        <Select value={formData.pricingPlanId} onValueChange={(value) => setFormData({ ...formData, pricingPlanId: value })}>
          <SelectTrigger className="bg-slate-800 border-white/20 text-white">
            <SelectValue placeholder="Selecione um plano" />
          </SelectTrigger>
          <SelectContent>
            {pricingPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} - R$ {plan.originalPrice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="inviteCode" className="text-white">Código de Convite (opcional)</Label>
        <Input
          id="inviteCode"
          value={formData.inviteCode}
          onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
          className="bg-slate-800 border-white/20 text-white"
          placeholder="Deixe vazio para gerar automaticamente"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
          {landingPage ? 'Atualizar' : 'Criar'} Landing Page
        </Button>
      </div>
    </form>
  );
}
