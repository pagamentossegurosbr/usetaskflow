const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO SUBSCRIPTION DO USUÁRIO');
console.log('===================================\n');

async function testUserSubscription() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar todos os usuários e seus planos
    console.log('\n📊 PLANOS DOS USUÁRIOS NO BANCO:');
    console.log('==================================');
    
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
    
    // Testar a API de subscription para cada usuário
    console.log('🔍 TESTANDO API DE SUBSCRIPTION:');
    console.log('================================');
    
    for (const user of users) {
      console.log(`\n🧪 Testando para: ${user.name} (${user.email})`);
      
      // Simular uma requisição para a API de subscription
      // Como não temos autenticação, vamos apenas verificar se a API está funcionando
      try {
        const response = await fetch('http://localhost:3000/api/user/subscription');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   Plano retornado pela API: ${data.plan}`);
          console.log(`   Features disponíveis: ${data.features?.length || 0} features`);
          
          // Verificar se o plano está correto
          if (data.plan === user.subscription_plan) {
            console.log('   ✅ Plano correto!');
          } else {
            console.log(`   ❌ Plano incorreto! Esperado: ${user.subscription_plan}, Recebido: ${data.plan}`);
          }
        } else {
          console.log('   ❌ Erro na API');
        }
      } catch (error) {
        console.log(`   ❌ Erro ao testar API: ${error.message}`);
      }
    }
    
    console.log('\n📈 RESUMO:');
    console.log('==========');
    console.log(`Total de usuários: ${users.length}`);
    console.log('Para testar completamente, você precisa:');
    console.log('1. Fazer login com cada usuário no frontend');
    console.log('2. Verificar se as features estão desbloqueadas');
    console.log('3. Testar se o plano aparece corretamente na interface');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testUserSubscription();
