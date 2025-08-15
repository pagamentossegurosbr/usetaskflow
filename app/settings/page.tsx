'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Sparkles, 
  RotateCcw, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useLanguage } from '@/hooks/useLanguage';
import { Crown, Globe } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  title: string;
  badges: string[];
  theme: string;
  hideProfileEffects?: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Hook para upgrade modal
  const { openUpgradeModal, currentPlan } = useUpgradeModal();
  
  // Hook para idioma
  const { language, changeLanguage, translations } = useLanguage();

  // Estados para configurações
  const [hideProfileEffects, setHideProfileEffects] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  
  // Estados para data de nascimento
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfBirthChangeCount, setDateOfBirthChangeCount] = useState(0);
  const [remainingChanges, setRemainingChanges] = useState(2);

  // Função para gerar chave única baseada no domínio
  const getStorageKey = (key: string) => {
    if (typeof window === 'undefined') return key;
    const domain = window.location.hostname;
    return `${domain}-${key}`;
  };

  // Carregar perfil e configurações
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(getStorageKey('user-profile'));
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setUserProfile(parsedProfile);
          setHideProfileEffects(parsedProfile.hideProfileEffects || false);
          setTheme(parsedProfile.theme || 'dark');
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
    }

    // Carregar data de nascimento
    loadDateOfBirth();
  }, []);

  const loadDateOfBirth = async () => {
    try {
      const response = await fetch('/api/user/date-of-birth');
      if (response.ok) {
        const data = await response.json();
        if (data.dateOfBirth) {
          const date = new Date(data.dateOfBirth);
          setDateOfBirth(date.toISOString().split('T')[0]);
        }
        setDateOfBirthChangeCount(data.changeCount || 0);
        setRemainingChanges(data.remainingChanges || 2);
      }
    } catch (error) {
      console.error('Erro ao carregar data de nascimento:', error);
    }
  };

  // Redirecionar se não autenticado
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSaveDateOfBirth = async () => {
    if (!dateOfBirth) {
      toast.error('Data de nascimento é obrigatória');
      return;
    }

    try {
      const response = await fetch('/api/user/date-of-birth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateOfBirth: dateOfBirth,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setDateOfBirthChangeCount(data.changeCount);
        setRemainingChanges(data.remainingChanges);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro ao salvar data de nascimento:', error);
      toast.error('Erro ao salvar data de nascimento');
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          hideProfileEffects,
          theme
        };

        localStorage.setItem(getStorageKey('user-profile'), JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        
        toast.success("Configurações salvas com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetXP = () => {
    if (confirm('Tem certeza que deseja resetar seu XP para o nível 1? Esta ação não pode ser desfeita.')) {
      try {
        // Salvar o perfil atual antes de resetar
        const currentProfile = localStorage.getItem(getStorageKey('user-profile'));
        
        // Resetar apenas o XP, mantendo outras configurações
        localStorage.removeItem(getStorageKey('productivity-stats'));
        localStorage.removeItem('level-3-modal-shown');
        localStorage.removeItem('level-4-modal-shown');
        localStorage.removeItem('level-5-modal-shown');
        localStorage.removeItem('level-6-modal-shown');
        localStorage.removeItem('level-7-modal-shown');
        localStorage.removeItem('level-8-modal-shown');
        localStorage.removeItem('level-9-modal-shown');
        localStorage.removeItem('level-10-modal-shown');
        localStorage.removeItem('previous-level');
        
        // Limpar qualquer outro dado relacionado ao XP/progresso
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('achievement') || 
            key.includes('level') || 
            key.includes('xp') || 
            key.includes('progress') ||
            key.includes('stats')
          )) {
            keysToRemove.push(key);
          }
        }
        
        // Remover as chaves encontradas (exceto user-profile)
        keysToRemove.forEach(key => {
          if (key !== getStorageKey('user-profile')) {
            localStorage.removeItem(key);
          }
        });
        
        // Restaurar o perfil se existia
        if (currentProfile) {
          localStorage.setItem(getStorageKey('user-profile'), currentProfile);
        }
        
        toast.success("XP resetado com sucesso! Você voltou ao nível 1.");
        
        // Recarregar a página para aplicar as mudanças
        window.location.reload();
      } catch (error) {
        console.error('Erro ao resetar XP:', error);
        toast.error("Erro ao resetar XP. Tente novamente.");
      }
    }
  };

  const handleClearAllData = () => {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os seus dados (tarefas, progresso, configurações). Esta ação não pode ser desfeita. Tem certeza?')) {
      try {
        // Limpar todos os dados do localStorage
        localStorage.clear();
        sessionStorage.clear();
        
        toast.success("Todos os dados foram apagados. Você será redirecionado para o login.");
        
        // Redirecionar para login
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        toast.error("Erro ao limpar dados. Tente novamente.");
      }
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        profile: userProfile,
        productivityStats: localStorage.getItem(getStorageKey('productivity-stats')),
        userTodos: localStorage.getItem(getStorageKey('user-todos')),
        taskHistory: localStorage.getItem(getStorageKey('task-history')),
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error("Erro ao exportar dados. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do TaskFlow
          </p>
        </div>

        {/* Configurações de Efeitos */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Efeitos Visuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Efeitos do Perfil</h4>
                  <p className="text-xs text-muted-foreground">
                    Ocultar partículas, brilho e animações especiais da foto de perfil
                  </p>
                </div>
              </div>
              <Switch
                checked={hideProfileEffects}
                onCheckedChange={setHideProfileEffects}
              />
            </div>
            
            {hideProfileEffects && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-600 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Os efeitos especiais da foto de perfil serão ocultados. 
                  Você ainda verá o indicador de nível, mas sem as animações mágicas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações de Tema */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-500" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Monitor className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Tema</h4>
                  <p className="text-xs text-muted-foreground">
                    Escolha entre tema claro, escuro ou automático
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Idioma */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Idioma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Globe className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Idioma da Aplicação</h4>
                  <p className="text-xs text-muted-foreground">
                    Escolha o idioma de sua preferência
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={language === 'pt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('pt')}
                >
                  🇧🇷 PT
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('en')}
                >
                  🇺🇸 EN
                </Button>
                <Button
                  variant={language === 'es' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('es')}
                >
                  🇪🇸 ES
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Bell className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Notificações do Sistema</h4>
                  <p className="text-xs text-muted-foreground">
                    Receber notificações sobre conquistas e progresso
                  </p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Data de Nascimento */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1"
                  disabled={remainingChanges === 0}
                />
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={remainingChanges > 0 ? "default" : "destructive"}>
                    {remainingChanges > 0 ? `${remainingChanges} alterações restantes` : 'Sem alterações restantes'}
                  </Badge>
                  {dateOfBirthChangeCount > 0 && (
                    <Badge variant="outline">
                      {dateOfBirthChangeCount} alteração{dateOfBirthChangeCount > 1 ? 'ões' : ''} realizada{dateOfBirthChangeCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta informação ficará visível apenas para administradores. 
                  {remainingChanges === 0 && ' Entre em contato com o administrador para alterações adicionais.'}
                </p>
              </div>
              
              {remainingChanges > 0 && (
                <Button
                  onClick={handleSaveDateOfBirth}
                  className="flex items-center gap-2"
                  disabled={!dateOfBirth}
                >
                  <CheckCircle className="h-4 w-4" />
                  Salvar Data de Nascimento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Dados */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Gerenciamento de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Exportar Dados
              </Button>
              
              <Button
                variant="outline"
                onClick={handleResetXP}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar XP
              </Button>
            </div>
            
            <Separator />
            
            {/* Seção de Upgrade - Mostrar apenas para usuários gratuitos */}
            {currentPlan === 'free' && (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-purple-600">Upgrade para Premium</h4>
                    <p className="text-xs text-purple-600 mt-1">
                      Desbloqueie recursos exclusivos e maximize sua produtividade.
                    </p>
                    <Button
                      onClick={() => openUpgradeModal('executor', 'Todos os Recursos')}
                      className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-600">Zona de Perigo</h4>
                  <p className="text-xs text-red-600 mt-1">
                    Estas ações são irreversíveis. Use com cuidado.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAllData}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Apagar Todos os Dados
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-500" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Versão do App</p>
                <p className="font-medium">TaskFlow v3.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Última Atualização</p>
                <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tema Atual</p>
                <Badge variant="secondary">{theme}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Efeitos do Perfil</p>
                <Badge variant={hideProfileEffects ? "destructive" : "secondary"}>
                  {hideProfileEffects ? "Desativados" : "Ativados"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Voltar ao App
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 