import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== TESTE SIMPLES ===')
    
    // Teste 1: Conexão básica
    console.log('1. Testando conexão...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão OK:', result)
    
    // Teste 2: Verificar tabela users
    console.log('2. Verificando tabela users...')
    const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
    console.log('✅ Tabela users OK, total:', users)
    
    // Teste 3: Tentar buscar com Prisma
    console.log('3. Testando busca com Prisma...')
    const prismaUsers = await prisma.user.findMany({ take: 1 })
    console.log('✅ Busca Prisma OK, usuários encontrados:', prismaUsers.length)
    
    return NextResponse.json({
      status: 'success',
      message: 'Todos os testes passaram',
      userCount: users[0].count,
      prismaUsers: prismaUsers.length
    })
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
