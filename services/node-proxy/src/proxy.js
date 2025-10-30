import express from 'express';
// フェイルオーバー: レートサービスが死んでたらゆるく通す
return true;
}
}


// キャッシュ問い合わせ
async function getFromCache(target) {
try {
const r = await axios.get(`http://python-cache:5050/cache`, { params: { url: target }, timeout: 2000 });
if (r.status === 200) return r.data;
return null;
} catch (e) { return null; }
}


async function saveToCache(target, body) {
try {
await axios.post('http://python-cache:5050/cache', { url: target, data: body });
} catch (e) { /* noop */ }
}


app.get('/proxy', async (req, res, next) => {
const target = req.query.target;
if (!target) return res.status(400).json({ error: 'target required' });


// rate check
const ok = await checkRate(req);
if (!ok) return res.status(429).json({ error: 'rate_limited' });


// cache
const c = await getFromCache(target);
if (c) return res.type('text/plain').send(c);


// proxying
const proxy = createProxyMiddleware({
target,
changeOrigin: true,
selfHandleResponse: true,
onProxyReq: (proxyReq, req) => {
// ヘッダ追加
proxyReq.setHeader('x-forwarded-by', 'interstellar-proxy');
// ここで Rust rewrite サービスにルーティングしたい場合はヘッダを書き換えてください
},
onProxyRes: (proxyRes, req, res) => {
const chunks = [];
proxyRes.on('data', (chunk) => chunks.push(chunk));
proxyRes.on('end', async () => {
const body = Buffer.concat(chunks).toString('utf8');
await saveToCache(target, body);
res.status(proxyRes.statusCode || 200);
// 必要ならヘッダをここで加工
res.setHeader('x-proxied-by', 'node-proxy');
res.send(body);
});
}
});


proxy(req, res, next);
});


app.get('/', (req, res) => res.send('Node proxy OK'));


app.listen(PORT, () => console.log(`Node proxy listening on ${PORT}`));
