const { PrismaClient } = require('@prisma/client');

console.log('🔓 DESBANNINDO USUÁRIO ADMIN');
console.log('=============================\n');

async function unbanAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar o status atual do usuário admin
    console.log('\n🔍 Verificando status do usuário admin...');
    const adminUser = await prisma.$queryRaw`
      SELECT id, name, email, role, is_banned, banned_at, ban_reason
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    const user = adminUser[0];
    console.log(`👤 Usuário: ${user.name} (${user.email})`);
    console.log(`🔒 Status banido: ${user.is_banned}`);
    console.log(`📅 Banido em: ${user.banned_at || 'N/A'}`);
    console.log(`📝 Motivo: ${user.ban_reason || 'N/A'}`);
    
    if (!user.is_banned) {
      console.log('✅ Usuário já está desbanido!');
      return;
    }
    
    // Desbanir o usuário
    console.log('\n🔓 Desbannindo usuário...');
    await prisma.$executeRaw`
      UPDATE users 
      SET is_banned = FALSE,
          banned_at = NULL,
          ban_reason = NULL,
          banned_by = NULL
      WHERE email = 'admin@taskflow.com'
    `;
    
    console.log('✅ Usuário desbanido com sucesso!');
    
    // Verificar se a alteração foi aplicada
    console.log('\n🔍 Verificando status após desbanimento...');
    const updatedUser = await prisma.$queryRaw`
      SELECT id, name, email, role, is_banned
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    const updated = updatedUser[0];
    console.log(`👤 Usuário: ${updated.name} (${updated.email})`);
    console.log(`🔒 Status banido: ${updated.is_banned}`);
    console.log(`🎯 Role: ${updated.role}`);
    
    console.log('\n🎉 Processo de desbanimento concluído!');
    console.log('\n📋 Credenciais para login:');
    console.log('Email: admin@taskflow.com');
    console.log('Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao desbanir usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar desbanimento
unbanAdminUser();
