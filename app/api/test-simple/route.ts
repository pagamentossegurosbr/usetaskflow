import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Teste simples OK",
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: "POST teste simples OK",
      receivedData: body,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: "Erro no teste simples",
      message: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 })
  }
}
