'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Link, 
  Activity, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  campaign: string | null;
  status: string;
  score: number;
  notes: string | null;
  tags: string;
  createdAt: string;
  updatedAt: string;
  convertedAt: string | null;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    level: number;
  } | null;
  activities: Array<{
    id: string;
    type: string;
    action: string;
    createdAt: string;
  }>;
  _count: {
    activities: number;
    funnelSteps: number;
  };
}

interface InviteLink {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  campaign: string | null;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  createdAt: string;
  clicks: Array<{
    id: string;
    clickedAt: string;
    lead: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  }>;
  _count: {
    clicks: number;
  };
}

interface CRMetrics {
  period: {
    start: string;
    end: string;
    days: number;
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
    averageScore: number;
    byStatus: Array<{ status: string; count: number }>;
    bySource: Array<{ source: string; count: number }>;
    byCampaign: Array<{ campaign: string; count: number }>;
    topLeads: Lead[];
  };
  links: {
    total: number;
    active: number;
    totalClicks: number;
    clickToLeadRate: number;
    byLink: Array<{ linkId: string; clicks: number }>;
  };
  funnel: {
    steps: Array<{
      step: string;
      total: number;
      completed: number;
      completionRate: number;
      avgTime: number;
    }>;
    averageTimePerStep: number;
  };
  activities: {
    recent: Array<{
      id: string;
      type: string;
      action: string;
      createdAt: string;
      leadName: string | null;
      leadEmail: string | null;
      leadStatus: string;
    }>;
  };
}

export default function AdminCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [metrics, setMetrics] = useState<CRMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('30');
  
  // Estados para modais
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingLink, setEditingLink] = useState<InviteLink | null>(null);

  // Estados para formulários
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    campaign: '',
    notes: '',
    tags: '',
    status: 'NEW'
  });

  const [linkForm, setLinkForm] = useState({
    name: '',
    description: '',
    type: 'GENERAL',
    campaign: '',
    maxUses: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchData();
  }, [periodFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [leadsRes, linksRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/leads?period=${periodFilter}`),
        fetch(`/api/admin/invite-links`),
        fetch(`/api/admin/crm-metrics?period=${periodFilter}`)
      ]);

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData.links || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do CRM:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm)
      });

      if (response.ok) {
        toast.success('Lead criado com sucesso');
        setShowLeadModal(false);
        setLeadForm({
          name: '',
          email: '',
          phone: '',
          source: 'website',
          campaign: '',
          notes: '',
          tags: '',
          status: 'NEW'
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar lead');
      }
    } catch (error) {
      toast.error('Erro ao criar lead');
    }
  };

  const handleCreateLink = async () => {
    try {
      const response = await fetch('/api/admin/invite-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkForm)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Link criado com sucesso');
        setShowLinkModal(false);
        setLinkForm({
          name: '',
          description: '',
          type: 'GENERAL',
          campaign: '',
          maxUses: '',
          expiresAt: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao criar link');
      }
    } catch (error) {
      toast.error('Erro ao criar link');
    }
  };

  // Função para filtrar leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = !sourceFilter || sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados do CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM - Gestão de Leads</h1>
          <p className="text-muted-foreground">Gerencie seus leads e campanhas</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowLeadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
          <Button onClick={() => setShowLinkModal(true)} variant="outline">
            <Link className="h-4 w-4 mr-2" />
            Novo Link
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="links">Links de Convite</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.leads.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{metrics?.leads.new || 0} novos este período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.leads?.conversionRate ? `${(metrics.leads?.conversionRate * 100).toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.leads?.converted || 0} convertidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Links Ativos</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.links?.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.links?.totalClicks || 0} cliques totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.leads?.averageScore?.toFixed(1) || '0.0'}</div>
                <p className="text-xs text-muted-foreground">
                  Qualidade dos leads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas atividades dos leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.activities?.recent?.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.leadName || activity.leadEmail || 'Lead desconhecido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action || 'Atividade'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Data desconhecida'}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    placeholder="Nome, email, telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="NEW">Novo</SelectItem>
                      <SelectItem value="CONTACTED">Contactado</SelectItem>
                      <SelectItem value="QUALIFIED">Qualificado</SelectItem>
                      <SelectItem value="CONVERTED">Convertido</SelectItem>
                      <SelectItem value="LOST">Perdido</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Fonte</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as fontes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="invite_link">Link de Convite</SelectItem>
                      <SelectItem value="organic">Orgânico</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Período</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">
                          {lead.name || lead.email || 'Lead sem nome'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {lead.email} {lead.phone && `• ${lead.phone}`}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{lead.source}</Badge>
                          <Badge variant={lead.status === 'CONVERTED' ? 'default' : 'secondary'}>
                            {lead.status}
                          </Badge>
                          {lead.score > 0 && (
                            <Badge variant="outline">Score: {lead.score}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingLead(lead)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {filteredLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          {/* Lista de Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links de Convite ({links.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{link.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description || 'Sem descrição'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{link.type}</Badge>
                          <Badge variant={link.isActive ? 'default' : 'secondary'}>
                            {link.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline">
                            {link.currentUses} / {link.maxUses || '∞'} usos
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/invite/${link.code}`);
                          toast.success('Link copiado!');
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingLink(link)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Estatísticas
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum link de convite encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Gráficos e análises detalhadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Lead */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={leadForm.name}
                onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                placeholder="Nome do lead"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="source">Fonte</Label>
              <Select value={leadForm.source} onValueChange={(value) => setLeadForm({...leadForm, source: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="invite_link">Link de Convite</SelectItem>
                  <SelectItem value="organic">Orgânico</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={leadForm.notes}
                onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                placeholder="Observações sobre o lead"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLeadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLead}>
              Criar Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Link */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Link de Convite</DialogTitle>
            <DialogDescription>
              Crie um novo link de convite para capturar leads
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkName">Nome</Label>
              <Input
                id="linkName"
                value={linkForm.name}
                onChange={(e) => setLinkForm({...linkForm, name: e.target.value})}
                placeholder="Nome do link"
              />
            </div>
            <div>
              <Label htmlFor="linkDescription">Descrição</Label>
              <Textarea
                id="linkDescription"
                value={linkForm.description}
                onChange={(e) => setLinkForm({...linkForm, description: e.target.value})}
                placeholder="Descrição do link"
              />
            </div>
            <div>
              <Label htmlFor="linkType">Tipo</Label>
              <Select value={linkForm.type} onValueChange={(value) => setLinkForm({...linkForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">Geral</SelectItem>
                  <SelectItem value="PARTNER">Parceiro</SelectItem>
                  <SelectItem value="AFFILIATE">Afiliado</SelectItem>
                  <SelectItem value="REFERRAL">Referência</SelectItem>
                  <SelectItem value="CAMPAIGN">Campanha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxUses">Máximo de Usos</Label>
              <Input
                id="maxUses"
                type="number"
                value={linkForm.maxUses}
                onChange={(e) => setLinkForm({...linkForm, maxUses: e.target.value})}
                placeholder="Ilimitado (deixe vazio)"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateLink}>
              Criar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
