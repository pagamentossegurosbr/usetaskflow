'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Language, detectLanguage, setLanguage as setLanguageStorage, getTranslations } from '@/lib/i18n';

export function useLanguage() {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>('pt');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        if (session?.user) {
          // Buscar idioma do usuário no servidor
          const response = await fetch('/api/user/language');
          if (response.ok) {
            const data = await response.json();
            setLanguageState(data.language);
          } else {
            console.warn('Erro ao buscar idioma do servidor, usando detecção local');
            // Fallback para detecção local
            const detectedLanguage = detectLanguage();
            setLanguageState(detectedLanguage);
          }
        } else {
          // Usuário não logado, usar detecção local
          const detectedLanguage = detectLanguage();
          setLanguageState(detectedLanguage);
        }
      } catch (error) {
        console.warn('Erro ao carregar idioma, usando português como fallback:', error);
        // Fallback para português
        setLanguageState('pt');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [session?.user]);

  const changeLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    setLanguageStorage(newLanguage);

    // Salvar no servidor se usuário estiver logado
    if (session?.user) {
      try {
        const response = await fetch('/api/user/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLanguage })
        });
        
        if (!response.ok) {
          console.warn('Erro ao salvar idioma no servidor, mas continuando com mudança local');
        }
      } catch (error) {
        console.warn('Erro ao salvar idioma no servidor, mas continuando com mudança local:', error);
      }
    }
  };

  const translations = getTranslations(language);

  return {
    language,
    translations,
    changeLanguage,
    isLoading
  };
}
