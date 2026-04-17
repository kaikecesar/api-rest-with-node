# api-rest-with-node

> Projeto **exclusivamente para fins de estudo** sobre como construir uma API REST em Node.js com Fastify, TypeScript, Knex e SQLite.

Este repositório implementa uma pequena API de **controle financeiro pessoal**, em que o usuário pode registrar transações de crédito e débito, listá-las, visualizar uma transação específica e obter um resumo (saldo) da sua conta. A identificação do usuário é feita por meio de **cookies de sessão**, sem necessidade de cadastro ou login.

O projeto foi construído seguindo a trilha de Node.js da [Rocketseat](https://www.rocketseat.com.br/) e tem como objetivo praticar:

- Criação de rotas HTTP com **Fastify**
- Validação de entrada com **Zod**
- Persistência em banco relacional com **Knex** + **SQLite**
- Versionamento de banco com **migrations**
- Validação de variáveis de ambiente em tempo de boot
- Identificação de usuários por **cookies**
- Uso de **middlewares** (preHandler) para proteção de rotas
- Tipagem do banco com `declare module` do Knex
- Configuração de **ESLint** e **TypeScript** em projeto Node moderno (ESM)

> ⚠️ **Aviso:** este projeto **não foi feito para produção**. Não há autenticação real, criptografia, rate limiting, testes automatizados ou qualquer outra preocupação típica de um sistema em produção. Ele serve apenas como material de aprendizado.

---

## Sumário

- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Rotas da API](#rotas-da-api)
- [Como funciona a sessão (cookies)](#como-funciona-a-sessão-cookies)
- [Requisitos do projeto](#requisitos-do-projeto)
- [Licença](#licença)

---

## Stack

| Categoria         | Biblioteca                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| Runtime           | [Node.js](https://nodejs.org/) (ESM, com `"type": "module"`)               |
| Linguagem         | [TypeScript](https://www.typescriptlang.org/)                              |
| HTTP framework    | [Fastify](https://fastify.dev/)                                            |
| Cookies           | [@fastify/cookie](https://github.com/fastify/fastify-cookie)               |
| Query builder     | [Knex](https://knexjs.org/)                                                |
| Banco de dados    | [SQLite3](https://www.sqlite.org/)                                         |
| Validação         | [Zod](https://zod.dev/)                                                    |
| Ambiente          | [dotenv](https://github.com/motdotla/dotenv)                               |
| Execução em dev   | [tsx](https://github.com/privatenumber/tsx)                                |
| Lint              | [ESLint](https://eslint.org/) + [@rocketseat/eslint-config](https://github.com/Rocketseat/eslint-config-rocketseat) |

---

## Estrutura do projeto

```
.
├── database/
│   ├── app.db                  # arquivo do banco SQLite (gerado)
│   └── migrations/             # migrations versionadas pelo Knex
│       ├── 20260414165906_create-transactions.ts
│       └── 20260414171319_add-session-id-to-transactions.ts
├── docs/
│   └── scope.md                # requisitos funcionais e regras de negócio
├── src/
│   ├── @types/
│   │   └── knex.d.ts           # tipagem da tabela transactions para o Knex
│   ├── env/
│   │   └── index.ts            # validação das variáveis de ambiente com Zod
│   ├── middlewares/
│   │   └── check-session-id-exists.ts  # protege rotas que exigem sessão
│   ├── routes/
│   │   └── transactions.ts     # rotas de transações
│   ├── database.ts             # configuração e instância do Knex
│   └── server.ts               # bootstrap do Fastify
├── .env.example
├── knexfile.ts                 # reaproveita a config do Knex em src/database.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Pré-requisitos

- **Node.js 20+** (o projeto usa `"type": "module"` e import de arquivos `.ts` via `tsx`)
- **npm** (ou outro gerenciador equivalente)

---

## Como rodar

1. Clone o repositório e instale as dependências:

```bash
git clone https://github.com/kaikecesar/api-rest-with-node.git
cd api-rest-with-node
npm install
```

2. Crie um arquivo `.env` na raiz, baseado no [.env.example](.env.example):

```env
NODE_ENV=development
DATABASE_URL=./database/app.db
```

3. Rode as migrations para criar o banco e as tabelas:

```bash
npm run knex -- migrate:latest
```

4. Suba o servidor em modo de desenvolvimento (com hot-reload):

```bash
npm run dev
```

A API estará disponível em **http://localhost:3333**.

---

## Scripts disponíveis

| Script         | Descrição                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`  | Sobe o servidor com `tsx watch` (recompila e reinicia ao salvar arquivos).                 |
| `npm run lint` | Roda o ESLint sobre os arquivos `.ts` dentro de `src/`.                                    |
| `npm run knex` | Atalho para a CLI do Knex (ex.: `npm run knex -- migrate:latest`, `migrate:make nome`).    |

---

## Variáveis de ambiente

As variáveis são validadas em tempo de inicialização por [src/env/index.ts](src/env/index.ts) usando Zod. Se alguma estiver inválida ou faltando, a aplicação **não sobe**.

| Variável       | Tipo                                          | Padrão        | Obrigatória |
| -------------- | --------------------------------------------- | ------------- | ----------- |
| `NODE_ENV`     | `'development' \| 'test' \| 'production'`     | `production`  | Não         |
| `DATABASE_URL` | `string` (caminho do arquivo SQLite)          | —             | **Sim**     |
| `PORT`         | `number`                                      | `3333`        | Não         |

---

## Banco de dados e migrations

O banco utilizado é o **SQLite**, com o arquivo persistido em `./database/app.db` (configurável via `DATABASE_URL`). A configuração do Knex está em [src/database.ts](src/database.ts) e é reaproveitada pelo [knexfile.ts](knexfile.ts).

### Tabela `transactions`

Criada pelas migrations em [database/migrations/](database/migrations/):

| Coluna       | Tipo            | Notas                                                  |
| ------------ | --------------- | ------------------------------------------------------ |
| `id`         | `uuid` (PK)     | Identificador único da transação.                      |
| `session_id` | `uuid` (index)  | Identifica a "sessão" do usuário (cookie).             |
| `title`      | `text`          | Descrição da transação.                                |
| `amount`     | `decimal(10,2)` | Valor (positivo para crédito, negativo para débito).   |
| `created_at` | `timestamp`     | Default `now()`.                                       |

A tipagem da tabela é declarada em [src/@types/knex.d.ts](src/@types/knex.d.ts), o que dá autocomplete e segurança de tipos nas queries.

### Comandos úteis do Knex

```bash
# Aplicar todas as migrations pendentes
npm run knex -- migrate:latest

# Reverter a última migration
npm run knex -- migrate:rollback

# Criar uma nova migration
npm run knex -- migrate:make nome-da-migration
```

---

## Rotas da API

Todas as rotas estão sob o prefixo **`/transactions`** (registrado em [src/server.ts](src/server.ts)).

### `POST /transactions`

Cria uma nova transação. Se o cookie `sessionId` ainda não existir, ele é gerado e enviado ao cliente.

**Body:**

```json
{
  "title": "Salário",
  "amount": 5000,
  "type": "credit"
}
```

- `type: "credit"` → soma o valor.
- `type: "debit"` → subtrai o valor (armazenado como negativo).

**Resposta:** `201 Created` (sem corpo).

---

### `GET /transactions`

Lista todas as transações da sessão atual.

**Requer cookie `sessionId`.**

**Resposta:**

```json
{
  "transactions": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "title": "Salário",
      "amount": 5000,
      "created_at": "2026-04-17 12:00:00"
    }
  ],
  "count": 1
}
```

---

### `GET /transactions/:id`

Retorna uma transação específica, desde que pertença à sessão atual.

**Requer cookie `sessionId`.**

---

### `GET /transactions/summary`

Retorna o saldo (soma de todos os `amount`) da sessão atual.

**Requer cookie `sessionId`.**

**Resposta:**

```json
{
  "summary": { "amount": 4500 }
}
```

---

## Como funciona a sessão (cookies)

A API **não tem cadastro nem login**. O usuário é identificado por um cookie chamado `sessionId`:

1. No primeiro `POST /transactions`, o servidor gera um UUID e envia no cookie `sessionId` (válido por 7 dias).
2. Nas requisições seguintes, o cliente envia esse cookie de volta.
3. O middleware [check-session-id-exists.ts](src/middlewares/check-session-id-exists.ts) bloqueia (`401 Unauthorized`) qualquer rota protegida que não tenha o cookie.
4. Todas as queries de leitura filtram por `session_id`, garantindo que cada "usuário" só vê as próprias transações.

---

## Requisitos do projeto

Os requisitos funcionais e regras de negócio que guiaram a implementação estão em [docs/scope.md](docs/scope.md):

**Requisitos funcionais (FR):**
- O usuário deve conseguir criar uma nova transação;
- O usuário deve conseguir obter um resumo da sua conta;
- O usuário deve conseguir listar todas as transações que ocorreram;
- O usuário deve conseguir visualizar uma única transação;

**Regras de negócio (BR):**
- Uma transação pode ser do tipo `credit` (soma) ou `debit` (subtrai);
- Deve ser possível identificar o usuário entre as requisições;
- O usuário só pode visualizar transações que ele mesmo criou.

---

## Licença

Projeto distribuído sob a licença ISC, **sem qualquer garantia**, e destinado **apenas a fins educacionais**.
