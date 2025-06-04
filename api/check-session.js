import { Client } from 'pg'

const connectionString = process.env.DATABASE_URL

export default async function handler(req, res) {
  const { username } = req.query
  if (!username) return res.status(400).json({ error: 'No username' })

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()

    const result = await client.query(
      `SELECT sessionActive FROM sessions WHERE username = $1`,
      [username]
    )

    const sessionActive = result.rows[0]?.sessionactive || false
    res.status(200).json({ sessionActive })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  } finally {
    await client.end()
  }
}
