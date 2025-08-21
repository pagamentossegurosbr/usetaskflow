const { PrismaClient } = require('@prisma/client');

console.log('📝 CRIANDO ÍNDICES DO CRM');
console.log('==========================\n');

async function createCRMIndexes() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Criar índices um por vez
    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "leads_email_key" ON "leads"("email") WHERE "email" IS NOT NULL',
      'CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads"("status")',
      'CREATE INDEX IF NOT EXISTS "leads_source_idx" ON "leads"("source")',
      'CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at")',
      
      'CREATE UNIQUE INDEX IF NOT EXISTS "invite_links_code_key" ON "invite_links"("code")',
      'CREATE INDEX IF NOT EXISTS "invite_links_type_idx" ON "invite_links"("type")',
      'CREATE INDEX IF NOT EXISTS "invite_links_is_active_idx" ON "invite_links"("is_active")',
      
      'CREATE INDEX IF NOT EXISTS "lead_activities_lead_id_idx" ON "lead_activities"("lead_id")',
      'CREATE INDEX IF NOT EXISTS "lead_activities_created_at_idx" ON "lead_activities"("created_at")',
      
      'CREATE INDEX IF NOT EXISTS "invite_link_clicks_link_id_idx" ON "invite_link_clicks"("link_id")',
      'CREATE INDEX IF NOT EXISTS "invite_link_clicks_clicked_at_idx" ON "invite_link_clicks"("clicked_at")',
      
      'CREATE INDEX IF NOT EXISTS "onboarding_steps_lead_id_idx" ON "onboarding_steps"("lead_id")',
      'CREATE INDEX IF NOT EXISTS "onboarding_steps_step_idx" ON "onboarding_steps"("step")'
    ];
    
    console.log('📝 Criando índices...');
    for (let i = 0; i < indexes.length; i++) {
      try {
        await prisma.$executeRawUnsafe(indexes[i]);
        console.log(`✅ Índice ${i + 1}/${indexes.length} criado`);
      } catch (error) {
        console.log(`⚠️ Índice ${i + 1} já existe ou erro:`, error.message);
      }
    }
    
    console.log('\n🎉 Índices do CRM criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar índices do CRM:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação dos índices
createCRMIndexes();
