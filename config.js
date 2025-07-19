const config = {
  development: {
    proxyUrl: "http://localhost:3001/api/rae-proxy/",
    englishApiUrl: "https://api.dictionaryapi.dev/api/v2/entries/en/",
  },
  production: {
    // Option 1: Vercel Serverless Function (recommended)
    proxyUrl: "https://wordle-max.vercel.app/api/rae-proxy?word=",
    // Option 2: Custom proxy server
    // proxyUrl: "https://your-proxy-server.herokuapp.com/api/rae-proxy/",
    englishApiUrl: "https://api.dictionaryapi.dev/api/v2/entries/en/",
  },
};

// Detect environment
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.includes("localhost");

export const currentConfig = isDevelopment
  ? config.development
  : config.production;

export default config;
