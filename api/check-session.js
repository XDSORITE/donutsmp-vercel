import { Client } from "pg"

export default async function handler(req, res) {
  const { username } = req.query
  // Query sessions table for that username
  const sessionActive = /* true/false from DB */
  res.status(200).json({ sessionActive })
}
