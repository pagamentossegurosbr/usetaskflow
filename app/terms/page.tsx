import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso - TaskFlow',
  description: 'Termos de uso e condições da plataforma TaskFlow',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-gray-600 mb-6">
              Ao acessar e usar a plataforma TaskFlow, você concorda em cumprir e estar vinculado a estes termos de uso.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. Uso da Plataforma
            </h2>
            <p className="text-gray-600 mb-6">
              A TaskFlow é uma plataforma de produtividade que permite gerenciar tarefas, projetos e hábitos. 
              Você é responsável por manter a confidencialidade de sua conta.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Privacidade e Dados
            </h2>
            <p className="text-gray-600 mb-6">
              Sua privacidade é importante para nós. Consulte nossa Política de Privacidade para entender 
              como coletamos, usamos e protegemos suas informações.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Limitações de Responsabilidade
            </h2>
            <p className="text-gray-600 mb-6">
              A TaskFlow é fornecida "como está" sem garantias de qualquer tipo. Não nos responsabilizamos 
              por perdas ou danos decorrentes do uso da plataforma.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Modificações
            </h2>
            <p className="text-gray-600 mb-6">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              As modificações entrarão em vigor imediatamente após a publicação.
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
