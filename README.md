# MoltGraph — полная инструкция по деплою

Интеллектуальная платформа для анализа AI-агентов в социальной сети Moltbook.

## 📁 Структура проекта

```
moltgraph/
├── frontend/    # React + Vite — то что видит пользователь
├── api/         # Express + Neo4j driver — REST API для фронта
├── crawler/     # Python + Docker — сбор свежих данных с Moltbook
└── README.md    # этот файл
```

## 🏗️ Архитектура

```
                                            ┌──────────────┐
                                            │   Moltbook   │
                                            │  (API key)   │
                                            └──────┬───────┘
                                                   │
                                                   ▼ опционально
┌──────────────┐     HTTPS    ┌──────────────┐  Bolt  ┌──────────────┐
│   Frontend   │ ──────────► │  API server  │ ──────► │    Neo4j     │
│   (Vercel /  │             │   (Railway)  │         │   (Aura /    │
│    Railway)  │             │              │         │   Railway)   │
└──────────────┘             └──────────────┘         └──────▲───────┘
                                                              │
                                                       ┌──────┴───────┐
                                                       │   Crawler    │
                                                       │  (твоя машина│
                                                       │   или VPS)   │
                                                       └──────────────┘
```

---

# 🚀 Пошаговая инструкция

## Шаг 1 — Подготовить GitHub-репозиторий

У тебя уже создан репо. Залей в него содержимое этого пакета:

```bash
# Распакуй архив
unzip moltgraph-monorepo.zip
cd moltgraph_final

# Инициализируй git
git init
git add .
git commit -m "Initial commit: MoltGraph monorepo"

# Подключи свой GitHub репо
git remote add origin git@github.com:ТВОЙ_ЮЗЕР/ТВОЙ_РЕПО.git
git branch -M main
git push -u origin main
```

> ⚠️ `neo4j.dump` (190 МБ) **нельзя** коммитить в GitHub — он в `.gitignore`. Храни его отдельно (Google Drive, Dropbox, локально).

---

## Шаг 2 — Поднять Neo4j базу

**Рекомендую: Neo4j Aura Free** (бесплатно, 200K nodes — твоего дампа хватит).

### 2.1. Создать инстанс

1. Открой https://console.neo4j.io
2. Sign up / Sign in
3. **New Instance** → **AuraDB Free**
4. Дай имя `moltgraph`, выбери регион (Frankfurt ближе всего к тебе)
5. **Create Instance** → запиши:
   - **Connection URI** (вида `neo4j+s://abc123.databases.neo4j.io`)
   - **Username** (обычно `neo4j`)
   - **Generated password** ← **СКОПИРУЙ И СОХРАНИ**, второй раз не покажут

### 2.2. Загрузить дамп

**Через Aura Web UI (проще):**

1. На странице инстанса → **⋮** (три точки) → **Import database**
2. Выбери файл `neo4j.dump` (190 МБ)
3. Подожди ~5–10 минут пока загрузится
4. Готово — переходи к шагу 3

**Через CLI (если предпочитаешь):**

```bash
# Установи aura-cli
npm install -g @neo4j/aura-cli

# Войди и загрузи дамп
aura-cli login
aura-cli data-api import neo4j.dump --instance-id YOUR_INSTANCE_ID
```

### 2.3. Проверить что данные загрузились

В Aura console → **Open** → откроется Neo4j Browser.  
В левой панели запусти запрос:

```cypher
MATCH (n) RETURN labels(n) AS type, count(*) AS count ORDER BY count DESC;
```

Должно вернуть что-то вроде:
```
Post     | 66111
Comment  | 108904
Agent    | 12670
Submolt  | 939
...
```

✅ Если данные есть — Neo4j готов.

---

## Шаг 3 — Задеплоить API на Railway

### 3.1. Создать проект

1. Открой https://railway.app → **New Project**
2. Выбери **Deploy from GitHub repo** → найди свой репо
3. Railway увидит монорепо — выбери **Add variables** или продолжи без переменных, исправим позже

### 3.2. Настроить service для API

1. После создания проекта Railway добавит **один сервис** (по умолчанию пытается определить тип). Тебе нужно вручную указать что это API:
   - Открой созданный сервис → **Settings** → **Root Directory** → введи `api`
   - **Build Command**: оставь пустым (Railway сам разберётся через `package.json`)
   - **Start Command**: `node server.js`

2. **Variables** (вкладка в сервисе) → добавь:

```
NEO4J_URI         = neo4j+s://abc123.databases.neo4j.io    (из шага 2.1)
NEO4J_USER        = neo4j
NEO4J_PASSWORD    = твой_пароль_из_aura                     (из шага 2.1)
NEO4J_DATABASE    = neo4j
CORS_ORIGIN       = *                                       (потом заменишь на домен фронта)
```

3. **Settings** → **Networking** → **Generate Domain**  
   Получишь URL вида `moltgraph-api-production-xxxx.up.railway.app`

### 3.3. Проверить API

```bash
# Health-check
curl https://твой-api.up.railway.app/health
# Должно вернуть: {"status":"healthy","neo4j":"connected"}

# Реальные данные
curl https://твой-api.up.railway.app/api/stats
# Должно вернуть массив с типами и количеством узлов
```

✅ Если оба запроса работают — API готов.

---

## Шаг 4 — Задеплоить Frontend

**Вариант A: Railway (всё в одном месте)**

1. В том же Railway-проекте → **+ New** → **GitHub Repo** → выбери тот же репо ещё раз
2. **Settings** → **Root Directory** → `frontend`
3. **Variables**:
   ```
   VITE_API_URL = https://твой-api.up.railway.app
   PORT         = 4173
   ```
4. **Settings** → **Networking** → **Generate Domain**

**Вариант B: Vercel (лучше для статики, бесплатнее)**

1. https://vercel.com → **Add New** → **Project**
2. Импортируй свой GitHub-репо
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Environment Variables**:
   ```
   VITE_API_URL = https://твой-api.up.railway.app
   ```
6. **Deploy**

### 4.1. Обновить CORS

После того как фронт получил свой домен — вернись в Railway → API сервис → **Variables** → измени:
```
CORS_ORIGIN = https://твой-фронт.vercel.app
```
Это безопаснее чем `*`.

✅ Открой URL фронта — должен работать с живыми данными из Neo4j.

---

## Шаг 5 (опционально) — Crawler для свежих данных

Без crawler-а у тебя будет дамп от 17 марта 2026 — это нормально для демонстрации. Запускай crawler **только если хочешь, чтобы данные обновлялись**.

### 5.1. Получить ключ Moltbook

1. Зарегайся на https://www.moltbook.com
2. Подтверди свой агент (см. `crawler/moltbook-registration/bot_register.md`)
3. Получи `MOLTBOOK_API_KEY` в личном кабинете

### 5.2. Запустить локально (или на VPS)

```bash
cd crawler

# Создай .env
cp .env.example .env
nano .env
# Заполни:
#   MOLTBOOK_API_KEY=твой_ключ
#   NEO4J_URI=neo4j+s://abc123.databases.neo4j.io
#   NEO4J_USER=neo4j
#   NEO4J_PASSWORD=твой_пароль

# Smoke-тест (30 сек) — проверка что всё подключено
docker compose run --rm crawler python -m scripts.smoke_test

# Полный краул (часы) — соберёт всё что доступно с Moltbook
docker compose run --rm crawler python -m scripts.full_crawl

# Автозапуск каждые 10 минут (на VPS под tmux/screen)
chmod +x autorun.sh
./autorun.sh
```

> 📦 Подробности — внутри `crawler/README.md` и `crawler/database.md`.

---

# 🔧 Локальная разработка

```bash
# Frontend
cd frontend
cp .env.example .env
# Открой .env, поставь VITE_API_URL=https://твой-api.up.railway.app
npm install
npm run dev
# → http://localhost:5173

# API (отдельный терминал)
cd api
cp .env.example .env
# Заполни Neo4j credentials
npm install
npm start
# → http://localhost:3001
```

---

# 🩺 Troubleshooting

| Проблема | Решение |
|---|---|
| Фронт показывает "Static fallback" | API недоступен → открой `/health` API |
| `Neo4j: disconnected` | Не те credentials → проверь переменные в Railway |
| `CORS error` в консоли | Поставь `CORS_ORIGIN=*` или укажи точный домен |
| Aura говорит `instance is paused` | Free-tier паузится через 3 дня бездействия → unpause в console |
| Дамп не влезает в Aura Free | Нужен Professional ($65/мес) или self-hosted Neo4j |
| Railway build падает | Проверь что **Root Directory** = `api` или `frontend` |
| `Module not found` при build | Проверь `package.json` — нет ли там лишних/неустановленных пакетов |
| Crawler не пишет в Neo4j | Проверь что `NEO4J_URI` использует `neo4j+s://` (не `bolt://`) для Aura |

---

# 💰 Стоимость (примерно)

| Сервис | Free tier | Если нужно больше |
|---|---|---|
| Neo4j Aura | ✅ 5GB, 200K nodes | Professional от $65/мес |
| Railway | ✅ $5 credit/мес | $5–20/мес для прод |
| Vercel | ✅ безлимит для hobby | Pro $20/мес |
| Crawler VPS | — | $5/мес (Hetzner CX11) |

**Минимум для работы: $0** (Aura Free + Railway free credit + Vercel hobby).

---

# 📚 Документация по компонентам

- **Frontend** — `frontend/README.md`
- **API** — `api/API_README.md`
- **Crawler** — `crawler/README.md`
- **Graph schema** — `crawler/graph-schema.md`
- **Database ops** — `crawler/database.md`
- **DB maintenance** — `crawler/db-maintaining.md`

---

# 🆘 Если что-то не работает

1. **API не отвечает** → Railway logs → ищи ошибки подключения к Neo4j
2. **Neo4j отвечает но данных нет** → проверь что дамп залился: `MATCH (n) RETURN count(n)`
3. **Фронт не видит API** → DevTools → Network → ищи запросы на `/api/*` и смотри какой URL и статус
4. **CORS блокирует** → API → Variables → `CORS_ORIGIN` = твой фронт-домен (без слеша в конце)

Если застрял — пиши, разберёмся.
