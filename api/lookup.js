export default async function handler(req, res) {
  // Allow cross-origin requests from anywhere (for testing)
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const response = await fetch(`https://api.donutsmp.net/v1/lookup/${username}`, {
      headers: {
        Authorization: "Bearer 8dc567be981c48e7a0bae5ea82cf57a5",
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
