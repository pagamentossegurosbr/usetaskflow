const { PrismaClient } = require('@prisma/client');

console.log('🔍 DEBUGANDO API DE USUÁRIOS');
console.log('============================\n');

async function debugUsersAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar usuários existentes
    console.log('\n🔍 Verificando usuários existentes...');
    const users = await prisma.$queryRaw`SELECT id, name, email, role, "isBanned" FROM users LIMIT 5`;
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Banido: ${user.isBanned}`);
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
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ GET /api/admin/users: ${data.users.length} usuários retornados`);
        console.log('Dados:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log(`❌ GET /api/admin/users: ${response.status} ${response.statusText}`);
        console.log('Erro:', errorText);
      }
    } catch (error) {
      console.log(`❌ Erro no GET /api/admin/users: ${error.message}`);
    }
    
    // Testar PATCH /api/admin/users (changeRole)
    console.log('\n🔍 Testando PATCH /api/admin/users (changeRole)...');
    try {
      const newRole = testUser.role === 'USER' ? 'ADMIN' : 'USER';
      const payload = {
        id: testUser.id,
        role: newRole
      };
      
      console.log('Payload sendo enviado:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ PATCH /api/admin/users: Role alterado para ${data.role}`);
        console.log('Resposta:', JSON.stringify(data, null, 2));
        
        // Reverter a mudança
        const revertPayload = {
          id: testUser.id,
          role: testUser.role
        };
        
        const revertResponse = await fetch('http://localhost:3000/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(revertPayload)
        });
        
        if (revertResponse.ok) {
          console.log(`✅ Role revertido para ${testUser.role}`);
        } else {
          console.log(`⚠️ Erro ao reverter role: ${revertResponse.status}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ PATCH /api/admin/users: ${response.status} ${response.statusText}`);
        console.log('Erro:', errorText);
      }
    } catch (error) {
      console.log(`❌ Erro no PATCH /api/admin/users: ${error.message}`);
    }
    
    // Testar PATCH /api/admin/users (ban/unban)
    console.log('\n🔍 Testando PATCH /api/admin/users (ban/unban)...');
    try {
      const payload = {
        id: testUser.id,
        isBanned: true
      };
      
      console.log('Payload sendo enviado:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('http://localhost:3000/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ PATCH /api/admin/users: Usuário banido (isBanned: ${data.isBanned})`);
        console.log('Resposta:', JSON.stringify(data, null, 2));
        
        // Desbanir o usuário
        const unbanPayload = {
          id: testUser.id,
          isBanned: false
        };
        
        const unbanResponse = await fetch('http://localhost:3000/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unbanPayload)
        });
        
        if (unbanResponse.ok) {
          console.log(`✅ Usuário desbanido`);
        } else {
          console.log(`⚠️ Erro ao desbanir: ${unbanResponse.status}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ PATCH /api/admin/users (ban): ${response.status} ${response.statusText}`);
        console.log('Erro:', errorText);
      }
    } catch (error) {
      console.log(`❌ Erro no PATCH /api/admin/users (ban): ${error.message}`);
    }
    
    console.log('\n🎉 Debug da API de usuários concluído!');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar debug
debugUsersAPI();
