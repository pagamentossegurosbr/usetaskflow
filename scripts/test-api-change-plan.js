const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO API DE MUDANÇA DE PLANO');
console.log('===================================\n');

async function testApiChangePlan() {
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
    
    const newPlan = testUser.subscription_plan === 'free' ? 'aspirante' : 'free';
    console.log(`🎯 Mudando plano de '${testUser.subscription_plan}' para '${newPlan}'`);
    
    // Simular o payload que o frontend envia
    const payload = {
      id: testUser.id,
      subscriptionPlan: newPlan
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Fazer a requisição PATCH
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('Resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Mudança de plano bem-sucedida via API!');
      
      // Verificar se a mudança foi aplicada no banco
      console.log('\n🔍 Verificando mudança no banco de dados...');
      const updatedUser = await prisma.$queryRaw`
        SELECT id, name, email, subscription_plan
        FROM users 
        WHERE id = ${testUser.id}
      `;
      
      const updated = updatedUser[0];
      console.log(`👤 Usuário: ${updated.name} (${updated.email})`);
      console.log(`📋 Plano após mudança: ${updated.subscription_plan}`);
      
      if (updated.subscription_plan === newPlan) {
        console.log('✅ Mudança confirmada no banco de dados!');
      } else {
        console.log('❌ Mudança não foi aplicada no banco de dados');
      }
      
    } else {
      console.log('❌ Mudança de plano falhou via API');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testApiChangePlan();
