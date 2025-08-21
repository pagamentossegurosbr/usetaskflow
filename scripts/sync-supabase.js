const { PrismaClient } = require('@prisma/client');

console.log('🔄 SINCRONIZANDO COM SUPABASE');
console.log('=============================\n');

async function syncSupabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar todas as tabelas
    console.log('\n🔍 Verificando tabelas existentes...');
    const tables = [
      'users', 'leads', 'invite_links', 'lead_activities', 
      'invite_link_clicks', 'onboarding_steps'
    ];
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${prisma.$raw(table)}`;
        const count = result[0].count;
        console.log(`✅ Tabela ${table}: ${count} registros`);
      } catch (error) {
        console.log(`❌ Tabela ${table}: Erro - ${error.message}`);
      }
    }
    
    // Verificar enums
    console.log('\n🔍 Verificando enums...');
    const enums = ['Role', 'LeadStatus', 'InviteLinkType'];
    
    for (const enumName of enums) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM pg_type 
            WHERE typname = ${enumName}
          ) as exists
        `;
        const exists = result[0].exists;
        console.log(`✅ Enum ${enumName}: ${exists ? 'Existe' : 'Não existe'}`);
      } catch (error) {
        console.log(`❌ Enum ${enumName}: Erro - ${error.message}`);
      }
    }
    
    // Criar dados de exemplo se necessário
    console.log('\n📝 Verificando dados de exemplo...');
    
    // Verificar se há leads
    const leadCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM leads`;
    if (leadCount[0].count === 0) {
      console.log('📝 Criando leads de exemplo...');
      
      const sampleLeads = [
        {
          id: 'lead-1',
          name: 'João Silva',
          email: 'joao@exemplo.com',
          phone: '(11) 99999-9999',
          source: 'website',
          status: 'NEW',
          score: 75
        },
        {
          id: 'lead-2',
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          phone: '(11) 88888-8888',
          source: 'invite_link',
          status: 'CONTACTED',
          score: 85
        },
        {
          id: 'lead-3',
          name: 'Pedro Costa',
          email: 'pedro@exemplo.com',
          phone: '(11) 77777-7777',
          source: 'organic',
          status: 'QUALIFIED',
          score: 90
        }
      ];
      
      for (const lead of sampleLeads) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO leads (id, name, email, phone, source, status, score, created_at, updated_at)
            VALUES ('${lead.id}', '${lead.name}', '${lead.email}', '${lead.phone}', '${lead.source}', '${lead.status}', ${lead.score}, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `);
        } catch (error) {
          console.log(`⚠️ Erro ao criar lead ${lead.name}:`, error.message);
        }
      }
      console.log('✅ Leads de exemplo criados');
    }
    
    // Verificar se há links de convite
    const linkCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM invite_links`;
    if (linkCount[0].count === 0) {
      console.log('📝 Criando links de convite de exemplo...');
      
      const sampleLinks = [
        {
          id: 'link-1',
          code: 'WELCOME2024',
          name: 'Link de Boas-vindas',
          description: 'Link para novos usuários',
          type: 'GENERAL',
          is_active: true
        },
        {
          id: 'link-2',
          code: 'PARTNER50',
          name: 'Link de Parceiro',
          description: 'Link para parceiros',
          type: 'PARTNER',
          is_active: true
        }
      ];
      
      for (const link of sampleLinks) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO invite_links (id, code, name, description, type, is_active, created_at, updated_at)
            VALUES ('${link.id}', '${link.code}', '${link.name}', '${link.description}', '${link.type}', ${link.is_active}, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `);
        } catch (error) {
          console.log(`⚠️ Erro ao criar link ${link.name}:`, error.message);
        }
      }
      console.log('✅ Links de convite de exemplo criados');
    }
    
    console.log('\n🎉 Sincronização com Supabase concluída!');
    console.log('O sistema está pronto para uso.');
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
syncSupabase();
