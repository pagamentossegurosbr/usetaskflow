# 🚀 Guia Completo de Produção - Notch Todo List V3

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Supabase](#configuração-do-supabase)
3. [Configuração do Stripe](#configuração-do-stripe)
4. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
5. [Otimizações de Produção](#otimizações-de-produção)
6. [Deploy](#deploy)
7. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### 📦 Dependências do Sistema
- Node.js 18+ 
- npm ou yarn
- Git
- Conta no Supabase
- Conta no Stripe
- Conta na plataforma de deploy (Vercel, Netlify, etc.)

### 🛠️ Scripts de Configuração
```bash
# Verificar configuração de produção
npm run setup:production

# Fazer deploy
npm run deploy:production
npm run deploy:vercel
npm run deploy:netlify
npm run deploy:manual
```

---

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e as chaves de API

### 2. Configurar Banco de Dados
```sql
-- Executar no SQL Editor do Supabase
-- Tabelas principais já estão configuradas via Prisma
-- Verificar se as migrations foram aplicadas
```

### 3. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Repetir para outras tabelas...
```

### 4. Configurar Storage (opcional)
```sql
-- Criar bucket para uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Política para avatares
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

---

## 💳 Configuração do Stripe

### 1. Configurar Conta Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Ative sua conta para produção
3. Configure webhooks

### 2. Criar Produtos e Preços
```bash
# Produto: Plano Aspirante
# Preço: R$ 9,90 (1º mês), R$ 24,90 (mensal)

# Produto: Plano Executor  
# Preço: R$ 24,90 (1º mês), R$ 49,90 (mensal)
```

### 3. Configurar Webhooks
- URL: `https://seu-dominio.com/api/webhooks/stripe`
- Eventos: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 🔐 Configuração das Variáveis de Ambiente

### 1. Criar Arquivo .env.local
```bash
cp env.production.example .env.local
```

### 2. Configurar Variáveis Obrigatórias
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# NextAuth
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=seu_secret_min_32_caracteres

# Stripe
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_publica
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret

# Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ASPIRANTE_TRIAL=price_seu_price_id_aspirante
NEXT_PUBLIC_STRIPE_PRICE_EXECUTOR_TRIAL=price_seu_price_id_executor
```

### 3. Configurar Variáveis Opcionais
```env
# OAuth Providers
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
GITHUB_ID=seu_github_id
GITHUB_SECRET=seu_github_secret

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=seu_analytics_id

# Email
RESEND_API_KEY=sua_resend_api_key
NEXT_PUBLIC_FROM_EMAIL=noreply@seu-dominio.com
```

---

## ⚡ Otimizações de Produção

### 1. Configuração do Next.js
```javascript
// next.config.production.js
const nextConfig = {
  // Otimizações de performance
  swcMinify: true,
  compress: true,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ];
  },
};
```

### 2. Otimizações de Bundle
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### 3. Otimizações de Imagens
```javascript
// next.config.js
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
};
```

---

## 🚀 Deploy

### 1. Deploy no Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
npm run deploy:vercel
```

### 2. Deploy no Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Fazer login
netlify login

# Deploy
npm run deploy:netlify
```

### 3. Deploy Manual
```bash
# Build
npm run build

# Upload dos arquivos para seu servidor
# Configurar nginx/apache
# Configurar SSL
```

### 4. Configuração de Domínio
1. Comprar domínio
2. Configurar DNS
3. Configurar SSL/HTTPS
4. Atualizar NEXTAUTH_URL

---

## 📊 Monitoramento e Manutenção

### 1. Analytics
```javascript
// _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 2. Error Tracking
```javascript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 3. Monitoramento de Performance
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
};
```

### 4. Backups Automáticos
```javascript
// scripts/backup.js
const { createBackup } = require('../lib/supabase-production');

async function backupAllUsers() {
  // Implementar backup automático
}
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Build
```bash
# Limpar cache
npm run clean

# Reinstalar dependências
npm run clean:all

# Verificar TypeScript
npm run type-check
```

#### 2. Erro de Conexão com Supabase
```bash
# Verificar variáveis de ambiente
npm run verify:config

# Testar conexão
node scripts/test-supabase-connection.js
```

#### 3. Erro de Stripe
```bash
# Verificar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Testar integração
npm run test:stripe
```

#### 4. Performance Lenta
```bash
# Analisar bundle
npm run build:analyze

# Verificar otimizações
npm run setup:production
```

### Logs e Debugging

#### 1. Logs de Produção
```javascript
// lib/logger.ts
export const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data),
};
```

#### 2. Monitoramento de Erros
```javascript
// pages/_error.tsx
import * as Sentry from '@sentry/nextjs';

function Error({ statusCode }) {
  useEffect(() => {
    Sentry.captureException(new Error(`Error ${statusCode}`));
  }, [statusCode]);
}
```

---

## 📈 Checklist de Produção

### ✅ Pré-Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase configurado e testado
- [ ] Stripe configurado e testado
- [ ] Build de produção funcionando
- [ ] Testes passando
- [ ] SEO configurado
- [ ] Analytics configurado

### ✅ Deploy
- [ ] Deploy executado com sucesso
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo
- [ ] Redirecionamentos configurados
- [ ] Performance testada

### ✅ Pós-Deploy
- [ ] Funcionalidades testadas
- [ ] Monitoramento ativo
- [ ] Backups configurados
- [ ] Alertas configurados
- [ ] Documentação atualizada

---

## 🆘 Suporte

### Recursos Úteis
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Stripe](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Contatos
- **Issues**: GitHub Issues
- **Documentação**: Este guia
- **Comunidade**: Discord/Slack

---

## 📝 Notas de Versão

### v3.0.0 - Produção
- ✅ Integração completa com Supabase
- ✅ Sistema de pagamentos com Stripe
- ✅ Otimizações de performance
- ✅ Configuração de produção
- ✅ Scripts de deploy automatizados
- ✅ Monitoramento e analytics
- ✅ Backup e recuperação
- ✅ Segurança e compliance

---

**🎉 Parabéns! Sua aplicação está pronta para produção!**
