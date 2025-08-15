import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTE DE AUTENTICAÇÃO ===')
    
    const body = await request.json()
    console.log('1. Dados recebidos:', { email: body.email })
    
    // Teste 1: Verificar se usuário existe
    console.log('2. Verificando usuário...')
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        level: true,
        xp: true,
        isBanned: true,
        isActive: true
      }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado')
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    
    console.log('✅ Usuário encontrado:', { id: user.id, email: user.email, role: user.role })
    
    // Teste 2: Verificar se está banido
    if (user.isBanned) {
      console.log('❌ Usuário banido')
      return NextResponse.json({ error: 'Usuário banido' }, { status: 403 })
    }
    
    // Teste 3: Verificar se está ativo
    if (!user.isActive) {
      console.log('❌ Usuário inativo')
      return NextResponse.json({ error: 'Usuário inativo' }, { status: 403 })
    }
    
    // Teste 4: Verificar senha
    console.log('3. Verificando senha...')
    if (!user.password) {
      console.log('❌ Usuário sem senha (OAuth)')
      return NextResponse.json({ error: 'Usuário sem senha' }, { status: 400 })
    }
    
    const isValidPassword = await bcrypt.compare(body.password, user.password)
    if (!isValidPassword) {
      console.log('❌ Senha inválida')
      return NextResponse.json({ error: 'Senha inválida' }, { status: 401 })
    }
    
    console.log('✅ Senha válida')
    
    // Teste 5: Atualizar último login
    console.log('4. Atualizando último login...')
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    console.log('✅ Último login atualizado')
    
    // Retornar dados do usuário
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
      xp: user.xp
    }
    
    console.log('✅ Autenticação bem-sucedida:', userData)
    return NextResponse.json({
      message: 'Autenticação bem-sucedida',
      user: userData
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de autenticação:', error)
    return NextResponse.json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
