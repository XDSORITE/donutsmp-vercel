// File: /api/getListingsPaged.js

import { Client } from "pg"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET" })
  }

  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 15
  const rawTable = req.query.table || "marketplace_listings"
  const search = req.query.search || ""
  const offset = (page - 1) * pageSize

  const allowedTables = {
    marketplace_listings: '"public"."marketplace_listings"',
    // You can add more allowed tables here if needed
  }

  const tableSql = allowedTables[rawTable]

  if (!tableSql) {
    return res.status(400).json({ error: "Invalid table name" })
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    const queryText = `
      SELECT id, "Seller" AS name, "Title" AS title, "Description" AS description, "Price" AS price
      FROM ${tableSql}
      WHERE "Title" ILIKE $1 OR "Description" ILIKE $1 OR "Seller" ILIKE $1
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
    `

    const result = await client.query(queryText, [`%${search}%`, pageSize, offset])

    return res.status(200).json({ listings: result.rows })
  } catch (err) {
    console.error("Database error in getListingsPaged:", err.message)
    return res.status(500).json({ error: "Internal server error" })
  } finally {
    await client.end()
  }
}
