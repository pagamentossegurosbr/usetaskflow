'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  Settings,
  Database,
  Shield,
  Bell,
  Palette,
  Save,
  MessageCircle,
  Mail,
  HelpCircle,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { formatWhatsAppNumber, WhatsAppFormatResult } from "@/lib/whatsappFormatter"

export default function AdminSettings() {
  const [supportConfig, setSupportConfig] = useState({
    whatsappNumber: '+55 11 99999-9999',
    supportEmail: 'suporte@taskflow.com',
    supportEnabled: true,
  });
  const [savingSupport, setSavingSupport] = useState(false);
  const [whatsappFormat, setWhatsappFormat] = useState<WhatsAppFormatResult | null>(null);
  const [whatsappInput, setWhatsappInput] = useState('+55 11 99999-9999');

  // Carregar configurações atuais do servidor
  useEffect(() => {
    const loadCurrentConfig = async () => {
      try {
        const response = await fetch('/api/admin/support-config');
        if (response.ok) {
          const data = await response.json();
          setSupportConfig(data);
          setWhatsappInput(data.whatsappNumber);
          console.log('Configurações carregadas:', data);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadCurrentConfig();
  }, []);

  // Inicializar o input com o valor atual do config
  useEffect(() => {
    setWhatsappInput(supportConfig.whatsappNumber);
  }, [supportConfig.whatsappNumber]);

  // Função para formatar WhatsApp em tempo real
  const handleWhatsAppChange = (value: string) => {
    setWhatsappInput(value);
    const formatResult = formatWhatsAppNumber(value);
    setWhatsappFormat(formatResult);
    
    // Se o formato for válido, atualizar o config
    if (formatResult.isValid) {
      setSupportConfig(prev => ({ ...prev, whatsappNumber: formatResult.formatted }));
    }
  };

  // Aplicar formatação quando o input perder o foco
  const handleWhatsAppBlur = () => {
    if (whatsappFormat && whatsappFormat.isValid) {
      setWhatsappInput(whatsappFormat.formatted);
    }
  };

  const saveSupportConfig = async () => {
    setSavingSupport(true);
    try {
      // Usar o número formatado se disponível
      const configToSave = {
        ...supportConfig,
        whatsappNumber: whatsappFormat?.isValid ? whatsappFormat.formatted : supportConfig.whatsappNumber
      };

      console.log('Salvando configurações:', configToSave);

      const response = await fetch('/api/admin/support-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        toast.success('Configurações de suporte salvas com sucesso!');
        
        // Atualizar o estado com a resposta do servidor
        if (result.config) {
          setSupportConfig(result.config);
          setWhatsappInput(result.config.whatsappNumber);
        }
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de suporte:', error);
      toast.error('Erro ao salvar configurações de suporte');
    } finally {
      setSavingSupport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Configure as opções gerais do sistema
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input id="siteName" defaultValue="TaskFlow Notch" />
            </div>
            <div>
              <Label htmlFor="siteDescription">Descrição</Label>
              <Input id="siteDescription" defaultValue="A beautiful and modern todo list application" />
            </div>
            <div>
              <Label htmlFor="maxUsers">Máximo de Usuários</Label>
              <Input id="maxUsers" type="number" defaultValue="1000" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="registrationEnabled">Permitir Registro</Label>
              <Switch id="registrationEnabled" defaultChecked />
            </div>
            <Button className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Máximo de Tentativas de Login</Label>
              <Input id="maxLoginAttempts" type="number" defaultValue="5" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorEnabled">Autenticação 2FA</Label>
              <Switch id="twoFactorEnabled" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ipWhitelistEnabled">Lista Branca de IPs</Label>
              <Switch id="ipWhitelistEnabled" />
            </div>
            <Button className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Segurança
            </Button>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backupFrequency">Frequência de Backup</Label>
              <select id="backupFrequency" className="w-full p-2 border rounded">
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">Backup Automático</Label>
              <Switch id="autoBackup" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compressionEnabled">Compressão de Dados</Label>
              <Switch id="compressionEnabled" defaultChecked />
            </div>
            <Button variant="outline" className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Executar Backup Manual
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Notificações por Email</Label>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Notificações Push</Label>
              <Switch id="pushNotifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="adminAlerts">Alertas de Admin</Label>
              <Switch id="adminAlerts" defaultChecked />
            </div>
            <div>
              <Label htmlFor="notificationEmail">Email de Notificações</Label>
              <Input id="notificationEmail" type="email" placeholder="admin@example.com" />
            </div>
            <Button className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Salvar Notificações
            </Button>
          </CardContent>
        </Card>

        {/* Support Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Contatos de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Número do WhatsApp
              </Label>
              <div className="relative">
                <Input 
                  id="whatsappNumber" 
                  placeholder="11989002458 ou 989002458 ou +5511989002458" 
                  value={whatsappInput}
                  onChange={(e) => handleWhatsAppChange(e.target.value)}
                  onBlur={handleWhatsAppBlur}
                  className={whatsappFormat ? (whatsappFormat.isValid ? 'border-green-500' : 'border-red-500') : ''}
                />
                {whatsappFormat && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {whatsappFormat.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Feedback visual da formatação */}
              {whatsappFormat && (
                <div className="mt-2 p-2 rounded-md text-sm">
                  {whatsappFormat.isValid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Formato correto: {whatsappFormat.formatted}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{whatsappFormat.error}</span>
                    </div>
                  )}
                  {whatsappFormat.error && whatsappFormat.preview && (
                    <div className="mt-1 text-xs text-blue-600">
                      Preview: {whatsappFormat.preview}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                Aceita: 11989002458, 989002458, 5511989002458, +5511989002458
              </p>
            </div>
            <div>
              <Label htmlFor="supportEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email de Suporte
              </Label>
              <Input 
                id="supportEmail" 
                type="email" 
                placeholder="suporte@taskflow.com"
                value={supportConfig.supportEmail}
                onChange={(e) => setSupportConfig({ ...supportConfig, supportEmail: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email para contato de suporte
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="supportEnabled">Suporte Ativo</Label>
              <Switch 
                id="supportEnabled" 
                checked={supportConfig.supportEnabled}
                onCheckedChange={(checked) => setSupportConfig({ ...supportConfig, supportEnabled: checked })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={saveSupportConfig}
              disabled={savingSupport}
            >
              {savingSupport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Contatos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">v3.0.0</div>
              <p className="text-sm text-muted-foreground">Versão do Sistema</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">Online</div>
              <p className="text-sm text-muted-foreground">Status do Banco</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}