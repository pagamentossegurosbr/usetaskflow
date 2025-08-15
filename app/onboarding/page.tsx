'use client'

import React, { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, User, Mail, Briefcase, Camera, X, Plus, CheckCircle, Upload, Trash2, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { validateAndFormatProfile } from "@/lib/profileValidation"

// Função para tracking de atividades do lead
const trackLeadActivity = async (session: any, type: string, action: string, details?: any) => {
  try {
    await fetch('/api/track/lead-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        action,
        details,
        email: session?.user?.email,
        name: session?.user?.name,
        source: 'invite_link', // Assumindo que veio de link de convite
      }),
    });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
};

// Função para tracking de steps do funil
const trackFunnelStep = async (session: any, stepName: string, stepOrder: number, completed: boolean, timeSpent?: number, data?: any) => {
  try {
    await fetch('/api/track/funnel-step', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stepName,
        stepOrder,
        completed,
        timeSpent,
        data,
        email: session?.user?.email,
        name: session?.user?.name,
        source: 'invite_link',
      }),
    });
  } catch (error) {
    console.error('Erro ao registrar step do funil:', error);
  }
};

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())

  // Tracking inicial quando a página carrega
  React.useEffect(() => {
    if (session?.user?.email) {
      trackFunnelStep(session, 'onboarding_start', 1, false);
      trackLeadActivity(session, 'page_view', 'Iniciou processo de onboarding');
      setStepStartTime(Date.now());
    }
  }, [session?.user?.email]);

  // Reset step timer when step changes
  React.useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentStep]);

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    title: "",
    avatar: "",
    theme: "dark",
    badges: ["Iniciante"] as string[], // Badge padrão fixo
    dateOfBirth: "",
  })

  // Funções de validação
  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validar nome completo
    if (!profileData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório";
    } else if (profileData.name.trim().split(' ').length < 2) {
      newErrors.name = "Digite seu nome completo (nome e sobrenome)";
    } else if (profileData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }
    
    // Validar data de nascimento
    if (!profileData.dateOfBirth) {
      newErrors.dateOfBirth = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(profileData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        newErrors.dateOfBirth = "Você deve ter pelo menos 13 anos";
      } else if (age > 120) {
        newErrors.dateOfBirth = "Data de nascimento inválida";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validar título/profissão
    if (!profileData.title.trim()) {
      newErrors.title = "Selecione sua profissão ou título";
    }
    
    // Validar biografia
    if (!profileData.bio.trim()) {
      newErrors.bio = "Biografia é obrigatória";
    } else if (profileData.bio.trim().length < 10) {
      newErrors.bio = "Biografia deve ter pelo menos 10 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

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
  ]

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  // Redirecionar se não autenticado
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem")
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }

      setAvatarFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleNext = async () => {
    // Calcular tempo gasto no step atual
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    
    // Validar step atual
    let isValid = true;
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }
    
    if (!isValid) {
      // Tracking de erro de validação
      await trackFunnelStep(session, `onboarding_step_${currentStep}_error`, currentStep, false, timeSpent);
      await trackLeadActivity(session, 'form_error', `Erro de validação no step ${currentStep}`, {
        step: currentStep,
        errors: errors,
        timeSpent: timeSpent
      });
      
      toast.error('Por favor, corrija os erros antes de continuar');
      return;
    }
    
    if (currentStep < totalSteps) {
      // Tracking do step atual com sucesso
      await trackFunnelStep(session, `onboarding_step_${currentStep}`, currentStep, true, timeSpent);
      await trackLeadActivity(session, 'form_progress', `Completou step ${currentStep} do onboarding`, {
        step: currentStep,
        timeSpent: timeSpent,
        data: {
          name: currentStep === 1 ? profileData.name : undefined,
          dateOfBirth: currentStep === 1 ? profileData.dateOfBirth : undefined,
          title: currentStep === 2 ? profileData.title : undefined,
          bio: currentStep === 2 ? profileData.bio : undefined,
        }
      });
      
      // Enviar dados detalhados para o funil
      await trackFunnelStep(session, `onboarding_step_${currentStep}_data`, currentStep, true, timeSpent, {
        step: currentStep,
        timeSpent: timeSpent,
        name: currentStep === 1 ? profileData.name : undefined,
        dateOfBirth: currentStep === 1 ? profileData.dateOfBirth : undefined,
        title: currentStep === 2 ? profileData.title : undefined,
        bio: currentStep === 2 ? profileData.bio : undefined,
        bioLength: currentStep === 2 ? profileData.bio.length : undefined,
        hasAvatar: !!profileData.avatar,
        validationErrors: Object.keys(errors).length,
        allFieldsValid: Object.keys(errors).length === 0
      });
      
      clearErrors();
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      // Calcular tempo total gasto no onboarding
      const totalTimeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
      
      // Tracking da conclusão do onboarding com dados completos
      await trackFunnelStep(session, 'onboarding_complete', totalSteps, true, totalTimeSpent);
      await trackLeadActivity(session, 'form_complete', 'Completou onboarding com sucesso', {
        totalTimeSpent: totalTimeSpent,
        hasBio: !!profileData.bio,
        hasTitle: !!profileData.title,
        hasAvatar: !!profileData.avatar,
        theme: profileData.theme,
        badges: profileData.badges,
        name: profileData.name,
        dateOfBirth: profileData.dateOfBirth,
        title: profileData.title,
        bio: profileData.bio,
        bioLength: profileData.bio.length,
        allFieldsCompleted: !!(profileData.name && profileData.dateOfBirth && profileData.title && profileData.bio)
      });
      
      // Converter arquivo para base64 se houver
      let avatarData = profileData.avatar
      if (avatarFile) {
        const reader = new FileReader()
        reader.onload = (e) => {
          avatarData = e.target?.result as string
          
          // Salvar perfil com avatar
          saveProfile(avatarData)
        }
        reader.readAsDataURL(avatarFile)
      } else {
        // Salvar perfil sem avatar
        saveProfile(avatarData)
      }
    } catch (error) {
      console.error("Erro ao processar avatar:", error)
      toast.error("Erro ao processar foto de perfil. Tente novamente.")
      setLoading(false)
    }
  }

  const saveProfile = async (avatarData: string) => {
    // Validar perfil antes de salvar
    const userProfile = {
      name: profileData.name,
      email: profileData.email,
      bio: profileData.bio || "Novo usuário do TaskFlow",
      avatar: avatarData || "",
      title: profileData.title || "Iniciante",
      badges: profileData.badges, // Sempre ["Iniciante"]
      theme: profileData.theme,
      hideProfileEffects: false,
    }

    // Salvar data de nascimento no banco de dados
    if (profileData.dateOfBirth) {
      try {
        const response = await fetch('/api/user/date-of-birth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateOfBirth: profileData.dateOfBirth,
          }),
        });

        if (!response.ok) {
          console.error('Erro ao salvar data de nascimento');
        }
      } catch (error) {
        console.error('Erro ao salvar data de nascimento:', error);
      }
    }

    // Validar e formatar perfil
    const profileValidation = validateAndFormatProfile(userProfile);
    
    if (!profileValidation.isValid) {
      toast.error('Dados inválidos', {
        description: profileValidation.errors.join(', '),
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    // Aplicar formatação automática
    const finalProfile = {
      ...userProfile,
      ...profileValidation.formatted,
    };

    // Gerar chave única baseada no domínio (igual ao app principal)
    const getStorageKey = (key: string) => {
      if (typeof window === 'undefined') return key;
      const domain = window.location.hostname;
      return `${domain}-${key}`;
    };

    // Limpar dados antigos antes de inicializar (para usuário novo)
    localStorage.removeItem(getStorageKey('productivity-stats'))
    localStorage.removeItem(getStorageKey('task-history'))
    localStorage.removeItem(getStorageKey('user-todos'))
    localStorage.removeItem(getStorageKey('cooldown-data'))
    localStorage.removeItem(getStorageKey('global-actions'))
    localStorage.removeItem(getStorageKey('user-profile'))

    localStorage.setItem(getStorageKey('user-profile'), JSON.stringify(finalProfile))
    localStorage.setItem(getStorageKey('onboarding-completed'), 'true')
    
    // Sinalizar que acabou de completar onboarding (para mostrar tutorial)
    sessionStorage.setItem('just-completed-onboarding', 'true')

    // Mostrar avisos se houver
    if (profileValidation.warnings.length > 0) {
      toast.warning('Avisos de formatação', {
        description: profileValidation.warnings.join(', '),
        duration: 4000,
      });
    }

    toast.success('Perfil criado com sucesso! ✨', {
      description: 'Seu perfil foi configurado e você está pronto para começar.',
      duration: 4000,
    });

    // Inicializar dados zerados
    const initialStats = {
      totalXP: 0,
      currentLevel: 1,
      levelName: 'Iniciante',
      xpToNextLevel: 100,
      xpInCurrentLevel: 0,
      totalTasksCompleted: 0,
      consecutiveDays: 0,
      bestDay: '',
      mostCommonTask: '',
      achievements: [
        {
          id: 'first_task',
          name: 'Primeiro Passo',
          description: 'Complete sua primeira tarefa',
          icon: '🎯',
          xpReward: 25,
          requirement: { type: 'tasks_completed', value: 1 },
          unlocked: false,
        },
        {
          id: 'productive_day',
          name: 'Dia Produtivo',
          description: 'Complete 5 tarefas em um dia',
          icon: '⚡',
          xpReward: 50,
          requirement: { type: 'daily_tasks', value: 5 },
          unlocked: false,
        },
        {
          id: 'week_warrior',
          name: 'Guerreiro da Semana',
          description: 'Complete tarefas por 7 dias consecutivos',
          icon: '🔥',
          xpReward: 100,
          requirement: { type: 'consecutive_days', value: 7 },
          unlocked: false,
        },
        {
          id: 'priority_master',
          name: 'Mestre das Prioridades',
          description: 'Complete 10 tarefas prioritárias',
          icon: '⭐',
          xpReward: 75,
          requirement: { type: 'priority_tasks', value: 10 },
          unlocked: false,
        },
        {
          id: 'speed_demon',
          name: 'Demônio da Velocidade',
          description: 'Complete 5 tarefas antes das 9h da manhã',
          icon: '🌅',
          xpReward: 50,
          requirement: { type: 'early_tasks', value: 5 },
          unlocked: false,
        },
      ],
      weeklyStats: {
        tasksCompleted: 0,
        totalTasks: 0,
        averageCompletionRate: 0,
        bestDay: '',
        mostProductiveHour: '',
        streakDays: 0,
      },
    }

    localStorage.setItem(getStorageKey('productivity-stats'), JSON.stringify(initialStats))
    localStorage.setItem(getStorageKey('user-todos'), JSON.stringify([]))

    toast.success("Perfil configurado com sucesso! Bem-vindo ao TaskFlow!")
    
    // Redirecionar para o app principal
    router.push("/")
    setLoading(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Informações Básicas</h2>
              <p className="text-muted-foreground">Vamos começar com suas informações principais</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => {
                    setProfileData({ ...profileData, name: e.target.value });
                    if (errors.name) clearErrors();
                  }}
                  placeholder="Ex: João Silva Santos"
                  className={`mt-1 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Digite seu nome completo (nome e sobrenome). Exemplo: João Silva Santos
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-1"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">Email não pode ser alterado</p>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => {
                    setProfileData({ ...profileData, dateOfBirth: e.target.value });
                    if (errors.dateOfBirth) clearErrors();
                  }}
                  className={`mt-1 ${errors.dateOfBirth ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Esta informação ficará visível apenas para administradores. Você deve ter pelo menos 13 anos.
                </p>
              </div>

              <div>
                <Label htmlFor="avatar">Foto de perfil (opcional)</Label>
                <div className="mt-1 space-y-3">
                  {/* Preview da imagem */}
                  {avatarPreview && (
                    <div className="relative inline-block">
                      <img
                        src={avatarPreview}
                        alt="Preview da foto de perfil"
                        className="w-24 h-24 rounded-full object-cover border-2 border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Área de upload */}
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Escolher foto
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou GIF até 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Briefcase className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Perfil Profissional</h2>
              <p className="text-muted-foreground">Conte-nos mais sobre você</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título/Profissão *</Label>
                <Select
                  value={profileData.title}
                  onValueChange={(value) => {
                    setProfileData({ ...profileData, title: value });
                    if (errors.title) clearErrors();
                  }}
                >
                  <SelectTrigger className={`mt-1 ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione sua profissão" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedProfessions.map((profession, index) => (
                      <SelectItem key={`${profession}-${index}`} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione a opção que melhor descreve sua profissão atual
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Biografia *</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => {
                    const text = e.target.value;
                    if (text.length <= 150) {
                      setProfileData({ ...profileData, bio: text });
                      if (errors.bio) clearErrors();
                    }
                  }}
                  placeholder="Ex: Sou um desenvolvedor apaixonado por tecnologia e produtividade. Busco sempre melhorar minhas habilidades e ajudar outros a alcançarem seus objetivos..."
                  className={`mt-1 ${errors.bio ? 'border-red-500 focus:border-red-500' : ''}`}
                  rows={4}
                  maxLength={150}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1">{errors.bio}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {profileData.bio.length}/150 caracteres - Conte um pouco sobre você, seus objetivos ou o que te motiva
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Seu Badge</h2>
              <p className="text-muted-foreground">Você começará com o badge "Iniciante"</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    Iniciante
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Badge padrão para novos usuários
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Você poderá desbloquear novos badges conforme progride no app!
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Pronto para começar!</h3>
                <p className="text-sm text-muted-foreground">
                  Você começará no <strong>Nível 1</strong> com <strong>0 XP</strong>. 
                  Complete tarefas para ganhar experiência e subir de nível!
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Configurar Perfil</h1>
          <p className="text-muted-foreground">
            Complete seu perfil para começar a usar o TaskFlow
          </p>
          
          {/* Aviso importante */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Importante:</strong> Todos os campos marcados com * são obrigatórios. 
              Preencha com informações reais e completas para uma melhor experiência.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    i + 1 < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">
              Passo {currentStep} de {totalSteps}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <Separator className="my-6" />

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-3">
                {/* Indicador de validação */}
                {currentStep === 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${profileData.name.trim() && profileData.name.trim().split(' ').length >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-muted-foreground">Nome completo</span>
                    <div className={`w-2 h-2 rounded-full ${profileData.dateOfBirth ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-muted-foreground">Data de nascimento</span>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${profileData.title ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-muted-foreground">Profissão</span>
                    <div className={`w-2 h-2 rounded-full ${profileData.bio.trim().length >= 10 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-muted-foreground">Biografia</span>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  disabled={loading || 
                    (currentStep === 1 && (!profileData.name.trim() || !profileData.dateOfBirth)) ||
                    (currentStep === 2 && (!profileData.title || !profileData.bio.trim()))
                  }
                  className="min-w-[100px]"
                >
                  {loading ? "Salvando..." : currentStep === totalSteps ? "Finalizar" : "Próximo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Você pode alterar essas informações a qualquer momento nas configurações
          </p>
        </div>
      </div>
    </div>
  )
}