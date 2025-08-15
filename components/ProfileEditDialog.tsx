'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Camera, Plus, X, Upload, Image as ImageIcon, Sparkles, RotateCcw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  validateAndFormatName, 
  validateAndFormatTitle, 
  validateAndFormatProfile,
  getValidProfessions 
} from '@/lib/profileValidation';

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

interface ProfileEditDialogProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableBadges = [
  'Produtivo', 'Desenvolvedor', 'Focado', 'Criativo', 'Organizado', 
  'Eficiente', 'Inovador', 'Dedicado', 'Estratégico', 'Colaborativo'
];

const avatarOptions = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
];

export function ProfileEditDialog({ profile, onUpdateProfile, open, onOpenChange }: ProfileEditDialogProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [newBadge, setNewBadge] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Lista de profissões pré-definidas (atualizada com cargos C-Level e outros)
  const predefinedProfessions = [
    // C-Level Executives
    "CEO", "CFO", "CTO", "COO", "CMO", "CHRO", "CLO", "CCO", "CDO", "CIO", "CRO", "CSO",
    
    // Executivos e Diretores
    "Diretor", "Diretor Executivo", "Diretor Financeiro", "Diretor de Tecnologia",
    "Diretor de Operações", "Diretor de Marketing", "Diretor de Recursos Humanos",
    "Diretor Comercial", "Diretor de Vendas", "Diretor de Produto",
    
    // Empreendedores e Empresários
    "Empreendedor", "Empresário", "Fundador", "Co-Fundador", "Sócio", "Proprietário",
    "Investidor", "Business Owner",
    
    // Tecnologia
    "Desenvolvedor", "Programador", "Engenheiro de Software", "Desenvolvedor Full Stack",
    "Desenvolvedor Frontend", "Desenvolvedor Backend", "Desenvolvedor Mobile", "DevOps",
    "Arquiteto de Software", "Analista de Sistemas", "Analista de Dados", "Cientista de Dados",
    "Product Manager", "Scrum Master", "Tech Lead",
    
    // Design
    "Designer", "Designer UX", "Designer UI", "Designer Gráfico", "Designer de Produto",
    "UX Designer", "UI Designer", "Product Designer",
    
    // Marketing e Vendas
    "Marketeiro", "Analista de Marketing", "Gerente de Marketing", "Especialista em Marketing Digital",
    "Vendedor", "Representante de Vendas", "Gerente de Vendas", "Marketing Manager",
    "Sales Manager", "Business Development Manager",
    
    // Administração e Negócios
    "Administrador", "Gerente", "Gerente Geral", "Gerente de Projetos", "Gerente de Produto",
    "Analista Administrativo", "Consultor", "Consultor de Negócios", "Analista de Negócios",
    "Analista Financeiro", "Contador", "Auditor", "Analista de Recursos Humanos",
    "Recrutador", "Especialista em RH", "Gerente de RH", "Business Analyst",
    "Project Manager", "Operations Manager",
    
    // Educação
    "Professor", "Educador", "Instrutor", "Tutor", "Coordenador Pedagógico",
    "Diretor de Escola", "Especialista em Educação", "Teacher", "Educator",
    
    // Saúde
    "Médico", "Enfermeiro", "Fisioterapeuta", "Psicólogo", "Psiquiatra",
    "Dentista", "Farmacêutico", "Nutricionista", "Terapeuta", "Doctor",
    "Nurse", "Physiotherapist", "Psychologist", "Psychiatrist",
    
    // Direito e Comunicação
    "Advogado", "Jornalista", "Escritor", "Tradutor", "Intérprete",
    "Lawyer", "Attorney", "Journalist", "Writer",
    
    // Artes e Mídia
    "Fotógrafo", "Videomaker", "Editor", "Ilustrador", "Artista",
    "Photographer", "Videographer", "Editor", "Illustrator", "Artist",
    
    // Ciências e Pesquisa
    "Pesquisador", "Cientista", "Biólogo", "Químico", "Físico", "Matemático", "Estatístico",
    "Researcher", "Scientist", "Biologist", "Chemist", "Physicist", "Mathematician",
    
    // Engenharia
    "Engenheiro Civil", "Engenheiro Mecânico", "Engenheiro Elétrico",
    "Arquiteto", "Urbanista", "Designer de Interiores",
    "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Architect",
    
    // Agricultura e Veterinária
    "Veterinário", "Zootecnista", "Agrônomo", "Engenheiro Agrícola",
    "Veterinarian", "Agronomist", "Agricultural Engineer",
    
    // Segurança e Serviços Públicos
    "Policial", "Bombeiro", "Militar", "Segurança",
    "Police Officer", "Firefighter", "Military", "Security Guard",
    
    // Serviços e Hospitalidade
    "Cozinheiro", "Chef", "Garçom", "Bartender", "Recepcionista",
    "Cook", "Chef", "Waiter", "Bartender", "Receptionist",
    
    // Transporte
    "Motorista", "Piloto", "Comissário de Bordo", "Aeromoça",
    "Driver", "Pilot", "Flight Attendant",
    
    // Estudantes e Iniciantes
    "Estudante", "Estagiário", "Aprendiz", "Freelancer",
    "Student", "Intern", "Apprentice", "Freelancer",
    
    // Outros Cargos Comuns
    "Assistente", "Auxiliar", "Operador", "Técnico", "Especialista",
    "Assistant", "Auxiliary", "Operator", "Technician", "Specialist",
    "Coordenador", "Supervisor", "Líder", "Team Lead", "Coordinator",
    "Supervisor", "Leader",
    
    // Outro (para cargos personalizados)
    "Outro"
  ];
  
  // Estados para validação em tempo real
  const [nameValidation, setNameValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({ isValid: true, errors: [], warnings: [] });
  const [titleValidation, setTitleValidation] = useState<{ isValid: boolean; errors: string[]; warnings: string[] }>({ isValid: true, errors: [], warnings: [] });
  const [isValidating, setIsValidating] = useState(false);

  // Função para validar nome com debounce
  const validateName = useCallback((name: string) => {
    const validation = validateAndFormatName(name);
    setNameValidation({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    });
    return validation;
  }, []);

  // Função para validar título com debounce
  const validateTitle = useCallback((title: string) => {
    const validation = validateAndFormatTitle(title);
    setTitleValidation({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    });
    return validation;
  }, []);

  // Debounce para validação
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editedProfile.name !== profile.name) {
        validateName(editedProfile.name);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editedProfile.name, profile.name, validateName]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editedProfile.title !== profile.title) {
        validateTitle(editedProfile.title);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editedProfile.title, profile.title, validateTitle]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Simular um evento de input para usar a função existente
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(event);
    }
  };

  const handleSave = () => {
    setIsValidating(true);
    
    // Validar perfil completo antes de salvar
    const profileValidation = validateAndFormatProfile(editedProfile);
    
    if (!profileValidation.isValid) {
      toast.error('Dados inválidos', {
        description: profileValidation.errors.join(', '),
        duration: 4000,
      });
      setIsValidating(false);
      return;
    }
    
    // Aplicar formatação automática
    const finalProfile = {
      ...editedProfile,
      ...profileValidation.formatted,
      avatar: uploadedImage || editedProfile.avatar
    };
    
    onUpdateProfile(finalProfile);
    onOpenChange(false);
    setUploadedImage(null);
    setIsValidating(false);
    
    // Mostrar avisos se houver
    if (profileValidation.warnings.length > 0) {
      toast.warning('Avisos de formatação', {
        description: profileValidation.warnings.join(', '),
        duration: 4000,
      });
    }
    
    toast.success('Perfil atualizado! ✨', {
      description: 'Suas alterações foram salvas com sucesso.',
      duration: 4000,
    });
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setUploadedImage(null);
    onOpenChange(false);
  };

  const addBadge = (badge: string) => {
    if (!editedProfile.badges.includes(badge)) {
      setEditedProfile({
        ...editedProfile,
        badges: [...editedProfile.badges, badge]
      });
    }
  };

  const removeBadge = (badge: string) => {
    setEditedProfile({
      ...editedProfile,
      badges: editedProfile.badges.filter(b => b !== badge)
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WebP).',
        duration: 4000,
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 5MB para melhor performance.',
        duration: 4000,
      });
      return;
    }

    try {
      // Mostrar loading
      toast.loading('Enviando imagem...', {
        duration: 0,
      });

      // Criar FormData
      const formData = new FormData();
      formData.append('avatar', file);

      // Enviar para API
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar estado local
        setUploadedImage(data.avatar);
        setEditedProfile(prev => ({ ...prev, avatar: data.avatar }));
        
        // Fechar loading e mostrar sucesso
        toast.dismiss();
        toast.success('Imagem enviada! 📸', {
          description: 'Sua nova foto de perfil foi carregada com sucesso.',
          duration: 4000,
        });
      } else {
        throw new Error(data.error || 'Erro ao enviar imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.dismiss();
      toast.error('Erro ao enviar imagem', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
        duration: 4000,
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      toast.loading('Removendo avatar...', {
        duration: 0,
      });

      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedImage(null);
        setEditedProfile(prev => ({ ...prev, avatar: '' }));
        
        toast.dismiss();
        toast.success('Avatar removido!', {
          description: 'Sua foto de perfil foi removida com sucesso.',
          duration: 4000,
        });
      } else {
        throw new Error(data.error || 'Erro ao remover avatar');
      }
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast.dismiss();
      toast.error('Erro ao remover avatar', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
        duration: 4000,
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const currentAvatar = uploadedImage || editedProfile.avatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Personalize suas informações e preferências do perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Foto do Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={currentAvatar} alt="Profile" />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                  onClick={triggerFileInput}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-3">
                {/* Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
                    isDragOver 
                      ? 'border-purple-500/70 bg-purple-500/10' 
                      : uploadedImage 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-purple-500/30 hover:border-purple-500/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center space-y-2">
                    {uploadedImage ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-200">
                            Imagem carregada com sucesso!
                          </p>
                          <p className="text-xs text-green-300/70">
                            Clique em "Salvar" para aplicar as mudanças
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerFileInput}
                            className="bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Trocar imagem
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-purple-400 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-purple-200">
                            Enviar foto do seu PC
                          </p>
                          <p className="text-xs text-purple-300/70">
                            Arraste uma imagem aqui ou clique para selecionar
                          </p>
                          <p className="text-xs text-purple-300/50">
                            JPG, PNG, GIF, WebP • Máx. 5MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerFileInput}
                          className="mt-2 bg-purple-500/10 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Escolher arquivo
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Avatar Presets */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Ou escolha uma das opções:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEditedProfile({ ...editedProfile, avatar });
                          setUploadedImage(null);
                        }}
                        className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                          currentAvatar === avatar 
                            ? 'border-primary ring-2 ring-primary/30' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img 
                          src={avatar} 
                          alt={`Avatar ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                placeholder="Seu nome completo"
                className={nameValidation.errors.length > 0 ? 'border-red-500' : nameValidation.warnings.length > 0 ? 'border-yellow-500' : ''}
              />
              {nameValidation.errors.length > 0 && (
                <div className="text-xs text-red-500 space-y-1">
                  {nameValidation.errors.map((error, index) => (
                    <div key={index}>⚠️ {error}</div>
                  ))}
                </div>
              )}
              {nameValidation.warnings.length > 0 && (
                <div className="text-xs text-yellow-600 space-y-1">
                  {nameValidation.warnings.map((warning, index) => (
                    <div key={index}>💡 {warning}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={editedProfile.bio}
              onChange={(e) => {
                const text = e.target.value;
                if (text.length <= 150) {
                  setEditedProfile({ ...editedProfile, bio: text });
                }
              }}
              placeholder="Conte um pouco sobre você..."
              className="min-h-[80px]"
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              {editedProfile.bio.length}/150 caracteres
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título Profissional</Label>
            <Select
              value={editedProfile.title}
              onValueChange={(value) => setEditedProfile({ ...editedProfile, title: value })}
            >
              <SelectTrigger className={titleValidation.errors.length > 0 ? 'border-red-500' : titleValidation.warnings.length > 0 ? 'border-yellow-500' : ''}>
                <SelectValue placeholder="Selecione sua profissão" />
              </SelectTrigger>
              <SelectContent>
                {predefinedProfessions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {titleValidation.errors.length > 0 && (
              <div className="text-xs text-red-500 space-y-1">
                {titleValidation.errors.map((error, index) => (
                  <div key={index}>⚠️ {error}</div>
                ))}
              </div>
            )}
            {titleValidation.warnings.length > 0 && (
              <div className="text-xs text-yellow-600 space-y-1">
                {titleValidation.warnings.map((warning, index) => (
                  <div key={index}>💡 {warning}</div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <Label>Badges</Label>
            <Card className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {editedProfile.badges.map((badge) => (
                  <Badge 
                    key={badge} 
                    variant="secondary" 
                    className="flex items-center gap-1 pr-1"
                  >
                    {badge}
                    <button
                      onClick={() => removeBadge(badge)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Select value={newBadge} onValueChange={setNewBadge}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar badge..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBadges
                      .filter(badge => !editedProfile.badges.includes(badge))
                      .map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newBadge) {
                      addBadge(newBadge);
                      setNewBadge('');
                    }
                  }}
                  disabled={!newBadge}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Link para Configurações */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Configurações Avançadas</Label>
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Settings className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Configurações do Sistema</h4>
                    <p className="text-xs text-muted-foreground">
                      Efeitos visuais, tema, notificações e gerenciamento de dados
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = '/settings';
                  }}
                >
                  Abrir Configurações
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isValidating || !nameValidation.isValid || !titleValidation.isValid}
          >
            {isValidating ? 'Validando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}