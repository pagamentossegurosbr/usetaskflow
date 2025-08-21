const { PrismaClient } = require('@prisma/client');

console.log('🔍 DEBUGANDO MUDANÇA DE PLANO');
console.log('=============================\n');

async function debugChangePlan() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar todos os usuários e seus planos
    console.log('\n🔍 Verificando todos os usuários...');
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role, subscription_plan
      FROM users 
      ORDER BY name
    `;
    
    console.log(`📊 Total de usuários: ${users.length}`);
    users.forEach(user => {
      console.log(`👤 ${user.name} (${user.email}) - Plano: ${user.subscription_plan} - Role: ${user.role}`);
    });
    
    // Testar mudança de plano diretamente no banco
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testando mudança de plano para: ${testUser.name}`);
      console.log(`📋 Plano atual: ${testUser.subscription_plan}`);
      
      const newPlan = testUser.subscription_plan === 'free' ? 'aspirante' : 'free';
      console.log(`🎯 Mudando para: ${newPlan}`);
      
      // Atualizar diretamente no banco
      await prisma.user.update({
        where: { id: testUser.id },
        data: { subscriptionPlan: newPlan }
      });
      
      console.log('✅ Mudança aplicada diretamente no banco!');
      
      // Verificar se foi aplicada
      const updatedUser = await prisma.$queryRaw`
        SELECT id, name, email, subscription_plan
        FROM users 
        WHERE id = ${testUser.id}
      `;
      
      const updated = updatedUser[0];
      console.log(`📋 Plano após mudança: ${updated.subscription_plan}`);
      
      if (updated.subscription_plan === newPlan) {
        console.log('✅ Mudança confirmada no banco!');
      } else {
        console.log('❌ Mudança não foi aplicada!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar debug
debugChangePlan();
