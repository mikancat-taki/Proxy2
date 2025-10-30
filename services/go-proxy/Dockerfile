FROM golang:1.21-alpine AS builder
WORKDIR /src
COPY main.go .
RUN go build -o /go-proxy main.go


FROM alpine:latest
COPY --from=builder /go-proxy /go-proxy
EXPOSE 7070
CMD ["/go-proxy"]
