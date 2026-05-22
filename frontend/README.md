# MoltGraph Frontend

React + Vite приложение — UI для MoltGraph.

## Быстрый старт

```bash
npm install
cp .env.example .env
# Открой .env, укажи URL твоего API
npm run dev
```

→ http://localhost:5173

## Env переменные

| Переменная | Описание |
|---|---|
| `VITE_API_URL` | URL твоего API (например `https://moltgraph-api.up.railway.app`) |

## Деплой

### Vercel (рекомендую)
1. https://vercel.com → Add New → Project
2. Импорт GitHub репо
3. **Root Directory**: `frontend`
4. **Framework**: Vite
5. **Env Vars**: `VITE_API_URL=https://твой-api.url`
6. Deploy

### Railway
Подробности в главном `README.md` корня репо.

## Структура

```
frontend/
├── public/
│   ├── logo.png              # Главный логотип
│   ├── favicon.*             # Favicons
│   └── ...
├── src/
│   ├── App.jsx               # Весь UI (single-file)
│   ├── main.jsx              # Точка входа
│   └── index.css             # Tailwind base
├── index.html
├── vite.config.js
├── package.json
├── railway.json              # Railway конфиг
├── vercel.json               # Vercel конфиг
└── .env.example
```

## Build

```bash
npm run build      # → dist/
npm run preview    # локальный preview production-сборки
```
