import { Client } from "pg"

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })

    try {
        await client.connect()

        const result = await client.query(
            "SELECT * FROM credentials WHERE username = $1 AND password = $2",
            [username, password]
        )

        await client.end()

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        return res.status(200).json(result.rows[0])
    } catch (error) {
        console.error("DB error:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}
