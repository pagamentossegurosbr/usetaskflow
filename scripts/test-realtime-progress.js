const { PrismaClient } = require('@prisma/client');

console.log('🧪 TESTANDO ATUALIZAÇÃO EM TEMPO REAL DO PROGRESSO');
console.log('==================================================\n');

async function testRealtimeProgress() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado com sucesso');
    
    // Verificar usuário admin
    console.log('\n📊 VERIFICANDO USUÁRIO ADMIN:');
    console.log('==============================');
    
    const admin = await prisma.$queryRaw`
      SELECT id, name, email, level, xp
      FROM users 
      WHERE email = 'admin@taskflow.com'
    `;
    
    if (admin.length > 0) {
      const user = admin[0];
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`📊 Nível: ${user.level}`);
      console.log(`⭐ XP: ${user.xp}`);
      
      // Calcular progresso para o próximo nível
      const levels = [
        { level: 1, xpRequired: 0 },
        { level: 2, xpRequired: 100 },
        { level: 3, xpRequired: 250 },
        { level: 4, xpRequired: 450 },
        { level: 5, xpRequired: 700 },
        { level: 6, xpRequired: 1000 },
        { level: 7, xpRequired: 1350 },
        { level: 8, xpRequired: 1750 },
        { level: 9, xpRequired: 2200 },
        { level: 10, xpRequired: 4200 },
      ];
      
      const currentLevel = levels.find(l => l.level === user.level) || levels[0];
      const nextLevel = levels.find(l => l.level === user.level + 1);
      
      if (nextLevel) {
        const xpInCurrentLevel = user.xp - currentLevel.xpRequired;
        const xpToNextLevel = nextLevel.xpRequired - user.xp;
        const progressPercentage = (xpInCurrentLevel / (xpInCurrentLevel + xpToNextLevel)) * 100;
        
        console.log(`📈 Progresso atual: ${xpInCurrentLevel}/${xpInCurrentLevel + xpToNextLevel} XP`);
        console.log(`📊 Porcentagem: ${progressPercentage.toFixed(1)}%`);
        console.log(`🎯 XP necessário para o próximo nível: ${xpToNextLevel}`);
      } else {
        console.log('🏆 Nível máximo atingido!');
      }
    } else {
      console.log('❌ Usuário admin não encontrado');
    }
    
    console.log('\n📋 INSTRUÇÕES PARA TESTE:');
    console.log('==========================');
    console.log('1. Abra o navegador em http://localhost:3000');
    console.log('2. Faça login com admin@taskflow.com / admin123');
    console.log('3. Complete algumas tarefas');
    console.log('4. Observe se o progresso na navbar atualiza em tempo real');
    console.log('5. Verifique se o XP e nível são atualizados simultaneamente');
    
    console.log('\n🔧 POSSÍVEIS PROBLEMAS:');
    console.log('=======================');
    console.log('- Se o progresso não atualizar, verifique o console do navegador');
    console.log('- Verifique se há erros de JavaScript');
    console.log('- Confirme se o evento "xp-updated" está sendo disparado');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testRealtimeProgress();
