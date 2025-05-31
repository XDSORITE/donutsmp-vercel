// /api/auctions.js

export default async function handler(req, res) {
  const url = "https://api.donutsmp.net/v1/auction/transactions/1"; // fixed page 1, you can add query params later

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Bad response from upstream API:", response.status, text);
      return res.status(500).json({ error: "Failed to fetch auction data: bad response." });
    }

    const data = await response.json();

    // Make sure transactions exist and is an array
    const transactions = Array.isArray(data.transactions) ? data.transactions : [];

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch auction data." });
  }
}
