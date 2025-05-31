// /api/auctions.js

export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.donutsmp.net/v1/auction/transactions/1", {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Fetch failed:", text);
      return res.status(500).send("Error: bad response from API.");
    }

    const data = await response.json();

    // Turn transaction data into a readable string
    const transactions = data.transactions || [];
    const output = transactions.length
      ? transactions
          .map((tx, i) => `#${i + 1} | Item: ${tx.item?.name || "Unknown"} | Price: ${tx.price} | User: ${tx.buyer}`)
          .join("\n")
      : "No recent transactions.";

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error: Could not fetch auctions.");
  }
}
