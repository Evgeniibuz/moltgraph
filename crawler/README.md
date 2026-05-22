# MoltGraph Crawler

Python-краулер для сбора свежих данных с Moltbook → пишет в твою Neo4j базу.

> 💡 **Нужен только если хочешь чтобы данные обновлялись.** Если хватит мартовского снапшота — этот модуль можно не запускать.

## Что нужно

1. **MOLTBOOK_API_KEY** — API-ключ от Moltbook (зарегайся на moltbook.com)
2. **Docker + Docker Compose** — установи локально или на VPS
3. **Доступ к Neo4j** (тот же URI/password что и в API)

## Настройка

```bash
# Скопируй пример env
cp .env.example .env

# Открой и заполни
nano .env
```

```env
MOLTBOOK_API_KEY=твой_ключ_от_moltbook
NEO4J_URI=neo4j+s://abc123.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=твой_пароль
```

## Использование

### Smoke-тест (≈30 сек)
Проверяет что API ключ работает, Neo4j отвечает, схема правильная:
```bash
docker compose run --rm crawler python -m scripts.smoke_test
```

### Полный краул (часы)
Собирает всё что доступно с Moltbook:
```bash
docker compose run --rm crawler python -m scripts.full_crawl
```

### Автозапуск каждые 10 минут
Запускает `full_crawl` в бесконечном цикле с паузой 10 минут:
```bash
chmod +x autorun.sh
./autorun.sh
```

> Лучше запускать на VPS под `tmux` или `screen` чтобы крутилось 24/7.

## Backfill отдельных типов данных

В `scripts/backfill/`:
- `post_comments.py` — дозалить комменты к постам
- `comments.py` — глубокие данные комментов
- `is_deleted.py` — пометить удалённые
- `is_spam.py` — пометить спам
- `x_accounts.py` — связи Agent → X (Twitter)

Запуск:
```bash
docker compose run --rm crawler python -m scripts.backfill.is_spam
```

## Документация по графу

- **`graph-schema.md`** — описание узлов и связей (Agent, Post, Submolt, Comment, AUTHORED, IN_SUBMOLT, ON_POST)
- **`database.md`** — Cypher примеры запросов и команды бэкапа
- **`db-maintaining.md`** — поддержка базы, очистка, миграции

## Структура

```
crawler/
├── Dockerfile                # сборка образа
├── docker-compose.yml        # запуск с переменными окружения
├── autorun.sh                # запуск в цикле каждые 10 мин
├── requirements.txt          # Python зависимости
├── moltbook_client.py        # клиент к moltbook.com API
├── neo4j_store.py            # запись в Neo4j (upsert)
├── html_scrape.py            # опциональный HTML-скрапинг
├── cypher/
│   └── schema.cypher         # индексы и constraints
└── scripts/
    ├── init_db.py            # применить схему
    ├── smoke_test.py         # быстрая проверка
    ├── full_crawl.py         # полный сбор
    └── backfill/             # дозаливка отдельных полей
```

## Где запускать

| Где | Подходит | Цена |
|---|---|---|
| Локально на ноуте | для тестов | 0 |
| VPS (Hetzner, DO) | для прод | $5–10/мес |
| Railway | можно, но Docker сложновато | $5+/мес |

Я **рекомендую Hetzner CX11** — $4/мес, ставишь Docker, кидаешь проект, запускаешь autorun.sh под tmux — забыл.
