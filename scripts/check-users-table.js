const { PrismaClient } = require('@prisma/client');

console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA USERS');
console.log('========================================\n');

async function checkUsersTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar estrutura da tabela users
    console.log('\n🔍 Verificando estrutura da tabela users...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('✅ Colunas da tabela users:');
    columns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable} - Default: ${col.column_default || 'N/A'}`);
    });
    
    // Verificar se a coluna is_banned existe
    const hasIsBanned = columns.some(col => col.column_name === 'is_banned');
    console.log(`\n🔍 Coluna is_banned existe: ${hasIsBanned ? '✅ Sim' : '❌ Não'}`);
    
    if (!hasIsBanned) {
      console.log('\n🔧 Criando coluna is_banned...');
      try {
        await prisma.$executeRaw`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE`;
        console.log('✅ Coluna is_banned criada com sucesso');
      } catch (error) {
        console.log(`❌ Erro ao criar coluna is_banned: ${error.message}`);
      }
    }
    
    // Verificar outros campos importantes
    const importantFields = ['banned_at', 'banned_by', 'ban_reason', 'is_active', 'last_login_at', 'date_of_birth', 'date_of_birth_change_count', 'language', 'subscription_plan', 'subscription_status', 'stripe_customer_id', 'stripe_subscription_id', 'subscription_started_at', 'subscription_expires_at', 'max_level', 'created_at', 'updated_at'];
    
    console.log('\n🔍 Verificando campos importantes...');
    for (const field of importantFields) {
      const exists = columns.some(col => col.column_name === field);
      console.log(`  ${field}: ${exists ? '✅ Existe' : '❌ Não existe'}`);
      
      if (!exists) {
        console.log(`  🔧 Criando campo ${field}...`);
        try {
          let sql = '';
          switch (field) {
            case 'banned_at':
              sql = 'ALTER TABLE users ADD COLUMN banned_at TIMESTAMP';
              break;
            case 'banned_by':
              sql = 'ALTER TABLE users ADD COLUMN banned_by TEXT';
              break;
            case 'ban_reason':
              sql = 'ALTER TABLE users ADD COLUMN ban_reason TEXT';
              break;
            case 'is_active':
              sql = 'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE';
              break;
            case 'last_login_at':
              sql = 'ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP';
              break;
            case 'date_of_birth':
              sql = 'ALTER TABLE users ADD COLUMN date_of_birth TIMESTAMP';
              break;
            case 'date_of_birth_change_count':
              sql = 'ALTER TABLE users ADD COLUMN date_of_birth_change_count INTEGER DEFAULT 0';
              break;
            case 'language':
              sql = 'ALTER TABLE users ADD COLUMN language TEXT DEFAULT \'pt\'';
              break;
            case 'subscription_plan':
              sql = 'ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT \'free\'';
              break;
            case 'subscription_status':
              sql = 'ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT \'active\'';
              break;
            case 'stripe_customer_id':
              sql = 'ALTER TABLE users ADD COLUMN stripe_customer_id TEXT';
              break;
            case 'stripe_subscription_id':
              sql = 'ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT';
              break;
            case 'subscription_started_at':
              sql = 'ALTER TABLE users ADD COLUMN subscription_started_at TIMESTAMP';
              break;
            case 'subscription_expires_at':
              sql = 'ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP';
              break;
            case 'max_level':
              sql = 'ALTER TABLE users ADD COLUMN max_level INTEGER DEFAULT 3';
              break;
            case 'created_at':
              sql = 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
              break;
            case 'updated_at':
              sql = 'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
              break;
          }
          
          if (sql) {
            await prisma.$executeRawUnsafe(sql);
            console.log(`  ✅ Campo ${field} criado com sucesso`);
          }
        } catch (error) {
          console.log(`  ❌ Erro ao criar campo ${field}: ${error.message}`);
        }
      }
    }
    
    // Verificar dados atuais
    console.log('\n🔍 Verificando dados atuais...');
    const users = await prisma.$queryRaw`SELECT id, name, email, role FROM users LIMIT 3`;
    console.log(`✅ Encontrados ${users.length} usuários:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🎉 Verificação da tabela users concluída!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar verificação
checkUsersTable();
