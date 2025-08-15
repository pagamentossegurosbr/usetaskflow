import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SIGNUP ===')
    
    const body = await request.json()
    console.log('1. Dados recebidos:', { name: body.name, email: body.email })
    
    // Teste 1: Conexão com banco
    console.log('2. Testando conexão com banco...')
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Conexão OK:', testResult)
    } catch (error) {
      console.log('❌ Erro de conexão:', error)
      return NextResponse.json({ error: 'Erro de conexão com banco' }, { status: 500 })
    }
    
    // Teste 2: Verificar se tabela users existe
    console.log('3. Verificando tabela users...')
    try {
      const users = await prisma.user.findMany({ take: 1 })
      console.log('✅ Tabela users existe, total:', users.length)
    } catch (error) {
      console.log('❌ Erro ao acessar tabela users:', error)
      return NextResponse.json({ error: 'Tabela users não existe' }, { status: 500 })
    }
    
    // Teste 3: Verificar se usuário já existe
    console.log('4. Verificando usuário existente...')
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true }
      })
      console.log('✅ Verificação OK, usuário existe:', !!existingUser)
      
      if (existingUser) {
        return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 })
      }
    } catch (error) {
      console.log('❌ Erro ao verificar usuário:', error)
      return NextResponse.json({ error: 'Erro ao verificar usuário' }, { status: 500 })
    }
    
    // Teste 4: Hash da senha
    console.log('5. Criando hash da senha...')
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12)
      console.log('✅ Hash criado com sucesso')
    } catch (error) {
      console.log('❌ Erro ao criar hash:', error)
      return NextResponse.json({ error: 'Erro ao processar senha' }, { status: 500 })
    }
    
    // Teste 5: Criar usuário
    console.log('6. Tentando criar usuário...')
    try {
      const hashedPassword = await bcrypt.hash(body.password, 12)
      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          role: 'USER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      console.log('✅ Usuário criado com sucesso:', user.id)
      
      return NextResponse.json({
        message: 'Usuário criado com sucesso',
        user
      }, { status: 201 })
      
    } catch (error) {
      console.log('❌ Erro ao criar usuário:', error)
      console.log('❌ Detalhes do erro:', error instanceof Error ? error.message : 'Erro desconhecido')
      return NextResponse.json({ 
        error: 'Erro ao criar usuário',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erro geral no debug:', error)
    return NextResponse.json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
