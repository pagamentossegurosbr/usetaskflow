import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade - TaskFlow',
  description: 'Política de privacidade e proteção de dados da TaskFlow',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Informações que Coletamos
            </h2>
            <p className="text-gray-600 mb-6">
              Coletamos informações que você nos fornece diretamente, como nome, email, 
              e dados de uso da plataforma para melhorar sua experiência.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Como Usamos suas Informações
            </h2>
            <p className="text-gray-600 mb-6">
              Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, 
              processar pagamentos e comunicar com você sobre atualizações importantes.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Compartilhamento de Dados
            </h2>
            <p className="text-gray-600 mb-6">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto conforme descrito nesta política ou com seu consentimento.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Segurança dos Dados
            </h2>
            <p className="text-gray-600 mb-6">
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações contra acesso não autorizado, alteração ou destruição.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Seus Direitos
            </h2>
            <p className="text-gray-600 mb-6">
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. 
              Entre em contato conosco para exercer esses direitos.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Cookies e Tecnologias Similares
            </h2>
            <p className="text-gray-600 mb-6">
              Utilizamos cookies e tecnologias similares para melhorar a funcionalidade 
              da plataforma e sua experiência de uso.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
