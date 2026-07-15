# Atlas · Frontend 💻

> Parte do **Projeto Atlas** — plataforma acadêmica desenvolvida para o **IFRN Campus Pau dos Ferros** como Projeto Integrador de Sistemas Distribuídos. O Atlas conecta alunos a trilhas de conhecimento e bolsas, com avaliação automática de código por IA.

**SPA (Single Page Application)** em React + TypeScript que é a interface única do Atlas para as duas personas: **aluno** (consome trilhas e se candidata a bolsas) e **professor** (gerencia trilhas, vagas e avalia talentos).

## O que esta aplicação faz

- **Autenticação:** fluxo de login via **SUAP (OAuth2)** com callback, guardando o JWT emitido pelo auth-service.
- **Trilhas:** navegação por trilhas, módulos e conteúdos, com acompanhamento de progresso e submissão de desafios.
- **Bolsas:** catálogo de bolsas, candidaturas e banco de talentos.
- **Feed:** mural institucional com posts, comentários, curtidas e banners.
- **Painel do professor:** gestão de trilhas/bolsas e avaliação de talentos.
- **Busca global, perfil e notificações** integrados aos respectivos serviços.

## Stack

- **React 18 + TypeScript** · **Vite**
- **Material UI (MUI)** + Emotion · lucide-react / simple-icons
- **TanStack Query** (data fetching/cache) · **Axios**
- react-router-dom · react-markdown + remark-gfm · react-youtube · sonner (toasts)
- ESLint + Prettier · Docker (Nginx servindo o build)

## Como se encaixa no Atlas

| Repositório | Responsabilidade |
|---|---|
| atlas-auth-service | Identidade: SUAP OAuth2, JWT, perfis de usuário |
| atlas-track-service | Trilhas, módulos, conteúdos, progresso e submissão de desafios |
| atlas-scholarship-service | Bolsas, candidaturas, banco de talentos e notas |
| atlas-feed-service | Feed institucional: posts, comentários, curtidas e banners |
| atlas-notification-service | Notificações (consumidor central via RabbitMQ) |
| atlas-ai-service | Avaliação de repositórios GitHub por LLM local (Ollama) |
| **atlas-frontend** | **SPA React + TypeScript (aluno e professor)** |
| atlas-infra | Docker Compose, Nginx (gateway), Postgres/Redis/RabbitMQ, deploy e backup |
| atlas-observability | Prometheus + Grafana (métricas dos serviços) |

**Comunicação:** todas as chamadas passam pelo **Nginx** (gateway), que valida o JWT e roteia para o serviço certo por namespace (`/api/auth/`, `/api/track/`, `/api/scholarship/`, `/api/feed/`, `/api/notifications/`). O cliente HTTP usa `VITE_API_URL` como base, com *overrides* opcionais por serviço.

## Estrutura

```
src/pages/        auth, tracks, scholarships, talent-bank, feed, teacher-panel, profile, search
src/services/     clientes HTTP (Axios) por serviço
src/components/   componentes reutilizáveis
src/contexts/ · src/providers/ · src/hooks/    estado e lógica compartilhada
src/routes/ · src/layouts/    roteamento e layout
src/theme/ · src/types/ · src/utils/
```

## Executando localmente

```bash
cp .env.example .env      # configure VITE_API_URL (ex.: http://localhost/api)
npm install
npm run dev               # Vite em modo desenvolvimento
```

Outros scripts: `npm run build` (typecheck + build de produção), `npm run preview`, `npm run lint`.

> Em produção, o app é servido por **Nginx** dentro de um container, orquestrado pelo **[Atlas-IFRN/atlas-infra](https://github.com/Atlas-IFRN/atlas-infra)**.

## Variáveis de ambiente

Baseie seu `.env` no `.env.example`. Principal: `VITE_API_URL` (base do gateway). Opcionais por serviço: `VITE_TRACKS_API_URL`, `VITE_FEED_API_URL`, `VITE_NOTIFICATIONS_API_URL`.

## CI/CD

Workflows de GitHub Actions em `.github/workflows/`.
