// backend/proxy.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 8080;

// 認証ミドルウェア
app.use(async (req, res, next) => {
  const token = req.headers["x-api-key"];
  if (token !== process.env.PROXY_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// ログ
app.use(morgan("dev"));

// キャッシュサーバーに問い合わせ（Python連携）
async function checkCache(url) {
  try {
    const resp = await axios.get(`http://localhost:5050/cache?url=${encodeURIComponent(url)}`);
    return resp.data || null;
  } catch {
    return null;
  }
}

async function saveCache(url, data) {
  try {
    await axios.post("http://localhost:5050/cache", { url, data });
  } catch {}
}

// プロキシ本体
app.use("/proxy", async (req, res, next) => {
  const target = req.query.target;
  if (!target) return res.status(400).json({ error: "No target" });

  const cached = await checkCache(target);
  if (cached) return res.send(cached);

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: async (proxyRes, req, res) => {
      let body = "";
      proxyRes.on("data", chunk => body += chunk.toString());
      proxyRes.on("end", async () => {
        await saveCache(target, body);
        res.status(proxyRes.statusCode).send(body);
      });
    },
    onError: (err, req, res) => res.status(502).json({ error: "Proxy Error", detail: err.message })
  });

  proxy(req, res, next);
});

app.listen(PORT, () => console.log(`🚀 Node Proxy running on ${PORT}`));
