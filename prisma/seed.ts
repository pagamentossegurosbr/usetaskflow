import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Achievements padrão baseados no sistema de produtividade
const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first_task',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira tarefa',
    icon: '🎯',
    xpReward: 25,
    requirement: { type: 'tasks_completed', value: 1 },
  },
  {
    id: 'productive_day',
    name: 'Dia Produtivo',
    description: 'Complete 5 tarefas em um dia',
    icon: '⚡',
    xpReward: 50,
    requirement: { type: 'daily_tasks', value: 5 },
  },
  {
    id: 'week_warrior',
    name: 'Guerreiro da Semana',
    description: 'Complete tarefas por 7 dias consecutivos',
    icon: '🔥',
    xpReward: 100,
    requirement: { type: 'consecutive_days', value: 7 },
  },
  {
    id: 'priority_master',
    name: 'Mestre das Prioridades',
    description: 'Complete 10 tarefas prioritárias',
    icon: '⭐',
    xpReward: 75,
    requirement: { type: 'priority_tasks', value: 10 },
  },
  {
    id: 'speed_demon',
    name: 'Demônio da Velocidade',
    description: 'Complete 5 tarefas antes das 9h da manhã',
    icon: '🌅',
    xpReward: 50,
    requirement: { type: 'early_tasks', value: 5 },
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Complete 3 tarefas após as 22h',
    icon: '🦉',
    xpReward: 40,
    requirement: { type: 'late_tasks', value: 3 },
  },
  {
    id: 'morning_person',
    name: 'Pessoa da Manhã',
    description: 'Complete 10 tarefas entre 6h e 12h',
    icon: '☀️',
    xpReward: 60,
    requirement: { type: 'morning_tasks', value: 10 },
  },
  {
    id: 'afternoon_worker',
    name: 'Trabalhador da Tarde',
    description: 'Complete 10 tarefas entre 12h e 18h',
    icon: '🌤️',
    xpReward: 60,
    requirement: { type: 'afternoon_tasks', value: 10 },
  },
  {
    id: 'evening_achiever',
    name: 'Conquistador da Noite',
    description: 'Complete 10 tarefas entre 18h e 22h',
    icon: '🌙',
    xpReward: 60,
    requirement: { type: 'evening_tasks', value: 10 },
  },
  {
    id: 'task_creator',
    name: 'Criador de Tarefas',
    description: 'Crie 50 tarefas no total',
    icon: '📝',
    xpReward: 75,
    requirement: { type: 'total_tasks_created', value: 50 },
  },
  {
    id: 'completion_master',
    name: 'Mestre da Conclusão',
    description: 'Complete 100 tarefas no total',
    icon: '✅',
    xpReward: 150,
    requirement: { type: 'total_tasks_completed', value: 100 },
  },
  {
    id: 'xp_collector',
    name: 'Coletor de XP',
    description: 'Acumule 1000 XP no total',
    icon: '💎',
    xpReward: 200,
    requirement: { type: 'total_xp', value: 1000 },
  },
  {
    id: 'level_5_reached',
    name: 'Nível 5 Alcançado',
    description: 'Alcance o nível 5',
    icon: '🏆',
    xpReward: 100,
    requirement: { type: 'level', value: 5 },
  },
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário administrador padrão
  const adminEmail = 'admin@taskflow.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'OWNER',
        level: 10,
        xp: 1000,
        isActive: true,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        maxLevel: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Usuário administrador criado')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Senha: admin123')
  } else {
    console.log('✅ Usuário administrador já existe')
  }

  // Criar achievements padrão
  console.log('🏆 Criando achievements padrão...')
  
  for (const achievementData of DEFAULT_ACHIEVEMENTS) {
    const existingAchievement = await prisma.achievement.findUnique({
      where: { id: achievementData.id }
    })

    if (!existingAchievement) {
      await prisma.achievement.create({
        data: {
          id: achievementData.id,
          name: achievementData.name,
          description: achievementData.description,
          icon: achievementData.icon,
          xpReward: achievementData.xpReward,
          requirement: achievementData.requirement,
        }
      })
      console.log(`✅ Achievement criado: ${achievementData.name}`)
    } else {
      console.log(`✅ Achievement já existe: ${achievementData.name}`)
    }
  }

  // Criar XP Levels padrão
  const xpLevels = [
    { level: 1, xpRequired: 0, title: 'Iniciante', description: 'Começando sua jornada', badge: '🌱', color: '#10b981' },
    { level: 2, xpRequired: 100, title: 'Praticante', description: 'Desenvolvendo hábitos', badge: '📚', color: '#3b82f6' },
    { level: 3, xpRequired: 250, title: 'Constante', description: 'Mantendo consistência', badge: '🔥', color: '#f59e0b' },
    { level: 4, xpRequired: 450, title: 'Comprometido', description: 'Focado nos objetivos', badge: '⚡', color: '#8b5cf6' },
    { level: 5, xpRequired: 700, title: 'Disciplinado', description: 'Hábitos sólidos', badge: '🎯', color: '#ef4444' },
    { level: 6, xpRequired: 1000, title: 'Produtivo', description: 'Alta produtividade', badge: '🚀', color: '#06b6d4' },
    { level: 7, xpRequired: 1350, title: 'Focado', description: 'Concentração total', badge: '🎪', color: '#84cc16' },
    { level: 8, xpRequired: 1750, title: 'Autônomo', description: 'Independência total', badge: '👑', color: '#f97316' },
    { level: 9, xpRequired: 2200, title: 'Alta Performance', description: 'Excelência em tudo', badge: '💎', color: '#ec4899' },
    { level: 10, xpRequired: 2700, title: 'Mestre da Produtividade', description: 'Mestre absoluto', badge: '🏆', color: '#6366f1' },
    { level: 11, xpRequired: 3300, title: 'Lenda', description: 'Lendário', badge: '🌟', color: '#fbbf24' },
    { level: 12, xpRequired: 4000, title: 'Mito', description: 'Mítico', badge: '💫', color: '#a855f7' },
    { level: 13, xpRequired: 4800, title: 'Deus da Produtividade', description: 'Divino', badge: '⚡', color: '#f59e0b' },
    { level: 14, xpRequired: 5700, title: 'Supremo', description: 'Supremo', badge: '👑', color: '#ef4444' },
    { level: 15, xpRequired: 6700, title: 'Infinito', description: 'Infinito', badge: '∞', color: '#000000' }
  ];

  for (const xpLevel of xpLevels) {
    await prisma.xPLevel.upsert({
      where: { level: xpLevel.level },
      update: xpLevel,
      create: xpLevel
    });
  }

  console.log('✅ XP Levels criados/atualizados');

  // Criar configuração de suporte padrão
  await prisma.settings.upsert({
    where: { key: 'support_config' },
    update: {
      value: {
        whatsappNumber: '+55 11 98900-2458',
        supportEmail: 'suporte@taskflow.com',
        supportEnabled: true,
        lastModified: Date.now()
      }
    },
    create: {
      key: 'support_config',
      value: {
        whatsappNumber: '+55 11 98900-2458',
        supportEmail: 'suporte@taskflow.com',
        supportEnabled: true,
        lastModified: Date.now()
      }
    }
  });

  console.log('✅ Configuração de suporte criada/atualizada');

  // Criar alguns posts de exemplo para o blog
  const samplePosts = [
    {
      title: 'Como aumentar sua produtividade em 300%',
      slug: 'como-aumentar-produtividade-300',
      content: `
        <h2>Introdução</h2>
        <p>A produtividade não é apenas sobre trabalhar mais horas, mas sim sobre trabalhar de forma mais inteligente. Neste guia completo, você descobrirá técnicas comprovadas que transformaram a vida de milhares de pessoas e podem transformar a sua também.</p>
        
        <h2>1. O Poder da Priorização</h2>
        <p>A primeira regra da produtividade é saber o que realmente importa. Muitas pessoas passam o dia inteiro ocupadas, mas não necessariamente produtivas. A diferença está na priorização.</p>
        
        <h3>Método Eisenhower</h3>
        <p>Divida suas tarefas em quatro categorias:</p>
        <ul>
          <li><strong>Urgente e Importante:</strong> Faça imediatamente</li>
          <li><strong>Importante, mas não urgente:</strong> Agende para depois</li>
          <li><strong>Urgente, mas não importante:</strong> Delega</li>
          <li><strong>Nem urgente, nem importante:</strong> Elimine</li>
        </ul>
        
        <h2>2. Técnica Pomodoro</h2>
        <p>A técnica Pomodoro é uma das ferramentas mais eficazes para manter o foco e evitar a procrastinação. Funciona assim:</p>
        <ol>
          <li>Trabalhe por 25 minutos sem interrupções</li>
          <li>Faça uma pausa de 5 minutos</li>
          <li>Após 4 ciclos, faça uma pausa maior de 15-30 minutos</li>
        </ol>
        
        <h2>3. Elimine Distrações</h2>
        <p>As distrações são o maior inimigo da produtividade. Aqui estão algumas estratégias:</p>
        <ul>
          <li>Desative notificações do celular</li>
          <li>Use o modo "não perturbe"</li>
          <li>Organize seu ambiente de trabalho</li>
          <li>Use fones de ouvido com cancelamento de ruído</li>
        </ul>
        
        <h2>4. Automatize Tarefas Repetitivas</h2>
        <p>Identifique tarefas que você faz repetidamente e automatize-as. Isso pode incluir:</p>
        <ul>
          <li>Respostas de email automáticas</li>
          <li>Backup automático de arquivos</li>
          <li>Agendamento de posts em redes sociais</li>
          <li>Relatórios automáticos</li>
        </ul>
        
        <h2>5. Aprenda a Dizer Não</h2>
        <p>Uma das habilidades mais importantes para aumentar a produtividade é saber dizer não. Não aceite compromissos que não estão alinhados com seus objetivos principais.</p>
        
        <h2>Conclusão</h2>
        <p>Aumentar sua produtividade em 300% não é uma tarefa impossível. Com as técnicas certas e consistência, você pode transformar completamente sua forma de trabalhar e viver.</p>
        
        <p>Lembre-se: a produtividade é um hábito que se desenvolve com o tempo. Comece implementando uma técnica por vez e veja os resultados aparecerem gradualmente.</p>
      `,
      excerpt: 'Descubra técnicas comprovadas que transformaram a vida de milhares de pessoas e podem transformar a sua também.',
      category: 'Produtividade',
      tags: ['produtividade', 'foco', 'organização', 'técnicas', 'eficiência'],
      status: 'published',
      seoTitle: 'Como Aumentar Produtividade em 300% - Guia Completo',
      seoDescription: 'Aprenda técnicas comprovadas para aumentar sua produtividade e alcançar seus objetivos mais rapidamente.',
      seoKeywords: 'produtividade, foco, organização, eficiência, hábitos'
    },
    {
      title: 'O Poder do Modo Caverna para Foco Profundo',
      slug: 'poder-modo-caverna-foco-profundo',
      content: `
        <h2>O que é o Modo Caverna?</h2>
        <p>O Modo Caverna é uma técnica de produtividade inspirada na ideia de que, para alcançar resultados extraordinários, você precisa se isolar das distrações do mundo exterior e mergulhar em um estado de foco profundo.</p>
        
        <h2>Por que Funciona?</h2>
        <p>Nosso cérebro é projetado para se distrair facilmente. Cada notificação, cada interrupção, cada mudança de contexto custa energia mental e tempo. O Modo Caverna elimina essas distrações, permitindo que você atinja um estado de fluxo.</p>
        
        <h3>Benefícios do Modo Caverna</h3>
        <ul>
          <li><strong>Foco Profundo:</strong> Capacidade de trabalhar por horas sem distrações</li>
          <li><strong>Maior Qualidade:</strong> Trabalho mais refinado e pensado</li>
          <li><strong>Menos Estresse:</strong> Redução da sobrecarga de informações</li>
          <li><strong>Resultados Superiores:</strong> Produtividade exponencialmente maior</li>
        </ul>
        
        <h2>Como Implementar o Modo Caverna</h2>
        
        <h3>1. Prepare seu Ambiente</h3>
        <p>Transforme seu espaço de trabalho em uma "caverna" de produtividade:</p>
        <ul>
          <li>Elimine distrações visuais</li>
          <li>Use iluminação adequada</li>
          <li>Organize suas ferramentas</li>
          <li>Tenha água e lanches saudáveis por perto</li>
        </ul>
        
        <h3>2. Configure Notificações</h3>
        <p>Durante o Modo Caverna, você deve:</p>
        <ul>
          <li>Desativar todas as notificações</li>
          <li>Colocar o celular em modo avião</li>
          <li>Fechar abas desnecessárias do navegador</li>
          <li>Usar aplicativos de bloqueio de distrações</li>
        </ul>
        
        <h3>3. Defina Sessões de Trabalho</h3>
        <p>O Modo Caverna funciona melhor em sessões de 2-4 horas. Durante esse tempo:</p>
        <ul>
          <li>Foque em uma única tarefa</li>
          <li>Evite mudanças de contexto</li>
          <li>Mantenha um ritmo constante</li>
          <li>Não verifique emails ou mensagens</li>
        </ul>
        
        <h2>Ferramentas para o Modo Caverna</h2>
        <p>Algumas ferramentas que podem ajudar:</p>
        <ul>
          <li><strong>TaskFlow:</strong> Para gerenciar tarefas sem distrações</li>
          <li><strong>Forest:</strong> Para bloquear distrações</li>
          <li><strong>Freedom:</strong> Para bloquear sites e aplicativos</li>
          <li><strong>Noisli:</strong> Para sons ambientes focados</li>
        </ul>
        
        <h2>Resultados Esperados</h2>
        <p>Com o Modo Caverna, você pode esperar:</p>
        <ul>
          <li>2-3x mais produtividade</li>
          <li>Maior qualidade no trabalho</li>
          <li>Menos estresse e ansiedade</li>
          <li>Mais satisfação com o trabalho realizado</li>
        </ul>
        
        <h2>Conclusão</h2>
        <p>O Modo Caverna não é apenas uma técnica de produtividade, é uma filosofia de vida. Quando você se compromete com o foco profundo, você se compromete com a excelência.</p>
        
        <p>Experimente o Modo Caverna hoje mesmo e descubra o poder do foco ininterrupto.</p>
      `,
      excerpt: 'Aprenda como o Modo Caverna pode revolucionar sua capacidade de concentração e transformar sua produtividade.',
      category: 'Foco',
      tags: ['foco', 'modo caverna', 'concentração', 'produtividade', 'deep work'],
      status: 'published',
      seoTitle: 'Modo Caverna: Como Atingir Foco Profundo',
      seoDescription: 'Descubra como o Modo Caverna pode transformar sua capacidade de concentração e produtividade.',
      seoKeywords: 'foco, concentração, modo caverna, produtividade, deep work'
    },
    {
      title: 'Sistema de Níveis XP: Como Funciona',
      slug: 'sistema-niveis-xp-como-funciona',
      content: `
        <h2>O que é o Sistema de Níveis XP?</h2>
        <p>O sistema de níveis XP (Experience Points) é uma técnica de gamificação que transforma tarefas cotidianas em uma jornada de progresso e conquistas. Em vez de apenas completar tarefas, você ganha experiência e sobe de nível.</p>
        
        <h2>Como Funciona?</h2>
        <p>Cada tarefa que você completa no TaskFlow gera pontos de experiência. Esses pontos se acumulam e, quando você atinge um certo limite, você sobe de nível. Cada nível traz novos benefícios e desafios.</p>
        
        <h3>Ganho de XP</h3>
        <ul>
          <li><strong>Tarefas Simples:</strong> 10-50 XP</li>
          <li><strong>Tarefas Médias:</strong> 50-100 XP</li>
          <li><strong>Tarefas Complexas:</strong> 100-200 XP</li>
          <li><strong>Hábitos Diários:</strong> 25 XP por dia</li>
          <li><strong>Sessões Pomodoro:</strong> 15 XP por sessão</li>
        </ul>
        
        <h2>Níveis e Benefícios</h2>
        
        <h3>Nível 1-5: Iniciante</h3>
        <p>Nestes níveis, você está aprendendo os fundamentos da produtividade. Benefícios incluem:</p>
        <ul>
          <li>Acesso a ferramentas básicas</li>
          <li>Badges de conquista</li>
          <li>Estatísticas básicas</li>
        </ul>
        
        <h3>Nível 6-10: Intermediário</h3>
        <p>Você já tem uma base sólida. Agora ganha acesso a:</p>
        <ul>
          <li>Modo Caverna</li>
          <li>Relatórios avançados</li>
          <li>Personalização de temas</li>
        </ul>
        
        <h3>Nível 11+: Avançado</h3>
        <p>Você é um mestre da produtividade. Benefícios exclusivos:</p>
        <ul>
          <li>Recursos premium</li>
          <li>Mentoria personalizada</li>
          <li>Acesso antecipado a novos recursos</li>
        </ul>
        
        <h2>Estratégias para Maximizar XP</h2>
        
        <h3>1. Consistência é Chave</h3>
        <p>Completar tarefas regularmente é mais eficiente do que fazer muitas de uma vez. O sistema recompensa a consistência.</p>
        
        <h3>2. Diversifique suas Atividades</h3>
        <p>Não foque apenas em um tipo de tarefa. Misture tarefas simples, médias e complexas para maximizar o ganho de XP.</p>
        
        <h3>3. Use o Modo Caverna</h3>
        <p>Sessões de foco profundo geram XP bônus e ajudam você a subir de nível mais rapidamente.</p>
        
        <h3>4. Mantenha Hábitos</h3>
        <p>Hábitos diários são uma fonte constante de XP. Crie hábitos que se alinhem com seus objetivos.</p>
        
        <h2>Psicologia por Trás do Sistema</h2>
        <p>O sistema de níveis XP funciona porque:</p>
        <ul>
          <li><strong>Feedback Imediato:</strong> Você vê o progresso instantaneamente</li>
          <li><strong>Progressão Clara:</strong> Sempre há um próximo objetivo</li>
          <li><strong>Recompensas:</strong> Cada nível traz novos benefícios</li>
          <li><strong>Comunidade:</strong> Compartilhe conquistas com outros usuários</li>
        </ul>
        
        <h2>Conclusão</h2>
        <p>O sistema de níveis XP transforma a produtividade em uma jornada emocionante. Em vez de apenas completar tarefas, você está construindo uma versão melhor de si mesmo, um nível de cada vez.</p>
        
        <p>Comece sua jornada hoje mesmo e descubra como é gratificante ver seu progresso em números.</p>
      `,
      excerpt: 'Entenda como o sistema de gamificação pode motivar você a alcançar seus objetivos e transformar sua produtividade.',
      category: 'Gamificação',
      tags: ['xp', 'níveis', 'gamificação', 'produtividade', 'motivação'],
      status: 'published',
      seoTitle: 'Sistema de Níveis XP: Como Funciona',
      seoDescription: 'Entenda como o sistema de gamificação pode motivar você a alcançar seus objetivos e transformar sua produtividade.',
      seoKeywords: 'xp, níveis, gamificação, produtividade, motivação, recompensas'
    }
  ];

  // Buscar um usuário para ser autor dos posts
  const user = await prisma.user.findFirst();
  
  if (user) {
    for (const post of samplePosts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: post,
        create: {
          ...post,
          authorId: user.id,
          publishedAt: new Date()
        }
      });
    }
    console.log('✅ Posts de exemplo criados/atualizados');
  }

  // Criar conteúdo de exemplo para a caverna
  const caveContent = [
    {
      title: 'Música para Foco Profundo',
      description: 'Playlist com músicas instrumentais para maximizar sua concentração',
      type: 'playlist',
      category: 'música',
      url: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      duration: 3600,
      isActive: true,
      order: 1
    },
    {
      title: 'Sons da Natureza',
      description: 'Sons ambientes da natureza para relaxamento e foco',
      type: 'ambient',
      category: 'sons',
      url: 'https://www.youtube.com/watch?v=q76bMs-NwRk',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      duration: 7200,
      isActive: true,
      order: 2
    },
    {
      title: 'Técnicas de Respiração',
      description: 'Guia completo de técnicas de respiração para foco e relaxamento',
      type: 'article',
      category: 'bem-estar',
      url: 'https://example.com/respiracao',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      duration: 900,
      isActive: true,
      order: 3
    }
  ];

  for (const content of caveContent) {
    // Verificar se já existe conteúdo com mesmo título e tipo
    const existing = await prisma.caveContent.findFirst({
      where: {
        title: content.title,
        type: content.type
      }
    });

    if (existing) {
      await prisma.caveContent.update({
        where: { id: existing.id },
        data: content
      });
    } else {
      await prisma.caveContent.create({
        data: content
      });
    }
  }

  console.log('✅ Conteúdo da caverna criado/atualizado');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })