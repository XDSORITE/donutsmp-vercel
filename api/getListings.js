// File: /api/getListings.js

import { Client } from "pg"

export default async function handler(req, res) {
  // Always set CORS headers
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

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    const result = await client.query(
      `SELECT id, "Seller" AS name, "Title" AS title, "Description" AS description, "Price" AS price
       FROM "public"."marketplace_listings"
       ORDER BY id`
    )

    // result.rows is an array of { id, name, title, description, price }
    return res.status(200).json({ listings: result.rows })
  } catch (err) {
    console.error("Database error in getListings:", err.message)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await client.end()
  }
}
