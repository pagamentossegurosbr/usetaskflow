const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('👤 CRIANDO USUÁRIO DE TESTE (FINAL)');
console.log('====================================\n');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Dados do usuário de teste
    const testUser = {
      email: 'admin@taskflow.com',
      name: 'Administrador',
      password: 'admin123',
      role: 'OWNER' // Usando OWNER que é um valor válido do enum
    };
    
    console.log('🔍 Verificando se usuário já existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });
    
    if (existingUser) {
      console.log('⚠️ Usuário já existe. Atualizando senha...');
      
      // Criptografar senha
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      
      // Atualizar usuário existente
      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          password: hashedPassword,
          role: testUser.role,
          name: testUser.name
        }
      });
      
      console.log('✅ Usuário atualizado com sucesso');
    } else {
      console.log('📝 Criando novo usuário...');
      
      // Criptografar senha
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      
      // Criar novo usuário
      await prisma.user.create({
        data: {
          email: testUser.email,
          name: testUser.name,
          password: hashedPassword,
          role: testUser.role
        }
      });
      
      console.log('✅ Usuário criado com sucesso');
    }
    
    console.log('\n📋 DADOS DO USUÁRIO DE TESTE:');
    console.log('Email:', testUser.email);
    console.log('Senha:', testUser.password);
    console.log('Role:', testUser.role);
    
    console.log('\n🎉 Usuário de teste pronto!');
    console.log('Agora você pode fazer login com essas credenciais.');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar criação do usuário
createTestUser();
