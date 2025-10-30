import static spark.Spark.*;
import java.util.*;


public class RateLimiter {
static Map<String, LinkedList<Long>> history = new HashMap<>();
static final int LIMIT = Integer.parseInt(System.getenv().getOrDefault("RATE_LIMIT", "60")); // req/min


public static void main(String[] args) {
port(Integer.parseInt(System.getenv().getOrDefault("PORT", "6060")));
get("/check", (req, res) -> {
String ip = req.ip();
long now = System.currentTimeMillis();
history.putIfAbsent(ip, new LinkedList<>());
LinkedList<Long> q = history.get(ip);
while (!q.isEmpty() && now - q.peekFirst() > 60000) q.pollFirst();
if (q.size() >= LIMIT) {
res.status(429);
return "{\"error\":\"rate_limit\"}";
}
q.addLast(now);
res.type("application/json");
return "{\"ok\":true}";
});
}
}
