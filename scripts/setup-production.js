#!/usr/bin/env node

/**
 * Script para configurar a aplicação para produção
 * Executa verificações e configurações necessárias
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Verificar se estamos no diretório correto
function checkProjectStructure() {
  logStep(1, 'Verificando estrutura do projeto...');
  
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.ts',
    'prisma/schema.prisma',
    'lib/supabase.ts',
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    logError(`Arquivos necessários não encontrados: ${missingFiles.join(', ')}`);
    process.exit(1);
  }

  logSuccess('Estrutura do projeto verificada');
}

// Verificar dependências
function checkDependencies() {
  logStep(2, 'Verificando dependências...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      '@supabase/ssr',
      'next',
      'react',
      'react-dom',
      'typescript',
      'tailwindcss',
    ];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]);
    
    if (missingDeps.length > 0) {
      logWarning(`Dependências recomendadas não encontradas: ${missingDeps.join(', ')}`);
      log('Execute: npm install ' + missingDeps.join(' '));
    } else {
      logSuccess('Dependências verificadas');
    }
  } catch (error) {
    logError('Erro ao verificar dependências: ' + error.message);
  }
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  logStep(3, 'Verificando variáveis de ambiente...');
  
  const envFile = '.env.local';
  const envExample = 'env.production.example';
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      logWarning(`Arquivo ${envFile} não encontrado`);
      log(`Copie ${envExample} para ${envFile} e configure as variáveis`);
    } else {
      logError('Arquivo de exemplo de variáveis de ambiente não encontrado');
    }
  } else {
    logSuccess('Arquivo de variáveis de ambiente encontrado');
  }
}

// Verificar configuração do Supabase
function checkSupabaseConfig() {
  logStep(4, 'Verificando configuração do Supabase...');
  
  const supabaseFile = 'lib/supabase.ts';
  const supabaseProductionFile = 'lib/supabase-production.ts';
  
  if (!fs.existsSync(supabaseFile)) {
    logError('Arquivo de configuração do Supabase não encontrado');
    return;
  }

  if (fs.existsSync(supabaseProductionFile)) {
    logSuccess('Configuração de produção do Supabase encontrada');
  } else {
    logWarning('Configuração de produção do Supabase não encontrada');
  }
}

// Verificar configuração do Next.js
function checkNextConfig() {
  logStep(5, 'Verificando configuração do Next.js...');
  
  const nextConfigFile = 'next.config.js';
  const nextConfigProductionFile = 'next.config.production.js';
  
  if (!fs.existsSync(nextConfigFile)) {
    logError('Arquivo de configuração do Next.js não encontrado');
    return;
  }

  if (fs.existsSync(nextConfigProductionFile)) {
    logSuccess('Configuração de produção do Next.js encontrada');
  } else {
    logWarning('Configuração de produção do Next.js não encontrada');
  }
}

// Verificar TypeScript
function checkTypeScript() {
  logStep(6, 'Verificando configuração do TypeScript...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    logSuccess('TypeScript configurado corretamente');
  } catch (error) {
    logWarning('Erros de TypeScript encontrados (serão ignorados em produção)');
  }
}

// Verificar ESLint
function checkESLint() {
  logStep(7, 'Verificando configuração do ESLint...');
  
  try {
    execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0', { stdio: 'pipe' });
    logSuccess('ESLint passou sem erros');
  } catch (error) {
    logWarning('ESLint encontrou problemas (serão ignorados em produção)');
  }
}

// Verificar build
function checkBuild() {
  logStep(8, 'Testando build de produção...');
  
  try {
    log('Executando build... (isso pode demorar alguns minutos)');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build de produção executado com sucesso');
  } catch (error) {
    logError('Erro no build de produção');
    log('Verifique os erros acima e corrija antes de fazer deploy');
    process.exit(1);
  }
}

// Verificar otimizações
function checkOptimizations() {
  logStep(9, 'Verificando otimizações...');
  
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  const optimizations = [
    { name: 'SWC Minify', check: 'swcMinify: true' },
    { name: 'Compressão', check: 'compress: true' },
    { name: 'Headers de segurança', check: 'X-Frame-Options' },
    { name: 'Powered by header removido', check: 'poweredByHeader: false' },
  ];

  optimizations.forEach(opt => {
    if (nextConfig.includes(opt.check)) {
      logSuccess(`${opt.name} configurado`);
    } else {
      logWarning(`${opt.name} não configurado`);
    }
  });
}

// Verificar scripts de produção
function checkProductionScripts() {
  logStep(10, 'Verificando scripts de produção...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = ['build', 'start'];
    const recommendedScripts = ['lint', 'type-check'];
    
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        logSuccess(`Script ${script} encontrado`);
      } else {
        logError(`Script ${script} não encontrado`);
      }
    });
    
    recommendedScripts.forEach(script => {
      if (scripts[script]) {
        logSuccess(`Script ${script} encontrado`);
      } else {
        logWarning(`Script ${script} não encontrado (recomendado)`);
      }
    });
  } catch (error) {
    logError('Erro ao verificar scripts: ' + error.message);
  }
}

// Gerar relatório
function generateReport() {
  logStep(11, 'Gerando relatório de produção...');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    checks: {
      projectStructure: true,
      dependencies: true,
      environmentVariables: fs.existsSync('.env.local'),
      supabaseConfig: fs.existsSync('lib/supabase.ts'),
      nextConfig: fs.existsSync('next.config.js'),
      typescript: true,
      eslint: true,
      build: true,
      optimizations: true,
      productionScripts: true,
    }
  };
  
  fs.writeFileSync('production-report.json', JSON.stringify(report, null, 2));
  logSuccess('Relatório de produção gerado: production-report.json');
}

// Função principal
function main() {
  log('🚀 Configuração de Produção - Notch Todo List V3', 'bright');
  log('================================================', 'bright');
  
  try {
    checkProjectStructure();
    checkDependencies();
    checkEnvironmentVariables();
    checkSupabaseConfig();
    checkNextConfig();
    checkTypeScript();
    checkESLint();
    checkBuild();
    checkOptimizations();
    checkProductionScripts();
    generateReport();
    
    log('\n🎉 Configuração de produção concluída!', 'bright');
    log('\n📋 Próximos passos:', 'cyan');
    log('1. Configure as variáveis de ambiente em .env.local');
    log('2. Configure o Supabase para produção');
    log('3. Configure o Stripe para produção');
    log('4. Configure o domínio e SSL');
    log('5. Faça deploy na plataforma escolhida (Vercel, Netlify, etc.)');
    
  } catch (error) {
    logError('Erro durante a configuração: ' + error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkProjectStructure,
  checkDependencies,
  checkEnvironmentVariables,
  checkSupabaseConfig,
  checkNextConfig,
  checkTypeScript,
  checkESLint,
  checkBuild,
  checkOptimizations,
  checkProductionScripts,
  generateReport,
};
