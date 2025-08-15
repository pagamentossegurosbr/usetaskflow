export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    tasks: string;
    habits: string;
    readingLibrary: string;
    pomodoro: string;
    achievements: string;
    progress: string;
    caveMode: string;
    blog: string;
    settings: string;
    projectPlanner: string;
  };

  // Common
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    view: string;
    hide: string;
    show: string;
    all: string;
    none: string;
    select: string;
    choose: string;
    create: string;
    update: string;
    remove: string;
    copy: string;
    share: string;
    download: string;
    upload: string;
    export: string;
    import: string;
    refresh: string;
    retry: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };

  // Tasks
  tasks: {
    title: string;
    description: string;
    addTask: string;
    editTask: string;
    deleteTask: string;
    completeTask: string;
    incompleteTask: string;
    priority: string;
    deadline: string;
    category: string;
    tags: string;
    estimatedTime: string;
    reward: string;
    pending: string;
    completed: string;
    allTasks: string;
    deleteAllTasks: string;
    confirmDeleteAll: string;
    taskDetails: string;
    startPomodoro: string;
    low: string;
    medium: string;
    high: string;
    minutes: string;
    hours: string;
    days: string;
    created: string;
    completedAt: string;
    dueDate: string;
    noDeadline: string;
    noCategory: string;
    noTags: string;
    noReward: string;
    taskCompleted: string;
    taskUncompleted: string;
    xpGained: string;
    xpRemoved: string;
  };

  // Habits
  habits: {
    title: string;
    addHabit: string;
    editHabit: string;
    deleteHabit: string;
    trackHabit: string;
    habitName: string;
    habitDescription: string;
    frequency: string;
    daily: string;
    weekly: string;
    monthly: string;
    goal: string;
    streak: string;
    currentStreak: string;
    longestStreak: string;
    totalCompletions: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
    lastWeek: string;
    lastMonth: string;
  };

  // Pomodoro
  pomodoro: {
    title: string;
    start: string;
    pause: string;
    reset: string;
    work: string;
    break: string;
    longBreak: string;
    workTime: string;
    breakTime: string;
    longBreakTime: string;
    sessions: string;
    completedSessions: string;
    focusTime: string;
    totalBreaks: string;
    productivity: string;
    startSession: string;
    endSession: string;
    sessionCompleted: string;
    breakStarted: string;
    workStarted: string;
  };

  // Achievements
  achievements: {
    title: string;
    unlocked: string;
    locked: string;
    progress: string;
    description: string;
    requirements: string;
    xpReward: string;
    levelUp: string;
    congratulations: string;
    newAchievement: string;
    totalAchievements: string;
    completionRate: string;
  };

  // Progress
  progress: {
    title: string;
    level: string;
    experience: string;
    currentLevel: string;
    nextLevel: string;
    xpNeeded: string;
    totalXP: string;
    productivity: string;
    focus: string;
    consistency: string;
    weekly: string;
    monthly: string;
    yearly: string;
    allTime: string;
    tasksCompleted: string;
    xpGained: string;
    bestDay: string;
    bestHour: string;
    streak: string;
    averageTasks: string;
    completionRate: string;
  };

  // Cave Mode
  caveMode: {
    title: string;
    description: string;
    enterCave: string;
    exitCave: string;
    focusMode: string;
    deepWork: string;
    ambientSounds: string;
    playlists: string;
    articles: string;
    videos: string;
    music: string;
    nature: string;
    rain: string;
    ocean: string;
    forest: string;
    whiteNoise: string;
    lofi: string;
    classical: string;
    productivity: string;
    motivation: string;
    learning: string;
    currentSession: string;
    sessionTime: string;
    breakTime: string;
    totalFocus: string;
  };

  // Blog
  blog: {
    title: string;
    readMore: string;
    published: string;
    author: string;
    category: string;
    tags: string;
    relatedPosts: string;
    popularPosts: string;
    latestPosts: string;
    searchPosts: string;
    noPostsFound: string;
    loadingPosts: string;
    sharePost: string;
    bookmark: string;
    comment: string;
    comments: string;
    leaveComment: string;
    subscribe: string;
    newsletter: string;
  };

  // Settings
  settings: {
    title: string;
    profile: string;
    account: string;
    preferences: string;
    notifications: string;
    privacy: string;
    security: string;
    language: string;
    theme: string;
    darkMode: string;
    lightMode: string;
    autoMode: string;
    sound: string;
    volume: string;
    notifications: string;
    emailNotifications: string;
    pushNotifications: string;
    dataExport: string;
    dataImport: string;
    deleteAccount: string;
    logout: string;
    saveChanges: string;
    resetSettings: string;
  };

  // Admin
  admin: {
    title: string;
    dashboard: string;
    users: string;
    content: string;
    settings: string;
    analytics: string;
    reports: string;
    xpLevels: string;
    caveContent: string;
    blogPosts: string;
    inviteLinks: string;
    systemSettings: string;
    userManagement: string;
    contentManagement: string;
    levelConfiguration: string;
    contentCreation: string;
    statistics: string;
    moderation: string;
  };
}

const translations: Record<Language, Translations> = {
  pt: {
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tarefas',
      habits: 'Hábitos',
      readingLibrary: 'Biblioteca',
      pomodoro: 'Pomodoro',
      achievements: 'Conquistas',
      progress: 'Progresso',
      caveMode: 'Modo Caverna',
      blog: 'Blog',
      settings: 'Configurações',
      projectPlanner: 'Planejador de Projetos'
    },
    common: {
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      close: 'Fechar',
      confirm: 'Confirmar',
      yes: 'Sim',
      no: 'Não',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      search: 'Pesquisar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Ver',
      hide: 'Ocultar',
      show: 'Mostrar',
      all: 'Todos',
      none: 'Nenhum',
      select: 'Selecionar',
      choose: 'Escolher',
      create: 'Criar',
      update: 'Atualizar',
      remove: 'Remover',
      copy: 'Copiar',
      share: 'Compartilhar',
      download: 'Baixar',
      upload: 'Enviar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Atualizar',
      retry: 'Tentar novamente',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação'
    },
    tasks: {
      title: 'Tarefas',
      description: 'Descrição',
      addTask: 'Adicionar Tarefa',
      editTask: 'Editar Tarefa',
      deleteTask: 'Excluir Tarefa',
      completeTask: 'Completar Tarefa',
      incompleteTask: 'Desmarcar Tarefa',
      priority: 'Prioridade',
      deadline: 'Prazo',
      category: 'Categoria',
      tags: 'Tags',
      estimatedTime: 'Tempo Estimado',
      reward: 'Recompensa',
      pending: 'Pendentes',
      completed: 'Concluídas',
      allTasks: 'Todas as Tarefas',
      deleteAllTasks: 'Excluir Todas',
      confirmDeleteAll: 'Tem certeza que deseja excluir todas as tarefas?',
      taskDetails: 'Detalhes da Tarefa',
      startPomodoro: 'Iniciar Pomodoro',
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      minutes: 'minutos',
      hours: 'horas',
      days: 'dias',
      created: 'Criada',
      completedAt: 'Concluída em',
      dueDate: 'Data de Vencimento',
      noDeadline: 'Sem prazo',
      noCategory: 'Sem categoria',
      noTags: 'Sem tags',
      noReward: 'Sem recompensa',
      taskCompleted: 'Tarefa completada!',
      taskUncompleted: 'Tarefa desmarcada',
      xpGained: 'XP ganho',
      xpRemoved: 'XP removido'
    },
    habits: {
      title: 'Hábitos',
      addHabit: 'Adicionar Hábito',
      editHabit: 'Editar Hábito',
      deleteHabit: 'Excluir Hábito',
      trackHabit: 'Rastrear Hábito',
      habitName: 'Nome do Hábito',
      habitDescription: 'Descrição do Hábito',
      frequency: 'Frequência',
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      goal: 'Meta',
      streak: 'Sequência',
      currentStreak: 'Sequência Atual',
      longestStreak: 'Maior Sequência',
      totalCompletions: 'Total de Completos',
      today: 'Hoje',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mês',
      lastWeek: 'Semana Passada',
      lastMonth: 'Mês Passado'
    },
    pomodoro: {
      title: 'Pomodoro',
      start: 'Iniciar',
      pause: 'Pausar',
      reset: 'Resetar',
      work: 'Trabalho',
      break: 'Pausa',
      longBreak: 'Pausa Longa',
      workTime: 'Tempo de Trabalho',
      breakTime: 'Tempo de Pausa',
      longBreakTime: 'Tempo de Pausa Longa',
      sessions: 'Sessões',
      completedSessions: 'Sessões Completadas',
      focusTime: 'Tempo de Foco',
      totalBreaks: 'Total de Pausas',
      productivity: 'Produtividade',
      startSession: 'Iniciar Sessão',
      endSession: 'Finalizar Sessão',
      sessionCompleted: 'Sessão completada!',
      breakStarted: 'Pausa iniciada',
      workStarted: 'Trabalho iniciado'
    },
    achievements: {
      title: 'Conquistas',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
      progress: 'Progresso',
      description: 'Descrição',
      requirements: 'Requisitos',
      xpReward: 'Recompensa XP',
      levelUp: 'Subiu de Nível!',
      congratulations: 'Parabéns!',
      newAchievement: 'Nova Conquista!',
      totalAchievements: 'Total de Conquistas',
      completionRate: 'Taxa de Conclusão'
    },
    progress: {
      title: 'Progresso',
      level: 'Nível',
      experience: 'Experiência',
      currentLevel: 'Nível Atual',
      nextLevel: 'Próximo Nível',
      xpNeeded: 'XP Necessário',
      totalXP: 'XP Total',
      productivity: 'Produtividade',
      focus: 'Foco',
      consistency: 'Consistência',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
      allTime: 'Todo Período',
      tasksCompleted: 'Tarefas Completadas',
      xpGained: 'XP Ganho',
      bestDay: 'Melhor Dia',
      bestHour: 'Melhor Hora',
      streak: 'Sequência',
      averageTasks: 'Média de Tarefas',
      completionRate: 'Taxa de Conclusão'
    },
    caveMode: {
      title: 'Modo Caverna',
      description: 'Foque no que realmente importa',
      enterCave: 'Entrar na Caverna',
      exitCave: 'Sair da Caverna',
      focusMode: 'Modo Foco',
      deepWork: 'Trabalho Profundo',
      ambientSounds: 'Sons Ambientes',
      playlists: 'Playlists',
      articles: 'Artigos',
      videos: 'Vídeos',
      music: 'Música',
      nature: 'Natureza',
      rain: 'Chuva',
      ocean: 'Oceano',
      forest: 'Floresta',
      whiteNoise: 'Ruído Branco',
      lofi: 'Lo-Fi',
      classical: 'Clássica',
      productivity: 'Produtividade',
      motivation: 'Motivação',
      learning: 'Aprendizado',
      currentSession: 'Sessão Atual',
      sessionTime: 'Tempo da Sessão',
      breakTime: 'Tempo de Pausa',
      totalFocus: 'Foco Total'
    },
    blog: {
      title: 'Blog',
      readMore: 'Ler Mais',
      published: 'Publicado',
      author: 'Autor',
      category: 'Categoria',
      tags: 'Tags',
      relatedPosts: 'Posts Relacionados',
      popularPosts: 'Posts Populares',
      latestPosts: 'Últimos Posts',
      searchPosts: 'Pesquisar Posts',
      noPostsFound: 'Nenhum post encontrado',
      loadingPosts: 'Carregando posts...',
      sharePost: 'Compartilhar Post',
      bookmark: 'Favoritar',
      comment: 'Comentar',
      comments: 'Comentários',
      leaveComment: 'Deixar Comentário',
      subscribe: 'Inscrever-se',
      newsletter: 'Newsletter'
    },
    settings: {
      title: 'Configurações',
      profile: 'Perfil',
      account: 'Conta',
      preferences: 'Preferências',
      notifications: 'Notificações',
      privacy: 'Privacidade',
      security: 'Segurança',
      language: 'Idioma',
      theme: 'Tema',
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      autoMode: 'Modo Automático',
      sound: 'Som',
      volume: 'Volume',
      emailNotifications: 'Notificações por Email',
      pushNotifications: 'Notificações Push',
      dataExport: 'Exportar Dados',
      dataImport: 'Importar Dados',
      deleteAccount: 'Excluir Conta',
      logout: 'Sair',
      saveChanges: 'Salvar Alterações',
      resetSettings: 'Resetar Configurações'
    },
    admin: {
      title: 'Admin',
      dashboard: 'Dashboard',
      users: 'Usuários',
      content: 'Conteúdo',
      settings: 'Configurações',
      analytics: 'Analytics',
      reports: 'Relatórios',
      xpLevels: 'Níveis XP',
      caveContent: 'Conteúdo Caverna',
      blogPosts: 'Posts do Blog',
      inviteLinks: 'Links de Convite',
      systemSettings: 'Configurações do Sistema',
      userManagement: 'Gerenciamento de Usuários',
      contentManagement: 'Gerenciamento de Conteúdo',
      levelConfiguration: 'Configuração de Níveis',
      contentCreation: 'Criação de Conteúdo',
      statistics: 'Estatísticas',
      moderation: 'Moderação'
    }
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      habits: 'Habits',
      readingLibrary: 'Library',
      pomodoro: 'Pomodoro',
      achievements: 'Achievements',
      progress: 'Progress',
      caveMode: 'Cave Mode',
      blog: 'Blog',
      settings: 'Settings',
      projectPlanner: 'Project Planner'
    },
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      hide: 'Hide',
      show: 'Show',
      all: 'All',
      none: 'None',
      select: 'Select',
      choose: 'Choose',
      create: 'Create',
      update: 'Update',
      remove: 'Remove',
      copy: 'Copy',
      share: 'Share',
      download: 'Download',
      upload: 'Upload',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      retry: 'Retry',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
    },
    tasks: {
      title: 'Tasks',
      description: 'Description',
      addTask: 'Add Task',
      editTask: 'Edit Task',
      deleteTask: 'Delete Task',
      completeTask: 'Complete Task',
      incompleteTask: 'Uncomplete Task',
      priority: 'Priority',
      deadline: 'Deadline',
      category: 'Category',
      tags: 'Tags',
      estimatedTime: 'Estimated Time',
      reward: 'Reward',
      pending: 'Pending',
      completed: 'Completed',
      allTasks: 'All Tasks',
      deleteAllTasks: 'Delete All Tasks',
      confirmDeleteAll: 'Are you sure you want to delete all tasks?',
      taskDetails: 'Task Details',
      startPomodoro: 'Start Pomodoro',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      created: 'Created',
      completedAt: 'Completed at',
      dueDate: 'Due Date',
      noDeadline: 'No deadline',
      noCategory: 'No category',
      noTags: 'No tags',
      noReward: 'No reward',
      taskCompleted: 'Task completed!',
      taskUncompleted: 'Task uncompleted',
      xpGained: 'XP gained',
      xpRemoved: 'XP removed'
    },
    habits: {
      title: 'Habits',
      addHabit: 'Add Habit',
      editHabit: 'Edit Habit',
      deleteHabit: 'Delete Habit',
      trackHabit: 'Track Habit',
      habitName: 'Habit Name',
      habitDescription: 'Habit Description',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      goal: 'Goal',
      streak: 'Streak',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      totalCompletions: 'Total Completions',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month'
    },
    pomodoro: {
      title: 'Pomodoro',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      work: 'Work',
      break: 'Break',
      longBreak: 'Long Break',
      workTime: 'Work Time',
      breakTime: 'Break Time',
      longBreakTime: 'Long Break Time',
      sessions: 'Sessions',
      completedSessions: 'Completed Sessions',
      focusTime: 'Focus Time',
      totalBreaks: 'Total Breaks',
      productivity: 'Productivity',
      startSession: 'Start Session',
      endSession: 'End Session',
      sessionCompleted: 'Session completed!',
      breakStarted: 'Break started',
      workStarted: 'Work started'
    },
    achievements: {
      title: 'Achievements',
      unlocked: 'Unlocked',
      locked: 'Locked',
      progress: 'Progress',
      description: 'Description',
      requirements: 'Requirements',
      xpReward: 'XP Reward',
      levelUp: 'Level Up!',
      congratulations: 'Congratulations!',
      newAchievement: 'New Achievement!',
      totalAchievements: 'Total Achievements',
      completionRate: 'Completion Rate'
    },
    progress: {
      title: 'Progress',
      level: 'Level',
      experience: 'Experience',
      currentLevel: 'Current Level',
      nextLevel: 'Next Level',
      xpNeeded: 'XP Needed',
      totalXP: 'Total XP',
      productivity: 'Productivity',
      focus: 'Focus',
      consistency: 'Consistency',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      allTime: 'All Time',
      tasksCompleted: 'Tasks Completed',
      xpGained: 'XP Gained',
      bestDay: 'Best Day',
      bestHour: 'Best Hour',
      streak: 'Streak',
      averageTasks: 'Average Tasks',
      completionRate: 'Completion Rate'
    },
    caveMode: {
      title: 'Cave Mode',
      description: 'Focus on what really matters',
      enterCave: 'Enter Cave',
      exitCave: 'Exit Cave',
      focusMode: 'Focus Mode',
      deepWork: 'Deep Work',
      ambientSounds: 'Ambient Sounds',
      playlists: 'Playlists',
      articles: 'Articles',
      videos: 'Videos',
      music: 'Music',
      nature: 'Nature',
      rain: 'Rain',
      ocean: 'Ocean',
      forest: 'Forest',
      whiteNoise: 'White Noise',
      lofi: 'Lo-Fi',
      classical: 'Classical',
      productivity: 'Productivity',
      motivation: 'Motivation',
      learning: 'Learning',
      currentSession: 'Current Session',
      sessionTime: 'Session Time',
      breakTime: 'Break Time',
      totalFocus: 'Total Focus'
    },
    blog: {
      title: 'Blog',
      readMore: 'Read More',
      published: 'Published',
      author: 'Author',
      category: 'Category',
      tags: 'Tags',
      relatedPosts: 'Related Posts',
      popularPosts: 'Popular Posts',
      latestPosts: 'Latest Posts',
      searchPosts: 'Search Posts',
      noPostsFound: 'No posts found',
      loadingPosts: 'Loading posts...',
      sharePost: 'Share Post',
      bookmark: 'Bookmark',
      comment: 'Comment',
      comments: 'Comments',
      leaveComment: 'Leave Comment',
      subscribe: 'Subscribe',
      newsletter: 'Newsletter'
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      account: 'Account',
      preferences: 'Preferences',
      notifications: 'Notifications',
      privacy: 'Privacy',
      security: 'Security',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      autoMode: 'Auto Mode',
      sound: 'Sound',
      volume: 'Volume',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      dataExport: 'Export Data',
      dataImport: 'Import Data',
      deleteAccount: 'Delete Account',
      logout: 'Logout',
      saveChanges: 'Save Changes',
      resetSettings: 'Reset Settings'
    },
    admin: {
      title: 'Admin',
      dashboard: 'Dashboard',
      users: 'Users',
      content: 'Content',
      settings: 'Settings',
      analytics: 'Analytics',
      reports: 'Reports',
      xpLevels: 'XP Levels',
      caveContent: 'Cave Content',
      blogPosts: 'Blog Posts',
      inviteLinks: 'Invite Links',
      systemSettings: 'System Settings',
      userManagement: 'User Management',
      contentManagement: 'Content Management',
      levelConfiguration: 'Level Configuration',
      contentCreation: 'Content Creation',
      statistics: 'Statistics',
      moderation: 'Moderation'
    }
  },
  es: {
    nav: {
      dashboard: 'Panel',
      tasks: 'Tareas',
      habits: 'Hábitos',
      readingLibrary: 'Biblioteca',
      pomodoro: 'Pomodoro',
      achievements: 'Logros',
      progress: 'Progreso',
      caveMode: 'Modo Cueva',
      blog: 'Blog',
      settings: 'Configuración',
      projectPlanner: 'Planificador de Proyectos'
    },
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Ver',
      hide: 'Ocultar',
      show: 'Mostrar',
      all: 'Todos',
      none: 'Ninguno',
      select: 'Seleccionar',
      choose: 'Elegir',
      create: 'Crear',
      update: 'Actualizar',
      remove: 'Remover',
      copy: 'Copiar',
      share: 'Compartir',
      download: 'Descargar',
      upload: 'Subir',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Actualizar',
      retry: 'Reintentar',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información'
    },
    tasks: {
      title: 'Tareas',
      description: 'Descripción',
      addTask: 'Agregar Tarea',
      editTask: 'Editar Tarea',
      deleteTask: 'Eliminar Tarea',
      completeTask: 'Completar Tarea',
      incompleteTask: 'Desmarcar Tarea',
      priority: 'Prioridad',
      deadline: 'Fecha Límite',
      category: 'Categoría',
      tags: 'Etiquetas',
      estimatedTime: 'Tiempo Estimado',
      reward: 'Recompensa',
      pending: 'Pendientes',
      completed: 'Completadas',
      allTasks: 'Todas las Tareas',
      deleteAllTasks: 'Eliminar Todas',
      confirmDeleteAll: '¿Estás seguro de que quieres eliminar todas las tareas?',
      taskDetails: 'Detalles de la Tarea',
      startPomodoro: 'Iniciar Pomodoro',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      minutes: 'minutos',
      hours: 'horas',
      days: 'días',
      created: 'Creada',
      completedAt: 'Completada en',
      dueDate: 'Fecha de Vencimiento',
      noDeadline: 'Sin fecha límite',
      noCategory: 'Sin categoría',
      noTags: 'Sin etiquetas',
      noReward: 'Sin recompensa',
      taskCompleted: '¡Tarea completada!',
      taskUncompleted: 'Tarea desmarcada',
      xpGained: 'XP ganado',
      xpRemoved: 'XP removido'
    },
    habits: {
      title: 'Hábitos',
      addHabit: 'Agregar Hábito',
      editHabit: 'Editar Hábito',
      deleteHabit: 'Eliminar Hábito',
      trackHabit: 'Rastrear Hábito',
      habitName: 'Nombre del Hábito',
      habitDescription: 'Descripción del Hábito',
      frequency: 'Frecuencia',
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      goal: 'Meta',
      streak: 'Racha',
      currentStreak: 'Racha Actual',
      longestStreak: 'Racha Más Larga',
      totalCompletions: 'Total de Completados',
      today: 'Hoy',
      thisWeek: 'Esta Semana',
      thisMonth: 'Este Mes',
      lastWeek: 'Semana Pasada',
      lastMonth: 'Mes Pasado'
    },
    pomodoro: {
      title: 'Pomodoro',
      start: 'Iniciar',
      pause: 'Pausar',
      reset: 'Reiniciar',
      work: 'Trabajo',
      break: 'Descanso',
      longBreak: 'Descanso Largo',
      workTime: 'Tiempo de Trabajo',
      breakTime: 'Tiempo de Descanso',
      longBreakTime: 'Tiempo de Descanso Largo',
      sessions: 'Sesiones',
      completedSessions: 'Sesiones Completadas',
      focusTime: 'Tiempo de Enfoque',
      totalBreaks: 'Total de Descansos',
      productivity: 'Productividad',
      startSession: 'Iniciar Sesión',
      endSession: 'Finalizar Sesión',
      sessionCompleted: '¡Sesión completada!',
      breakStarted: 'Descanso iniciado',
      workStarted: 'Trabajo iniciado'
    },
    achievements: {
      title: 'Logros',
      unlocked: 'Desbloqueado',
      locked: 'Bloqueado',
      progress: 'Progreso',
      description: 'Descripción',
      requirements: 'Requisitos',
      xpReward: 'Recompensa XP',
      levelUp: '¡Subió de Nivel!',
      congratulations: '¡Felicitaciones!',
      newAchievement: '¡Nuevo Logro!',
      totalAchievements: 'Total de Logros',
      completionRate: 'Tasa de Finalización'
    },
    progress: {
      title: 'Progreso',
      level: 'Nivel',
      experience: 'Experiencia',
      currentLevel: 'Nivel Actual',
      nextLevel: 'Siguiente Nivel',
      xpNeeded: 'XP Necesario',
      totalXP: 'XP Total',
      productivity: 'Productividad',
      focus: 'Enfoque',
      consistency: 'Consistencia',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
      allTime: 'Todo el Tiempo',
      tasksCompleted: 'Tareas Completadas',
      xpGained: 'XP Ganado',
      bestDay: 'Mejor Día',
      bestHour: 'Mejor Hora',
      streak: 'Racha',
      averageTasks: 'Promedio de Tareas',
      completionRate: 'Tasa de Finalización'
    },
    caveMode: {
      title: 'Modo Cueva',
      description: 'Enfócate en lo que realmente importa',
      enterCave: 'Entrar a la Cueva',
      exitCave: 'Salir de la Cueva',
      focusMode: 'Modo Enfoque',
      deepWork: 'Trabajo Profundo',
      ambientSounds: 'Sonidos Ambientales',
      playlists: 'Listas de Reproducción',
      articles: 'Artículos',
      videos: 'Videos',
      music: 'Música',
      nature: 'Naturaleza',
      rain: 'Lluvia',
      ocean: 'Océano',
      forest: 'Bosque',
      whiteNoise: 'Ruido Blanco',
      lofi: 'Lo-Fi',
      classical: 'Clásica',
      productivity: 'Productividad',
      motivation: 'Motivación',
      learning: 'Aprendizaje',
      currentSession: 'Sesión Actual',
      sessionTime: 'Tiempo de Sesión',
      breakTime: 'Tiempo de Descanso',
      totalFocus: 'Enfoque Total'
    },
    blog: {
      title: 'Blog',
      readMore: 'Leer Más',
      published: 'Publicado',
      author: 'Autor',
      category: 'Categoría',
      tags: 'Etiquetas',
      relatedPosts: 'Posts Relacionados',
      popularPosts: 'Posts Populares',
      latestPosts: 'Últimos Posts',
      searchPosts: 'Buscar Posts',
      noPostsFound: 'No se encontraron posts',
      loadingPosts: 'Cargando posts...',
      sharePost: 'Compartir Post',
      bookmark: 'Marcar',
      comment: 'Comentar',
      comments: 'Comentarios',
      leaveComment: 'Dejar Comentario',
      subscribe: 'Suscribirse',
      newsletter: 'Boletín'
    },
    settings: {
      title: 'Configuración',
      profile: 'Perfil',
      account: 'Cuenta',
      preferences: 'Preferencias',
      notifications: 'Notificaciones',
      privacy: 'Privacidad',
      security: 'Seguridad',
      language: 'Idioma',
      theme: 'Tema',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      autoMode: 'Modo Automático',
      sound: 'Sonido',
      volume: 'Volumen',
      emailNotifications: 'Notificaciones por Email',
      pushNotifications: 'Notificaciones Push',
      dataExport: 'Exportar Datos',
      dataImport: 'Importar Datos',
      deleteAccount: 'Eliminar Cuenta',
      logout: 'Cerrar Sesión',
      saveChanges: 'Guardar Cambios',
      resetSettings: 'Restablecer Configuración'
    },
    admin: {
      title: 'Admin',
      dashboard: 'Panel',
      users: 'Usuarios',
      content: 'Contenido',
      settings: 'Configuración',
      analytics: 'Analíticas',
      reports: 'Reportes',
      xpLevels: 'Niveles XP',
      caveContent: 'Contenido Cueva',
      blogPosts: 'Posts del Blog',
      inviteLinks: 'Enlaces de Invitación',
      systemSettings: 'Configuración del Sistema',
      userManagement: 'Gestión de Usuarios',
      contentManagement: 'Gestión de Contenido',
      levelConfiguration: 'Configuración de Niveles',
      contentCreation: 'Creación de Contenido',
      statistics: 'Estadísticas',
      moderation: 'Moderación'
    }
  }
};

export function getTranslations(language: Language): Translations {
  return translations[language] || translations.pt;
}

export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'pt';
  
  const browserLang = navigator.language.toLowerCase();
  const savedLang = localStorage.getItem('language') as Language;
  
  if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
    return savedLang;
  }
  
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'pt';
}

export function setLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language);
  }
}

export function t(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language] || translations.pt;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Portuguese
      value = translations.pt;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }
  
  return value || key;
}
