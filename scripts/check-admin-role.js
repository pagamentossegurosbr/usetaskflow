const { PrismaClient } = require('@prisma/client');

console.log('🔍 VERIFICANDO ROLE DO ADMIN');
console.log('============================\n');

async function checkAdminRole() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar o usuário admin
    console.log('\n🔍 Verificando usuário admin...');
    const adminUser = await prisma.$queryRaw`
      SELECT id, name, email, role, is_banned, subscription_plan
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    const admin = adminUser[0];
    console.log(`👤 Usuário: ${admin.name} (${admin.email})`);
    console.log(`🎯 Role: ${admin.role}`);
    console.log(`🔒 Status banido: ${admin.is_banned}`);
    console.log(`📋 Plano: ${admin.subscription_plan}`);
    
    if (admin.role === 'OWNER') {
      console.log('✅ Usuário admin tem role OWNER - correto!');
    } else {
      console.log('❌ Usuário admin NÃO tem role OWNER - precisa corrigir!');
      console.log(`🎯 Role atual: ${admin.role}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkAdminRole();
