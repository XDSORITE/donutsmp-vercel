import { Client } from "pg";

export default async function handler(req, res) {
  // 1) Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // 2) Pull username & password from the webhook’s JSON body
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ ok: false, error: "username and password are required" });
  }

  // 3) Connect to Neon (using the same DATABASE_URL you already set in Vercel env)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // 4) Query your existing credentials table for a matching row
    const result = await client.query(
      "SELECT 1 FROM credentials WHERE username = $1 AND password = $2",
      [username, password]
    );

    await client.end();

    if (result.rows.length === 1) {
      // 5a) If exactly one row matches → return 200 OK
      return res.status(200).json({ ok: true });
    } else {
      // 5b) No match → 401 Unauthorized
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("DB error in /api/check-credentials:", err);
    await client.end();
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
