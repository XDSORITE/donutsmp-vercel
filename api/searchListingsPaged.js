// File: /api/searchListingsPaged.js

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

  // Read page parameter (default = 1)
  const page = parseInt(req.query.page) || 1
  const pageSize = 15
  const offset = (page - 1) * pageSize

  // Read search parameter
  const search = req.query.search || ""

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    // 1️⃣ Get matching rows (paged)
    const result = await client.query(
      `SELECT id, "Seller" AS name, "Title" AS title, "Description" AS description, "Price" AS price
       FROM "public"."marketplace_listings"
       WHERE "Title" ILIKE $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, pageSize, offset]
    )

    // 2️⃣ Get total matching count (for pagination)
    const countResult = await client.query(
      `SELECT COUNT(*) AS count
       FROM "public"."marketplace_listings"
       WHERE "Title" ILIKE $1`,
      [`%${search}%`]
    )

    const totalCount = parseInt(countResult.rows[0]?.count || "0")

    // Response
    return res.status(200).json({
      listings: result.rows,
      total: totalCount,
    })
  } catch (err) {
    console.error("Database error in searchListingsPaged:", err.message)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await client.end()
  }
}
