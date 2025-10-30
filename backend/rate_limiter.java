// backend/rate_limiter.java
import static spark.Spark.*;
import java.util.*;
import java.time.*;

public class RateLimiter {
    static Map<String, List<Long>> history = new HashMap<>();
    static final int LIMIT = 20; // 20 req / min

    public static void main(String[] args) {
        port(6060);
        get("/check", (req, res) -> {
            String ip = req.ip();
            long now = System.currentTimeMillis();
            history.putIfAbsent(ip, new ArrayList<>());
            List<Long> times = history.get(ip);
            times.removeIf(t -> now - t > 60000);
            if (times.size() >= LIMIT) {
                res.status(429);
                return "{\"error\":\"Rate limit exceeded\"}";
            }
            times.add(now);
            return "{\"ok\":true}";
        });
    }
}
