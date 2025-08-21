const { PrismaClient } = require('@prisma/client');

console.log('👑 CORRIGINDO ROLE DO USUÁRIO ADMIN');
console.log('==================================\n');

async function fixAdminRole() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar o status atual do usuário admin
    console.log('\n🔍 Verificando role atual do usuário admin...');
    const adminUser = await prisma.$queryRaw`
      SELECT id, name, email, role, is_banned
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    const user = adminUser[0];
    console.log(`👤 Usuário: ${user.name} (${user.email})`);
    console.log(`🎯 Role atual: ${user.role}`);
    console.log(`🔒 Status banido: ${user.is_banned}`);
    
    if (user.role === 'OWNER') {
      console.log('✅ Usuário já tem role OWNER!');
      return;
    }
    
    // Alterar role para OWNER
    console.log('\n👑 Alterando role para OWNER...');
    await prisma.$executeRaw`
      UPDATE users 
      SET role = 'OWNER'
      WHERE email = 'admin@taskflow.com'
    `;
    
    console.log('✅ Role alterada com sucesso!');
    
    // Verificar se a alteração foi aplicada
    console.log('\n🔍 Verificando role após alteração...');
    const updatedUser = await prisma.$queryRaw`
      SELECT id, name, email, role, is_banned
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    const updated = updatedUser[0];
    console.log(`👤 Usuário: ${updated.name} (${updated.email})`);
    console.log(`🎯 Role: ${updated.role}`);
    console.log(`🔒 Status banido: ${updated.is_banned}`);
    
    console.log('\n🎉 Correção da role concluída!');
    console.log('\n📋 Credenciais para login:');
    console.log('Email: admin@taskflow.com');
    console.log('Senha: admin123');
    console.log('Role: OWNER (acesso completo)');
    
  } catch (error) {
    console.error('❌ Erro ao alterar role:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixAdminRole();
