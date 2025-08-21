const { PrismaClient } = require('@prisma/client');

console.log('🏗️ CRIANDO TABELAS NO BANCO DE DADOS (CORRIGIDO)');
console.log('==================================================\n');

async function createTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // SQL para criar a tabela users (plural como o Prisma espera)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "level" INTEGER NOT NULL DEFAULT 1,
        "xp" INTEGER NOT NULL DEFAULT 0,
        "bio" TEXT,
        "title" TEXT,
        "badges" TEXT NOT NULL DEFAULT '',
        "theme" TEXT NOT NULL DEFAULT 'dark',
        "hide_profile_effects" BOOLEAN NOT NULL DEFAULT false,
        "is_banned" BOOLEAN NOT NULL DEFAULT false,
        "banned_at" TIMESTAMP(3),
        "banned_by" TEXT,
        "ban_reason" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP(3),
        "avatar" TEXT,
        "date_of_birth" TIMESTAMP(3),
        "date_of_birth_change_count" INTEGER NOT NULL DEFAULT 0,
        "language" TEXT NOT NULL DEFAULT 'pt',
        "subscription_plan" TEXT NOT NULL DEFAULT 'free',
        "subscription_status" TEXT NOT NULL DEFAULT 'active',
        "stripe_customer_id" TEXT,
        "stripe_subscription_id" TEXT,
        "subscription_started_at" TIMESTAMP(3),
        "subscription_expires_at" TIMESTAMP(3),
        "max_level" INTEGER NOT NULL DEFAULT 3,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar índices
    const createIndexes = `
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `;
    
    console.log('📝 Criando tabela users...');
    await prisma.$executeRawUnsafe(createUsersTable);
    console.log('✅ Tabela users criada');
    
    console.log('📝 Criando índices...');
    await prisma.$executeRawUnsafe(createIndexes);
    console.log('✅ Índices criados');
    
    // Verificar se a tabela foi criada usando SQL direto
    console.log('\n🔍 Verificando tabela criada...');
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    const userCount = result[0].count;
    console.log(`✅ Tabela users existe com ${userCount} usuários`);
    
    console.log('\n🎉 Tabelas criadas com sucesso!');
    console.log('Agora você pode testar a autenticação novamente.');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n🔧 PROBLEMA DE PERMISSÃO:');
      console.log('1. Verifique se o usuário do banco tem permissões de CREATE');
      console.log('2. Verifique se está conectando ao banco correto');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação das tabelas
createTables();
