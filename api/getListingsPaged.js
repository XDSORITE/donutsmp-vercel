// pages/api/getListingsPaged.js
import db from "../../lib/db" // your DB connection code

export default async function handler(req, res) {
    const page = parseInt(req.query.page || "1", 10)
    const pageSize = parseInt(req.query.pageSize || "15", 10)
    const table = req.query.table || "main"
    const search = req.query.search || ""

    const offset = (page - 1) * pageSize

    try {
        const [listingsRows] = await db.query(
            `
            SELECT id, name, title, description, price
            FROM ?? 
            WHERE title LIKE ? OR description LIKE ? OR name LIKE ?
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            `,
            [
                table,
                `%${search}%`,
                `%${search}%`,
                `%${search}%`,
                pageSize,
                offset,
            ]
        )

        const [countRows] = await db.query(
            `
            SELECT COUNT(*) as total
            FROM ?? 
            WHERE title LIKE ? OR description LIKE ? OR name LIKE ?
            `,
            [table, `%${search}%`, `%${search}%`, `%${search}%`]
        )

        const total = countRows[0]?.total || 0

        res.status(200).json({ listings: listingsRows, total })
    } catch (err) {
        console.error("Error in getListingsPaged:", err)
        res.status(500).json({ error: "Internal server error" })
    }
}
