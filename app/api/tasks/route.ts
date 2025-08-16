import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// Importação adiada do Prisma para evitar crash em edge/produção sem DATABASE_URL
async function getPrismaSafe() {
  try {
    const mod = await import('@/lib/prisma')
    return mod.prisma
  } catch (e) {
    return null as any
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function shouldFallbackToStateless(error: any): boolean {
  const code = error?.code || error?.meta?.code;
  if (!code) return false;
  // Erros típicos de conexão/misconfiguração no Prisma em produção
  return (
    code.startsWith?.('P100') || // P1000..P1009 (conexão/credenciais)
    code === 'P1013' // string de conexão inválida
  );
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== TASKS ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Se não há sessão, retornar array vazio
    if (!session?.user?.id) {
      console.log('2. Usuário não autenticado, retornando array vazio')
      return NextResponse.json({ tasks: [] })
    }

    // Buscar tarefas do usuário. Tentamos retornar campos completos; se o DB
    // não tiver alguma coluna opcional (schema parcial), fazemos fallback para básicos
    let tasks
    try {
      const prisma = await getPrismaSafe()
      if (!prisma) return NextResponse.json({ tasks: [] })
      tasks = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          text: true,
          completed: true,
          priority: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          scheduledFor: true,
          // Campos opcionais (podem não existir em DB sem migrações)
          description: true,
          category: true,
          deadline: true,
          estimatedTime: true,
          tags: true,
          reward: true,
        }
      })
    } catch (err: any) {
      if (err?.code === 'P2022') {
        const prisma = await getPrismaSafe()
        if (!prisma) return NextResponse.json({ tasks: [] })
        tasks = await prisma.task.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            text: true,
            completed: true,
            priority: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            completedAt: true,
            scheduledFor: true,
          }
        })
      } else if (!process.env.DATABASE_URL || shouldFallbackToStateless(err)) {
        // Fallback sem DB: retornar lista vazia para não quebrar a UI
        return NextResponse.json({ tasks: [] })
      } else {
        throw err
      }
    }

    console.log(`3. Encontradas ${tasks.length} tarefas para o usuário`)
    return NextResponse.json({ tasks })

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
    
    if (!session?.user?.id) {
      console.log('2. Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    console.log('3. Dados recebidos:', body)

    // Preparar dados base e opcionais
    const baseData = {
      title: body.title || body.text || 'Nova tarefa',
      text: body.text || body.title || 'Nova tarefa',
      userId: session.user.id,
      priority: body.priority || false,
    } as any
    const optionalData = {
      ...(body.description ? { description: body.description } : {}),
      ...(body.category ? { category: body.category } : {}),
      ...(body.deadline ? { deadline: new Date(body.deadline) } : {}),
      ...(typeof body.estimatedTime === 'number' ? { estimatedTime: body.estimatedTime } : {}),
      ...(Array.isArray(body.tags) ? { tags: body.tags } : {}),
      ...(body.reward ? { reward: body.reward } : {}),
      ...(body.scheduledFor ? { scheduledFor: new Date(body.scheduledFor) } : {}),
    }

    // Tentar com opcionais; se o banco não tiver colunas, refazer só com base
    let task
    try {
      const prisma = await getPrismaSafe()
      if (!prisma) {
        const now = new Date().toISOString()
        return NextResponse.json({ task: {
          id: `task-${Date.now()}`,
          title: baseData.title,
          text: baseData.text,
          completed: false,
          priority: !!baseData.priority,
          userId: session.user.id,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          scheduledFor: null,
        } })
      }
      task = await prisma.task.create({
        data: { ...baseData, ...optionalData },
        select: {
          id: true,
          title: true,
          text: true,
          completed: true,
          priority: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          scheduledFor: true,
          description: true,
          category: true,
          deadline: true,
          estimatedTime: true,
          tags: true,
          reward: true,
        }
      })
    } catch (err: any) {
      if (err?.code === 'P2022') {
        // Coluna inexistente; criar apenas com campos base
        const prisma = await getPrismaSafe()
        if (!prisma) return NextResponse.json({ task: {
          id: `task-${Date.now()}`,
          title: baseData.title,
          text: baseData.text,
          completed: false,
          priority: !!baseData.priority,
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          scheduledFor: null,
        } })
        task = await prisma.task.create({
          data: { ...baseData },
          select: {
            id: true,
            title: true,
            text: true,
            completed: true,
            priority: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            completedAt: true,
            scheduledFor: true,
          }
        })
      } else if (!process.env.DATABASE_URL || shouldFallbackToStateless(err)) {
        // Fallback sem DB: responder com tarefa simulada (UI salva no localStorage)
        const now = new Date().toISOString()
        const simulated = {
          id: `task-${Date.now()}`,
          title: baseData.title,
          text: baseData.text,
          completed: false,
          priority: !!baseData.priority,
          userId: session.user.id,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          scheduledFor: null,
        }
        return NextResponse.json({ task: simulated })
      } else {
        throw err
      }
    }

    console.log('4. Tarefa criada com sucesso:', task.id)
    return NextResponse.json({ task })

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

export async function PUT(request: NextRequest) {
  try {
    console.log('=== UPDATE TASK DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    if (!session?.user?.id) {
      console.log('2. Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    console.log('3. Dados recebidos:', body)

    if (!body.id) {
      return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário sem ler colunas opcionais
    const prisma = await getPrismaSafe()
    if (!prisma) {
      // Sem DB, simular sucesso na atualização
      return NextResponse.json({
        task: {
          id: body.id,
          title: body.title || body.text || 'Tarefa',
          text: body.text || body.title || 'Tarefa',
          completed: !!body.completed,
          priority: !!body.priority,
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: body.completed ? new Date().toISOString() : null,
          scheduledFor: null,
        },
        warning: 'Sem conexão com DB; atualização não foi persistida.'
      })
    }
    const ownsTask = await prisma.task.count({
      where: {
        id: body.id,
        userId: session.user.id,
      },
    })

    if (ownsTask === 0) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const updateOptional = {
      ...(body.description ? { description: body.description } : {}),
      ...(body.category ? { category: body.category } : {}),
      ...(body.deadline ? { deadline: new Date(body.deadline) } : {}),
      ...(typeof body.estimatedTime === 'number' ? { estimatedTime: body.estimatedTime } : {}),
      ...(Array.isArray(body.tags) ? { tags: body.tags } : {}),
      ...(body.reward ? { reward: body.reward } : {}),
      ...(body.scheduledFor ? { scheduledFor: new Date(body.scheduledFor) } : {}),
    }

    const updateBase = {
      ...(body.title || body.text ? { title: body.title || body.text } : {}),
      ...(body.text || body.title ? { text: body.text || body.title } : {}),
      ...(typeof body.completed === 'boolean' ? { completed: body.completed } : {}),
      ...(typeof body.priority === 'boolean' ? { priority: body.priority } : {}),
      ...(typeof body.completed === 'boolean' ? { completedAt: body.completed ? new Date() : null } : {}),
    }

    let updatedTask
    try {
      updatedTask = await prisma.task.update({
        where: { id: body.id },
        data: { ...updateBase, ...updateOptional },
        select: {
          id: true,
          title: true,
          text: true,
          completed: true,
          priority: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          scheduledFor: true,
          description: true,
          category: true,
          deadline: true,
          estimatedTime: true,
          tags: true,
          reward: true,
        }
      })
    } catch (err: any) {
      if (err?.code === 'P2022') {
        updatedTask = await prisma.task.update({
          where: { id: body.id },
          data: { ...updateBase },
          select: {
            id: true,
            title: true,
            text: true,
            completed: true,
            priority: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            completedAt: true,
            scheduledFor: true,
          }
        })
      } else if (!process.env.DATABASE_URL || shouldFallbackToStateless(err)) {
        // Fallback sem DB: responder sucesso sem persistir para não quebrar a UX
        return NextResponse.json({
          task: {
            id: body.id,
            title: body.title || body.text || 'Tarefa',
            text: body.text || body.title || 'Tarefa',
            completed: !!body.completed,
            priority: !!body.priority,
            userId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: body.completed ? new Date().toISOString() : null,
            scheduledFor: null,
          },
          warning: 'Sem conexão com DB em produção; atualização não foi persistida.'
        })
      } else {
        throw err
      }
    }

    console.log('4. Tarefa atualizada com sucesso:', updatedTask.id)
    return NextResponse.json({ task: updatedTask })

  } catch (error) {
    console.error("❌ Erro ao atualizar tarefa:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Suporte a DELETE ?id=...
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Deleta sem ler colunas opcionais (evita P2022 se o schema do DB estiver parcial)
    const prisma = await getPrismaSafe()
    if (!prisma) {
      return NextResponse.json({ success: true, warning: 'Sem conexão com DB; deleção não persistida.' })
    }
    let result
    try {
      result = await prisma.task.deleteMany({ where: { id, userId: session.user.id } })
    } catch (err: any) {
      if (!process.env.DATABASE_URL || shouldFallbackToStateless(err)) {
        // Fallback sem DB: responder 200 mesmo sem deletar no servidor
        return NextResponse.json({ success: true, warning: 'Sem conexão com DB em produção; deleção não foi persistida.' })
      }
      throw err
    }
    if (result.count === 0) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}