# Bolao Frontend

Frontend do bolao da Copa do Mundo 2026.

## Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

## Funcionalidades

- Login e cadastro
- Dashboard de jogos
- Palpites por partida
- Filtros por etapa, grupo/fase e status
- Palpite de campeao
- Ranking geral e por grupo
- Grupos de bolao
- Historico
- Perfil do usuario
- Painel admin

## Instalar

```bash
npm install
```

## Variaveis de ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL="http://localhost:3333"
```

Em producao, troque pela URL publica do backend:

```env
VITE_API_URL="https://url-do-backend.com"
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Frontend local:

```txt
http://localhost:5173
```

## Build de producao

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```

## Backend necessario

O frontend depende da API do backend rodando e configurada em `VITE_API_URL`.

No backend, configure:

```env
DATABASE_URL="..."
DIRECT_URL="..."
JWT_SECRET="..."
FRONTEND_URL="http://localhost:5173"
```

Depois rode no backend:

```bash
npm install
npx prisma generate
npx prisma db push
node scripts/importWorldCupMatches.js
npm run dev
```
