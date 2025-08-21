const { PrismaClient } = require('@prisma/client');

console.log('🗄️ VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS');
console.log('============================================\n');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando conexão com banco de dados...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar se a tabela users existe
    console.log('\n🔍 Verificando tabela users...');
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tabela users existe com ${userCount} usuários`);
    } catch (error) {
      console.log('❌ Tabela users não existe ou não está acessível');
      console.log('Erro:', error.message);
      
      console.log('\n📋 SOLUÇÕES:');
      console.log('1. Execute: npx prisma db push');
      console.log('2. Ou execute: npx prisma migrate deploy');
      console.log('3. Verifique se DATABASE_URL está correto no .env.local');
      console.log('4. Verifique se o banco Supabase está ativo');
      
      return false;
    }
    
    // Verificar outras tabelas importantes
    const tablesToCheck = ['Task', 'Session', 'Account'];
    
    for (const table of tablesToCheck) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`✅ Tabela ${table} existe com ${count} registros`);
      } catch (error) {
        console.log(`❌ Tabela ${table} não existe ou não está acessível`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n🔧 PROBLEMA DE CONEXÃO:');
      console.log('1. Verifique se DATABASE_URL está correto');
      console.log('2. Verifique se o banco Supabase está ativo');
      console.log('3. Verifique se as credenciais estão corretas');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkDatabase().then((success) => {
  if (success) {
    console.log('\n✅ Banco de dados está funcionando corretamente!');
  } else {
    console.log('\n❌ Problemas encontrados no banco de dados');
    console.log('Execute os comandos sugeridos acima para corrigir');
  }
});
