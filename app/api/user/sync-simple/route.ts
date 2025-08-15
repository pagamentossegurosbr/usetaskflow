import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SYNC SIMPLE DEBUG ===')
    
    // Verificar se conseguimos importar as dependências
    console.log('1. Verificando dependências...')
    
    const session = await getServerSession(authOptions)
    console.log('2. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Verificar se o usuário está autenticado
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    console.log('3. Email da query:', email)
    console.log('4. Email da sessão:', session.user.email)

    // Verificar se o email da query é o mesmo da sessão (segurança)
    if (email !== session.user.email) {
      console.log('❌ Email não corresponde à sessão')
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar dados do usuário com schema ultra-minimal
    console.log('5. Buscando usuário no banco...')
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado no banco')
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log('✅ Usuário encontrado:', user.id)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Valores padrão para campos que não existem no schema ultra-minimal
      xp: 0,
      level: 1,
      bio: null,
      title: null,
      avatar: null,
      theme: 'dark',
      lastUpdated: new Date().toISOString(),
    })

  } catch (error) {
    console.error("❌ Erro na sincronização:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
