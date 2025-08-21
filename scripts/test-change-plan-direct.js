const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO MUDANÇA DE PLANO DIRETAMENTE');
console.log('========================================\n');

async function testChangePlanDirect() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Buscar o usuário de teste
    console.log('\n🔍 Buscando usuário de teste...');
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
    
    // Testar mudança de plano diretamente no banco
    console.log('\n🔍 Testando mudança de plano diretamente...');
    
    const newPlan = testUser.subscription_plan === 'free' ? 'aspirante' : 'free';
    console.log(`🎯 Mudando plano de '${testUser.subscription_plan}' para '${newPlan}'`);
    
    // Atualizar diretamente no banco
    await prisma.user.update({
      where: { id: testUser.id },
      data: { subscriptionPlan: newPlan }
    });
    
    console.log('✅ Mudança de plano aplicada diretamente!');
    
    // Verificar se a mudança foi aplicada
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
    
    // Testar a API diretamente (sem middleware)
    console.log('\n🔍 Testando API diretamente...');
    
    const payload = {
      id: testUser.id,
      subscriptionPlan: testUser.subscription_plan // Voltar ao plano original
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Fazer a requisição PATCH diretamente para a API
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
      console.log('✅ API funcionando corretamente!');
    } else {
      console.log('❌ API retornou erro - provavelmente middleware bloqueando');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testChangePlanDirect();
