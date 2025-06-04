export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  try {
    const response = await fetch("https://api.donutsmp.net/v1/auction/transactions/1", {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    })

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch auction data" })
    }

    const data = await response.json()
    res.status(200).json(data) // You get { transactions: [...] }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
}