// Sistema de validação e formatação de informações para perfis de usuário
// Foco em segurança e padronização sem alterar layout/design

// Lista de profissões válidas e conhecidas
const VALID_PROFESSIONS = [
  // C-Level Executives
  'CEO', 'CFO', 'CTO', 'COO', 'CMO', 'CHRO', 'CLO', 'CCO', 'CDO', 'CIO', 'CRO', 'CSO',
  'Chief Executive Officer', 'Chief Financial Officer', 'Chief Technology Officer', 
  'Chief Operating Officer', 'Chief Marketing Officer', 'Chief Human Resources Officer',
  'Chief Legal Officer', 'Chief Communications Officer', 'Chief Data Officer',
  'Chief Information Officer', 'Chief Revenue Officer', 'Chief Security Officer',
  
  // Executivos e Diretores
  'Diretor', 'Diretor Executivo', 'Diretor Financeiro', 'Diretor de Tecnologia',
  'Diretor de Operações', 'Diretor de Marketing', 'Diretor de Recursos Humanos',
  'Diretor Comercial', 'Diretor de Vendas', 'Diretor de Produto', 'Diretor de Projetos',
  'Diretor de Inovação', 'Diretor de Estratégia', 'Diretor de Compliance',
  
  // Empreendedores e Empresários
  'Empreendedor', 'Empresário', 'Fundador', 'Co-Fundador', 'Sócio', 'Proprietário',
  'Investidor', 'Angel Investor', 'Venture Capitalist', 'Business Owner',
  
  // Tecnologia
  'Desenvolvedor', 'Programador', 'Engenheiro de Software', 'Desenvolvedor Full Stack',
  'Desenvolvedor Frontend', 'Desenvolvedor Backend', 'Desenvolvedor Mobile', 'DevOps',
  'Arquiteto de Software', 'Analista de Sistemas', 'Analista de Dados', 'Cientista de Dados',
  'Engenheiro de Dados', 'Analista de Business Intelligence', 'Analista de Qualidade',
  'Testador', 'QA Engineer', 'Product Manager', 'Scrum Master', 'Tech Lead',
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Mobile Developer', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer',
  'AI Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Security Engineer',
  
  // Design
  'Designer', 'Designer UX', 'Designer UI', 'Designer Gráfico', 'Designer de Produto',
  'Designer de Interface', 'Designer Visual', 'Ilustrador', 'Diretor de Arte',
  'UX Designer', 'UI Designer', 'Product Designer', 'Visual Designer',
  
  // Marketing e Vendas
  'Marketeiro', 'Analista de Marketing', 'Gerente de Marketing', 'Especialista em Marketing Digital',
  'Vendedor', 'Representante de Vendas', 'Gerente de Vendas', 'Analista de Vendas',
  'Especialista em SEO', 'Especialista em SEM', 'Social Media Manager',
  'Marketing Manager', 'Sales Manager', 'Business Development Manager',
  'Account Manager', 'Sales Representative', 'Marketing Specialist',
  
  // Administração e Negócios
  'Administrador', 'Gerente', 'Gerente Geral', 'Gerente de Projetos', 'Gerente de Produto',
  'Analista Administrativo', 'Assistente Administrativo', 'Secretário',
  'Consultor', 'Consultor de Negócios', 'Analista de Negócios',
  'Analista Financeiro', 'Contador', 'Auditor', 'Analista de Recursos Humanos',
  'Recrutador', 'Especialista em RH', 'Gerente de RH', 'Business Analyst',
  'Project Manager', 'Product Manager', 'Operations Manager',
  
  // Educação
  'Professor', 'Educador', 'Instrutor', 'Tutor', 'Coordenador Pedagógico',
  'Diretor de Escola', 'Especialista em Educação', 'Teacher', 'Educator',
  'Academic Coordinator', 'School Principal',
  
  // Saúde
  'Médico', 'Enfermeiro', 'Fisioterapeuta', 'Psicólogo', 'Psiquiatra',
  'Dentista', 'Farmacêutico', 'Nutricionista', 'Terapeuta', 'Doctor',
  'Nurse', 'Physiotherapist', 'Psychologist', 'Psychiatrist', 'Dentist',
  'Pharmacist', 'Nutritionist', 'Therapist',
  
  // Direito e Comunicação
  'Advogado', 'Jornalista', 'Escritor', 'Tradutor', 'Intérprete',
  'Lawyer', 'Attorney', 'Journalist', 'Writer', 'Translator', 'Interpreter',
  
  // Artes e Mídia
  'Fotógrafo', 'Videomaker', 'Editor', 'Revisor', 'Bibliotecário',
  'Photographer', 'Videographer', 'Editor', 'Reviewer', 'Librarian',
  
  // Ciências e Pesquisa
  'Arquivista', 'Historiador', 'Sociólogo', 'Antropólogo', 'Geógrafo',
  'Biólogo', 'Químico', 'Físico', 'Matemático', 'Estatístico',
  'Archivist', 'Historian', 'Sociologist', 'Anthropologist', 'Geographer',
  'Biologist', 'Chemist', 'Physicist', 'Mathematician', 'Statistician',
  
  // Engenharia
  'Engenheiro Civil', 'Engenheiro Mecânico', 'Engenheiro Elétrico',
  'Arquiteto', 'Urbanista', 'Designer de Interiores',
  'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
  'Architect', 'Urban Planner', 'Interior Designer',
  
  // Agricultura e Veterinária
  'Veterinário', 'Zootecnista', 'Agrônomo', 'Engenheiro Agrícola',
  'Veterinarian', 'Zootechnician', 'Agronomist', 'Agricultural Engineer',
  
  // Segurança e Serviços Públicos
  'Policial', 'Bombeiro', 'Militar', 'Segurança',
  'Police Officer', 'Firefighter', 'Military', 'Security Guard',
  
  // Serviços e Hospitalidade
  'Cozinheiro', 'Chef', 'Garçom', 'Bartender', 'Recepcionista',
  'Cook', 'Chef', 'Waiter', 'Bartender', 'Receptionist',
  
  // Transporte
  'Motorista', 'Piloto', 'Comissário de Bordo', 'Aeromoça',
  'Driver', 'Pilot', 'Flight Attendant',
  
  // Estudantes e Iniciantes
  'Estudante', 'Estagiário', 'Aprendiz', 'Freelancer',
  'Student', 'Intern', 'Apprentice', 'Freelancer',
  
  // Outros Cargos Comuns
  'Assistente', 'Auxiliar', 'Operador', 'Técnico', 'Especialista',
  'Assistant', 'Auxiliary', 'Operator', 'Technician', 'Specialist',
  'Coordenador', 'Supervisor', 'Líder', 'Team Lead', 'Coordinator',
  'Supervisor', 'Leader', 'Team Lead'
];

// Regex para validação de caracteres permitidos
const ALLOWED_CHARS_REGEX = /^[a-zA-ZÀ-ÿ\s()]+$/;
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /eval\s*\(/gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi,
  /document\./gi,
  /window\./gi,
  /location\./gi,
  /history\./gi,
  /navigator\./gi,
  /screen\./gi,
  /localStorage\./gi,
  /sessionStorage\./gi,
  /cookie/gi,
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  // Removidos padrões que causam falsos positivos para nomes legítimos
  // /fetch/gi,
  // /axios/gi,
  // /jquery/gi,
  // /angular/gi,
  // /react/gi,
  // /vue/gi,
  // /node/gi,
  // /php/gi,
  // /python/gi,
  // /java/gi,
  // /c\+\+/gi,
  // /c#/gi,
  // /\.net/gi,
  // /asp/gi,
  // /jsp/gi,
  // /sql/gi,
  // /mysql/gi,
  // /postgresql/gi,
  // /mongodb/gi,
  // /redis/gi,
  // /docker/gi,
  // /kubernetes/gi,
  // /aws/gi,
  // /azure/gi,
  // /gcp/gi,
  // /heroku/gi,
  // /vercel/gi,
  // /netlify/gi,
  // /github/gi,
  // /gitlab/gi,
  // /bitbucket/gi,
  // /npm/gi,
  // /yarn/gi,
  // /webpack/gi,
  // /babel/gi,
  // /eslint/gi,
  // /prettier/gi,
  // /jest/gi,
  // /cypress/gi,
  // /selenium/gi,
  // /postman/gi,
  // /insomnia/gi,
  // /swagger/gi,
  // /graphql/gi,
  // /rest/gi,
  // /api/gi,
  // /oauth/gi,
  // /jwt/gi,
  // /bcrypt/gi,
  // /md5/gi,
  // /sha/gi,
  // /encrypt/gi,
  // /decrypt/gi,
  // /hash/gi,
  // /salt/gi,
  // /token/gi,
  // /session/gi,
  // /csrf/gi,
  // /xss/gi,
  // /sqli/gi,
  // /nosqli/gi,
  // /ldap/gi,
  // /saml/gi,
  // /oauth2/gi,
  // /openid/gi,
  // /sso/gi,
  // /mfa/gi,
  // /2fa/gi,
  // /totp/gi,
  // /hotp/gi,
  // /yubikey/gi,
  // /authenticator/gi,
  // /password/gi,
  // /username/gi,
  // /email/gi,
  // /phone/gi,
  // /address/gi,
  // /credit/gi,
  // /card/gi,
  // /bank/gi,
  // /account/gi,
  // /login/gi,
  // /logout/gi,
  // /register/gi,
  // /signup/gi,
  // /signin/gi,
  // /signout/gi,
  // /profile/gi,
  // /settings/gi,
  // /config/gi,
  // /admin/gi,
  // /root/gi,
  // /sudo/gi,
  // /su/gi,
  // /chmod/gi,
  // /chown/gi,
  // /ls/gi,
  // /cd/gi,
  // /pwd/gi,
  // /mkdir/gi,
  // /rm/gi,
  // /cp/gi,
  // /mv/gi,
  // /cat/gi,
  // /grep/gi,
  // /find/gi,
  // /ps/gi,
  // /top/gi,
  // /htop/gi,
  // /kill/gi,
  // /killall/gi,
  // /pkill/gi,
  // /systemctl/gi,
  // /service/gi,
  // /init/gi,
  // /systemd/gi,
  // /cron/gi,
  // /crontab/gi,
  // /at/gi,
  // /batch/gi,
  // /anacron/gi,
  // /logrotate/gi,
  // /rsyslog/gi,
  // /syslog/gi,
  // /journalctl/gi,
  // /dmesg/gi,
  // /last/gi,
  // /who/gi,
  // /w/gi,
  // /uptime/gi,
  // /free/gi,
  // /df/gi,
  // /du/gi,
  // /iostat/gi,
  // /vmstat/gi,
  // /netstat/gi,
  // /ss/gi,
  // /ip/gi,
  // /ifconfig/gi,
  // /route/gi,
  // /ping/gi,
  // /traceroute/gi,
  // /nslookup/gi,
  // /dig/gi,
  // /host/gi,
  // /nmap/gi,
  // /telnet/gi,
  // /ssh/gi,
  // /scp/gi,
  // /sftp/gi,
  // /ftp/gi,
  // /wget/gi,
  // /curl/gi,
  // /lynx/gi,
  // /links/gi,
  // /elinks/gi,
  // /w3m/gi,
  // /nc/gi,
  // /netcat/gi,
  // /socat/gi,
  // /openssl/gi,
  // /gpg/gi,
  // /gnupg/gi,
  // /certbot/gi,
  // /letsencrypt/gi,
  // /ssl/gi,
  // /tls/gi,
  // /https/gi,
  // /http/gi,
  // /ftp/gi,
  // /smtp/gi,
  // /pop3/gi,
  // /imap/gi,
  // /dns/gi,
  // /dhcp/gi,
  // /tftp/gi,
  // /nfs/gi,
  // /cifs/gi,
  // /samba/gi,
  // /ldap/gi,
  // /kerberos/gi,
  // /ntp/gi,
  // /snmp/gi,
  // /syslog/gi,
  // /rsyslog/gi,
  // /logrotate/gi,
  // /cron/gi,
  // /at/gi,
  // /batch/gi,
  // /anacron/gi,
  // /systemd/gi,
  // /init/gi,
  // /service/gi,
  // /systemctl/gi,
  // /chkconfig/gi,
  // /update-rc.d/gi,
  // /insserv/gi,
  // /rcconf/gi,
  // /sysv-rc-conf/gi,
  // /rc-update/gi,
  // /openrc/gi,
  // /runit/gi,
  // /s6/gi,
  // /daemontools/gi,
  // /supervisor/gi,
  // /monit/gi,
  // /god/gi,
  // /bluepill/gi,
  // /eye/gi,
  // /foreman/gi,
  // /upstart/gi,
  // /launchd/gi,
  // /smf/gi,
  // /rc/gi,
  // /init.d/gi,
  // /rc.d/gi,
  // /etc/gi,
  // /var/gi,
  // /tmp/gi,
  // /home/gi,
  // /root/gi,
  // /usr/gi,
  // /bin/gi,
  // /sbin/gi,
  // /lib/gi,
  // /lib64/gi,
  // /opt/gi,
  // /mnt/gi,
  // /media/gi,
  // /proc/gi,
  // /sys/gi,
  // /dev/gi,
  // /run/gi,
  // /srv/gi,
  // /boot/gi,
  // /lost+found/gi,
  // /\./gi
];

// Função para limpar e formatar texto
export function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços duplicados
    // Removida limpeza muito restritiva que removia números e caracteres especiais
    // .replace(/[^\w\sÀ-ÿ()]/g, '') // Remove caracteres especiais exceto acentos e parênteses
    // .replace(/\d/g, '') // Remove números
    // .replace(/[^\x00-\x7F]/g, (char) => {
    //   // Mantém apenas acentos válidos do português
    //   const validAccents = /[À-ÿ]/;
    //   return validAccents.test(char) ? char : '';
    // });
}

// Função para formatar texto em title case
export function formatTitleCase(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const cleaned = cleanText(text);
  if (!cleaned) return '';
  
  return cleaned
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Função para validar caracteres permitidos
export function validateAllowedChars(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return ALLOWED_CHARS_REGEX.test(text);
}

// Função para detectar caracteres perigosos
export function detectDangerousChars(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  const dangerous = [];
  // Removidos caracteres comuns que não são realmente perigosos: ()&$#@!%*+=|`~^"';:,?
  // Mantidos apenas os realmente perigosos para XSS/HTML injection
  const dangerousChars = /[<>{}[\]\\\/]/g;
  const matches = text.match(dangerousChars);
  
  if (matches) {
    dangerous.push(...Array.from(new Set(matches)));
  }
  
  return dangerous;
}

// Função para detectar padrões perigosos
export function detectDangerousPatterns(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  
  const detected = [];
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(text)) {
      detected.push(pattern.source);
    }
  }
  
  return detected;
}

// Função para normalizar texto (remover acentos para comparação)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

// Função para validar profissão
export function validateProfession(title: string): boolean {
  if (!title || typeof title !== 'string') return false;
  
  const cleaned = cleanText(title);
  if (!cleaned) return false;
  
  const normalizedTitle = normalizeText(cleaned);
  
  // Verificar correspondência exata
  const exactMatch = VALID_PROFESSIONS.some(profession => 
    normalizeText(profession) === normalizedTitle
  );
  
  if (exactMatch) return true;
  
  // Verificar correspondência parcial (para casos como "CEO" vs "Chief Executive Officer")
  const partialMatch = VALID_PROFESSIONS.some(profession => {
    const normalizedProfession = normalizeText(profession);
    return normalizedTitle.includes(normalizedProfession) || 
           normalizedProfession.includes(normalizedTitle);
  });
  
  return partialMatch;
}

// Função para obter profissões válidas
export function getValidProfessions(): string[] {
  return [...VALID_PROFESSIONS];
}

// Função para verificar se uma profissão é válida
export function isValidProfession(title: string): boolean {
  return validateProfession(title);
}

// Função para sanitizar texto (remover conteúdo perigoso)
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let sanitized = text;
  
  // Remove padrões perigosos
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Remove apenas caracteres realmente perigosos para XSS/HTML injection
  sanitized = sanitized.replace(/[<>{}[\]\\\/]/g, '');
  
  // Não remove números, emojis ou outros caracteres comuns
  
  return sanitized.trim();
}

// Função para registrar tentativas maliciosas - otimizada para reduzir logs desnecessários
export function logMaliciousAttempt(field: string, value: string, reason: string): void {
  // Filtrar padrões muito comuns que não são realmente perigosos
  const commonPatterns = ['w', 'su', 'ss', 'us', 'er', 'or', 'al', 'an', 'ar', 'el', 'en', 'es', 'et', 'in', 'it', 'le', 'me', 'ne', 'on', 're', 'se', 'te', 'ue', 've', 'script', 'alert', 'eval', 'function'];
  
  // Se o motivo contém apenas padrões comuns ou é muito curto, não logar
  if (commonPatterns.some(pattern => reason.includes(pattern)) || reason.length <= 6) {
    return;
  }
  
  const log = {
    timestamp: new Date().toISOString(),
    field,
    value: value.substring(0, 100), // Limita o tamanho do log
    reason,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };
  
  // Salva no localStorage para auditoria
  const logs = JSON.parse(localStorage.getItem('malicious-attempts') || '[]');
  logs.push(log);
  
  // Mantém apenas os últimos 50 logs (reduzido de 100)
  if (logs.length > 50) {
    logs.splice(0, logs.length - 50);
  }
  
  localStorage.setItem('malicious-attempts', JSON.stringify(logs));
  
  // Log no console apenas em desenvolvimento e apenas para padrões realmente suspeitos
  if (process.env.NODE_ENV === 'development' && reason.length > 4) {
    console.warn('Tentativa maliciosa detectada:', {
      field,
      value: value.substring(0, 50),
      reason,
      timestamp: log.timestamp
    });
  }
}

// Função para validar e formatar nome
export function validateAndFormatName(name: string): { 
  isValid: boolean; 
  formatted: string; 
  errors: string[]; 
  warnings: string[]; 
} {
  const result = {
    isValid: true,
    formatted: '',
    errors: [] as string[],
    warnings: [] as string[]
  };
  
  if (!name || typeof name !== 'string') {
    result.isValid = false;
    result.errors.push('Nome é obrigatório');
    result.formatted = 'Usuário';
    return result;
  }
  
  // Verificar caracteres perigosos - apenas para padrões realmente suspeitos
  const dangerousChars = detectDangerousChars(name);
  if (dangerousChars.length > 0) {
    // Filtrar caracteres comuns que não são realmente perigosos
    const filteredChars = dangerousChars.filter(char => 
      !['w', 'su', 'ss', 'us', 'er', 'or', 'al', 'an', 'ar', 'el', 'en', 'es', 'et', 'in', 'it', 'le', 'me', 'ne', 'on', 're', 'se', 'te', 'ue', 've'].includes(char)
    );
    
    if (filteredChars.length > 0) {
      result.isValid = false;
      result.errors.push(`Caracteres inválidos detectados: ${filteredChars.join(', ')}`);
      logMaliciousAttempt('name', name, `Dangerous characters: ${filteredChars.join(', ')}`);
    }
  }
  
  // Verificar padrões perigosos - apenas para padrões realmente suspeitos
  const dangerousPatterns = detectDangerousPatterns(name);
  if (dangerousPatterns.length > 0) {
    // Filtrar padrões comuns que não são realmente perigosos
    const filteredPatterns = dangerousPatterns.filter(pattern => 
      !['w', 'su', 'ss', 'us', 'er', 'or', 'al', 'an', 'ar', 'el', 'en', 'es', 'et', 'in', 'it', 'le', 'me', 'ne', 'on', 're', 'se', 'te', 'ue', 've'].includes(pattern)
    );
    
    if (filteredPatterns.length > 0) {
      result.isValid = false;
      result.errors.push('Padrões maliciosos detectados');
      logMaliciousAttempt('name', name, `Dangerous patterns: ${filteredPatterns.join(', ')}`);
    }
  }
  
  // Validar caracteres permitidos - removida validação muito restritiva
  // if (!validateAllowedChars(name)) {
  //   result.isValid = false;
  //   result.errors.push('Apenas letras e espaços são permitidos');
  // }
  
  // Limpar e formatar
  const cleaned = cleanText(name);
  if (!cleaned) {
    result.isValid = false;
    result.errors.push('Nome não pode estar vazio após limpeza');
    result.formatted = 'Usuário';
    return result;
  }
  
  // Verificar comprimento
  if (cleaned.length < 2) {
    result.isValid = false;
    result.errors.push('Nome deve ter pelo menos 2 caracteres');
  }
  
  if (cleaned.length > 50) {
    result.warnings.push('Nome muito longo, será truncado');
  }
  
  // Formatar
  result.formatted = formatTitleCase(cleaned).substring(0, 50);
  
  return result;
}

// Função para validar e formatar título profissional
export function validateAndFormatTitle(title: string): { 
  isValid: boolean; 
  formatted: string; 
  errors: string[]; 
  warnings: string[]; 
} {
  const result = {
    isValid: true,
    formatted: '',
    errors: [] as string[],
    warnings: [] as string[]
  };
  
  if (!title || typeof title !== 'string') {
    result.isValid = false;
    result.errors.push('Título profissional é obrigatório');
    result.formatted = 'Profissional';
    return result;
  }
  
  // Verificar caracteres perigosos - apenas para padrões realmente suspeitos
  const dangerousChars = detectDangerousChars(title);
  if (dangerousChars.length > 0) {
    // Filtrar caracteres comuns que não são realmente perigosos
    const filteredChars = dangerousChars.filter(char => 
      !['w', 'su', 'ss', 'us', 'er', 'or', 'al', 'an', 'ar', 'el', 'en', 'es', 'et', 'in', 'it', 'le', 'me', 'ne', 'on', 're', 'se', 'te', 'ue', 've'].includes(char)
    );
    
    if (filteredChars.length > 0) {
      result.isValid = false;
      result.errors.push(`Caracteres inválidos detectados: ${filteredChars.join(', ')}`);
      logMaliciousAttempt('title', title, `Dangerous characters: ${filteredChars.join(', ')}`);
    }
  }
  
  // Verificar padrões perigosos - apenas para padrões realmente suspeitos
  const dangerousPatterns = detectDangerousPatterns(title);
  if (dangerousPatterns.length > 0) {
    // Filtrar padrões comuns que não são realmente perigosos
    const filteredPatterns = dangerousPatterns.filter(pattern => 
      !['w', 'su', 'ss', 'us', 'er', 'or', 'al', 'an', 'ar', 'el', 'en', 'es', 'et', 'in', 'it', 'le', 'me', 'ne', 'on', 're', 'se', 'te', 'ue', 've'].includes(pattern)
    );
    
    if (filteredPatterns.length > 0) {
      result.isValid = false;
      result.errors.push('Padrões maliciosos detectados');
      logMaliciousAttempt('title', title, `Dangerous patterns: ${filteredPatterns.join(', ')}`);
    }
  }
  
  // Validar caracteres permitidos - removida validação muito restritiva
  // if (!validateAllowedChars(title)) {
  //   result.isValid = false;
  //   result.errors.push('Apenas letras e espaços são permitidos');
  // }
  
  // Limpar e formatar
  const cleaned = cleanText(title);
  if (!cleaned) {
    result.isValid = false;
    result.errors.push('Título não pode estar vazio após limpeza');
    result.formatted = 'Profissional';
    return result;
  }
  
  // Verificar comprimento
  if (cleaned.length < 3) {
    result.isValid = false;
    result.errors.push('Título deve ter pelo menos 3 caracteres');
  }
  
  if (cleaned.length > 100) {
    result.warnings.push('Título muito longo, será truncado');
  }
  
  // Formatar
  result.formatted = formatTitleCase(cleaned).substring(0, 100);
  
  // Verificar se é uma profissão válida e corrigir automaticamente
  if (!validateProfession(result.formatted)) {
    // Tentar encontrar a profissão correta sem acentos
    const normalizedFormatted = normalizeText(result.formatted);
    const correctProfession = VALID_PROFESSIONS.find(profession => 
      normalizeText(profession) === normalizedFormatted
    );
    
    if (correctProfession) {
      // Corrigir automaticamente para a versão com acentos
      result.formatted = correctProfession;
      result.warnings.push('Profissão corrigida automaticamente');
    } else {
      // Verificar correspondência parcial
      const partialMatch = VALID_PROFESSIONS.find(profession => {
        const normalizedProfession = normalizeText(profession);
        return normalizedFormatted.includes(normalizedProfession) || 
               normalizedProfession.includes(normalizedFormatted);
      });
      
      if (partialMatch) {
        result.formatted = partialMatch;
        result.warnings.push('Profissão corrigida automaticamente');
      } else {
        // Se não encontrar correspondência, não mostrar erro - deixar o usuário escolher
        result.warnings.push('Título não reconhecido como profissão padrão, mas aceito');
      }
    }
  }
  
  return result;
}

// Função principal para validar e formatar perfil completo
export function validateAndFormatProfile(profile: {
  name: string;
  title: string;
  [key: string]: any;
}): {
  isValid: boolean;
  formatted: {
    name: string;
    title: string;
    [key: string]: any;
  };
  errors: string[];
  warnings: string[];
} {
  const result = {
    isValid: true,
    formatted: { ...profile },
    errors: [] as string[],
    warnings: [] as string[]
  };
  
  // Validar nome
  const nameValidation = validateAndFormatName(profile.name);
  if (!nameValidation.isValid) {
    result.isValid = false;
    result.errors.push(...nameValidation.errors);
  }
  if (nameValidation.warnings.length > 0) {
    result.warnings.push(...nameValidation.warnings);
  }
  result.formatted.name = nameValidation.formatted;
  
  // Validar título
  const titleValidation = validateAndFormatTitle(profile.title);
  if (!titleValidation.isValid) {
    result.isValid = false;
    result.errors.push(...titleValidation.errors);
  }
  if (titleValidation.warnings.length > 0) {
    result.warnings.push(...titleValidation.warnings);
  }
  result.formatted.title = titleValidation.formatted;
  
  return result;
} 