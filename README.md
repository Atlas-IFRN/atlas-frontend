# Atlas Frontend ⚡

Interface de usuário do ecossistema **Atlas** — SPA para alunos e professores interagirem com trilhas de conhecimento, bolsas de estudo e perfil acadêmico.

## Stack

| Tecnologia | Papel |
|------------|-------|
| React 19 | Interface reativa e componentizada |
| Vite | Build tool com Hot Reload |
| TypeScript | Tipagem estática |
| Atomic Design | Organização de componentes em camadas reutilizáveis |

## Arquitetura de pastas

```
src/
├── components/     # Atomic Design: atoms / molecules / organisms / templates
├── pages/          # Telas de rota
├── hooks/          # Hooks customizados (estado, efeitos, integração)
├── services/       # Camada de acesso à API
└── assets/         # Imagens, ícones, recursos estáticos
```

### Atomic Design

| Camada | Responsabilidade | Exemplos |
|--------|-----------------|----------|
| `atoms` | Blocos mínimos de UI | botões, inputs, labels |
| `molecules` | Composições coesas de átomos | campos com label + erro, cards |
| `organisms` | Seções completas | headers, formulários, listas filtradas |
| `templates` | Estruturas de página sem dados de negócio | layouts, shells visuais |

> Quando criar um componente: classifique na camada correta antes de commitar. Componentes de baixo nível devem ser desacoplados de regras de negócio.

## Executando localmente

### Com Docker (recomendado)

Este serviço é orquestrado junto com todos os outros pelo repositório central de infraestrutura:

> **[Atlas-IFRN/atlas-infra](https://github.com/Atlas-IFRN/atlas-infra)** — Docker Compose canônico, Nginx, scripts de deploy e backup.

Para rodar o frontend em modo dev isolado (com Hot Reload):

```bash
# Pré-requisito: infra compartilhada rodando
git clone https://github.com/Atlas-IFRN/atlas-infra
cd atlas-infra && docker compose -f docker-compose.dev.yml up -d

# Neste repositório
cp .env.development.example .env.development
docker build -f Dockerfile.dev -t atlas-frontend-dev .
docker run --rm -p 5173:5173 -v $(pwd):/app -v /app/node_modules --env-file .env.development atlas-frontend-dev
```

Acesse: `http://localhost:5173`

### Sem Docker (Node nativo)

```bash
npm install
npm run dev
```

> **Windows:** use WSL 2 como backend do Docker Desktop para evitar problemas de volume e performance.

## Variáveis de ambiente

| Arquivo | Uso |
|---------|-----|
| `.env.development` | Dev local (lido pelo Vite e pelo container) |
| `.env.example` | Template versionado — sem secrets |

Apenas variáveis com prefixo `VITE_` são expostas ao bundle do browser:

```env
VITE_API_URL=http://localhost:8000/api
VITE_ENV_NAME=development
```

Acesso no código:
```ts
const apiUrl = import.meta.env.VITE_API_URL
```

## Comandos úteis

| Comando | Finalidade |
|---------|------------|
| `npm run dev` | Dev sem container |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |

## Padrões de código

- **ESLint** obrigatório antes de qualquer merge
- **Clean Code** — nomes claros, funções com responsabilidade única
- **Atomic Design** obrigatório para novos componentes de UI
- **TypeScript** — tipos explícitos quando agregam legibilidade

> Extraia regras de negócio e integração com API para `services/` e `hooks/`. Evite acoplar páginas a detalhes de implementação.

## Hot Reload com Docker

O `Dockerfile.dev` monta o código como volume, então mudanças em `src/` são refletidas imediatamente sem rebuild. O volume separado de `node_modules` preserva o ambiente do container.

