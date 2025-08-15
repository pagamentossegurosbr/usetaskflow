import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, isAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar alguns usuários para criar tarefas
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true }
    })

    if (users.length === 0) {
      return NextResponse.json({ error: "Nenhum usuário encontrado" }, { status: 404 })
    }

    // Tarefas de exemplo
    const sampleTasks = [
      { title: "Revisar relatório mensal", text: "Analisar dados de vendas do mês passado", priority: true },
      { title: "Preparar apresentação", text: "Criar slides para reunião com cliente", priority: false },
      { title: "Atualizar sistema", text: "Instalar atualizações de segurança", priority: true },
      { title: "Responder emails", text: "Verificar e responder emails pendentes", priority: false },
      { title: "Reunião de equipe", text: "Participar da reunião semanal", priority: false },
      { title: "Backup dos dados", text: "Fazer backup completo do sistema", priority: true },
      { title: "Treinar novo funcionário", text: "Orientar sobre processos da empresa", priority: false },
      { title: "Revisar código", text: "Code review do projeto em desenvolvimento", priority: true },
    ]

    // Criar tarefas para diferentes usuários
    const tasksToCreate = []
    for (let i = 0; i < sampleTasks.length; i++) {
      const user = users[i % users.length]
      const task = sampleTasks[i]
      
      // Algumas tarefas já completadas
      const completed = Math.random() > 0.6
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
      
      tasksToCreate.push({
        title: task.title,
        text: task.text,
        priority: task.priority,
        completed,
        completedAt: completed ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) : null,
        userId: user.id,
        createdAt,
        updatedAt: createdAt,
      })
    }

    // Inserir tarefas no banco
    const createdTasks = await prisma.task.createMany({
      data: tasksToCreate
    })

    return NextResponse.json({
      message: `${createdTasks.count} tarefas de exemplo criadas com sucesso`,
      count: createdTasks.count,
      users: users.map(u => u.name)
    })

  } catch (error) {
    console.error("Erro ao criar tarefas de exemplo:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}