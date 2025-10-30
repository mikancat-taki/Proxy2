FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release
FROM debian:buster-slim
COPY --from=builder /app/target/release/rust-rewrite /usr/local/bin/rust-rewrite
EXPOSE 8081
CMD ["/usr/local/bin/rust-rewrite"]
