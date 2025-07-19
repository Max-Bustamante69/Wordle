const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(
  cors({
    origin: [
      "https://wordle-max.vercel.app",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Proxy endpoint for RAE API
app.get("/api/rae-proxy/:word", async (req, res) => {
  try {
    const word = req.params.word;
    console.log(`Proxying request for word: ${word}`);

    const response = await fetch(`https://rae-api.com/api/words/${word}`);

    if (response.ok) {
      const data = await response.json();
      res.json(data);
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
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(
    `RAE API proxy available at: http://localhost:${PORT}/api/rae-proxy/:word`
  );
});
