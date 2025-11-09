# Production Deployment Guide

This guide covers deploying your SupaNext application to production using the most cost-effective methods.

## Table of Contents

1. [Deployment Options Comparison](#deployment-options-comparison)
2. [Recommended: Self-Hosted VPS](#recommended-self-hosted-vps)
3. [Alternative: Managed Cloud Services](#alternative-managed-cloud-services)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Step-by-Step Deployment](#step-by-step-deployment)
6. [Production Configuration](#production-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Cost Optimization Tips](#cost-optimization-tips)

## Deployment Options Comparison

### Option 1: Self-Hosted VPS (Most Cost-Effective)

- **Cost**: $5-20/month (DigitalOcean, Linode, Vultr, Hetzner)
- **Pros**: Full control, predictable costs, no vendor lock-in
- **Cons**: Requires server management, manual scaling
- **Best for**: Small to medium applications, predictable traffic

### Option 2: Cloud Provider (AWS/GCP/Azure)

- **Cost**: $30-100+/month (varies by usage)
- **Pros**: Auto-scaling, managed services, global CDN
- **Cons**: Complex pricing, potential cost overruns
- **Best for**: Large applications, unpredictable traffic

### Option 3: Platform-as-a-Service (Vercel + Supabase Cloud)

- **Cost**: $20-50/month (Vercel Pro + Supabase Pro)
- **Pros**: Zero-config deployment, automatic scaling
- **Cons**: Higher cost, less control
- **Best for**: Quick deployment, minimal DevOps

## Recommended: Self-Hosted VPS

### Why VPS is Most Cost-Effective

For a typical application:

- **VPS (2GB RAM, 1 vCPU)**: $6-12/month
- **Domain**: $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$7-13/month

Compare to:

- **Vercel Pro + Supabase Pro**: $20 + $25 = $45/month
- **AWS (minimal)**: $30-50/month
- **GCP (minimal)**: $25-40/month

### Recommended VPS Providers

1. **Hetzner** (Europe) - Best value: €4-8/month
2. **DigitalOcean** - $6-12/month, great docs
3. **Linode** - $5-10/month, reliable
4. **Vultr** - $6-12/month, global locations

## Pre-Deployment Checklist

### Security

- [ ] Change all default passwords in `.env`
- [ ] Update `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD`
- [ ] Generate new JWT secrets
- [ ] Update `SUPABASE_PUBLIC_URL` to production domain
- [ ] Enable firewall (UFW) on server
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure domain DNS records

### Performance

- [ ] Enable Next.js production build
- [ ] Configure database connection pooling
- [ ] Set up CDN for static assets (optional)
- [ ] Enable compression (nginx/gzip)
- [ ] Configure caching headers

### Monitoring

- [ ] Set up health checks
- [ ] Configure log rotation
- [ ] Set up uptime monitoring (UptimeRobot - free)
- [ ] Configure backup strategy

## Step-by-Step Deployment

### 1. Server Setup

#### Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y

# Install Git
sudo apt install git -y

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Clone and Configure Application

```bash
# Clone your repository
git clone <your-repo-url> /opt/supanext
cd /opt/supanext

# Copy and edit environment file
cp .env.example .env
nano .env
```

#### Update `.env` for Production

```env
# Generate new secrets (run these commands)
# openssl rand -base64 32  # For JWT_SECRET
# openssl rand -base64 32  # For POSTGRES_PASSWORD

# Production URLs
SUPABASE_PUBLIC_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://api.yourdomain.com

# Change default credentials
DASHBOARD_USERNAME=your_secure_username
DASHBOARD_PASSWORD=your_secure_password_here

# Update all keys and secrets
JWT_SECRET=<generate-new-secret>
POSTGRES_PASSWORD=<generate-new-secret>
# ... update all other secrets
```

### 3. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/supanext`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main application
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Next.js Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Supabase API Gateway
    location /rest/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Studio (optional - consider restricting access)
    location /studio/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Restrict access (uncomment and configure)
        # allow YOUR_IP_ADDRESS;
        # deny all;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/supanext /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Set Up SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal: sudo certbot renew --dry-run
```

### 5. Configure Firewall

```bash
# Install UFW
sudo apt install ufw -y

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 6. Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_PUBLIC_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
    restart: unless-stopped
    # Remove volume mounts for production
    # volumes:
    #   - .:/app
    #   - /app/node_modules
    #   - /app/.next

  # Add resource limits to prevent resource exhaustion
  db:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M

  # ... other services with similar resource limits
```

### 7. Create Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Update `next.config.js` for standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### 8. Deploy Application

```bash
# Build and start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check logs
docker compose logs -f nextjs

# Check all services are running
docker compose ps
```

### 9. Set Up Automatic Backups

Create `/opt/supanext/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T db pg_dump -U supabase_admin postgres > $BACKUP_DIR/db_$DATE.sql

# Backup volumes
docker run --rm -v supanext_db-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes_$DATE.tar.gz /data

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make executable and add to crontab:

```bash
chmod +x /opt/supanext/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/supanext/backup.sh
```

## Production Configuration

### Environment Variables

Ensure all production secrets are set:

```bash
# Generate secure secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for POSTGRES_PASSWORD
openssl rand -base64 32  # Use for other secrets
```

### Database Optimization

In `docker-compose.yml`, add PostgreSQL tuning:

```yaml
db:
  command:
    - postgres
    - -c
    - config_file=/etc/postgresql/postgresql.conf
    - -c
    - log_min_messages=warning
    - -c
    - shared_buffers=256MB
    - -c
    - effective_cache_size=1GB
    - -c
    - maintenance_work_mem=64MB
    - -c
    - checkpoint_completion_target=0.9
    - -c
    - wal_buffers=16MB
    - -c
    - default_statistics_target=100
    - -c
    - random_page_cost=1.1
    - -c
    - effective_io_concurrency=200
    - -c
    - work_mem=4MB
    - -c
    - min_wal_size=1GB
    - -c
    - max_wal_size=4GB
```

## Security Hardening

### 1. Restrict Supabase Studio Access

Add IP whitelist to Nginx:

```nginx
location /studio/ {
    allow YOUR_IP_ADDRESS;
    deny all;
    # ... rest of config
}
```

### 2. Enable Database SSL

Update connection strings to use SSL:

```env
POSTGRES_BACKEND_URL=postgresql://user:pass@host:port/db?sslmode=require
```

### 3. Set Up Fail2Ban

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Security Updates

```bash
# Add to crontab
0 3 * * 0 apt update && apt upgrade -y && docker compose pull && docker compose up -d
```

## Monitoring & Maintenance

### 1. Health Check Endpoint

Your app already has health checks. Monitor with:

- **UptimeRobot** (free): https://uptimerobot.com
- **Pingdom** (free tier available)
- **StatusCake** (free tier available)

### 2. Log Management

```bash
# View logs
docker compose logs -f

# Rotate logs (add to crontab)
0 0 * * * docker compose logs --since 24h > /var/log/supanext/$(date +\%Y\%m\%d).log
```

### 3. Resource Monitoring

Install monitoring tools:

```bash
# Install htop
sudo apt install htop -y

# Monitor Docker resources
docker stats
```

## Cost Optimization Tips

### 1. Right-Size Your VPS

- **Start small**: 2GB RAM, 1 vCPU ($6/month)
- **Scale up** only when needed
- **Monitor usage**: `htop`, `docker stats`

### 2. Use Object Storage for Files

Instead of Supabase Storage, use:

- **Backblaze B2**: $5/TB storage, $10/TB egress
- **Cloudflare R2**: $0.015/GB storage, no egress fees
- **DigitalOcean Spaces**: $5/month for 250GB

### 3. Optimize Docker Images

- Use multi-stage builds (already in Dockerfile.prod)
- Remove unused dependencies
- Use Alpine Linux base images

### 4. Enable Caching

- Use Cloudflare (free tier) for CDN
- Configure browser caching headers
- Use Redis for application caching (optional)

### 5. Database Optimization

- Regular `VACUUM` operations
- Index optimization
- Connection pooling (already configured)

### 6. Scheduled Scaling

For predictable traffic patterns:

- Scale down during off-hours
- Use cron jobs to stop/start services

## Estimated Monthly Costs

### Minimal Setup (Low Traffic)

- VPS (2GB RAM): $6-12
- Domain: $1 (annual/12)
- SSL: Free
- **Total: ~$7-13/month**

### Medium Setup (Moderate Traffic)

- VPS (4GB RAM): $12-24
- Domain: $1
- Object Storage: $5
- Monitoring: Free
- **Total: ~$18-30/month**

### High Traffic Setup

- VPS (8GB RAM): $24-48
- Domain: $1
- Object Storage: $10-20
- CDN (Cloudflare Pro): $20
- **Total: ~$55-89/month**

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker compose logs nextjs

# Check resources
docker stats

# Restart services
docker compose restart
```

### Database Issues

```bash
# Check database logs
docker compose logs db

# Connect to database
docker compose exec db psql -U supabase_admin postgres
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

## Support

For issues specific to this boilerplate, check:

- GitHub Issues
- Supabase Discord
- Next.js Discussions

---

**Last Updated**: 2025-01-09
