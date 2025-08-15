# 🔒 Guia de Segurança - Notch Todo List V3

## 🚨 Problema Resolvido: Chave da API do Stripe Exposta

### ✅ **O que foi feito:**

1. **Removido arquivos sensíveis** do repositório:
   - `.env.backup` (contendo chave da API do Stripe)
   - `.env.temp`

2. **Atualizado .gitignore** para prevenir futuras exposições:
   - Adicionados todos os tipos de arquivos de ambiente
   - Proteção contra commit acidental de chaves

3. **Limpo histórico do Git** usando `git filter-branch`:
   - Removida completamente a chave do histórico
   - Forçado push para atualizar o repositório remoto

## 🛡️ **Medidas de Segurança Implementadas**

### **1. .gitignore Atualizado**
```gitignore
# Arquivos de ambiente
.env*.local
.env
.env.backup
.env.temp
.env.production
.env.development
```

### **2. Arquivo de Exemplo Seguro**
- Criado `env.local.example` com placeholders
- Sem chaves reais, apenas exemplos

### **3. Validação de Variáveis**
- Implementada validação automática
- Fallbacks seguros para desenvolvimento
- Logs de aviso quando não configurado

## 📋 **Checklist de Segurança**

### ✅ **Antes de Fazer Commit**
- [ ] Verificar se não há arquivos `.env*` no staging
- [ ] Verificar se não há chaves de API no código
- [ ] Verificar se não há senhas hardcoded
- [ ] Executar `git status` para verificar arquivos

### ✅ **Configuração Segura**
- [ ] Usar apenas `env.local.example` como template
- [ ] Nunca commitar `.env.local`
- [ ] Usar variáveis de ambiente em produção
- [ ] Rotacionar chaves regularmente

## 🔧 **Comandos de Segurança**

### **Verificar arquivos sensíveis:**
```bash
# Verificar se há arquivos .env no staging
git diff --cached --name-only | grep -E "\.env"

# Verificar se há chaves no código
grep -r "sk_" . --exclude-dir=node_modules
grep -r "pk_" . --exclude-dir=node_modules
```

### **Limpar arquivos sensíveis:**
```bash
# Remover arquivo do staging
git rm --cached .env.backup

# Remover do histórico (se necessário)
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env.backup" --prune-empty --tag-name-filter cat -- --all
```

## 🚀 **Próximos Passos**

### **1. Configurar Ambiente Local**
```bash
# Copiar arquivo de exemplo
cp env.local.example .env.local

# Editar com suas configurações
nano .env.local
```

### **2. Configurar Supabase**
1. Criar projeto no Supabase
2. Obter URL e chaves de API
3. Configurar no `.env.local`

### **3. Configurar Stripe (Teste)**
1. Criar conta de teste no Stripe
2. Obter chaves de teste
3. Configurar price IDs

### **4. Testar Aplicação**
```bash
npm run setup:development
npm run dev
```

## ⚠️ **Boas Práticas**

### **Nunca fazer:**
- ❌ Commitar arquivos `.env*`
- ❌ Hardcodar chaves no código
- ❌ Usar chaves de produção em desenvolvimento
- ❌ Compartilhar chaves por email/chat

### **Sempre fazer:**
- ✅ Usar variáveis de ambiente
- ✅ Usar chaves de teste para desenvolvimento
- ✅ Rotacionar chaves regularmente
- ✅ Verificar `.gitignore` antes de commits

## 🔍 **Monitoramento**

### **GitHub Security Features:**
- Secret scanning ativo
- Push protection habilitado
- Alertas automáticos para chaves expostas

### **Verificações Regulares:**
- Revisar commits antes do push
- Verificar logs de segurança
- Monitorar alertas do GitHub

## 📞 **Em Caso de Emergência**

Se uma chave for exposta:

1. **Imediatamente:**
   - Revogar a chave no serviço (Stripe, Supabase, etc.)
   - Gerar nova chave
   - Atualizar variáveis de ambiente

2. **Limpar repositório:**
   - Remover arquivo do staging
   - Limpar histórico do Git
   - Forçar push

3. **Prevenir futuras exposições:**
   - Atualizar `.gitignore`
   - Implementar hooks de pre-commit
   - Treinar equipe sobre segurança

---

**🔒 Segurança é prioridade! Sempre verifique antes de commitar.**
