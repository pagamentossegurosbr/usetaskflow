const { PrismaClient } = require('@prisma/client');

console.log('🏗️ CRIANDO TABELAS DO CRM');
console.log('==========================\n');

async function createCRMTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // SQL para criar a tabela leads
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "source" TEXT NOT NULL DEFAULT 'website',
        "campaign" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "score" INTEGER NOT NULL DEFAULT 0,
        "notes" TEXT,
        "tags" TEXT NOT NULL DEFAULT '',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        "converted_at" TIMESTAMP(3),
        "user_id" TEXT,
        
        CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela invite_links
    const createInviteLinksTable = `
      CREATE TABLE IF NOT EXISTS "invite_links" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL DEFAULT 'GENERAL',
        "campaign" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "max_uses" INTEGER,
        "current_uses" INTEGER NOT NULL DEFAULT 0,
        "expires_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela lead_activities
    const createLeadActivitiesTable = `
      CREATE TABLE IF NOT EXISTS "lead_activities" (
        "id" TEXT NOT NULL,
        "lead_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela invite_link_clicks
    const createInviteLinkClicksTable = `
      CREATE TABLE IF NOT EXISTS "invite_link_clicks" (
        "id" TEXT NOT NULL,
        "link_id" TEXT NOT NULL,
        "lead_id" TEXT,
        "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "invite_link_clicks_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // SQL para criar a tabela onboarding_steps
    const createOnboardingStepsTable = `
      CREATE TABLE IF NOT EXISTS "onboarding_steps" (
        "id" TEXT NOT NULL,
        "lead_id" TEXT NOT NULL,
        "step" TEXT NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "completed_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
      );
    `;
    
    console.log('📝 Criando tabela leads...');
    await prisma.$executeRawUnsafe(createLeadsTable);
    console.log('✅ Tabela leads criada');
    
    console.log('📝 Criando tabela invite_links...');
    await prisma.$executeRawUnsafe(createInviteLinksTable);
    console.log('✅ Tabela invite_links criada');
    
    console.log('📝 Criando tabela lead_activities...');
    await prisma.$executeRawUnsafe(createLeadActivitiesTable);
    console.log('✅ Tabela lead_activities criada');
    
    console.log('📝 Criando tabela invite_link_clicks...');
    await prisma.$executeRawUnsafe(createInviteLinkClicksTable);
    console.log('✅ Tabela invite_link_clicks criada');
    
    console.log('📝 Criando tabela onboarding_steps...');
    await prisma.$executeRawUnsafe(createOnboardingStepsTable);
    console.log('✅ Tabela onboarding_steps criada');
    
    // Criar índices
    console.log('📝 Criando índices...');
    const createIndexes = `
      CREATE UNIQUE INDEX IF NOT EXISTS "leads_email_key" ON "leads"("email") WHERE "email" IS NOT NULL;
      CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status");
      CREATE INDEX IF NOT EXISTS "leads_source_idx" ON "leads"("source");
      CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at");
      
      CREATE UNIQUE INDEX IF NOT EXISTS "invite_links_code_key" ON "invite_links"("code");
      CREATE INDEX IF NOT EXISTS "invite_links_type_idx" ON "invite_links"("type");
      CREATE INDEX IF NOT EXISTS "invite_links_is_active_idx" ON "invite_links"("is_active");
      
      CREATE INDEX IF NOT EXISTS "lead_activities_lead_id_idx" ON "lead_activities"("lead_id");
      CREATE INDEX IF NOT EXISTS "lead_activities_created_at_idx" ON "lead_activities"("created_at");
      
      CREATE INDEX IF NOT EXISTS "invite_link_clicks_link_id_idx" ON "invite_link_clicks"("link_id");
      CREATE INDEX IF NOT EXISTS "invite_link_clicks_clicked_at_idx" ON "invite_link_clicks"("clicked_at");
      
      CREATE INDEX IF NOT EXISTS "onboarding_steps_lead_id_idx" ON "onboarding_steps"("lead_id");
      CREATE INDEX IF NOT EXISTS "onboarding_steps_step_idx" ON "onboarding_steps"("step");
    `;
    
    await prisma.$executeRawUnsafe(createIndexes);
    console.log('✅ Índices criados');
    
    // Verificar tabelas criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    const tables = ['leads', 'invite_links', 'lead_activities', 'invite_link_clicks', 'onboarding_steps'];
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${prisma.$raw(table)}`;
        const count = result[0].count;
        console.log(`✅ Tabela ${table} existe com ${count} registros`);
      } catch (error) {
        console.log(`❌ Erro ao verificar tabela ${table}:`, error.message);
      }
    }
    
    console.log('\n🎉 Todas as tabelas do CRM criadas com sucesso!');
    console.log('O sistema CRM está pronto para uso.');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas do CRM:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação das tabelas
createCRMTables();
