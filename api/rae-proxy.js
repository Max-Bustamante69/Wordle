// Vercel Serverless Function for RAE API proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  try {
    console.log(`Proxying request for word: ${word}`);

    const response = await fetch(
      `https://rae-api.com/api/words/${word.toLowerCase()}`
    );

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(response.status).json({
        error: "Word not found in RAE API",
        status: response.status,
      });
    }
  } catch (error) {
    console.error("Error proxying request to RAE API:", error);
    res.status(500).json({
      error: "Error al obtener la palabra.",
      details: error.message,
    });
  }
}
