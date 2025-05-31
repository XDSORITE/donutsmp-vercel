// /api/auctions.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.donutsmp.net/v1/market/listings?page=1", {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Fetch failed with status", response.status, "and body:", text);
      return res.status(500).json({ error: "Failed to fetch auction data: bad response." });
    }

    const data = await response.json();
    res.status(200).json({ listings: data.listings || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch auction data." });
  }
}
