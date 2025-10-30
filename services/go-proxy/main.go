package main


import (
"io"
"log"
"net/http"
"net/http/httputil"
"net/url"
"os"
)


func main() {
http.HandleFunc("/forward", func(w http.ResponseWriter, r *http.Request) {
target := r.URL.Query().Get("target")
if target == "" { http.Error(w, "target required", 400); return }
u, err := url.Parse(target)
if err != nil { http.Error(w, "bad target", 400); return }
proxy := httputil.NewSingleHostReverseProxy(u)
proxy.ServeHTTP(w, r)
})


http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
io.WriteString(w, "ok")
})


port := os.Getenv("PORT")
if port == "" { port = "7070" }
log.Println("Go proxy listening on " + port)
log.Fatal(http.ListenAndServe(":"+port, nil))
}
