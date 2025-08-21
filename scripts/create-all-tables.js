const { PrismaClient } = require('@prisma/client');

console.log('🏗️ CRIANDO TODAS AS TABELAS DO SISTEMA');
console.log('========================================\n');

async function createAllTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // SQL para criar a tabela tasks
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "due_date" TIMESTAMP(3),
        "completed_at" TIMESTAMP(3),
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela settings
    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela sessions (se não existir)
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "session_token" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela accounts (se não existir)
    const createAccountsTable = `
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "provider_account_id" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('📝 Criando tabela tasks...');
    await prisma.$executeRawUnsafe(createTasksTable);
    console.log('✅ Tabela tasks criada');
    
    console.log('📝 Criando tabela settings...');
    await prisma.$executeRawUnsafe(createSettingsTable);
    console.log('✅ Tabela settings criada');
    
    console.log('📝 Criando tabela sessions...');
    await prisma.$executeRawUnsafe(createSessionsTable);
    console.log('✅ Tabela sessions criada');
    
    console.log('📝 Criando tabela accounts...');
    await prisma.$executeRawUnsafe(createAccountsTable);
    console.log('✅ Tabela accounts criada');
    
    // Criar índices
    console.log('📝 Criando índices...');
    const createIndexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "tasks_id_key" ON "tasks"("id")',
      'CREATE INDEX IF NOT EXISTS "tasks_user_id_idx" ON "tasks"("user_id")',
      'CREATE INDEX IF NOT EXISTS "tasks_status_idx" ON "tasks"("status")',
      'CREATE INDEX IF NOT EXISTS "tasks_due_date_idx" ON "tasks"("due_date")',
      
      'CREATE UNIQUE INDEX IF NOT EXISTS "settings_id_key" ON "settings"("id")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "settings_key_key" ON "settings"("key")',
      
      'CREATE UNIQUE INDEX IF NOT EXISTS "sessions_id_key" ON "sessions"("id")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "sessions_session_token_key" ON "sessions"("session_token")',
      'CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id")',
      
      'CREATE UNIQUE INDEX IF NOT EXISTS "accounts_id_key" ON "accounts"("id")',
      'CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id")'
    ];
    
    for (let i = 0; i < createIndexes.length; i++) {
      try {
        await prisma.$executeRawUnsafe(createIndexes[i]);
        console.log(`✅ Índice ${i + 1}/${createIndexes.length} criado`);
      } catch (error) {
        console.log(`⚠️ Índice ${i + 1} já existe ou erro:`, error.message);
      }
    }
    
    // Inserir configurações padrão
    console.log('📝 Inserindo configurações padrão...');
    const defaultSettings = [
      {
        id: 'support-email',
        key: 'support_email',
        value: 'suporte@taskflow.com'
      },
      {
        id: 'support-phone',
        key: 'support_phone',
        value: '(11) 99999-9999'
      },
      {
        id: 'support-hours',
        key: 'support_hours',
        value: 'Segunda a Sexta, 9h às 18h'
      }
    ];
    
    for (const setting of defaultSettings) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO settings (id, key, value, created_at, updated_at)
          VALUES ('${setting.id}', '${setting.key}', '${setting.value}', NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `);
      } catch (error) {
        console.log(`⚠️ Erro ao inserir setting ${setting.key}:`, error.message);
      }
    }
    console.log('✅ Configurações padrão inseridas');
    
    // Verificar todas as tabelas
    console.log('\n🔍 Verificando todas as tabelas...');
    const allTables = [
      'users', 'tasks', 'settings', 'sessions', 'accounts',
      'leads', 'invite_links', 'lead_activities', 'invite_link_clicks', 'onboarding_steps'
    ];
    
    for (const table of allTables) {
      try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${prisma.$raw(table)}`;
        const count = result[0].count;
        console.log(`✅ Tabela ${table}: ${count} registros`);
      } catch (error) {
        console.log(`❌ Tabela ${table}: Erro - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Todas as tabelas criadas com sucesso!');
    console.log('O sistema está completamente configurado.');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação das tabelas
createAllTables();
