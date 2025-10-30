import express from 'express';


return res.status(401).json({ error: 'unauthorized' });
});


// Rate check
async function checkRate(req) {
try { const r = await axios.get(RATE_CHECK_URL, { timeout: 2000 }); return r.status === 200; }
catch { return true; }
}


// Try Redis -> Python TTL cache -> fetch
async function getCached(target) {
try {
const r = await redis.get(`cache:${target}`);
if (r) return r;
} catch {}
try {
const r2 = await axios.get(`http://python-cache:5050/cache`, { params: { url: target }, timeout: 1500 });
if (r2.status === 200) return r2.data;
} catch {}
return null;
}


async function saveCache(target, body) {
try { await redis.setEx(`cache:${target}`, parseInt(process.env.REDIS_TTL || '300'), body); } catch {}
try { await axios.post('http://python-cache:5050/cache', { url: target, data: body }).catch(()=>{}); } catch {}
}


app.get('/proxy', async (req, res, next) => {
const target = req.query.target;
if (!target) return res.status(400).json({ error: 'target required' });
if (!await checkRate(req)) return res.status(429).json({ error: 'rate_limited' });


const cached = await getCached(target);
if (cached) return res.type('text/html').send(cached);


const proxy = createProxyMiddleware({
target,
changeOrigin: true,
selfHandleResponse: true,
onProxyReq: (proxyReq, req) => { proxyReq.setHeader('x-forwarded-by', 'interstellar-proxy'); },
onProxyRes: (proxyRes, req, res) => {
const chunks = [];
proxyRes.on('data', c => chunks.push(c));
proxyRes.on('end', async () => {
const body = Buffer.concat(chunks).toString('utf8');
await saveCache(target, body);
res.status(proxyRes.statusCode || 200);
res.setHeader('x-proxied-by', 'node-proxy');
res.send(body);
});
}
});
proxy(req, res, next);
});


app.get('/', (req, res) => res.send('Node proxy OK'));
app.listen(PORT, () => console.log(`Node proxy listening on ${PORT}`));
