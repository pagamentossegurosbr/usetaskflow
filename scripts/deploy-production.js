#!/usr/bin/env node

/**
 * Script para automatizar o deploy de produção
 * Suporta Vercel, Netlify e outras plataformas
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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

// Verificar se o comando existe
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Verificar se estamos em um repositório git
function checkGitRepository() {
  logStep(1, 'Verificando repositório Git...');
  
  try {
    execSync('git status', { stdio: 'pipe' });
    logSuccess('Repositório Git encontrado');
    return true;
  } catch (error) {
    logError('Não é um repositório Git válido');
    log('Execute: git init && git add . && git commit -m "Initial commit"');
    return false;
  }
}

// Verificar se há mudanças não commitadas
function checkUncommittedChanges() {
  logStep(2, 'Verificando mudanças não commitadas...');
  
  try {
    const result = execSync('git status --porcelain', { encoding: 'utf8' });
    if (result.trim()) {
      logWarning('Há mudanças não commitadas');
      log('Recomendado: git add . && git commit -m "Update before deploy"');
      return false;
    } else {
      logSuccess('Todas as mudanças estão commitadas');
      return true;
    }
  } catch (error) {
    logError('Erro ao verificar status do Git');
    return false;
  }
}

// Verificar branch atual
function checkCurrentBranch() {
  logStep(3, 'Verificando branch atual...');
  
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`Branch atual: ${branch}`);
    
    if (branch === 'main' || branch === 'master') {
      logSuccess('Branch principal detectada');
      return true;
    } else {
      logWarning(`Branch atual: ${branch} (recomendado: main/master)`);
      return false;
    }
  } catch (error) {
    logError('Erro ao verificar branch atual');
    return false;
  }
}

// Verificar variáveis de ambiente
function checkEnvironmentVariables() {
  logStep(4, 'Verificando variáveis de ambiente...');
  
  const envFile = '.env.local';
  const envProductionFile = 'env.production.example';
  
  if (!fs.existsSync(envFile)) {
    logError(`Arquivo ${envFile} não encontrado`);
    log(`Copie ${envProductionFile} para ${envFile} e configure as variáveis`);
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];
  
  const missingVars = requiredVars.filter(var_name => !envContent.includes(var_name));
  
  if (missingVars.length > 0) {
    logError(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    return false;
  }
  
  logSuccess('Variáveis de ambiente verificadas');
  return true;
}

// Executar build de produção
function runProductionBuild() {
  logStep(5, 'Executando build de produção...');
  
  try {
    log('Executando: npm run build');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build de produção concluído');
    return true;
  } catch (error) {
    logError('Erro no build de produção');
    return false;
  }
}

// Verificar se o Vercel CLI está instalado
function checkVercelCLI() {
  logStep(6, 'Verificando Vercel CLI...');
  
  if (commandExists('vercel')) {
    logSuccess('Vercel CLI encontrado');
    return true;
  } else {
    logWarning('Vercel CLI não encontrado');
    log('Para instalar: npm i -g vercel');
    return false;
  }
}

// Verificar se o Netlify CLI está instalado
function checkNetlifyCLI() {
  logStep(7, 'Verificando Netlify CLI...');
  
  if (commandExists('netlify')) {
    logSuccess('Netlify CLI encontrado');
    return true;
  } else {
    logWarning('Netlify CLI não encontrado');
    log('Para instalar: npm i -g netlify-cli');
    return false;
  }
}

// Deploy no Vercel
function deployToVercel() {
  logStep(8, 'Fazendo deploy no Vercel...');
  
  try {
    log('Executando: vercel --prod');
    execSync('vercel --prod', { stdio: 'inherit' });
    logSuccess('Deploy no Vercel concluído');
    return true;
  } catch (error) {
    logError('Erro no deploy do Vercel');
    return false;
  }
}

// Deploy no Netlify
function deployToNetlify() {
  logStep(8, 'Fazendo deploy no Netlify...');
  
  try {
    // Primeiro, fazer build
    log('Executando build para Netlify...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Depois, fazer deploy
    log('Executando: netlify deploy --prod --dir=out');
    execSync('netlify deploy --prod --dir=out', { stdio: 'inherit' });
    
    logSuccess('Deploy no Netlify concluído');
    return true;
  } catch (error) {
    logError('Erro no deploy do Netlify');
    return false;
  }
}

// Deploy manual (build + upload)
function manualDeploy() {
  logStep(8, 'Preparando para deploy manual...');
  
  try {
    // Fazer build
    log('Executando build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Criar arquivo de deploy
    const deployInfo = {
      timestamp: new Date().toISOString(),
      buildDir: '.next',
      staticDir: 'out',
      instructions: [
        '1. Faça upload da pasta .next para seu servidor',
        '2. Configure o servidor para servir arquivos estáticos',
        '3. Configure as variáveis de ambiente no servidor',
        '4. Configure o proxy reverso (nginx/apache)',
        '5. Configure SSL/HTTPS',
      ]
    };
    
    fs.writeFileSync('deploy-info.json', JSON.stringify(deployInfo, null, 2));
    logSuccess('Informações de deploy salvas em deploy-info.json');
    return true;
  } catch (error) {
    logError('Erro ao preparar deploy manual');
    return false;
  }
}

// Verificar status do deploy
function checkDeployStatus(platform) {
  logStep(9, `Verificando status do deploy no ${platform}...`);
  
  try {
    if (platform === 'vercel') {
      execSync('vercel ls', { stdio: 'inherit' });
    } else if (platform === 'netlify') {
      execSync('netlify status', { stdio: 'inherit' });
    }
    
    logSuccess(`Status do ${platform} verificado`);
    return true;
  } catch (error) {
    logWarning(`Não foi possível verificar o status do ${platform}`);
    return false;
  }
}

// Função principal
function main() {
  log('🚀 Deploy de Produção - Notch Todo List V3', 'bright');
  log('============================================', 'bright');
  
  // Verificações iniciais
  if (!checkGitRepository()) return;
  if (!checkUncommittedChanges()) {
    logWarning('Continuando mesmo com mudanças não commitadas...');
  }
  if (!checkCurrentBranch()) {
    logWarning('Continuando mesmo não estando na branch principal...');
  }
  if (!checkEnvironmentVariables()) return;
  if (!runProductionBuild()) return;
  
  // Verificar plataformas disponíveis
  const hasVercel = checkVercelCLI();
  const hasNetlify = checkNetlifyCLI();
  
  // Escolher plataforma
  let platform = process.argv[2];
  
  if (!platform) {
    if (hasVercel) {
      platform = 'vercel';
      log('Vercel detectado como plataforma padrão', 'yellow');
    } else if (hasNetlify) {
      platform = 'netlify';
      log('Netlify detectado como plataforma padrão', 'yellow');
    } else {
      platform = 'manual';
      log('Nenhuma plataforma detectada, usando deploy manual', 'yellow');
    }
  }
  
  // Executar deploy
  let deploySuccess = false;
  
  switch (platform.toLowerCase()) {
    case 'vercel':
      if (hasVercel) {
        deploySuccess = deployToVercel();
        if (deploySuccess) {
          checkDeployStatus('vercel');
        }
      } else {
        logError('Vercel CLI não está instalado');
      }
      break;
      
    case 'netlify':
      if (hasNetlify) {
        deploySuccess = deployToNetlify();
        if (deploySuccess) {
          checkDeployStatus('netlify');
        }
      } else {
        logError('Netlify CLI não está instalado');
      }
      break;
      
    case 'manual':
      deploySuccess = manualDeploy();
      break;
      
    default:
      logError(`Plataforma não suportada: ${platform}`);
      log('Plataformas suportadas: vercel, netlify, manual');
      return;
  }
  
  if (deploySuccess) {
    log('\n🎉 Deploy concluído com sucesso!', 'bright');
    log('\n📋 Próximos passos:', 'cyan');
    log('1. Verifique se o site está funcionando corretamente');
    log('2. Teste todas as funcionalidades principais');
    log('3. Configure monitoramento e analytics');
    log('4. Configure backups automáticos');
    log('5. Configure alertas de erro');
  } else {
    logError('Deploy falhou');
    log('Verifique os erros acima e tente novamente');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkGitRepository,
  checkUncommittedChanges,
  checkCurrentBranch,
  checkEnvironmentVariables,
  runProductionBuild,
  deployToVercel,
  deployToNetlify,
  manualDeploy,
};
