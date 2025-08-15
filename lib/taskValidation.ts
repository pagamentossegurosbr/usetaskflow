// Sistema de validação de tarefas para prevenir farming de XP

// Blacklist de tarefas genéricas e irrelevantes
const TASK_BLACKLIST = [
  'aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii', 'jjj',
  'kkk', 'lll', 'mmm', 'nnn', 'ooo', 'ppp', 'qqq', 'rrr', 'sss', 'ttt',
  'uuu', 'vvv', 'www', 'xxx', 'yyy', 'zzz',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj',
  'kk', 'll', 'mm', 'nn', 'oo', 'pp', 'qq', 'rr', 'ss', 'tt',
  'uu', 'vv', 'ww', 'xx', 'yy', 'zz',
  'teste', 'test', 'teste1', 'test1', 'teste2', 'test2',
  'ok', 'ok1', 'ok2', 'ok3', 'ok4', 'ok5',
  'sim', 'nao', 'yes', 'no', 'si', 'no',
  '123', '1234', '12345', '123456', '1234567', '12345678',
  'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yz',
  'qwe', 'asd', 'zxc', 'rty', 'fgh', 'vbn', 'uio', 'jkl', 'mnm',
  'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'oi', 'oi1', 'oi2', 'oi3', 'oi4', 'oi5',
  'oi oi', 'oi oi oi', 'oi oi oi oi',
  'teste teste', 'teste teste teste',
  'ok ok', 'ok ok ok', 'ok ok ok ok',
  'sim sim', 'sim sim sim', 'sim sim sim sim',
  'nao nao', 'nao nao nao', 'nao nao nao nao',
  'oi oi oi oi oi', 'teste teste teste teste',
  'ok ok ok ok ok', 'sim sim sim sim sim',
  'nao nao nao nao nao'
];

// Tarefas legítimas que devem ser permitidas mesmo sendo curtas
const LEGITIMATE_SHORT_TASKS = [
  'estudar', 'ler', 'correr', 'nadar', 'andar', 'meditar', 'rezar',
  'pensar', 'sonhar', 'dormir', 'acordar', 'comer', 'beber', 'lavar',
  'limpar', 'arrumar', 'organizar', 'planejar', 'focar', 'respirar',
  'relaxar', 'descansar', 'trabalhar', 'estudar', 'aprender', 'praticar',
  'treinar', 'exercitar', 'malhar', 'fazer flexões', 'fazer abdominais',
  'fazer agachamentos', 'fazer polichinelos', 'fazer prancha',
  'fazer yoga', 'fazer pilates', 'fazer alongamento',
  'tomar banho', 'escovar os dentes', 'pentear o cabelo',
  'vestir', 'calçar', 'descalçar', 'sentar', 'levantar', 'andar',
  'subir', 'descer', 'entrar', 'sair', 'abrir', 'fechar',
  'ligar', 'desligar', 'ligar tv', 'desligar tv', 'ligar luz',
  'desligar luz', 'ligar ar', 'desligar ar', 'ligar ventilador',
  'desligar ventilador', 'ligar computador', 'desligar computador',
  'ligar celular', 'desligar celular', 'carregar celular',
  'carregar computador', 'carregar notebook', 'carregar tablet',
  'carregar fone', 'carregar relógio', 'carregar smartwatch',
  'verificar email', 'verificar mensagens', 'verificar notificações',
  'verificar agenda', 'verificar calendário', 'verificar compromissos',
  'verificar tarefas', 'verificar lista', 'verificar anotações',
  'verificar documentos', 'verificar arquivos', 'verificar pastas',
  'verificar downloads', 'verificar fotos', 'verificar vídeos',
  'verificar músicas', 'verificar apps', 'verificar configurações',
  'verificar privacidade', 'verificar segurança', 'verificar backup',
  'verificar atualizações', 'verificar sistema', 'verificar rede',
  'verificar wifi', 'verificar bluetooth', 'verificar dados',
  'verificar bateria', 'verificar armazenamento', 'verificar memória',
  'verificar processador', 'verificar placa de vídeo', 'verificar som',
  'verificar microfone', 'verificar câmera', 'verificar sensor',
  'verificar GPS', 'verificar acelerômetro', 'verificar giroscópio',
  'verificar magnetômetro', 'verificar barômetro', 'verificar termômetro',
  'verificar umidade', 'verificar pressão', 'verificar altitude',
  'verificar velocidade', 'verificar distância', 'verificar tempo',
  'verificar data', 'verificar hora', 'verificar fuso horário',
  'verificar idioma', 'verificar região', 'verificar moeda',
  'verificar unidades', 'verificar formato', 'verificar codificação',
  'verificar compressão', 'verificar criptografia', 'verificar hash',
  'verificar checksum', 'verificar integridade', 'verificar autenticidade',
  'verificar validade', 'verificar expiração', 'verificar renovação',
  'verificar cancelamento', 'verificar reembolso', 'verificar devolução',
  'verificar troca', 'verificar garantia', 'verificar seguro',
  'verificar seguro saúde', 'verificar seguro vida', 'verificar seguro auto',
  'verificar seguro casa', 'verificar seguro viagem', 'verificar seguro pet',
  'verificar seguro celular', 'verificar seguro notebook', 'verificar seguro bike',
  'verificar seguro moto', 'verificar seguro barco', 'verificar seguro avião',
  'verificar seguro helicóptero', 'verificar seguro drone', 'verificar seguro drone',
  'verificar seguro drone', 'verificar seguro drone', 'verificar seguro drone'
];

export interface TaskValidationResult {
  isValid: boolean;
  reason?: string;
  suggestion?: string;
}

export function validateTask(text: string): TaskValidationResult {
  const normalizedText = text.trim().toLowerCase();
  
  // Verificar se está vazio
  if (!normalizedText) {
    return {
      isValid: false,
      reason: 'A tarefa não pode estar vazia.',
      suggestion: 'Digite uma descrição para sua tarefa.'
    };
  }
  
  // Verificar se tem menos de 4 caracteres (exceto tarefas legítimas)
  if (normalizedText.length < 4 && !LEGITIMATE_SHORT_TASKS.includes(normalizedText)) {
    return {
      isValid: false,
      reason: 'Tarefas muito curtas podem ser irrelevantes.',
      suggestion: 'Adicione mais contexto à sua tarefa. Ex: "Estudar matemática" em vez de "Estudar".'
    };
  }
  
  // Verificar blacklist
  if (TASK_BLACKLIST.includes(normalizedText)) {
    return {
      isValid: false,
      reason: 'Esta tarefa parece ser irrelevante.',
      suggestion: 'Crie tarefas com significado real para sua produtividade.'
    };
  }
  
  // Verificar padrões de letras repetidas
  if (hasRepeatedPattern(normalizedText)) {
    return {
      isValid: false,
      reason: 'Padrões repetitivos não são tarefas válidas.',
      suggestion: 'Crie tarefas com conteúdo real e significativo.'
    };
  }
  
  // Verificar se contém apenas caracteres especiais ou números
  if (hasOnlySpecialChars(normalizedText)) {
    return {
      isValid: false,
      reason: 'Tarefas devem conter texto legível.',
      suggestion: 'Use palavras reais para descrever suas tarefas.'
    };
  }
  
  // Verificar se é muito genérica
  if (isTooGeneric(normalizedText)) {
    return {
      isValid: false,
      reason: 'Tarefas muito genéricas podem ser irrelevantes.',
      suggestion: 'Seja mais específico. Ex: "Estudar React - Capítulo 3" em vez de "Estudar".'
    };
  }
  
  return { isValid: true };
}

function hasRepeatedPattern(text: string): boolean {
  // Verificar se tem 3 ou mais caracteres iguais consecutivos
  for (let i = 0; i < text.length - 2; i++) {
    if (text[i] === text[i + 1] && text[i] === text[i + 2]) {
      return true;
    }
  }
  
  // Verificar padrões como "aaa", "abcabc", etc.
  const patterns = [
    /(.)\1{2,}/, // 3+ caracteres iguais
    /(.{2})\1{2,}/, // padrões de 2 caracteres repetidos
    /(.{3})\1{1,}/, // padrões de 3 caracteres repetidos
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

function hasOnlySpecialChars(text: string): boolean {
  // Verificar se contém apenas caracteres especiais, números ou espaços
  const hasLetters = /[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(text);
  return !hasLetters;
}

function isTooGeneric(text: string): boolean {
  const genericWords = [
    'coisa', 'algo', 'tarefa', 'item', 'lista', 'checklist',
    'todo', 'task', 'item', 'thing', 'stuff', 'work',
    'fazer', 'fazer algo', 'fazer coisa', 'fazer tarefa',
    'fazer item', 'fazer lista', 'fazer checklist',
    'fazer todo', 'fazer task', 'fazer thing', 'fazer stuff',
    'fazer work', 'fazer trabalho', 'fazer serviço',
    'fazer atividade', 'fazer ação', 'fazer movimento',
    'fazer gesto', 'fazer ato', 'fazer feito', 'fazer obra',
    'fazer criação', 'fazer produção', 'fazer elaboração',
    'fazer confecção', 'fazer fabricação', 'fazer construção',
    'fazer montagem', 'fazer instalação', 'fazer configuração',
    'fazer ajuste', 'fazer correção', 'fazer reparo',
    'fazer manutenção', 'fazer limpeza', 'fazer organização',
    'fazer arrumação', 'fazer ordenação', 'fazer classificação',
    'fazer categorização', 'fazer separação', 'fazer divisão',
    'fazer distribuição', 'fazer alocação', 'fazer atribuição',
    'fazer designação', 'fazer nomeação', 'fazer indicação',
    'fazer sugestão', 'fazer recomendação', 'fazer aconselhamento',
    'fazer orientação', 'fazer direcionamento', 'fazer guiamento',
    'fazer condução', 'fazer liderança', 'fazer comando',
    'fazer controle', 'fazer gestão', 'fazer administração',
    'fazer coordenação', 'fazer supervisão', 'fazer monitoramento',
    'fazer acompanhamento', 'fazer seguimento', 'fazer rastreamento',
    'fazer verificação', 'fazer checagem', 'fazer conferência',
    'fazer validação', 'fazer confirmação', 'fazer aprovação',
    'fazer autorização', 'fazer permissão', 'fazer consentimento',
    'fazer aceitação', 'fazer concordância', 'fazer concordância',
    'fazer concordância', 'fazer concordância', 'fazer concordância'
  ];
  
  return genericWords.includes(text);
} 