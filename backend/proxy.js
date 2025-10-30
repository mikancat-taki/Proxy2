// proxy.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.all("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url parameter");

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: { ...req.headers, host: undefined },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const data = await response.text();
    res.send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
