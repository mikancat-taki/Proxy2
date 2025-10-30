use warp::Filter;


#[tokio::main]
async fn main() {
let rewrite = warp::path("rewrite").and(warp::query::raw()).map(|q: String| {
// 受け取ったqueryをベースにヘッダ書き換えのルールを返す（簡易）
warp::reply::json(&serde_json::json!({"inject_header":"x-rewrite","value":q}))
});


warp::serve(rewrite).run(([0,0,0,0], 8081)).await;
}
