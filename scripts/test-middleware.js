console.log('🧪 TESTANDO MIDDLEWARE');
console.log('======================\n');

async function testMiddleware() {
  try {
    console.log('🔍 Testando requisição para API admin...');
    
    // Fazer uma requisição simples para a API admin
    const response = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('Resposta:', responseText);
    
    if (response.status === 401) {
      console.log('✅ Middleware está funcionando - bloqueando requisição não autenticada');
    } else {
      console.log('❌ Middleware não está funcionando como esperado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar teste
testMiddleware();
