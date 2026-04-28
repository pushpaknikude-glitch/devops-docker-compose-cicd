# 🚀 Production Docker Compose Deployment — Node.js + MongoDB + NGINX

![CI/CD](https://img.shields.io/badge/CI%2FCD-GitLab-orange?logo=gitlab)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Security](https://img.shields.io/badge/Security-Trivy-red?logo=aqua)
![Node](https://img.shields.io/badge/Node.js-20--alpine-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)
![NGINX](https://img.shields.io/badge/NGINX-1.25--alpine-green?logo=nginx)

A production-grade containerized application stack deployed via a GitLab CI/CD pipeline with automated security scanning (Trivy), multi-environment support (staging + production), and zero-downtime rolling deployments.

---

## Architecture

```
                        ┌─────────────────────────────────────────┐
                        │            GitLab CI/CD Pipeline         │
                        │                                          │
                        │  [build] → [trivy scan] → [deploy]      │
                        └──────────────────┬──────────────────────┘
                                           │ SSH deploy
                                           ▼
Internet ──► NGINX :80 ──► Node.js :3000 ──► MongoDB :27017
              (reverse proxy)   (REST API)     (internal network only)

Networks:
  frontend: nginx ↔ app        (bridge, internet-facing)
  backend:  app  ↔ mongo       (bridge, internal — no external access)
```

---

## Stack

| Component | Image             | Role                                           |
|-----------|-------------------|------------------------------------------------|
| NGINX     | nginx:1.25-alpine | Reverse proxy, rate limiting, security headers |
| Node.js   | node:20-alpine    | REST API (multi-stage build, non-root user)    |
| MongoDB   | mongo:7.0         | Persistent data store (internal network only)  |

---

## Pipeline Stages

### 1. Build
- Multi-stage Docker build (builder → production)
- Layer caching with `--cache-from` to speed up builds
- Pushes `image:$CI_COMMIT_SHORT_SHA` + `image:latest` to Docker Hub

### 2. Security Scan (Trivy)
- Scans the built image for **HIGH** and **CRITICAL** CVEs
- Pipeline **fails hard** if vulnerabilities are found (`--exit-code 1`)
- Full JSON report uploaded as GitLab artifact → visible in Security Dashboard
- Nothing reaches production unless it passes this gate

### 3. Deploy
- **`main` branch** → production environment
- **`develop` branch** → staging environment
- SSH-based zero-downtime rolling restart via `docker compose up -d`
- Health checks verified post-deploy before pipeline marks success
- Old images pruned automatically to prevent disk bloat

---

## Security Highlights

- **Non-root container** — Node.js app runs as `appuser`, not root
- **Internal MongoDB network** — DB port never exposed to host or internet
- **Least-privilege DB user** — app connects as `appuser` (readWrite only), not root
- **NGINX security headers** — X-Frame-Options, X-Content-Type-Options, XSS protection
- **Rate limiting** — 30 req/min per IP via NGINX `limit_req`
- **Trivy gate** — no HIGH/CRITICAL CVEs reach production
- **Secrets via CI variables** — no credentials in code or `.env` committed to git

---

## Quick Start (Local)

**Prerequisites:** Docker, Docker Compose v2

```bash
# 1. Clone the repo
git clone https://github.com/pushpaknikude-glitch/devops-docker-compose-cicd.git
cd devops-docker-compose-cicd

# 2. Set up environment
cp .env.example .env
# Edit .env with your values

# 3. Start the stack
docker compose up -d

# 4. Verify all services are healthy
docker compose ps

# 5. Test the API
curl http://localhost/health
curl http://localhost/items
```

---

## API Endpoints

| Method | Endpoint     | Description                       |
|--------|-------------|-----------------------------------|
| GET    | `/`         | Welcome message                   |
| GET    | `/health`   | Health check (DB status included) |
| GET    | `/items`    | List all items                    |
| POST   | `/items`    | Create a new item                 |
| DELETE | `/items/:id`| Delete an item by ID              |

**Example:**
```bash
curl -X POST http://localhost/items \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "description": "Created via API"}'
```

---

## GitLab CI/CD Variables (Required)

Set these under **Settings → CI/CD → Variables** in your GitLab project:

| Variable                 | Description                       | Protected |
|--------------------------|-----------------------------------|-----------|
| `DOCKER_HUB_USERNAME`    | Your Docker Hub username          | No        |
| `DOCKER_HUB_TOKEN`       | Docker Hub access token           | ✅ Yes    |
| `DEPLOY_SERVER_IP`       | Production server IP              | ✅ Yes    |
| `DEPLOY_USER`            | SSH user on deploy server         | No        |
| `DEPLOY_SSH_PRIVATE_KEY` | SSH private key for server access | ✅ Yes    |
| `MONGO_ROOT_USER`        | MongoDB root username             | ✅ Yes    |
| `MONGO_ROOT_PASSWORD`    | MongoDB root password             | ✅ Yes    |
| `MONGO_APP_PASSWORD`     | MongoDB app user password         | ✅ Yes    |

---

## Resource Limits

Defined in `docker-compose.yml` to prevent resource starvation:

| Service | CPU Limit | Memory Limit |
|---------|-----------|--------------|
| Node.js | 0.5 core  | 256 MB       |
| MongoDB | 0.5 core  | 512 MB       |

---

## Project Structure

```
.
├── .gitlab-ci.yml          # CI/CD pipeline (build → scan → deploy)
├── docker-compose.yml      # Production stack definition
├── .env.example            # Environment variable template
├── app/
│   ├── Dockerfile          # Multi-stage build (builder + production)
│   ├── index.js            # Express REST API
│   ├── index.test.js       # Jest unit tests
│   └── package.json
├── nginx/
│   └── nginx.conf          # Reverse proxy + security headers + rate limiting
└── mongo-init/
    └── init.js             # DB init: create app user + seed data
```

---

## Author

**Pushpak Nikude** — DevOps Engineer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-pushpak--nikude-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/pushpak-nikude-68b0291b1/)
