// File: /api/login.js

import { Client } from "pg";

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read username & password from query parameters
  const { username, password } = req.query || {};
  if (!username || !password) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(400)
      .json({ valid: false, error: "Username and password are required" });
  }

  // Connect to your Neon Postgres database
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Query for password and account_id from credentials table
    const queryText = `
      SELECT password, account_id
        FROM credentials
       WHERE username = $1
       LIMIT 1
    `;
    const { rows } = await client.query(queryText, [username]);

    // Always include CORS header on JSON responses
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (rows.length === 0) {
      // No matching user
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }

    const { password: storedPassword, account_id } = rows[0];

    // Plaintext comparison for demonstration (use hashed passwords in production)
    if (password === storedPassword) {
      // Return valid: true plus the account_id
      return res.status(200).json({ valid: true, account_id });
    } else {
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(500)
      .json({ valid: false, error: "Internal server error" });
  } finally {
    await client.end();
  }
}
