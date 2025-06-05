// File: /api/login.js
import { Client } from "pg";

export default async function handler(req, res) {
  // 1) Handle CORS preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    // Allow any origin (you can lock this down to your Framer preview domain if you wish)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  // 2) Allow only GET from here onward
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 3) Read username & password from query params
  const { username, password } = req.query || {};
  if (!username || !password) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res
      .status(400)
      .json({ valid: false, error: "Username and password are required" });
  }

  // 4) Connect to your Neon Postgres
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Query the "credentials" table (your actual table name)
    const queryText = `
      SELECT password
        FROM credentials
       WHERE username = $1
       LIMIT 1
    `;
    const { rows } = await client.query(queryText, [username]);

    // Always send back CORS header on JSON responses
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (rows.length === 0) {
      // No matching row
      return res
        .status(200)
        .json({ valid: false, error: "Incorrect username or password" });
    }

    const storedPassword = rows[0].password;
    // (Plaintext check for demo—swap in bcrypt.compare in production)
    if (password === storedPassword) {
      return res.status(200).json({ valid: true });
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
