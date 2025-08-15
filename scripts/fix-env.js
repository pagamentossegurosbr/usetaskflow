const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo variáveis de ambiente...');

try {
  // Ler o arquivo .env
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extrair DATABASE_URL e outras variáveis importantes
  const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  const directUrlMatch = envContent.match(/DIRECT_URL="([^"]+)"/);
  const nextAuthUrlMatch = envContent.match(/NEXTAUTH_URL="([^"]+)"/);
  const nextAuthSecretMatch = envContent.match(/NEXTAUTH_SECRET="([^"]+)"/);
  const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\n]+)/);
  const supabaseAnonKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\n]+)/);
  const supabaseServiceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);
  
  if (!databaseUrlMatch) {
    console.error('❌ DATABASE_URL não encontrada no arquivo .env!');
    process.exit(1);
  }
  
  // Criar novo conteúdo para .env.local
  let newEnvLocalContent = `# ========================================
# CONFIGURAÇÃO CORRIGIDA - NOTCH TODO LIST
# ========================================

# ========================================
# SUPABASE CONFIGURATION
# ========================================
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrlMatch ? supabaseUrlMatch[1] : 'https://your-project.supabase.co'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKeyMatch ? supabaseAnonKeyMatch[1] : 'your_supabase_anon_key_here'}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKeyMatch ? supabaseServiceKeyMatch[1] : 'your_supabase_service_role_key_here'}

# ========================================
# NEXTAUTH CONFIGURATION
# ========================================
NEXTAUTH_URL=${nextAuthUrlMatch ? nextAuthUrlMatch[1] : 'http://localhost:3000'}
NEXTAUTH_SECRET=${nextAuthSecretMatch ? nextAuthSecretMatch[1] : 'your_nextauth_secret_here'}

# ========================================
# DATABASE CONFIGURATION
# ========================================
DIRECT_URL=${directUrlMatch ? directUrlMatch[1] : 'your_direct_url_here'}
DATABASE_URL=${databaseUrlMatch[1]}

# ========================================
# STRIPE CONFIGURATION
# ========================================
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Price IDs para produção
STRIPE_PRICE_EXECUTOR_TRIAL=your_executor_trial_price_id
STRIPE_PRICE_ASPIRANTE_TRIAL=your_aspirante_trial_price_id
STRIPE_ASPIRANTE_PRICE_ID=your_aspirante_price_id
STRIPE_EXECUTOR_PRICE_ID=your_executor_price_id
STRIPE_PRICE_EXECUTOR_REGULAR=your_executor_regular_price_id
STRIPE_PRICE_ASPIRANTE_REGULAR=your_aspirante_regular_price_id

# ========================================
# OAUTH PROVIDERS
# ========================================
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# GitHub OAuth
GITHUB_ID=your_github_id_here
GITHUB_SECRET=your_github_secret_here

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
`;
  
  // Escrever o novo arquivo .env.local
  fs.writeFileSync(envLocalPath, newEnvLocalContent);
  
  console.log('✅ Arquivo .env.local corrigido com sucesso!');
  console.log('📋 DATABASE_URL corrigida:', databaseUrlMatch[1]);
  console.log('🔄 Reinicie o servidor de desenvolvimento para aplicar as mudanças.');
  
} catch (error) {
  console.error('❌ Erro ao corrigir variáveis de ambiente:', error);
  process.exit(1);
}
