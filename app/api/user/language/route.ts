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

export async function POST(request: NextRequest) {
  try {
    console.log('=== LANGUAGE UPDATE ROUTE DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('1. Sessão obtida:', session ? 'Sim' : 'Não')
    
    // Se não há sessão, retornar erro
    if (!session?.user?.email) {
      console.log('2. Usuário não autenticado')
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { language } = body
    
    console.log('3. Idioma recebido:', language)
    
    // Por enquanto, apenas logar o idioma (não salvamos no banco)
    console.log('4. Idioma processado com sucesso (sem salvar no banco)')
    
    return NextResponse.json({ 
      message: 'Idioma processado com sucesso (sem salvar no banco)',
      language 
    })

  } catch (error) {
    console.error("❌ Erro na rota de atualização de idioma:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

