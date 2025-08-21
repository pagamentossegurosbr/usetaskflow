const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO EXATAMENTE COMO O FRONTEND');
console.log('=======================================\n');

async function testFrontendExact() {
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
    
    // Simular exatamente o que o frontend está enviando
    console.log('\n🔍 Testando PATCH exatamente como o frontend...');
    
    // Simular o payload que o frontend envia para changeRole
    const payload = {
      id: testUser.id,
      role: testUser.role === 'USER' ? 'MODERATOR' : 'USER'
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Simular exatamente os headers que o frontend envia
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
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
testFrontendExact();
