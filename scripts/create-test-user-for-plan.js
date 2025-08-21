const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('👤 CRIANDO USUÁRIO DE TESTE PARA PLANO');
console.log('======================================\n');

async function createTestUserForPlan() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar se o usuário de teste já existe
    console.log('\n🔍 Verificando se usuário de teste já existe...');
    const existingUser = await prisma.$queryRaw`
      SELECT id, name, email, subscription_plan
      FROM users 
      WHERE email = 'teste@taskflow.com'
    `;
    
    if (existingUser.length > 0) {
      console.log('✅ Usuário de teste já existe:');
      console.log(`👤 Nome: ${existingUser[0].name}`);
      console.log(`📧 Email: ${existingUser[0].email}`);
      console.log(`📋 Plano: ${existingUser[0].subscription_plan}`);
      return;
    }
    
    // Criar usuário de teste
    console.log('\n🔧 Criando usuário de teste...');
    
    const hashedPassword = await bcrypt.hash('teste123', 12);
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'teste@taskflow.com',
        password: hashedPassword,
        role: 'USER',
        subscriptionPlan: 'free',
        subscriptionStatus: 'active'
      }
    });
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log(`👤 ID: ${newUser.id}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`📋 Plano: ${newUser.subscriptionPlan}`);
    console.log(`🎯 Role: ${newUser.role}`);
    
    console.log('\n📋 Credenciais do usuário de teste:');
    console.log('Email: teste@taskflow.com');
    console.log('Senha: teste123');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação
createTestUserForPlan();
