const fetch = require('node-fetch');

async function testSync() {
  try {
    console.log('🔄 Testando sincronização com Supabase...\n');

    // Primeiro, testar a conexão
    console.log('1. Testando conexão com Supabase...');
    const connectionResponse = await fetch('http://localhost:3000/api/test-supabase-connection');
    const connectionData = await connectionResponse.json();
    
    if (connectionData.success) {
      console.log('✅ Conexão estabelecida com sucesso');
      console.log(`📊 Tabelas: ${JSON.stringify(connectionData.tables)}`);
    } else {
      console.log('❌ Erro na conexão:', connectionData.message);
      return;
    }

    console.log('\n2. Testando sincronização...');
    
    // Simular uma requisição de sincronização (sem autenticação real)
    const syncResponse = await fetch('http://localhost:3000/api/sync/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const syncData = await syncResponse.json();
    
    if (syncResponse.ok) {
      if (syncData.success) {
        console.log('✅ Sincronização realizada com sucesso!');
        console.log(`📊 Estatísticas: ${JSON.stringify(syncData.stats)}`);
        console.log(`⏰ Timestamp: ${syncData.timestamp}`);
      } else {
        console.log('⚠️ Sincronização não configurada:', syncData.message);
        if (syncData.note) {
          console.log(`📝 Nota: ${syncData.note}`);
        }
      }
    } else {
      console.log('❌ Erro na sincronização:', syncData.error);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSync();
