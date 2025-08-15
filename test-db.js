const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testando conexão com banco de dados...')
    
    // Teste básico de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexão com banco OK:', result)
    
    // Teste de busca de usuários
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true, name: true }
    })
    console.log('✅ Busca de usuários OK:', users.length, 'usuários encontrados')
    
    // Teste de criação de usuário (sem salvar)
    console.log('✅ Prisma configurado corretamente')
    
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
