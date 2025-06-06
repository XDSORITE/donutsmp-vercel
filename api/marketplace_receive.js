// File: /api/marketplace.js
import { Client } from "pg"

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"])
    res.setHeader("Access-Control-Allow-Origin", "*")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { Seller, Title, Description, Price } = req.query

  if (!Seller || !Title || !Description || !Price) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    return res
      .status(400)
      .json({ success: false, error: "Missing one or more required fields" })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    // Determine next id: SELECT MAX(id) and add 1
    const maxRes = await client.query(
      'SELECT MAX(id) AS max_id FROM "public"."marketplace_listings";'
    )
    const maxId = maxRes.rows[0].max_id
    const nextId = maxId !== null ? maxId + 1 : 1

    // Insert new row with explicit id
    const insertText = `
      INSERT INTO "public"."marketplace_listings"(id, "Seller", "Title", "Description", "Price")
      VALUES($1, $2, $3, $4, $5)
    `
    await client.query(insertText, [
      nextId,
      Seller,
      Title,
      Description,
      Price,
    ])

    res.setHeader("Access-Control-Allow-Origin", "*")
    return res
      .status(200)
      .json({ success: true, id: nextId })
  } catch (err) {
    console.error("Database error:", err)
    res.setHeader("Access-Control-Allow-Origin", "*")
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" })
  } finally {
    await client.end()
  }
}
