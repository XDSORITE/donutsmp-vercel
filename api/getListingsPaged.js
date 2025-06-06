import db from "../../lib/db"

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        const page = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.pageSize) || 15
        const table = req.query.table || "marketplace_listings"
        const search = req.query.search || ""

        const offset = (page - 1) * pageSize

        let query = `
            SELECT id, name, title, description, price
            FROM ${table}
            WHERE title ILIKE $1 OR description ILIKE $1 OR name ILIKE $1
            ORDER BY id DESC
            LIMIT $2 OFFSET $3
        `

        const listings = await db.query(query, [`%${search}%`, pageSize, offset])

        res.status(200).json({ listings })
    } catch (error) {
        console.error("Error in getListingsPaged:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}
