const { PrismaClient } = require('@prisma/client');

console.log('📝 CRIANDO DADOS DE EXEMPLO PARA O CRM');
console.log('=======================================\n');

async function createSampleData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Criar leads de exemplo
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
      },
      {
        id: 'lead-4',
        name: 'Ana Oliveira',
        email: 'ana@exemplo.com',
        phone: '(11) 66666-6666',
        source: 'paid',
        status: 'CONVERTED',
        score: 95
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
    
    // Criar links de convite de exemplo
    console.log('📝 Criando links de convite de exemplo...');
    const sampleLinks = [
      {
        id: 'link-1',
        code: 'WELCOME2024',
        name: 'Link de Boas-vindas',
        description: 'Link para novos usuários',
        type: 'GENERAL',
        is_active: true,
        current_uses: 15
      },
      {
        id: 'link-2',
        code: 'PARTNER50',
        name: 'Link de Parceiro',
        description: 'Link para parceiros',
        type: 'PARTNER',
        is_active: true,
        current_uses: 8
      },
      {
        id: 'link-3',
        code: 'AFFILIATE100',
        name: 'Link de Afiliado',
        description: 'Link para afiliados',
        type: 'AFFILIATE',
        is_active: true,
        current_uses: 25
      }
    ];
    
    for (const link of sampleLinks) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO invite_links (id, code, name, description, type, is_active, current_uses, created_at, updated_at)
          VALUES ('${link.id}', '${link.code}', '${link.name}', '${link.description}', '${link.type}', ${link.is_active}, ${link.current_uses}, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `);
      } catch (error) {
        console.log(`⚠️ Erro ao criar link ${link.name}:`, error.message);
      }
    }
    console.log('✅ Links de convite de exemplo criados');
    
    // Criar atividades de exemplo
    console.log('📝 Criando atividades de exemplo...');
    const sampleActivities = [
      {
        id: 'activity-1',
        lead_id: 'lead-1',
        type: 'EMAIL',
        action: 'Email enviado'
      },
      {
        id: 'activity-2',
        lead_id: 'lead-2',
        type: 'CALL',
        action: 'Ligação realizada'
      },
      {
        id: 'activity-3',
        lead_id: 'lead-3',
        type: 'MEETING',
        action: 'Reunião agendada'
      },
      {
        id: 'activity-4',
        lead_id: 'lead-4',
        type: 'CONVERSION',
        action: 'Lead convertido'
      }
    ];
    
    for (const activity of sampleActivities) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO lead_activities (id, lead_id, type, action, created_at)
          VALUES ('${activity.id}', '${activity.lead_id}', '${activity.type}', '${activity.action}', NOW())
          ON CONFLICT (id) DO NOTHING
        `);
      } catch (error) {
        console.log(`⚠️ Erro ao criar atividade ${activity.id}:`, error.message);
      }
    }
    console.log('✅ Atividades de exemplo criadas');
    
    // Criar tasks de exemplo
    console.log('📝 Criando tasks de exemplo...');
    const sampleTasks = [
      {
        id: 'task-1',
        title: 'Revisar leads da semana',
        description: 'Analisar e qualificar leads recebidos',
        status: 'PENDING',
        priority: 'HIGH'
      },
      {
        id: 'task-2',
        title: 'Preparar apresentação',
        description: 'Criar slides para reunião com cliente',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM'
      },
      {
        id: 'task-3',
        title: 'Fazer follow-up',
        description: 'Entrar em contato com leads qualificados',
        status: 'COMPLETED',
        priority: 'LOW'
      }
    ];
    
    // Buscar o ID do usuário admin
    const adminUser = await prisma.$queryRaw`SELECT id FROM users WHERE email = 'admin@taskflow.com' LIMIT 1`;
    const userId = adminUser[0]?.id;
    
    if (userId) {
      for (const task of sampleTasks) {
        try {
          await prisma.$executeRawUnsafe(`
            INSERT INTO tasks (id, title, description, status, priority, user_id, created_at, updated_at)
            VALUES ('${task.id}', '${task.title}', '${task.description}', '${task.status}', '${task.priority}', '${userId}', NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
          `);
        } catch (error) {
          console.log(`⚠️ Erro ao criar task ${task.title}:`, error.message);
        }
      }
      console.log('✅ Tasks de exemplo criadas');
    } else {
      console.log('⚠️ Usuário admin não encontrado, pulando criação de tasks');
    }
    
    console.log('\n🎉 Dados de exemplo criados com sucesso!');
    console.log('O CRM agora tem dados para demonstração.');
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação dos dados de exemplo
createSampleData();
