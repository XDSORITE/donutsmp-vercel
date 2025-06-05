// File: /api/login.js
import { Client } from "pg";

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read username + password from query parameters
  const { username, password } = req.query || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ valid: false, error: "Username and password are required" });
  }

  // Connect to Neon Postgres using your DATABASE_URL env var
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // ◀️ CHANGE HERE: query from "credentials" instead of "users"
    //
    // Replace "credentials" and column names if your schema differs.
    // This example assumes:
    //   • table name = credentials
    //   • columns:   username (varchar), password (varchar)
    //
    const queryText = `SELECT password 
                       FROM credentials 
                       WHERE username = $1 
                       LIMIT 1`;
    const { rows } = await client.query(queryText, [username]);

    if (rows.length === 0) {
      // No matching row in credentials
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }

    const storedPassword = rows[0].password;

    // Plaintext comparison (for demonstration!). In production, hash & compare.
    if (password === storedPassword) {
      return res.status(200).json({ valid: true });
    } else {
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res
      .status(500)
      .json({ valid: false, error: "Internal server error" });
  } finally {
    await client.end();
  }
}
