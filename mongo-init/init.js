// MongoDB initialization script
// Runs once on first container start

db = db.getSiblingDB('appdb');

// Create app-specific user with least-privilege access
db.createUser({
  user: 'appuser',
  pwd: process.env.MONGO_APP_PASSWORD || 'changeme_in_production',
  roles: [{ role: 'readWrite', db: 'appdb' }]
});

// Seed initial data
db.items.insertMany([
  {
    name: 'DevOps Pipeline',
    description: 'CI/CD pipeline with GitLab, Docker, and Trivy security scanning',
    createdAt: new Date()
  },
  {
    name: 'Kubernetes Cluster',
    description: 'Production K8s cluster with RBAC, HPA, and Helm deployments',
    createdAt: new Date()
  },
  {
    name: 'Monitoring Stack',
    description: 'Prometheus + Grafana for metrics and alerting',
    createdAt: new Date()
  }
]);

print('MongoDB initialized: appdb created with appuser and seed data');
