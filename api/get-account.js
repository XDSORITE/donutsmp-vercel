import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { account_id } = req.body

  if (!account_id) {
    return res.status(400).json({ error: 'Missing account_id' })
  }

  try {
    const client = await pool.connect()

    const result = await client.query(
      'SELECT account_id, username, password FROM credentials WHERE account_id = $1',
      [account_id]
    )

    client.release()

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('Database error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}
