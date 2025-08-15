import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('=== TESTE DE CONEXÃO COM BANCO ===')
    
    // Teste básico de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão OK:', result)
    
    // Verificar se a tabela users existe
    try {
      const users = await prisma.user.findMany({
        take: 1,
        select: { id: true, email: true }
      })
      console.log('✅ Tabela users existe:', users.length > 0)
    } catch (error) {
      console.log('❌ Erro ao acessar tabela users:', error)
    }
    
    // Tentar criar um usuário de teste
    try {
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'hashed_password',
          role: 'USER',
          level: 1,
          xp: 0,
          isActive: true
        },
        select: { id: true, email: true }
      })
      console.log('✅ Usuário de teste criado:', testUser)
      
      // Deletar o usuário de teste
      await prisma.user.delete({
        where: { id: testUser.id }
      })
      console.log('✅ Usuário de teste deletado')
      
    } catch (error) {
      console.log('❌ Erro ao criar usuário de teste:', error)
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Teste de banco concluído',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
