# MoltGraph API + Neo4j — Deployment Guide

Полная инструкция по восстановлению старого деплоя на новом Railway.

---

## Что у тебя есть

1. **`neo4j.dump`** — снапшот базы Neo4j (190 МБ) на 17 марта 2026
   Был в архиве `moltgraphdata.zip → moltgraphdata/dataset/neo4j.dump`
2. **`server.js`** — обновлённая версия API (всё через env vars)
3. **`crawler/`** — Python-краулер, если захочешь собирать свежие данные
   _(нужен `MOLTBOOK_API_KEY` от Moltbook)_

---

## Архитектура

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Frontend   │  HTTP   │  API server  │  Bolt   │   Neo4j     │
│ (Vercel или │ ──────► │  (Railway)   │ ──────► │  (Aura или  │
│  Railway)   │         │              │         │  Railway)   │
└─────────────┘         └──────────────┘         └─────────────┘
                                                        ▲
                                                        │ опционально
                                                  ┌──────────────┐
                                                  │   Crawler    │
                                                  │  (Python +   │
                                                  │   Docker)    │
                                                  └──────────────┘
```

---

## Шаг 1. Поднять Neo4j

### Вариант А — Neo4j Aura (рекомендую если влезет)

1. Зарегистрируйся: https://console.neo4j.io
2. Создай **Free instance** (5 GB, до 200K nodes — у тебя ~70K, влезет)
3. Скопируй credentials из welcome-email:
   - URI: `neo4j+s://xxxxxx.databases.neo4j.io`
   - User: `neo4j`
   - Password: (выдают при создании)
4. Залей дамп — через Aura CLI:

```bash
# Установить aura-cli
npm install -g @neo4j/aura-cli

# Войти
aura-cli login

# Загрузить дамп в свой инстанс
aura-cli data-api import neo4j.dump --instance-id YOUR_INSTANCE_ID
```

Или через GUI: https://console.neo4j.io → твой инстанс → **Import database** → залить `neo4j.dump`.

### Вариант Б — Neo4j на Railway (если в Aura не влезает)

1. На Railway: **New Service → Database → не находишь Neo4j?** → используй **Empty Service**
2. Положи туда `Dockerfile`:

```dockerfile
FROM neo4j:5.15-community

ENV NEO4J_AUTH=neo4j/your-strong-password
ENV NEO4J_dbms_memory_pagecache_size=512m
ENV NEO4J_dbms_memory_heap_max__size=1g
ENV NEO4J_server_default__listen__address=0.0.0.0

# Залить дамп при первом запуске
COPY neo4j.dump /tmp/neo4j.dump

CMD ["sh", "-c", "if [ ! -f /data/databases/neo4j/restored ]; then \
       neo4j-admin database load neo4j --from-path=/tmp --overwrite-destination=true && \
       touch /data/databases/neo4j/restored; \
     fi && neo4j console"]
```

3. На Railway: **Settings → Networking → Generate Domain** для bolt-порта
4. Запиши URL: `bolt://YOUR_DOMAIN.railway.app:7687`

---

## Шаг 2. Задеплоить API на Railway

### 2.1 Подготовь репозиторий

```bash
git init
git add server.js package.json Procfile railway.json .env.example
git commit -m "Initial API deploy"
git remote add origin git@github.com:YOUR_USER/moltgraph-api.git
git push -u origin main
```

### 2.2 На Railway

1. **New Project → Deploy from GitHub repo** → выбери репо `moltgraph-api`
2. В **Variables** добавь:
   - `NEO4J_URI` = `neo4j+s://xxxxxx.databases.neo4j.io` (из шага 1)
   - `NEO4J_USER` = `neo4j`
   - `NEO4J_PASSWORD` = (твой пароль)
   - `NEO4J_DATABASE` = `neo4j`
   - `CORS_ORIGIN` = `*` (или конкретный домен фронтенда)
3. **Settings → Networking → Generate Domain** — получишь URL вида `moltgraph-api-production-xxxx.up.railway.app`
4. Проверь:

```bash
curl https://your-api.up.railway.app/health
# должно вернуть {"status":"healthy","neo4j":"connected"}

curl https://your-api.up.railway.app/api/stats
# должно вернуть массив с labels и counts
```

---

## Шаг 3. Обновить фронтенд

В `moltgraph_v2/src/App.jsx` найди строку:

```js
const API = "https://moltgraph-api-production.up.railway.app";
```

Замени на свой новый Railway URL.

**Лучше через env-переменную:**

1. В корне проекта создай `.env`:
```
VITE_API_URL=https://your-new-api.up.railway.app
```

2. В `App.jsx`:
```js
const API = import.meta.env.VITE_API_URL || "https://your-new-api.up.railway.app";
```

3. При деплое на Vercel/Railway добавь ту же переменную в Environment.

---

## Шаг 4 (опционально). Запустить crawler

Если хочешь свежие данные с Moltbook (а не только дамп от марта):

1. Получи API ключ Moltbook: https://www.moltbook.com → личный кабинет → API
2. На своей машине / VPS:

```bash
cd moltgraphdata
echo "MOLTBOOK_API_KEY=твой_ключ" > .env
echo "NEO4J_URI=neo4j+s://xxxxxx.databases.neo4j.io" >> .env
echo "NEO4J_USER=neo4j" >> .env
echo "NEO4J_PASSWORD=твой_пароль" >> .env

docker compose build crawler
docker compose run --rm crawler python -m scripts.full_crawl
```

Или регулярно через `autorun.sh` (запускает каждые 10 минут).

---

## Troubleshooting

| Проблема | Решение |
|---|---|
| `Static fallback` на фронте | API недоступен → проверь `/health` |
| `Neo4j: disconnected` | Не те credentials → проверь `NEO4J_URI`, `NEO4J_PASSWORD` |
| `CORS error` | Поставь `CORS_ORIGIN=*` или конкретный домен фронта |
| Aura говорит "instance is paused" | Free tier паузится через 3 дня без активности → unpause в console |
| Дамп не загружается в Aura | Возможно превышение лимита Free (200K nodes) → нужен Professional или self-host |
| `Error: ServiceUnavailable` | Aura имеет лимит соединений на Free → подожди / увеличь tier |

---

## Команды для проверки в Neo4j Browser

После загрузки дампа открой Neo4j Browser (Aura → Open → Browser) и выполни:

```cypher
// Сколько узлов каких типов
MATCH (n) RETURN labels(n) AS label, count(*) AS cnt ORDER BY cnt DESC;

// Топ-10 агентов по карме
MATCH (a:Agent) RETURN a.name, a.karma ORDER BY a.karma DESC LIMIT 10;

// Топ-10 сабмолтов по количеству постов
MATCH (s:Submolt)<-[:IN_SUBMOLT]-(p:Post)
RETURN s.name, count(p) AS posts ORDER BY posts DESC LIMIT 10;
```

Если эти запросы возвращают данные — всё работает, API будет отдавать живые данные на фронт.
