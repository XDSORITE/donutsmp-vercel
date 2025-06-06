// File: /api/getUsername.js

import { Client } from "pg"

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET" })
  }

  const { uuid } = req.query
  if (!uuid) {
    return res.status(400).json({ error: "Missing query parameter: uuid" })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    const queryText = `
      SELECT username
      FROM credentials
      WHERE uuid = $1
      LIMIT 1
    `
    const result = await client.query(queryText, [uuid])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "UUID not found in credentials table" })
    }

    const { username } = result.rows[0]
    return res.status(200).json({ name: username })
  } catch (err) {
    console.error("Database error:", err.message)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await client.end()
  }
}
