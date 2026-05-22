import express from 'express'
import cors from 'cors'
import neo4j from 'neo4j-driver'

const app = express()
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))

// ── Neo4j connection — all from env vars ──────────────────
const NEO4J_URI      = process.env.NEO4J_URI      || 'bolt://localhost:7687'
const NEO4J_USER     = process.env.NEO4J_USER     || 'neo4j'
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'please-change-me'
const NEO4J_DATABASE = process.env.NEO4J_DATABASE || 'neo4j'

console.log('[startup] Connecting to Neo4j at:', NEO4J_URI)

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000,
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 20 * 1000
  }
)

const query = async (cypher, params = {}) => {
  const session = driver.session({ database: NEO4J_DATABASE })
  try {
    const result = await session.run(cypher, params)
    return result.records.map(r => r.toObject())
  } finally {
    await session.close()
  }
}

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => res.json({
  status: 'ok',
  service: 'moltgraph-api',
  version: '2.0.0',
  endpoints: [
    '/health',
    '/api/stats',
    '/api/agents/top?limit=20',
    '/api/agents/:name',
    '/api/submolts',
    '/api/submolts/:name',
    '/api/agents/interests',
    '/api/coordination'
  ]
}))

app.get('/health', async (req, res) => {
  try {
    await query('RETURN 1 AS ok')
    res.json({ status: 'healthy', neo4j: 'connected' })
  } catch (e) {
    res.status(503).json({ status: 'unhealthy', neo4j: 'disconnected', error: e.message })
  }
})

// ── Stats ─────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const data = await query(
      'MATCH (n) RETURN labels(n)[0] AS label, count(*) AS cnt ORDER BY cnt DESC'
    )
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Agents ────────────────────────────────────────────────
app.get('/api/agents/top', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 200)
    const data = await query(`
      MATCH (a:Agent)-[:AUTHORED]->(p:Post)
      RETURN a.name AS name, a.karma AS karma,
             a.follower_count AS followers, count(p) AS posts
      ORDER BY karma DESC LIMIT $limit
    `, { limit: neo4j.int(limit) })
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/agents/interests', async (req, res) => {
  try {
    const data = await query(`
      MATCH (a:Agent)-[:AUTHORED]->(p:Post)-[:IN_SUBMOLT]->(s:Submolt)
      RETURN s.name AS topic, count(p) AS interactions, count(distinct a) AS agents
      ORDER BY interactions DESC LIMIT 12
    `)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/agents/:name', async (req, res) => {
  try {
    const name = req.params.name
    const [profile] = await query(`
      MATCH (a:Agent {name: $name})
      RETURN a.name AS name, a.karma AS karma,
             a.follower_count AS followers, a.description AS bio,
             a.is_claimed AS claimed
    `, { name })
    const posts = await query(`
      MATCH (a:Agent {name: $name})-[:AUTHORED]->(p:Post)-[:IN_SUBMOLT]->(s:Submolt)
      RETURN p.title AS title, p.score AS score, p.comment_count AS comments,
             s.name AS submolt, p.created_at AS created
      ORDER BY score DESC LIMIT 10
    `, { name })
    res.json({ profile, posts })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Submolts ──────────────────────────────────────────────
app.get('/api/submolts', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 100)
    const data = await query(`
      MATCH (s:Submolt)<-[:IN_SUBMOLT]-(p:Post)
      RETURN s.name AS name, s.subscriber_count AS subs, count(p) AS posts
      ORDER BY posts DESC LIMIT $limit
    `, { limit: neo4j.int(limit) })
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/submolts/:name', async (req, res) => {
  try {
    const name = req.params.name
    const agents = await query(`
      MATCH (a:Agent)-[:AUTHORED]->(p:Post)-[:IN_SUBMOLT]->(s:Submolt {name: $name})
      RETURN a.name AS name, a.karma AS karma, count(p) AS posts
      ORDER BY posts DESC LIMIT 20
    `, { name })
    const posts = await query(`
      MATCH (p:Post)-[:IN_SUBMOLT]->(s:Submolt {name: $name})
      RETURN p.title AS title, p.score AS score, p.comment_count AS comments,
             p.created_at AS created
      ORDER BY score DESC LIMIT 10
    `, { name })
    res.json({ agents, posts })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Coordination ──────────────────────────────────────────
app.get('/api/coordination', async (req, res) => {
  try {
    const data = await query(`
      MATCH (a:Agent)-[:AUTHORED]->(p:Post) WHERE p.is_spam = true
      RETURN count(distinct a) AS coordAgents, count(p) AS spamPosts
    `)
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Graceful shutdown ─────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[shutdown] SIGTERM received, closing Neo4j driver…')
  await driver.close()
  process.exit(0)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`[ready] API running on port ${PORT}`))
