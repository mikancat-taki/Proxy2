from flask import Flask, request, jsonify
from cachetools import TTLCache
import os


app = Flask(__name__)
cache = TTLCache(maxsize=2000, ttl=int(os.getenv('CACHE_TTL', '300')))


@app.route('/cache', methods=['GET'])
def get_cache():
url = request.args.get('url')
if not url: return ('', 400)
if url in cache:
return jsonify(cache[url])
return ('', 404)


@app.route('/cache', methods=['POST'])
def set_cache():
data = request.get_json() or {}
url = data.get('url')
content = data.get('data')
if not url: return ('', 400)
cache[url] = content
return jsonify({'ok': True})


if __name__ == '__main__':
app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5050)))
