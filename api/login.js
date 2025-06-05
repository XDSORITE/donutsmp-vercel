// File: /api/login.js
import { Client } from "pg";

export default async function handler(req, res) {
  // 1) Only allow GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2) Read username and password from query parameters
  const { username, password } = req.query || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ valid: false, error: "Username and password are required" });
  }

  // 3) Connect to Postgres
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Replace "users" and column names if your table is different
    const queryText = `SELECT password FROM users WHERE username = $1 LIMIT 1`;
    const { rows } = await client.query(queryText, [username]);

    if (rows.length === 0) {
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }

    const storedPassword = rows[0].password;
    // NOTE: this example uses plaintext. In production, compare a hashed password.
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
