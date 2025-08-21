import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptionsFixed } from "@/lib/auth-fixed"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SUBSCRIPTION ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptionsFixed)
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

    // Buscar o plano real do usuário no banco de dados
    console.log('3. Buscando plano do usuário no banco de dados...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { subscriptionPlan: true }
    })

    if (!user) {
      console.log('4. Usuário não encontrado no banco, retornando plano gratuito')
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        features: ['basic_tasks', 'basic_analytics'],
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      })
    }

    const plan = user.subscriptionPlan || 'free'
    console.log(`5. Plano encontrado: ${plan}`)

    // Definir features baseadas no plano
    const getFeatures = (plan: string) => {
      switch (plan) {
        case 'executor':
          return [
            'basic_tasks', 'advanced_tasks', 'basic_analytics', 'advanced_analytics',
            'habits', 'library', 'pomodoro', 'cave_mode', 'project_planner',
            'unlimited_tasks', 'priority_support', 'custom_themes'
          ]
        case 'aspirante':
          return [
            'basic_tasks', 'advanced_tasks', 'basic_analytics', 'advanced_analytics',
            'habits', 'library', 'pomodoro', 'cave_mode', 'project_planner'
          ]
        case 'free':
        default:
          return ['basic_tasks', 'basic_analytics']
      }
    }

    const features = getFeatures(plan)
    console.log(`6. Features disponíveis: ${features.length} features`)

    return NextResponse.json({
      plan: plan,
      status: 'active',
      features: features,
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
