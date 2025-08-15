import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== LANGUAGE ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Se não há sessão, retornar idioma padrão
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado, retornando idioma padrão')
      return NextResponse.json({ language: 'pt-BR' })
    }

    console.log('3. Usuário autenticado, retornando idioma padrão')
    return NextResponse.json({ language: 'pt-BR' })

  } catch (error) {
    console.error("❌ Erro na rota de idioma:", error)
    return NextResponse.json(
      { 
        language: 'pt-BR',
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

