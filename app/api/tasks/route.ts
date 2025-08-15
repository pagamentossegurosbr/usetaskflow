import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TASKS ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Se não há sessão, retornar array vazio
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado, retornando array vazio')
      return NextResponse.json({ tasks: [] })
    }

    console.log('3. Usuário autenticado, retornando array vazio (sem tabela tasks)')
    return NextResponse.json({ tasks: [] })

  } catch (error) {
    console.error("❌ Erro na rota de tarefas:", error)
    return NextResponse.json(
      { 
        tasks: [],
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE TASK DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    console.log('3. Dados recebidos:', body)

    console.log('4. Retornando tarefa simulada (sem tabela tasks)')
    return NextResponse.json({
      id: `task-${Date.now()}`,
      title: body.title || 'Tarefa simulada',
      completed: false,
      createdAt: new Date().toISOString(),
      userId: session.user.id
    })

  } catch (error) {
    console.error("❌ Erro ao criar tarefa:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}