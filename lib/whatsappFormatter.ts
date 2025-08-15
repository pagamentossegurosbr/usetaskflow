/**
 * Função para formatar números de WhatsApp brasileiros de forma inteligente
 * Aceita diferentes formatos de entrada e retorna o formato padrão
 */

export interface WhatsAppFormatResult {
  formatted: string;
  isValid: boolean;
  error?: string;
  preview: string;
}

export function formatWhatsAppNumber(input: string): WhatsAppFormatResult {
  // Remover todos os caracteres não numéricos
  const cleanNumber = input.replace(/\D/g, '');
  
  // Se não há números, retornar erro
  if (!cleanNumber) {
    return {
      formatted: '',
      isValid: false,
      error: 'Número inválido',
      preview: ''
    };
  }

  // Verificar se já tem código do país (55)
  let number = cleanNumber;
  
  // Se começa com 55, remover para processar
  if (number.startsWith('55')) {
    number = number.substring(2);
  }
  
  // Se tem 11 dígitos (DDD + número), assumir que é brasileiro
  if (number.length === 11) {
    const ddd = number.substring(0, 2);
    const phoneNumber = number.substring(2);
    
    // Validar DDD brasileiro (11-99, exceto alguns reservados)
    const validDDDs = [
      11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68,
      69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95,
      96, 97, 98, 99
    ];
    
    if (!validDDDs.includes(parseInt(ddd))) {
      return {
        formatted: `+55 ${ddd} ${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`,
        isValid: false,
        error: 'DDD inválido',
        preview: `+55 ${ddd} ${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`
      };
    }
    
    const formatted = `+55 ${ddd} ${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`;
    
    return {
      formatted,
      isValid: true,
      preview: formatted
    };
  }
  
  // Se tem 9 dígitos, assumir que é número sem DDD (usar DDD padrão 11)
  if (number.length === 9) {
    const formatted = `+55 11 ${number.substring(0, 5)}-${number.substring(5)}`;
    
    return {
      formatted,
      isValid: true,
      preview: formatted,
      error: 'DDD não informado, usando 11 como padrão'
    };
  }
  
  // Se tem 8 dígitos, assumir que é número antigo sem 9 (usar DDD padrão 11)
  if (number.length === 8) {
    const formatted = `+55 11 9${number.substring(0, 4)}-${number.substring(4)}`;
    
    return {
      formatted,
      isValid: true,
      preview: formatted,
      error: 'DDD não informado e número sem 9, usando 11 como padrão e adicionando 9'
    };
  }
  
  // Se tem 10 dígitos, pode ser DDD + número antigo
  if (number.length === 10) {
    const ddd = number.substring(0, 2);
    const phoneNumber = number.substring(2);
    const formatted = `+55 ${ddd} 9${phoneNumber.substring(0, 4)}-${phoneNumber.substring(4)}`;
    
    return {
      formatted,
      isValid: true,
      preview: formatted,
      error: 'Número sem 9, adicionando 9 automaticamente'
    };
  }
  
  // Se tem 13 dígitos, pode ser código do país + DDD + número
  if (number.length === 13 && number.startsWith('55')) {
    const ddd = number.substring(2, 4);
    const phoneNumber = number.substring(4);
    const formatted = `+55 ${ddd} ${phoneNumber.substring(0, 5)}-${phoneNumber.substring(5)}`;
    
    return {
      formatted,
      isValid: true,
      preview: formatted
    };
  }
  
  // Caso não se encaixe em nenhum padrão
  return {
    formatted: `+55 11 ${number.substring(0, Math.min(5, number.length))}-${number.substring(5, Math.min(9, number.length))}`,
    isValid: false,
    error: 'Formato não reconhecido',
    preview: `+55 11 ${number.substring(0, Math.min(5, number.length))}-${number.substring(5, Math.min(9, number.length))}`
  };
}

/**
 * Função para validar se um número de WhatsApp está no formato correto
 */
export function validateWhatsAppNumber(number: string): boolean {
  const result = formatWhatsAppNumber(number);
  return result.isValid;
}

/**
 * Função para extrair apenas os números de um texto
 */
export function extractNumbers(text: string): string {
  return text.replace(/\D/g, '');
}
