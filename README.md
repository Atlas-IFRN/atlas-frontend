# Atlas - Frontend Service

Interface de usuário do ecossistema de microsserviços Atlas, responsável pela experiência web do sistema de gerenciamento de bolsas de estudo. Este projeto foi estruturado com foco em escalabilidade, manutenção e padronização visual para evoluir em conjunto com os demais serviços da plataforma.

## ✨ Tech Stack

| Tecnologia | Papel no projeto |
| --- | --- |
| React 19 | Base da interface reativa e componentizada |
| Vite | Build tool e ambiente de desenvolvimento com Hot Reload |
| TypeScript | Tipagem estática para reduzir erros e melhorar a manutenção |
| Docker | Padronização do ambiente de execução local |
| Atomic Design | Organização dos componentes de UI em camadas reutilizáveis |

## 📋 Manifesto de Requisitos

O arquivo `requirements.txt` foi incluído neste repositório para **compatibilidade com sistemas de submissão acadêmica ou documentação externa**, permitindo que o projeto seja aprovado em processos de avaliação que exigem listagem explícita de dependências em formato padrão.

Este arquivo documenta as tecnologias base do ambiente:

```
Node.js >= 20.19
npm >= 10.0
Docker >= 20.10
Docker Compose >= 2.0
React >= 19.0
TypeScript >= 6.0
Vite >= 8.0
```

### Importante

**O gerenciamento real de dependências de software continua sendo feito exclusivamente via `package.json` e seu lockfile.**

O arquivo `requirements.txt` é meramente informativo e não é utilizado pelo fluxo de desenvolvimento ou build do projeto. Alterações de dependências devem sempre ser feitas editando `package.json` e executando `npm install` ou `npm update`.

## 🏗️ Arquitetura de Pastas

A pasta `src` concentra toda a implementação da interface. A organização foi pensada para separar responsabilidades e tornar a evolução do frontend previsível.

| Pasta | Responsabilidade |
| --- | --- |
| `src/components` | Biblioteca de componentes reutilizáveis, organizada por Atomic Design |
| `src/pages` | Telas de rota, responsáveis por compor a experiência de cada página |
| `src/hooks` | Hooks customizados para encapsular lógica reutilizável de estado, efeitos e integração |
| `src/services` | Camada de acesso a APIs e integração com o backend |
| `src/assets` | Imagens, ícones, ilustrações e demais recursos estáticos |

### `src/components` e Atomic Design

O diretório `src/components` deve seguir rigorosamente a metodologia Atomic Design.

| Camada | Objetivo | Exemplos |
| --- | --- | --- |
| `atoms` | Menores blocos de interface, com responsabilidade única | botões, inputs, labels, ícones |
| `molecules` | Combinações simples de átomos que formam um comportamento coeso | campos com label e mensagem de erro, cards resumidos |
| `organisms` | Seções mais completas da interface, compostas por moléculas e átomos | cabeçalhos, formulários complexos, listas com filtros |
| `templates` | Estruturas de página sem dependência de dados de negócio | layouts base, colunas, shells visuais |

Regras práticas para essa organização:

- Componentes de baixo nível devem permanecer desacoplados de regras de negócio.
- A composição deve acontecer de baixo para cima, do átomo ao template.
- Telas finais não devem “furar” a hierarquia e importar diretamente detalhes internos quando existir um componente apropriado.
- Novos componentes devem ser classificados na camada correta antes de serem adicionados ao repositório.
### Nota sobre arquivos `.gitkeep`

O Git não rastreia diretórios vazios por padrão. Para garantir que a estrutura de pastas do Atomic Design seja enviada ao repositório no commit inicial, foram adicionados arquivos `.gitkeep` em cada uma das camadas:

- `src/components/atoms/.gitkeep`
- `src/components/molecules/.gitkeep`
- `src/components/organisms/.gitkeep`
- `src/components/templates/.gitkeep`

Assim que você clonar o projeto e criar o primeiro componente real dentro de uma dessas pastas, o arquivo `.gitkeep` correspondente **pode (e deve) ser excluído** para manter o diretório limpo. O arquivo será automaticamente substituído pelo componente e deixará de ser necessário.
## 🐳 Setup com Docker

### Pré-requisitos

| Requisito | Observação |
| --- | --- |
| Docker Engine / Docker Desktop | Necessário para construir e executar o container |
| Docker Compose | Usado para subir o serviço `frontend` |
| Node.js | Não é obrigatório para executar via container, mas ajuda em tarefas locais |

### Execução do zero

1. Acesse a raiz do projeto (onde estão `package.json` e `docker-compose.yml`).

2. Garanta que o arquivo `.env.development` exista ou crie um `.env` com as variáveis necessárias.

3. Suba a aplicação com build da imagem:

```bash
docker compose up --build
```

4. Acesse a interface no navegador:

```text
http://localhost:5173
```

### Nota importante para Windows

Para usuários de Windows, recomenda-se fortemente:

- Usar WSL 2 como backend do Docker Desktop.
- Executar o Docker Desktop e o terminal como Administrador, especialmente na primeira configuração.
- Verificar se o compartilhamento de arquivos e a integração com a distro WSL estão habilitados.

Esses passos evitam problemas comuns de performance, montagem de volumes e comunicação entre o host Windows e o container.

### Setup Local sem Docker

Caso prefira rodar a aplicação localmente utilizando Node.js nativo (sem Docker):

1. Acesse a raiz do projeto.
2. Certifique-se de que está rodando a versão do Node.js definida no `requirements.txt`.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente necessárias num arquivo `.env.development` baseado no escopo esperado, caso necessário.
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse no navegador:
   ```text
   http://localhost:5173
   ```

## ⚙️ Configuração de Ambiente

As variáveis de ambiente deste projeto ficam em arquivos `.env` na raiz do repositório. Eles servem para separar configurações que mudam entre ambientes, como desenvolvimento, homologação e produção, sem precisar alterar o código-fonte.

### O que são arquivos `.env`

Arquivos `.env` são arquivos de texto simples usados para armazenar pares `chave=valor`. No contexto deste projeto, eles ajudam a definir, por exemplo, a URL do backend, o nome do ambiente e outras configurações que variam conforme o contexto de execução.

### Hierarquia de arquivos

| Arquivo | Uso | Observação |
| --- | --- | --- |
| `.env` | Base padrão de configuração | Pode conter valores comuns a todos os ambientes |
| `.env.development` | Usado no desenvolvimento local | É o arquivo carregado pelo fluxo de `npm run dev` e pelo Docker Compose deste projeto |
| `.env.example` | Modelo para novos devs | Deve ser versionado, mas sem segredos reais |

No projeto atual, o `docker-compose.yml` aponta para `.env.development` via `env_file`, então esse arquivo é lido no momento em que o container sobe.

### Prefixo `VITE_`

No Vite, variáveis de ambiente só são expostas ao código do frontend se começarem com `VITE_`. Isso é uma proteção deliberada da ferramenta: apenas variáveis explicitamente marcadas como públicas entram no bundle acessível pelo navegador.

Na prática, isso significa que `API_URL` sozinho não fica disponível no frontend, mas `VITE_API_URL` fica acessível em tempo de execução do código React.

### Acesso no código

Exemplo técnico de uso no frontend:

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

Esse valor pode ser usado para criar clientes HTTP, configurar interceptors do Axios ou montar chamadas para o backend.

### Exemplo de configuração

```env
VITE_API_URL=http://localhost:8000/api
VITE_ENV_NAME=development
```

### Integração com Docker

O `docker-compose.yml` lê o arquivo `.env.development` através de `env_file` e injeta essas variáveis no container na inicialização. Isso mantém a configuração centralizada e evita hardcode no código.

Importante: o Docker disponibiliza essas variáveis para o processo dentro do container, mas quem decide quais delas vão aparecer no frontend é o Vite, por meio do prefixo `VITE_`.

### Segurança e `.gitignore`

Nunca suba arquivos `.env` reais para o GitHub quando eles contiverem dados sensíveis, como tokens, credenciais, chaves privadas ou URLs internas não públicas. O repositório deve versionar apenas o exemplo `.env.example`, para documentar a estrutura esperada sem expor segredos.

Boas práticas recomendadas:

- Mantenha segredos fora do frontend sempre que possível.
- Versione apenas arquivos de exemplo, não os arquivos reais de ambiente.
- Garanta que arquivos locais sensíveis estejam cobertos por `.gitignore`.
- Use valores diferentes por ambiente para evitar que configuração de desenvolvimento vaze para produção.

## 🔁 Fluxo de Desenvolvimento

### Adicionando novas dependências

Quando uma dependência for adicionada ao projeto, o container deve ser reconstruído para garantir que o ambiente reflita o novo estado do `package.json` e do lockfile.

```bash
docker compose up --build
```

Se você alterar dependências dentro do container ou atualizar o lockfile, prefira reconstruir a imagem em vez de depender apenas do container já em execução.

### Hot Reload com volumes do Docker

O `docker-compose.yml` monta o código-fonte como volume:

```yaml
volumes:
	- .:/app
	- /app/node_modules
```

Isso permite que mudanças feitas no código sejam refletidas imediatamente no navegador durante o desenvolvimento, aproveitando o Hot Reload do Vite.

Em resumo:

- Alterou um arquivo em `src`? O container recebe a mudança via volume.
- Salvou o arquivo? O Vite recompila apenas o necessário.
- Evitou reinstalar dependências a cada ciclo? O volume separado de `node_modules` ajuda a preservar o ambiente do container.

## 🧭 Padrões de Código

O projeto segue uma base de qualidade voltada para clareza, previsibilidade e manutenção contínua.

| Padrão | Diretriz |
| --- | --- |
| ESLint | A base de lint deve ser respeitada antes de qualquer merge |
| Clean Code | Nomes claros, funções pequenas e responsabilidade única |
| Atomic Design | Obrigatório para novos componentes de UI |
| TypeScript | Tipos explícitos quando agregarem legibilidade e segurança |

### Boas práticas esperadas

- Prefira composição em vez de duplicação.
- Mantenha componentes com responsabilidade única.
- Extraia regras de negócio e integração com API para `services` e `hooks` quando fizer sentido.
- Evite acoplamento excessivo entre páginas e detalhes de implementação.

## 📌 Comandos Úteis

| Comando | Finalidade |
| --- | --- |
| `docker compose up --build` | Sobe a aplicação com rebuild da imagem |
| `npm run dev` | Executa o frontend em modo desenvolvimento fora do container |
| `npm run build` | Gera o build de produção |
| `npm run lint` | Executa as regras de ESLint |

## 🌐 Visão Geral do Projeto

O Atlas - Frontend Service é a camada de apresentação do ecossistema Atlas. Seu objetivo é entregar uma interface consistente para operar o sistema de bolsas de estudo, consumindo os serviços do backend por meio de uma arquitetura modular, escalável e fácil de manter.

---

> Dica: ao evoluir o projeto, mantenha a separação entre apresentação, regra de negócio e integração com API. Isso reduz retrabalho e facilita a escala da base de código.
