// /api/getListingsPaged.js
import db from "../../lib/db"

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*") // CORS allow all (you can restrict if needed)
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        res.status(200).end()
        return
    }

    try {
        const {
            page = 1,
            pageSize = 15,
            search = "",
        } = req.query

        const pageInt = parseInt(page)
        const pageSizeInt = parseInt(pageSize)
        const offset = (pageInt - 1) * pageSizeInt
        const searchTerm = `%${search}%`

        const query = `
            SELECT id, name, title, description, price
            FROM marketplace_listings
            WHERE title LIKE ? OR description LIKE ? OR name LIKE ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
        `

        const results = await db.query(query, [
            searchTerm,
            searchTerm,
            searchTerm,
            pageSizeInt,
            offset,
        ])

        res.status(200).json({ listings: results })
    } catch (err) {
        console.error("Error in getListingsPaged:", err)
        res.status(500).json({ error: err.message })
    }
}
