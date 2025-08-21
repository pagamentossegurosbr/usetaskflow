const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DE PROBLEMAS DE AUTENTICAÇÃO');
console.log('============================================\n');

// 1. Verificar arquivo .env.local
console.log('1. Verificando arquivo .env.local...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env.local encontrado');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_ID',
    'GITHUB_SECRET'
  ];
  
  const missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('❌ Variáveis ausentes:', missingVars.join(', '));
  } else {
    console.log('✅ Todas as variáveis de ambiente necessárias estão presentes');
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado');
  console.log('📝 Criando arquivo .env.local com configuração básica...');
  
  const envTemplate = `# ========================================
# CONFIGURAÇÃO DE DESENVOLVIMENTO - NOTCH TODO LIST
# ========================================

# ========================================
# NEXTAUTH CONFIGURATION
# ========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_min_32_chars

# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

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
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Arquivo .env.local criado com sucesso');
}

// 2. Verificar configuração do NextAuth
console.log('\n2. Verificando configuração do NextAuth...');
const authPath = path.join(process.cwd(), 'lib/auth.ts');
if (fs.existsSync(authPath)) {
  console.log('✅ Arquivo lib/auth.ts encontrado');
} else {
  console.log('❌ Arquivo lib/auth.ts não encontrado');
}

// 3. Verificar configuração do Prisma
console.log('\n3. Verificando configuração do Prisma...');
const prismaPath = path.join(process.cwd(), 'lib/prisma.ts');
if (fs.existsSync(prismaPath)) {
  console.log('✅ Arquivo lib/prisma.ts encontrado');
} else {
  console.log('❌ Arquivo lib/prisma.ts não encontrado');
}

// 4. Verificar schema do Prisma
console.log('\n4. Verificando schema do Prisma...');
const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Arquivo prisma/schema.prisma encontrado');
} else {
  console.log('❌ Arquivo prisma/schema.prisma não encontrado');
}

// 5. Verificar middleware
console.log('\n5. Verificando middleware...');
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('✅ Arquivo middleware.ts encontrado');
  
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  if (middlewareContent.includes('/api/auth/')) {
    console.log('✅ Middleware está configurado para permitir rotas de autenticação');
  } else {
    console.log('⚠️  Middleware pode estar bloqueando rotas de autenticação');
  }
} else {
  console.log('❌ Arquivo middleware.ts não encontrado');
}

console.log('\n============================================');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('============================================');
console.log('1. Configure as variáveis de ambiente no arquivo .env.local');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:3000/api/debug-auth');
console.log('4. Verifique os logs do console para mais detalhes');
console.log('5. Se necessário, execute: npx prisma generate');
console.log('6. Se necessário, execute: npx prisma db push');
console.log('\n🔧 Se o problema persistir, verifique:');
console.log('- Configuração do banco de dados');
console.log('- Credenciais do OAuth (Google/GitHub)');
console.log('- Configuração do NextAuth Secret');
console.log('============================================');
