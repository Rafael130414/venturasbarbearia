# 💈 Barbearia Elite - Venturas Edition

Sistema de gestão premium para barbearias, focado em performance industrial, design minimalista e notificações em tempo real.

## 🚀 Tecnologias
- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS (Industrial Monolith Theme)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Icons:** Lucide React

## 🛠️ Funcionalidades
- **Portal do Cliente:** Agendamento rápido via `#agendar`.
- **Agenda Mestra:** Gestão de horários com notificações sonoras em tempo real.
- **Dashboard Elite:** Métricas financeiras, lucratividade e ranking de cortes.
- **Gestão de Equipe:** Controle de profissionais e horários de descanso (almoço).
- **Gestão de Serviços:** Catálogo dinâmico de cortes e preços.

## 🔐 Credenciais de Acesso (Supabase)
> **Aviso de Segurança:** Recomenda-se alterar a senha após o uso inicial e não compartilhar este arquivo em repositórios públicos.

| Serviço | Usuário | Senha |
|---------|---------|-------|
| **Supabase** | `rodriguessilvarafael645@gmail.com` | `Ra99181523@@` |

## 📦 Instalação e Execução
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com suas chaves do Supabase.
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🏗️ Estrutura do Projeto
- `/src/pages/Booking.tsx`: Portal público de agendamento.
- `/src/pages/Appointments.tsx`: Agenda administrativa em tempo real.
- `/src/pages/Dashboard.tsx`: Visão financeira e métricas.
- `/src/pages/Barbers.tsx`: Gestão da equipe e horários.
- `/src/pages/Services.tsx`: Gestão do catálogo de serviços.

---
*Powered by Venturas Elite OS v2*
