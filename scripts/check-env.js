const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 VERIFICAÇÃO E CORREÇÃO DE VARIÁVEIS DE AMBIENTE');
console.log('==================================================\n');

// Função para gerar secret aleatório
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Verificar arquivo .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  console.log('📁 Arquivo .env.local encontrado');
  envContent = fs.readFileSync(envLocalPath, 'utf8');
} else {
  console.log('📁 Arquivo .env.local não encontrado - criando...');
}

// Verificar variáveis críticas
const requiredVars = {
  'NEXTAUTH_URL': 'http://localhost:3000',
  'NEXTAUTH_SECRET': generateSecret(32),
  'DATABASE_URL': 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
  'GOOGLE_CLIENT_ID': 'your_google_client_id_here',
  'GOOGLE_CLIENT_SECRET': 'your_google_client_secret_here',
  'GITHUB_ID': 'your_github_id_here',
  'GITHUB_SECRET': 'your_github_secret_here',
  'NODE_ENV': 'development',
  'NEXT_PUBLIC_APP_ENV': 'development'
};

console.log('🔍 Verificando variáveis de ambiente...\n');

let needsUpdate = false;
const missingVars = [];

for (const [varName, defaultValue] of Object.entries(requiredVars)) {
  if (!envContent.includes(`${varName}=`)) {
    console.log(`❌ ${varName}: AUSENTE`);
    missingVars.push(varName);
    needsUpdate = true;
  } else {
    console.log(`✅ ${varName}: CONFIGURADO`);
  }
}

if (needsUpdate) {
  console.log('\n📝 Adicionando variáveis ausentes...\n');
  
  let newEnvContent = envContent;
  
  // Adicionar cabeçalho se arquivo estiver vazio
  if (!newEnvContent.trim()) {
    newEnvContent = `# ========================================
# CONFIGURAÇÃO DE DESENVOLVIMENTO - NOTCH TODO LIST
# ========================================

`;
  }
  
  // Adicionar variáveis ausentes
  for (const varName of missingVars) {
    const defaultValue = requiredVars[varName];
    newEnvContent += `${varName}=${defaultValue}\n`;
    console.log(`➕ Adicionado: ${varName}=${defaultValue}`);
  }
  
  // Salvar arquivo
  fs.writeFileSync(envLocalPath, newEnvContent);
  console.log('\n✅ Arquivo .env.local atualizado com sucesso!');
} else {
  console.log('\n✅ Todas as variáveis necessárias estão configuradas!');
}

console.log('\n==================================================');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('==================================================');
console.log('1. Configure as credenciais reais no arquivo .env.local:');
console.log('   - DATABASE_URL: URL do seu banco Supabase');
console.log('   - GOOGLE_CLIENT_ID/SECRET: Credenciais do Google OAuth');
console.log('   - GITHUB_ID/SECRET: Credenciais do GitHub OAuth');
console.log('   - NEXTAUTH_SECRET: Mantenha o valor gerado ou crie um novo');
console.log('\n2. Execute: npm run dev');
console.log('3. Teste a autenticação em: http://localhost:3000/api/test-auth');
console.log('4. Verifique os logs do console para diagnosticar problemas');
console.log('==================================================');
