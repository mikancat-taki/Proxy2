// frontend/config/config.js
export const BACKEND_URL = "http://localhost:8080/proxy";
export const API_KEY = "YOUR_SECRET_KEY"; // proxy.jsと一致

export const proxyFetch = async (targetUrl) => {
  const res = await fetch(`${BACKEND_URL}?target=${encodeURIComponent(targetUrl)}`, {
    headers: { "x-api-key": API_KEY },
  });
  return res.text();
};
