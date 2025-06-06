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
    return res.status(400).json({ success: false, error: "Missing one or more required fields" })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    const insertText = `
      INSERT INTO "public"."marketplace_listings"("Seller", "Title", "Description", "Price")
      VALUES($1, $2, $3, $4)
      RETURNING id
    `
    const insertRes = await client.query(insertText, [
      Seller,
      Title,
      Description,
      Price,
    ])

    const insertedId = insertRes.rows[0].id

    res.setHeader("Access-Control-Allow-Origin", "*")
    return res.status(200).json({ success: true, id: insertedId })
  } catch (err) {
    console.error("Database error:", err)
    res.setHeader("Access-Control-Allow-Origin", "*")
    return res.status(500).json({ success: false, error: "Internal server error" })
  } finally {
    await client.end()
  }
}
