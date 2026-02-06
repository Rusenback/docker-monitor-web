# Build stage
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -ldflags='-w -s' -o main .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata && \
    # Luo docker group GID 956:llä
    addgroup -g 956 docker && \
    # Luo appuser ja lisää docker-ryhmään
    adduser -D -u 1000 appuser && \
    adduser appuser docker

WORKDIR /app

COPY --from=builder /app/main .

USER appuser

EXPOSE 8080

CMD ["./main"]
