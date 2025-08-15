import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suporte - TaskFlow',
  description: 'Central de suporte e ajuda da TaskFlow',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Central de Suporte
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Como Podemos Ajudar?
              </h2>
              <p className="text-gray-600 mb-6">
                Nossa equipe está aqui para ajudar você a aproveitar ao máximo a TaskFlow. 
                Entre em contato conosco através dos canais abaixo.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">suporte@taskflow.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Chat</h3>
                    <p className="text-gray-600">Disponível 24/7</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">📚</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Documentação</h3>
                    <p className="text-gray-600">Guias e tutoriais</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Perguntas Frequentes
              </h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Como criar minha primeira tarefa?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Acesse o dashboard e clique no botão "+" para adicionar uma nova tarefa. 
                    Preencha os detalhes e salve.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Como atualizar meu plano?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Vá para Configurações > Assinatura e escolha o plano que melhor atende suas necessidades.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Esqueci minha senha
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas por email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tempo de Resposta
            </h2>
            <p className="text-gray-600">
              Nosso objetivo é responder a todas as solicitações em até 24 horas durante dias úteis. 
              Para questões urgentes, utilize nosso chat em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
