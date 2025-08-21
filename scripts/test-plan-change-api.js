const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO API DE MUDANÇA DE PLANO');
console.log('===================================\n');

async function testPlanChangeAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Buscar um usuário para testar
    console.log('\n🔍 Buscando usuário para teste...');
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role, subscription_plan
      FROM users 
      WHERE email = 'teste@taskflow.com'
    `;
    
    if (users.length === 0) {
      console.log('❌ Usuário de teste não encontrado');
      return;
    }
    
    const testUser = users[0];
    console.log(`🧪 Usando usuário: ${testUser.name} (${testUser.id})`);
    console.log(`📋 Plano atual: ${testUser.subscription_plan}`);
    
    // Testar mudança de plano via API
    console.log('\n🔍 Testando mudança de plano via API...');
    
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: testUser.id,
        subscriptionPlan: 'executor'
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resposta da API:', result);
      
      // Verificar se o plano foi alterado no banco
      console.log('\n🔍 Verificando se o plano foi alterado no banco...');
      const updatedUser = await prisma.$queryRaw`
        SELECT id, name, email, role, subscription_plan
        FROM users 
        WHERE id = ${testUser.id}
      `;
      
      console.log('📊 Usuário após atualização:', updatedUser[0]);
      
      // Testar GET da API para ver se retorna subscriptionPlan
      console.log('\n🔍 Testando GET da API...');
      const getResponse = await fetch('http://localhost:3000/api/admin/users');
      
      console.log(`GET Status: ${getResponse.status} ${getResponse.statusText}`);
      
      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('📊 Dados retornados pelo GET:');
        getData.users.forEach(user => {
          console.log(`  - ${user.name}: ${user.subscriptionPlan || 'N/A'}`);
        });
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPlanChangeAPI();
