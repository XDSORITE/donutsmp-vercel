// File: /api/login.js
import { Client } from "pg";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ valid: false, error: "Username and password are required" });
  }

  // Connect to your Postgres database via the DATABASE_URL env var
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // Replace “users” and column names with your actual table/column names.
    // This example assumes a table “users” with columns “username” (varchar) and “password” (varchar).
    const queryText = `SELECT password FROM users WHERE username = $1 LIMIT 1`;
    const { rows } = await client.query(queryText, [username]);

    if (rows.length === 0) {
      // No user found
      return res.status(200).json({ valid: false, error: "Incorrect username or password" });
    }

    const userRecord = rows[0];
    const storedPassword = userRecord.password;

    // For demonstration: plaintext comparison.
    // In production, you should store hashed passwords and compare with bcrypt or similar.
    if (password === storedPassword) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false, error: "Incorrect username or password" });
    }
  } catch (err) {
    console.error("Database error:", err);
    return res.status(500).json({ valid: false, error: "Internal server error" });
  } finally {
    await client.end();
  }
}
