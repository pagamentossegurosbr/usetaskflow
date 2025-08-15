# 🔧 Guia de Desenvolvimento - Notch Todo List V3

## 🚨 Problemas Identificados e Soluções

### 1. **Erro de CORS e URLs de Produção**
**Problema**: A aplicação está tentando acessar URLs de produção em desenvolvimento local.

**Solução**:
```bash
# 1. Copiar arquivo de exemplo
cp env.example .env.local

# 2. Configurar variáveis de ambiente para desenvolvimento
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 2. **Erro de JSON Inválido**
**Problema**: Respostas HTML sendo interpretadas como JSON.

**Solução**: 
- Middleware configurado para lidar com CORS
- Headers de segurança adicionados
- Validação de variáveis de ambiente implementada

### 3. **Erro de Fetch Failed**
**Problema**: Falha na comunicação com APIs.

**Solução**:
- URLs relativas em vez de absolutas
- Tratamento de erro melhorado
- Fallbacks para desenvolvimento

## 🛠️ Configuração Rápida

### 1. **Executar Script de Configuração**
```bash
npm run setup:development
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Editar .env.local com suas configurações
nano .env.local
```

### 3. **Instalar Dependências**
```bash
npm install
```

### 4. **Executar em Desenvolvimento**
```bash
npm run dev
```

## 📋 Checklist de Configuração

### ✅ **Variáveis de Ambiente Obrigatórias**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXTAUTH_URL=http://localhost:3000`
- [ ] `NEXTAUTH_SECRET` (mínimo 32 caracteres)

### ✅ **Configurações do Supabase**
- [ ] Projeto criado no Supabase
- [ ] URL e chaves configuradas
- [ ] Tabelas criadas (se necessário)

### ✅ **Configurações do Stripe (Teste)**
- [ ] Conta de teste configurada
- [ ] Chaves de teste configuradas
- [ ] Price IDs configurados

## 🔍 Troubleshooting

### **Erro: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**
**Causa**: API retornando HTML em vez de JSON
**Solução**: 
1. Verificar se as variáveis de ambiente estão configuradas
2. Verificar se o Supabase está acessível
3. Verificar se as URLs estão corretas

### **Erro: "Failed to fetch"**
**Causa**: Problema de CORS ou rede
**Solução**:
1. Verificar se o servidor está rodando
2. Verificar configurações de CORS
3. Verificar se as URLs são relativas

### **Erro: "Access to fetch has been blocked by CORS policy"**
**Causa**: Configuração de CORS incorreta
**Solução**:
1. Middleware já configurado
2. Headers de CORS adicionados
3. Verificar se está usando localhost:3000

## 🚀 Scripts Úteis

```bash
# Configurar desenvolvimento
npm run setup:development

# Verificar configuração
npm run verify:config

# Limpar cache
npm run clean

# Verificar tipos TypeScript
npm run type-check

# Executar linting
npm run lint
```

## 📁 Estrutura de Arquivos

```
├── .env.local              # Variáveis de ambiente (criar)
├── env.example             # Exemplo de variáveis
├── next.config.js          # Configuração Next.js
├── middleware.ts           # Middleware para CORS
├── lib/
│   └── supabase.ts        # Configuração Supabase
└── scripts/
    └── setup-development.js # Script de configuração
```

## 🔧 Configurações Implementadas

### **1. Middleware de CORS**
- Headers de CORS configurados
- Suporte a desenvolvimento e produção
- Tratamento de requests OPTIONS

### **2. Configuração do Supabase**
- Validação de variáveis de ambiente
- Fallbacks para desenvolvimento
- Logs de aviso quando não configurado

### **3. Configuração do Next.js**
- Headers de segurança
- Otimizações de performance
- Configurações de CORS

### **4. Tratamento de Erros**
- Mensagens de erro específicas
- Fallbacks para funcionalidades
- Logs informativos

## 🎯 Próximos Passos

1. **Configure as variáveis de ambiente** em `.env.local`
2. **Execute o script de configuração**: `npm run setup:development`
3. **Teste a aplicação**: `npm run dev`
4. **Verifique se os erros foram resolvidos**

## 📞 Suporte

Se ainda houver problemas:
1. Verifique os logs no console
2. Execute `npm run setup:development`
3. Verifique se todas as variáveis estão configuradas
4. Teste a conexão com Supabase

---

**🎉 Com essas configurações, a aplicação deve funcionar corretamente em desenvolvimento!**
