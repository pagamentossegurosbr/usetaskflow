# Atualização de Preços no Stripe

## Preços Atuais vs Novos Preços

### Plano Executor

**Preços Atuais:**
- 1º Mês: R$ 97,00
- Mensal: R$ 129,90

**Novos Preços:**
- 1º Mês: R$ 24,90
- Mensal: R$ 49,90

## Instruções para Atualização no Stripe

### 1. Acesse o Dashboard do Stripe
- Vá para https://dashboard.stripe.com
- Faça login na sua conta

### 2. Navegue para Produtos
- No menu lateral, clique em "Produtos"
- Encontre o produto "Executor" (prod_SpfaMuTz5LfKlR)

### 3. Atualize os Preços

#### Para o 1º Mês (Trial):
1. Clique no preço atual do 1º mês
2. Clique em "Editar preço"
3. Altere o valor para R$ 24,90 (2490 centavos)
4. Salve as alterações

#### Para o Preço Mensal:
1. Clique no preço mensal atual
2. Clique em "Editar preço"
3. Altere o valor para R$ 49,90 (4990 centavos)
4. Salve as alterações

### 4. Verifique os Price IDs
Os Price IDs devem permanecer os mesmos:
- 1º Mês: `price_1Ru0FCDY8STDZSZWz6KEmH5L`
- Mensal: `price_1Ru0FGDY8STDZSZWL6ArBwl2`

### 5. Teste a Integração
Após atualizar os preços:
1. Teste o fluxo de upgrade no site
2. Verifique se os valores corretos aparecem
3. Teste uma compra de teste

## Observações Importantes

- Os Price IDs não devem ser alterados para manter a compatibilidade
- Apenas os valores monetários devem ser atualizados
- O plano Aspirante permanece com os mesmos preços
- Todos os usuários existentes continuarão com seus preços atuais até a renovação

## Benefícios da Atualização

1. **Preços mais acessíveis** - Aumenta a conversão
2. **Melhor valor percebido** - R$ 49,90/mês para todas as funcionalidades premium
3. **Competitividade** - Preços alinhados com o mercado
4. **Novas funcionalidades** - Pomodoro, Planejador, Cave Mode, Biblioteca, Habit Tracker
