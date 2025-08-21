const { PrismaClient } = require('@prisma/client');

console.log('🔐 TESTANDO API DE USUÁRIOS COM AUTENTICAÇÃO');
console.log('=============================================\n');

async function testAuthUsersAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Primeiro, fazer login para obter uma sessão
    console.log('\n🔐 Fazendo login...');
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@taskflow.com',
          password: 'admin123',
          redirect: false
        })
      });
      
      console.log(`Status do login: ${loginResponse.status} ${loginResponse.statusText}`);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login bem-sucedido');
        console.log('Dados do login:', JSON.stringify(loginData, null, 2));
        
        // Extrair cookies da resposta
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('Cookies recebidos:', cookies);
        
        // Testar GET /api/admin/users com autenticação
        console.log('\n🔍 Testando GET /api/admin/users com autenticação...');
        const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
          headers: {
            'Cookie': cookies || ''
          }
        });
        
        console.log(`Status: ${usersResponse.status} ${usersResponse.statusText}`);
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log(`✅ GET /api/admin/users: ${usersData.users.length} usuários retornados`);
          console.log('Dados:', JSON.stringify(usersData, null, 2));
          
          // Testar PATCH com autenticação
          if (usersData.users.length > 0) {
            const testUser = usersData.users[0];
            console.log(`\n🔍 Testando PATCH com usuário: ${testUser.name}`);
            
            const patchPayload = {
              id: testUser.id,
              role: testUser.role === 'USER' ? 'ADMIN' : 'USER'
            };
            
            console.log('Payload:', JSON.stringify(patchPayload, null, 2));
            
            const patchResponse = await fetch('http://localhost:3000/api/admin/users', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies || ''
              },
              body: JSON.stringify(patchPayload)
            });
            
            console.log(`Status do PATCH: ${patchResponse.status} ${patchResponse.statusText}`);
            
            if (patchResponse.ok) {
              const patchData = await patchResponse.json();
              console.log('✅ PATCH bem-sucedido');
              console.log('Resposta:', JSON.stringify(patchData, null, 2));
            } else {
              const errorText = await patchResponse.text();
              console.log('❌ Erro no PATCH');
              console.log('Erro:', errorText);
            }
          }
        } else {
          const errorText = await usersResponse.text();
          console.log('❌ Erro no GET /api/admin/users');
          console.log('Erro:', errorText);
        }
      } else {
        const errorText = await loginResponse.text();
        console.log('❌ Erro no login');
        console.log('Erro:', errorText);
      }
    } catch (error) {
      console.log(`❌ Erro na autenticação: ${error.message}`);
    }
    
    console.log('\n🎉 Teste de autenticação concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testAuthUsersAPI();
