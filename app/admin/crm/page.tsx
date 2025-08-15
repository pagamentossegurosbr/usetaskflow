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
      lead: {
        id: string;
        name: string | null;
        email: string | null;
        status: string;
      };
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
        setLeads(leadsData.leads);
      }

      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setLinks(linksData.links);
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

  const copyLinkToClipboard = (code: string) => {
    const link = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { color: 'bg-blue-100 text-blue-800', label: 'Novo' },
      CONTACTED: { color: 'bg-yellow-100 text-yellow-800', label: 'Contactado' },
      QUALIFIED: { color: 'bg-green-100 text-green-800', label: 'Qualificado' },
      CONVERTED: { color: 'bg-purple-100 text-purple-800', label: 'Convertido' },
      LOST: { color: 'bg-red-100 text-red-800', label: 'Perdido' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', label: 'Arquivado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      website: { color: 'bg-blue-100 text-blue-800', label: 'Website' },
      invite_link: { color: 'bg-green-100 text-green-800', label: 'Link de Convite' },
      organic: { color: 'bg-purple-100 text-purple-800', label: 'Orgânico' },
      paid: { color: 'bg-orange-100 text-orange-800', label: 'Pago' },
      manual: { color: 'bg-gray-100 text-gray-800', label: 'Manual' }
    };

    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.manual;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleEditLead = (lead: Lead) => {
    // Implementar edição de lead
    toast.info('Funcionalidade de edição de lead será implementada em breve');
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/admin/leads?id=${leadId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Lead deletado com sucesso');
        fetchData(); // Recarregar dados
      } else {
        toast.error('Erro ao deletar lead');
      }
    } catch (error) {
      toast.error('Erro ao deletar lead');
    }
  };

  const handleEditLink = (link: InviteLink) => {
    // Implementar edição de link
    toast.info('Funcionalidade de edição de link será implementada em breve');
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/invite-links?id=${linkId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Link deletado com sucesso');
        fetchData(); // Recarregar dados
      } else {
        toast.error('Erro ao deletar link');
      }
    } catch (error) {
      toast.error('Erro ao deletar link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM & Métricas</h1>
          <p className="text-muted-foreground">
            Gerencie leads, links de convite e acompanhe métricas de conversão
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Métricas Rápidas */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.leads?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics?.leads?.new || 0} novos nos últimos {metrics?.period?.days || 30} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.leads?.conversionRate || 0}%</div>
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
              <div className="text-2xl font-bold">{metrics?.leads?.averageScore || 0}</div>
              <p className="text-xs text-muted-foreground">
                Engajamento dos leads
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="links">Links de Convite</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Leads por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Leads por Status</CardTitle>
                <CardDescription>Distribuição dos leads por status atual</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.leads?.byStatus?.map((item) => (
                  <div key={item.status} className="flex items-center justify-between py-2">
                    <span className="text-sm">{getStatusBadge(item.status)}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gráfico de Leads por Fonte */}
            <Card>
              <CardHeader>
                <CardTitle>Leads por Fonte</CardTitle>
                <CardDescription>Origem dos leads</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.leads?.bySource?.map((item) => (
                  <div key={item.source} className="flex items-center justify-between py-2">
                    <span className="text-sm">{getSourceBadge(item.source)}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
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
                {metrics?.activities.recent.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {activity.lead.name || activity.lead.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
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
              <CardTitle>Leads ({leads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{lead.name || 'Sem nome'}</p>
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(lead.status)}
                      {getSourceBadge(lead.source)}
                      <Badge variant="outline">Score: {lead.score}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLead(lead)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
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
                        <p className="font-medium">{link.name}</p>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{link.type}</Badge>
                          <Badge variant={link.isActive ? "default" : "secondary"}>
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
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLinkToClipboard(link.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLink(link)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLink(link.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          {/* Funil de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <CardDescription>Análise dos passos do funil</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.funnel?.steps && metrics.funnel.steps.length > 0 ? (
                <div className="space-y-4">
                  {metrics?.funnel?.steps?.map((step) => (
                    <div key={step.step} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{step.step}</p>
                          <p className="text-sm text-muted-foreground">
                            {step.completed} de {step.total} completaram
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{step.completionRate}%</p>
                        <p className="text-sm text-muted-foreground">
                          {step.avgTime} min em média
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum dado do funil disponível</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Os dados do funil aparecerão quando houver atividades de onboarding registradas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Criar/Editar Lead */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="source">Fonte</Label>
                <Select value={leadForm.source} onValueChange={(value) => setLeadForm({ ...leadForm, source: value })}>
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
            </div>
            <div>
              <Label htmlFor="campaign">Campanha</Label>
              <Input
                id="campaign"
                value={leadForm.campaign}
                onChange={(e) => setLeadForm({ ...leadForm, campaign: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={leadForm.tags}
                onChange={(e) => setLeadForm({ ...leadForm, tags: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLeadModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLead}>
                Criar Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criar/Editar Link */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Link de Convite</DialogTitle>
            <DialogDescription>
              Crie um novo link de convite para rastrear conversões
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkName">Nome do Link</Label>
              <Input
                id="linkName"
                value={linkForm.name}
                onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="linkDescription">Descrição</Label>
              <Textarea
                id="linkDescription"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkType">Tipo</Label>
                <Select value={linkForm.type} onValueChange={(value) => setLinkForm({ ...linkForm, type: value })}>
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
                <Label htmlFor="linkCampaign">Campanha</Label>
                <Input
                  id="linkCampaign"
                  value={linkForm.campaign}
                  onChange={(e) => setLinkForm({ ...linkForm, campaign: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxUses">Limite de Usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  placeholder="Ilimitado"
                  value={linkForm.maxUses}
                  onChange={(e) => setLinkForm({ ...linkForm, maxUses: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Data de Expiração</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={linkForm.expiresAt}
                  onChange={(e) => setLinkForm({ ...linkForm, expiresAt: e.target.value })}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
