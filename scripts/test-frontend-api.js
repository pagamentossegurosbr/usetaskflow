const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO API COMO O FRONTEND');
console.log('=================================\n');

async function testFrontendAPI() {
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
    
    // Simular o que o frontend está enviando
    console.log('\n🔍 Testando PATCH como o frontend...');
    
    // Testar diferentes tipos de payload que o frontend pode estar enviando
    const testPayloads = [
      {
        name: 'changeRole',
        payload: {
          id: testUser.id,
          role: testUser.role === 'USER' ? 'MODERATOR' : 'USER'
        }
      },
      {
        name: 'ban',
        payload: {
          id: testUser.id,
          isBanned: true
        }
      },
      {
        name: 'edit',
        payload: {
          id: testUser.id,
          name: 'Novo Nome',
          email: 'novo@email.com'
        }
      }
    ];
    
    for (const test of testPayloads) {
      console.log(`\n🔍 Testando: ${test.name}`);
      console.log('Payload:', JSON.stringify(test.payload, null, 2));
      
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(test.payload)
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log('Resposta:', responseText);
      
      if (response.ok) {
        console.log(`✅ ${test.name} bem-sucedido!`);
      } else {
        console.log(`❌ ${test.name} falhou`);
      }
      
      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testFrontendAPI();
