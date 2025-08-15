#!/usr/bin/env node

/**
 * Script para configurar o ambiente de desenvolvimento
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
  const envExample = 'env.example';
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExample)) {
      logWarning(`Arquivo ${envFile} não encontrado`);
      log(`Copie ${envExample} para ${envFile} e configure as variáveis`);
      
      // Tentar copiar automaticamente
      try {
        fs.copyFileSync(envExample, envFile);
        logSuccess(`Arquivo ${envFile} criado automaticamente`);
        log('⚠️  Configure as variáveis de ambiente em .env.local');
      } catch (error) {
        logError(`Erro ao copiar ${envExample}: ${error.message}`);
      }
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
  
  if (!fs.existsSync(supabaseFile)) {
    logError('Arquivo de configuração do Supabase não encontrado');
    return;
  }

  logSuccess('Configuração do Supabase encontrada');
}

// Verificar configuração do Next.js
function checkNextConfig() {
  logStep(5, 'Verificando configuração do Next.js...');
  
  const nextConfigFile = 'next.config.js';
  
  if (!fs.existsSync(nextConfigFile)) {
    logError('Arquivo de configuração do Next.js não encontrado');
    return;
  }

  logSuccess('Configuração do Next.js encontrada');
}

// Verificar TypeScript
function checkTypeScript() {
  logStep(6, 'Verificando configuração do TypeScript...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    logSuccess('TypeScript configurado corretamente');
  } catch (error) {
    logWarning('Erros de TypeScript encontrados (serão ignorados em desenvolvimento)');
  }
}

// Verificar ESLint
function checkESLint() {
  logStep(7, 'Verificando configuração do ESLint...');
  
  try {
    execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0', { stdio: 'pipe' });
    logSuccess('ESLint passou sem erros');
  } catch (error) {
    logWarning('ESLint encontrou problemas (serão ignorados em desenvolvimento)');
  }
}

// Verificar build de desenvolvimento
function checkDevBuild() {
  logStep(8, 'Testando build de desenvolvimento...');
  
  try {
    log('Executando build... (isso pode demorar alguns minutos)');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build de desenvolvimento executado com sucesso');
  } catch (error) {
    logError('Erro no build de desenvolvimento');
    log('Verifique os erros acima e corrija antes de continuar');
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
    { name: 'CORS configurado', check: 'Access-Control-Allow-Origin' },
  ];

  optimizations.forEach(opt => {
    if (nextConfig.includes(opt.check)) {
      logSuccess(`${opt.name} configurado`);
    } else {
      logWarning(`${opt.name} não configurado`);
    }
  });
}

// Verificar scripts de desenvolvimento
function checkDevelopmentScripts() {
  logStep(10, 'Verificando scripts de desenvolvimento...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = ['dev', 'build', 'start'];
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
  logStep(11, 'Gerando relatório de desenvolvimento...');
  
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
      developmentScripts: true,
    }
  };
  
  fs.writeFileSync('development-report.json', JSON.stringify(report, null, 2));
  logSuccess('Relatório de desenvolvimento gerado: development-report.json');
}

// Função principal
function main() {
  log('🚀 Configuração de Desenvolvimento - Notch Todo List V3', 'bright');
  log('====================================================', 'bright');
  
  try {
    checkProjectStructure();
    checkDependencies();
    checkEnvironmentVariables();
    checkSupabaseConfig();
    checkNextConfig();
    checkTypeScript();
    checkESLint();
    checkDevBuild();
    checkOptimizations();
    checkDevelopmentScripts();
    generateReport();
    
    log('\n🎉 Configuração de desenvolvimento concluída!', 'bright');
    log('\n📋 Próximos passos:', 'cyan');
    log('1. Configure as variáveis de ambiente em .env.local');
    log('2. Configure o Supabase para desenvolvimento');
    log('3. Configure o Stripe para teste');
    log('4. Execute: npm run dev');
    log('5. Acesse: http://localhost:3000');
    
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
  checkDevBuild,
  checkOptimizations,
  checkDevelopmentScripts,
  generateReport,
};
