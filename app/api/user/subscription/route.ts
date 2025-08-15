import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SUBSCRIPTION ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Se não há sessão, retornar plano gratuito
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado, retornando plano gratuito')
      return NextResponse.json({ 
        plan: 'free',
        status: 'active',
        features: ['basic_tasks', 'basic_analytics']
      })
    }

    console.log('3. Usuário autenticado, retornando plano gratuito (sem tabela subscription)')
    return NextResponse.json({
      plan: 'free',
      status: 'active',
      features: ['basic_tasks', 'basic_analytics'],
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    })

  } catch (error) {
    console.error("❌ Erro na rota de assinatura:", error)
    return NextResponse.json(
      { 
        plan: 'free',
        status: 'active',
        features: ['basic_tasks', 'basic_analytics'],
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
