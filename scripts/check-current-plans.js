const { PrismaClient } = require('@prisma/client');

console.log('🔍 VERIFICANDO PLANOS ATUAIS');
console.log('============================\n');

async function checkCurrentPlans() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar todos os usuários e seus planos
    console.log('\n📊 PLANOS ATUAIS DOS USUÁRIOS:');
    console.log('================================');
    
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role, subscription_plan
      FROM users 
      ORDER BY name
    `;
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🎯 Role: ${user.role}`);
      console.log(`   📋 Plano: ${user.subscription_plan}`);
      console.log('');
    });
    
    console.log(`📈 Total de usuários: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkCurrentPlans();
