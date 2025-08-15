import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimiters, checkRateLimit, getRateLimitHeaders, getIPIdentifier } from '@/lib/rateLimiter'

// GET - Buscar tarefas do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST - Criar nova tarefa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Rate limiting para criação de tarefas
    const identifier = session.user.email || getIPIdentifier(request);
    const rateLimitResult = checkRateLimit(rateLimiters.taskCreation, identifier);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message || "Rate limit excedido" },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            ...getRateLimitHeaders(rateLimiters.taskCreation, identifier)
          }
        }
      );
    }

    const body = await request.json()
    const { 
      title, 
      text, 
      description, 
      category, 
      priority = false, 
      priorityLevel,
      deadline,
      estimatedTime,
      tags,
      recurrence,
      links,
      checklist,
      reward,
      notes,
      scheduledFor 
    } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Título da tarefa é obrigatório" }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        text: text || title.trim(),
        userId: session.user.id,
        // Campos opcionais
        ...(description && { description }),
        ...(category && { category }),
        ...(priority !== undefined && { priority }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(estimatedTime && { estimatedTime }),
        ...(tags && { tags }),
        ...(reward && { reward }),
      }
    })

    return NextResponse.json({ task }, { status: 201 })

  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tarefa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      id, 
      text, 
      completed, 
      priority, 
      scheduledFor,
      description,
      category,
      deadline,
      estimatedTime,
      tags,
      reward
    } = body

    console.log("PUT /api/tasks - Body recebido:", { id, text, completed, priority, scheduledFor, description, category, deadline, estimatedTime, tags, reward })
    console.log("PUT /api/tasks - ID type:", typeof id, "ID value:", id)

    if (!id || id === 'undefined' || id === 'null') {
      console.error("PUT /api/tasks - ID da tarefa não fornecido ou inválido:", id)
      return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (text !== undefined) {
      updateData.text = text.trim()
      updateData.title = text.trim().substring(0, 100)
    }
    
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }
    
    if (priority !== undefined) {
      updateData.priority = priority
    }
    
    if (scheduledFor !== undefined) {
      updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
    }
    
    // Campos opcionais
    if (description !== undefined) {
      updateData.description = description
    }
    
    if (category !== undefined) {
      updateData.category = category
    }
    
    if (deadline !== undefined) {
      updateData.deadline = deadline ? new Date(deadline) : null
    }
    
    if (estimatedTime !== undefined) {
      updateData.estimatedTime = estimatedTime
    }
    
    if (tags !== undefined) {
      updateData.tags = tags
    }
    
    if (reward !== undefined) {
      updateData.reward = reward
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ task })

  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar tarefa
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 })
    }

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Tarefa deletada com sucesso" })

  } catch (error) {
    console.error("Erro ao deletar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}