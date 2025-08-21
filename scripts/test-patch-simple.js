const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTE SIMPLES DO PATCH');
console.log('==========================\n');

async function testPatchSimple() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Buscar um usuário para testar
    const users = await prisma.$queryRaw`SELECT id, name, email, role FROM users LIMIT 1`;
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    const testUser = users[0];
    console.log(`🧪 Usando usuário: ${testUser.name} (${testUser.id})`);
    
    // Testar PATCH diretamente
    console.log('\n🔍 Testando PATCH /api/admin/users...');
    
    const payload = {
      id: testUser.id,
      role: testUser.role === 'USER' ? 'ADMIN' : 'USER'
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('Resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ PATCH bem-sucedido!');
    } else {
      console.log('❌ PATCH falhou');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPatchSimple();
