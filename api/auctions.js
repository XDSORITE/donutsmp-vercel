// Vercel Serverless API Route - /api/auctions
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.donutsmp.net/v1/market/listings?page=1");
    const data = await response.json();
    res.status(200).json({ listings: data.listings || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auction data." });
  }
}
