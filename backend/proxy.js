// simple reverse proxy for Interstellar frontend to use as backend
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * target: 実際にアクセスしたい外部ホスト（デフォルトは外部へそのまま転送するワイルドカード的挙動）
 * 注意: セキュリティのため、公開時はターゲットホストのホワイトリスト化や認証を必ず実装してください。
 */
const PROXY_OPTIONS = {
  changeOrigin: true,
  // preserveHostHdr: true, // 必要に応じて
  onProxyReq(proxyReq, req, res) {
    // 必要ならヘッダ加工
    proxyReq.setHeader('x-forwarded-by', 'interstellar-proxy');
  },
  onError(err, req, res) {
    res.status(502).json({ error: 'proxy_error', details: err.message });
  },
  logLevel: 'warn'
};

// ログ
app.use(morgan('combined'));

// シンプルな API 用ルート（例: /api/* をそのまま外部へ転送）
app.use('/api/*', (req, res, next) => {
  // ここで認証・レート制限など挟めます
  next();
}, createProxyMiddleware({
  ...PROXY_OPTIONS,
  // 外部ホストへ転送する。パラメータにより動的に変えてもよい。
  target: 'https://example.com',
  pathRewrite: (path, req) => {
    // /api/foo -> /foo に書き換える例
    return path.replace(/^\/api/, '');
  }
}));

// 汎用プロキシルート: クエリで target を指定する（公開時は危険なのでホワイトリスト化推奨）
app.use('/proxy', createProxyMiddleware({
  ...PROXY_OPTIONS,
  router: (req) => {
    const target = req.query.target;
    // サンプル保護: query に無ければエラー
    if (!target) return 'https://example.com';
    return target;
  },
  onProxyReq(proxyReq, req, res) {
    proxyReq.setHeader('x-forwarded-by', 'interstellar-proxy');
  }
}));

// ルート確認
app.get('/', (req, res) => {
  res.send('Interstellar-compatible proxy running');
});

app.listen(PORT, () => {
  console.log(`Proxy listening on ${PORT}`);
});
