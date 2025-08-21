const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO API DE USUÁRIOS');
console.log('============================\n');

async function testUsersAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar usuários existentes
    console.log('\n🔍 Verificando usuários existentes...');
    const users = await prisma.$queryRaw`SELECT id, name, email, role FROM users LIMIT 5`;
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    const testUser = users[0];
    console.log(`\n🧪 Usando usuário de teste: ${testUser.name} (${testUser.id})`);
    
    // Testar GET /api/admin/users
    console.log('\n🔍 Testando GET /api/admin/users...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ GET /api/admin/users: ${data.users.length} usuários retornados`);
      } else {
        console.log(`❌ GET /api/admin/users: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Erro no GET /api/admin/users: ${error.message}`);
    }
    
    // Testar PATCH /api/admin/users (changeRole)
    console.log('\n🔍 Testando PATCH /api/admin/users (changeRole)...');
    try {
      const newRole = testUser.role === 'USER' ? 'ADMIN' : 'USER';
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testUser.id,
          role: newRole
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ PATCH /api/admin/users: Role alterado para ${data.role}`);
        
        // Reverter a mudança
        await fetch('http://localhost:3000/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: testUser.id,
            role: testUser.role
          })
        });
        console.log(`✅ Role revertido para ${testUser.role}`);
      } else {
        const error = await response.text();
        console.log(`❌ PATCH /api/admin/users: ${response.status} ${response.statusText}`);
        console.log(`   Erro: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Erro no PATCH /api/admin/users: ${error.message}`);
    }
    
    // Testar PATCH /api/admin/users (ban/unban)
    console.log('\n🔍 Testando PATCH /api/admin/users (ban/unban)...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: testUser.id,
          isBanned: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ PATCH /api/admin/users: Usuário banido (isBanned: ${data.isBanned})`);
        
        // Desbanir o usuário
        await fetch('http://localhost:3000/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: testUser.id,
            isBanned: false
          })
        });
        console.log(`✅ Usuário desbanido`);
      } else {
        const error = await response.text();
        console.log(`❌ PATCH /api/admin/users (ban): ${response.status} ${response.statusText}`);
        console.log(`   Erro: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Erro no PATCH /api/admin/users (ban): ${error.message}`);
    }
    
    console.log('\n🎉 Testes da API de usuários concluídos!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar testes
testUsersAPI();
