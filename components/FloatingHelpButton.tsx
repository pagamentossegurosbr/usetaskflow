'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  X,
  ExternalLink
} from 'lucide-react';
import { useSupportConfig } from '@/hooks/useSupportConfig';

export function FloatingHelpButton() {
  const { config, loading, lastUpdate } = useSupportConfig();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com o TaskFlow Notch.');
    const url = `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Suporte - TaskFlow Notch');
    const body = encodeURIComponent('Olá!\n\nPreciso de ajuda com o TaskFlow Notch.\n\nObrigado!');
    const url = `mailto:${config.supportEmail}?subject=${subject}&body=${body}`;
    window.open(url);
  };

  // Não mostrar o botão se o suporte estiver desabilitado
  if (!config.supportEnabled) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Botão Principal */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`
                h-12 w-12 rounded-full shadow-lg border border-white/10 
                bg-black/40 backdrop-blur-xl hover:bg-black/60 
                transition-all duration-300 ease-in-out relative
                ${isExpanded ? 'bg-purple-600/80 hover:bg-purple-700/80' : ''}
              `}
            >
              {/* Indicador de atualização recente */}
              {lastUpdate > 0 && Date.now() - lastUpdate < 10000 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              )}
              {isExpanded ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <HelpCircle className="h-5 w-5 text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-black/80 backdrop-blur-sm border border-white/10">
            <p className="text-white text-sm">Precisa de ajuda?</p>
          </TooltipContent>
        </Tooltip>

        {/* Opções de Ajuda */}
        <div className={`
          absolute bottom-16 right-0 space-y-2 transition-all duration-300 ease-in-out
          ${isExpanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}>
          {/* WhatsApp */}
          <Button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600/80 backdrop-blur-xl hover:bg-green-700/80 text-white text-sm font-medium rounded-lg shadow-lg border border-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4" />
            Suporte Via WhatsApp
          </Button>

          {/* Email */}
          <Button
            onClick={handleEmail}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 backdrop-blur-xl hover:bg-blue-700/80 text-white text-sm font-medium rounded-lg shadow-lg border border-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            <Mail className="h-4 w-4" />
            Suporte Via Email
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
