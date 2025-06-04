import { Client } from 'pg'

const connectionString = process.env.DATABASE_URL

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()

    const query = `SELECT * FROM credentials WHERE username = $1 AND password = $2`
    const result = await client.query(query, [username, password])

    if (result.rows.length === 1) {
      // ✅ Login success, store session flag
      await client.query(
        `INSERT INTO sessions (username, sessionActive) VALUES ($1, true)
         ON CONFLICT (username) DO UPDATE SET sessionActive = true`,
        [username]
      )
      res.status(200).json({ success: true })
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  } finally {
    await client.end()
  }
}
