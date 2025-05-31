export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.donutsmp.net/v1/auction/transactions/1", {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Fetch failed with status", response.status, "and body:", text);
      return res.status(500).json({ error: `Failed to fetch auction data: ${response.status} - ${text}` });
    }

    const data = await response.json();
    // Assuming the data you want is in data.transactions or something similar
    res.status(200).json({ transactions: data.transactions || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch auction data." });
  }
}
