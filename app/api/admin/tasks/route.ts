import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { debug } from "@/lib/debug"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const userId = searchParams.get("userId")
    const completed = searchParams.get("completed")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search") || ""
    const dateFromRaw = searchParams.get("dateFrom")
    const dateToRaw = searchParams.get("dateTo")
    
    // Debug e validação rigorosa de datas
    debug.log("dateFromRaw:", dateFromRaw, "dateToRaw:", dateToRaw)
    
    const dateFrom = dateFromRaw && dateFromRaw.length < 20 && /^\d{4}-\d{2}-\d{2}$/.test(dateFromRaw) ? dateFromRaw : null
    const dateTo = dateToRaw && dateToRaw.length < 20 && /^\d{4}-\d{2}-\d{2}$/.test(dateToRaw) ? dateToRaw : null

    const skip = (page - 1) * limit

    const where = {
      ...(userId && { userId }),
      ...(completed !== null && { completed: completed === "true" }),
      ...(priority !== null && { priority: priority === "true" }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { text: { contains: search } },
        ]
      }),
      ...(dateFrom && {
        createdAt: {
          gte: new Date(dateFrom),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      }),
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.task.count({ where })
    ])

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json(
        { error: "ID da tarefa é obrigatório" },
        { status: 400 }
      )
    }

    const task = await prisma.task.delete({
      where: { id: taskId }
    })

    // Log da atividade administrativa
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "admin_delete_task",
        details: {
          taskId,
          taskTitle: task.title,
          originalUserId: task.userId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}