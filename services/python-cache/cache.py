# backend/proxy_cache.py
from flask import Flask, request, jsonify
from cachetools import TTLCache

app = Flask(__name__)
cache = TTLCache(maxsize=500, ttl=300)  # 5分キャッシュ

@app.route("/cache", methods=["GET"])
def get_cache():
    url = request.args.get("url")
    return jsonify(cache.get(url)) if url in cache else ("", 404)

@app.route("/cache", methods=["POST"])
def set_cache():
    data = request.get_json()
    url, content = data.get("url"), data.get("data")
    cache[url] = content
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5050)
