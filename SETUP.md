# Configuração do Sistema de Barbearia

## Visão Geral
Sistema completo de gestão para barbearias com controle financeiro, agendamentos inteligentes e relatórios detalhados.

## Funcionalidades

### Gestão de Serviços
- Cadastro de serviços com preço e tempo de duração
- Ativar/desativar serviços
- Edição e exclusão de serviços

### Gestão de Barbeiros
- Cadastro de barbeiros com telefone
- Controle de status ativo/inativo
- Relatórios de desempenho individual

### Agendamento Inteligente
- Agenda diária, semanal e mensal
- Bloqueio automático de horários baseado na duração do serviço
- Prevenção de conflitos de horário
- Cadastro rápido de novos clientes
- Status de agendamentos: agendado, concluído, cancelado

### Controle Financeiro
- Registro de pagamentos por forma:
  - Cartão de Crédito
  - Cartão de Débito
  - Dinheiro
  - Pix
- Controle de despesas por categoria
- Cálculo automático de lucro

### Dashboard e Relatórios
- Faturamento por período (dia, semana, mês)
- Total de despesas
- Lucro líquido
- Relatórios por forma de pagamento
- Relatórios por tipo de serviço
- Desempenho por barbeiro
- Visualizações gráficas

## Configuração

### 1. Configurar Supabase

1. Acesse seu projeto no Supabase
2. O banco de dados já foi criado automaticamente com todas as tabelas necessárias
3. Copie as credenciais do projeto:
   - URL do projeto
   - Chave Anon (pública)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 3. Criar Primeiro Usuário

1. Execute o projeto
2. Clique em "Não tem conta? Criar agora"
3. Cadastre seu email e senha
4. Faça login

## Estrutura do Banco de Dados

### Tabelas Criadas
- `barbers` - Barbeiros
- `services` - Serviços oferecidos
- `clients` - Clientes
- `appointments` - Agendamentos
- `payments` - Pagamentos registrados
- `expenses` - Despesas da barbearia
- `expense_categories` - Categorias de despesas

### Segurança
- Row Level Security (RLS) ativado em todas as tabelas
- Autenticação obrigatória para todos os recursos
- Políticas de acesso configuradas

## Uso do Sistema

### Fluxo Básico

1. **Configuração Inicial**
   - Cadastrar serviços (ex: Corte, Barba, Degradê)
   - Cadastrar barbeiros da equipe

2. **Agendamentos**
   - Criar agendamento escolhendo cliente, barbeiro, serviço e horário
   - Sistema calcula automaticamente o horário final
   - Visualizar agendamentos por data

3. **Concluir Atendimento**
   - Marcar agendamento como concluído
   - Registrar forma de pagamento
   - Valor já vem preenchido com o preço do serviço

4. **Registrar Despesas**
   - Cadastrar despesas mensais (aluguel, produtos, contas)
   - Categorizar despesas

5. **Visualizar Relatórios**
   - Dashboard atualizado em tempo real
   - Filtros por período (dia, semana, mês)
   - Análise detalhada de desempenho

## Dicas de Uso

- Use o filtro de data nos agendamentos para navegar entre dias
- Cadastre categorias de despesas conforme necessário
- O lucro é calculado automaticamente (faturamento - despesas)
- Barbeiros inativos não aparecem na criação de agendamentos
- Serviços inativos não aparecem na criação de agendamentos

## Suporte

O sistema foi desenvolvido com:
- React + TypeScript
- Tailwind CSS
- Supabase (banco de dados e autenticação)
- Lucide React (ícones)
