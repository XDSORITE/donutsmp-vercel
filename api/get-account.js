import { Client } from "pg"

export default async function handler(req, res) {
  const { username } = req.body

  if (!username) return res.status(400).json({ error: "Username required" })

  const client = new Client({
    connectionString: process.env.DATABASE_URL_UNPOOLED, // Use the unpooled URL for safer connection in serverless
    ssl: { rejectUnauthorized: false }, // Ensure SSL, optional depending on your setup
  })

  try {
    await client.connect()

    const result = await client.query(
      "SELECT * FROM credentials WHERE username = $1",
      [username]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error("DB ERROR:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  } finally {
    await client.end()
  }
}
