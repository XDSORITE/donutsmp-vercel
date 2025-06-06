// /api/searchListingsPaged.js
import { pool } from "../../lib/db" // your DB pool connection

export default async function handler(req, res) {
    try {
        const { page = "1", pageSize = "15", table = "main", search = "" } = req.query

        if (!search || search.trim() === "") {
            return res.status(400).json({ error: "search param is required" })
        }

        const pageNum = parseInt(page)
        const sizeNum = parseInt(pageSize)
        const offset = (pageNum - 1) * sizeNum

        // Count total matching
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM ${table} WHERE LOWER(title) LIKE LOWER($1)`,
            [`%${search}%`]
        )
        const total = parseInt(countResult.rows[0].count)

        // Get paged matching listings
        const result = await pool.query(
            `SELECT id, title, description, price, name FROM ${table} WHERE LOWER(title) LIKE LOWER($1) ORDER BY id DESC LIMIT $2 OFFSET $3`,
            [`%${search}%`, sizeNum, offset]
        )

        return res.status(200).json({ listings: result.rows, total })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Internal server error" })
    }
}
