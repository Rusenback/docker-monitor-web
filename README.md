# 🐳 Docker Monitor

Homelab ready real-time Docker container monitoring system with historical analytics.

![Dashboard](./screenshots/dashboard.png)

## ✨ Features

- ⚡ **Real-time monitoring** - WebSocket updates every 2 seconds
- 📊 **Historical data** - View trends over 1h, 24h, 7d, 30d
- 📜 **Container logs** - Built-in log viewer
- 🎨 **Beautiful UI** - Dracula-themed dashboard
- 💾 **TimescaleDB** - Optimized time-series storage
- 🔒 **Security** - Non-root containers, minimal images
- 🐳 **Docker native** - Monitors all containers on host

## 📋 TODO 

- [ ] Live log streaming 
- [ ] Container control buttons (start/stop/restart)
- [ ] Alert system for high resource usage 
- [ ] Search and filer containers

## 🏗️ Architecture
```mermaid
flowchart LR
    subgraph Browser["🌐 Browser"]
        UI[React Dashboard]
    end

    subgraph Frontend["Frontend Container"]
        NGINX[Nginx<br/>Alpine Linux<br/>~40MB]
    end

    subgraph Backend["Backend Container"]
        GIN[Gin Router]
        WS[WebSocket Hub]
        DOCKER_SVC[Docker Service]
        API_HANDLERS[API Handlers]
    end

    subgraph Database["TimescaleDB Container"]
        TSDB[(Time-Series DB<br/>Hypertables)]
    end

    subgraph Host["Host System"]
        DOCKER_SOCK[Docker Socket<br/>/var/run/docker.sock]
        CONTAINERS[Running Containers]
    end

    UI -->|HTTP| NGINX
    NGINX -->|Proxy| GIN
    
    GIN --> API_HANDLERS
    GIN --> WS
    
    API_HANDLERS -->|REST API| UI
    WS -->|Real-time Stream| UI
    
    DOCKER_SVC -->|Read Stats| DOCKER_SOCK
    DOCKER_SOCK -->|Metrics| CONTAINERS
    
    DOCKER_SVC -->|Store Metrics| TSDB
    API_HANDLERS -->|Query History| TSDB
    
    WS -->|Broadcast| UI
    
    style UI fill:#bd93f9
    style GIN fill:#50fa7b
    style TSDB fill:#8be9fd
    style DOCKER_SOCK fill:#ff79c6
```

## 🚀 Quick Start
```bash
git clone https://github.com/rusenback/docker-monitor-web
cd docker-monitor
docker compose up -d
```

Access at http://localhost:3000

## 📸 Screnshots

## Graphs
![Graphs](./screenshots/containerGraph.png)

![Logs](./screenshots/containerLogs.png)

## 🛠️ Tech Stack

**Backend:**
- Go 1.23
- Gin web framework
- Docker SDK
- WebSockets
- PostgreSQL driver

**Frontend:**
- React 18
- TypeScript
- Bun
- Recharts
- Tailwind CSS

**Database:**
- TimescaleDB (PostgreSQL + time-series)

**Infrastructure:**
- Docker & Docker Compose
- Multi-stage builds
- Non-root containers
- Alpine Linux base

## 🔐 Security Features

- Non-root containers
- Read-only Docker socket
- Minimal base images
- No unnecessary capabilities
- Security headers

## 📝 License

MIT- Go 1.23

