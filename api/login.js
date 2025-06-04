import { Client } from "pg"

export default async function handler(req, res) {
  const { username, password } = req.body
  // (validate, then...)
  // Save { username, sessionActive: true } in a “sessions” table or cache
  res.status(200).json({ success: true })
}
