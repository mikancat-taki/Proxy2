#!/bin/bash
echo "🚀 Starting all proxy components..."

# Python Cache
python3 backend/proxy_cache.py &

# Java RateLimiter
javac backend/rate_limiter.java && java -cp backend RateLimiter &

# Node Proxy
node backend/proxy.js
