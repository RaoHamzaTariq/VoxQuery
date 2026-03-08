# 🚀 VoxQuery Deployment Guide

> Complete guide for deploying VoxQuery to production environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Platform-Specific Guides](#platform-specific-guides)
- [Docker Deployment](#docker-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Overview

VoxQuery is built on Next.js 15 and can be deployed to any platform that supports Node.js applications. This guide covers deployment to popular platforms and self-hosted options.

### Deployment Options

| Platform | Best For | Difficulty | Cost |
|----------|----------|------------|------|
| **Vercel** | Production (Recommended) | Easy | Free tier available |
| **Google Cloud Run** | Scalable production | Medium | Pay-per-use |
| **AWS Amplify** | AWS integration | Easy | Free tier available |
| **Railway** | Simple deployment | Easy | Free tier available |
| **Docker** | Self-hosted/On-premise | Medium | Infrastructure cost |
| **VPS** | Full control | Hard | Infrastructure cost |

---

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality

- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no errors
- [ ] Production build succeeds (`npm run build`)
- [ ] No console.log() debug statements
- [ ] Environment variables documented

### Testing

- [ ] Tested with Demo Mode
- [ ] Tested with MySQL (if applicable)
- [ ] Tested with PostgreSQL (if applicable)
- [ ] Voice features work correctly
- [ ] Charts render properly
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing completed

### Security

- [ ] API keys secured in environment variables
- [ ] `.env` files added to `.gitignore`
- [ ] Destructive queries blocked
- [ ] SSL enabled for database connections
- [ ] CORS configured correctly

### Performance

- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Database queries optimized
- [ ] Connection pooling configured (if needed)

---

## Environment Configuration

### Required Environment Variables

```env
# ════════════════════════════════════════════════════════
# Required: API Keys
# ════════════════════════════════════════════════════════
NEXT_PUBLIC_GEMINI_API_KEY="your_production_gemini_api_key"

# ════════════════════════════════════════════════════════
# Optional: Business Customization
# ════════════════════════════════════════════════════════
BUSINESS_NAME="Your Company Name"
INDUSTRY_TYPE="retail"
DATABASE_TYPE="mysql"
DEFAULT_CHART_TYPE="bar"
ENABLE_DESTRUCTIVE_QUERIES="false"
CUSTOM_INSTRUCTIONS=""
DEBUG_MODE="false"

# ════════════════════════════════════════════════════════
# Optional: Application Settings
# ════════════════════════════════════════════════════════
APP_URL="https://your-domain.com"
```

### Platform-Specific Variable Setup

Each platform has different methods for setting environment variables:

| Platform | Method |
|----------|--------|
| **Vercel** | Dashboard → Project Settings → Environment Variables |
| **Google Cloud Run** | gcloud CLI or Console → Environment variables |
| **AWS Amplify** | Console → App Settings → Environment variables |
| **Railway** | Dashboard → Project → Variables |
| **Docker** | `.env` file or `--env-file` flag |
| **VPS** | `.env` file or system environment |

---

## Platform-Specific Guides

### Vercel (Recommended)

Vercel is the easiest and most optimized platform for Next.js applications.

#### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy

# Deploy to production
vercel deploy --prod
```

#### Step-by-Step

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_GEMINI_API_KEY`
   - Add other optional variables

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys

5. **Configure Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

#### Vercel Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Vercel-Specific Optimizations

```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
```

---

### Google Cloud Run

Deploy VoxQuery as a containerized application on Google Cloud Run.

#### Prerequisites

- Google Cloud Platform account
- Google Cloud SDK installed
- Docker installed

#### Step 1: Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 2: Build and Push Container

```bash
# Set project
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/voxquery

# Or build locally with Docker
docker build -t gcr.io/$PROJECT_ID/voxquery .
docker push gcr.io/$PROJECT_ID/voxquery
```

#### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy voxquery \
  --image gcr.io/$PROJECT_ID/voxquery \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_GEMINI_API_KEY=your_key \
  --set-env-vars BUSINESS_NAME="Your Company" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 80
```

#### Step 4: Set Up Custom Domain

```bash
gcloud run domain-mappings create \
  --service voxquery \
  --domain your-domain.com \
  --project $PROJECT_ID
```

#### Cloud Run Optimization

```dockerfile
# Optimized Dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

### AWS Amplify

Deploy VoxQuery using AWS Amplify's managed hosting.

#### Step 1: Connect Repository

1. Visit [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "Connect app"
3. Select your GitHub repository
4. Choose the main branch

#### Step 2: Configure Build Settings

Amplify auto-detects Next.js. Customize if needed:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Step 3: Set Environment Variables

In Amplify Console:

1. Go to "App settings" → "Environment variables"
2. Add `NEXT_PUBLIC_GEMINI_API_KEY`
3. Add other variables
4. Click "Save"

#### Step 4: Deploy

Amplify automatically deploys on push to main branch.

---

### Railway

Simple deployment with automatic GitHub integration.

#### Quick Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Environment Variables**
   - Click your project
   - Go to "Variables"
   - Add `NEXT_PUBLIC_GEMINI_API_KEY`
   - Add other variables

4. **Deploy**
   - Railway automatically builds and deploys
   - Get your public URL

---

### Docker Deployment

Deploy VoxQuery using Docker for self-hosted or on-premise deployment.

#### Dockerfile

```dockerfile
# ════════════════════════════════════════════════════════
# VoxQuery Production Dockerfile
# ════════════════════════════════════════════════════════

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build Docker image
docker build -t voxquery:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_GEMINI_API_KEY=your_key \
  -e BUSINESS_NAME="Your Company" \
  --name voxquery \
  voxquery:latest

# View logs
docker logs -f voxquery

# Stop container
docker stop voxquery
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  voxquery:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_GEMINI_API_KEY=${NEXT_PUBLIC_GEMINI_API_KEY}
      - BUSINESS_NAME=${BUSINESS_NAME:-VoxQuery}
      - INDUSTRY_TYPE=${INDUSTRY_TYPE:-retail}
      - DATABASE_TYPE=${DATABASE_TYPE:-mysql}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with Docker Compose:

```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### VPS Deployment (Ubuntu/Debian)

Deploy VoxQuery on a virtual private server.

#### Prerequisites

- Ubuntu 20.04+ or Debian 11+ server
- SSH access
- Domain name pointing to server IP

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### Step 2: Clone Repository

```bash
# Create application user
sudo useradd -m -s /bin/bash voxquery

# Switch to user
sudo su - voxquery

# Clone repository
cd /home/voxquery
git clone https://github.com/your-org/voxquery.git
cd voxquery

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
nano .env.local  # Edit with your values
```

#### Step 3: Build Application

```bash
# Build for production
npm run build
```

#### Step 4: Set Up PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'voxquery',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
  }],
};
```

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
# Run the generated command
```

#### Step 5: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/voxquery
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/voxquery /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 6: Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Post-Deployment

### Verification Checklist

After deployment, verify:

- [ ] Application loads without errors
- [ ] Voice features work (test microphone)
- [ ] Database connections work (test with demo mode)
- [ ] Charts render correctly
- [ ] Mobile responsive design works
- [ ] No console errors in browser
- [ ] API endpoints respond correctly
- [ ] SSL certificate is valid

### Testing Endpoints

```bash
# Test health (if implemented)
curl https://your-domain.com/health

# Test schema endpoint
curl -X POST https://your-domain.com/api/db/schema \
  -H "Content-Type: application/json" \
  -d '{"connection": {"isMock": true}}'

# Test query endpoint
curl -X POST https://your-domain.com/api/db/query \
  -H "Content-Type: application/json" \
  -d '{
    "connection": {"isMock": true},
    "query": "SELECT * FROM orders LIMIT 5"
  }'
```

### Performance Testing

```bash
# Install Apache Bench (if not installed)
sudo apt install -y apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 https://your-domain.com/

# Check response times
# Look for: Time per request, Requests per second
```

---

## Monitoring & Maintenance

### Logging

#### Vercel Logs

```bash
# View deployment logs
vercel logs <deployment-url>

# Stream logs in real-time
vercel logs --follow <deployment-url>
```

#### Docker Logs

```bash
# View container logs
docker logs voxquery

# Stream logs
docker logs -f voxquery

# Last 100 lines
docker logs --tail 100 voxquery
```

#### PM2 Logs

```bash
# View logs
pm2 logs voxquery

# Clear logs
pm2 flush
```

### Monitoring Tools

#### Basic Health Check Endpoint

Add to your application:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

#### Uptime Monitoring

Use services like:

- **UptimeRobot** (Free): [uptimerobot.com](https://uptimerobot.com)
- **Pingdom** (Paid): [pingdom.com](https://pingdom.com)
- **StatusCake** (Free tier): [statuscake.com](https://statuscake.com)

### Backup Strategy

#### Environment Variables

```bash
# Backup environment variables securely
# NEVER commit to version control
tar -czf env-backup-$(date +%Y%m%d).tar.gz .env.local
# Store securely (e.g., encrypted cloud storage)
```

#### Database Backups

Configure regular backups for your database:

```bash
# MySQL backup script
#!/bin/bash
mysqldump -u username -p database_name > backup-$(date +%Y%m%d).sql

# PostgreSQL backup script
#!/bin/bash
pg_dump -U username database_name > backup-$(date +%Y%m%d).sql
```

### Updates and Maintenance

#### Updating VoxQuery

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart application
# PM2:
pm2 restart voxquery
# Docker:
docker-compose restart
# Vercel: Automatic on push
```

#### Version Pinning

For production stability, pin dependency versions:

```json
{
  "dependencies": {
    "next": "15.4.9",
    "react": "19.2.1",
    "@google/genai": "1.17.0"
  }
}
```

---

## Troubleshooting

### Common Deployment Issues

#### Problem: Build fails in production

**Symptoms:**
```
Error: TypeScript compilation failed
```

**Solution:**
```bash
# Check for type errors locally
npx tsc --noEmit

# Fix errors and push again
# Or temporarily disable strict types in tsconfig.json
```

#### Problem: Environment variables not working

**Symptoms:**
- API key errors
- Configuration not applied

**Solution:**
```bash
# Verify variables are set correctly
# Vercel: Check dashboard
# Docker: docker exec voxquery env
# VPS: pm2 show voxquery

# Restart application after changes
```

#### Problem: Application won't start

**Symptoms:**
```
Error: Cannot find module '@/lib/store'
```

**Solution:**
```bash
# Ensure output is set to 'standalone' in next.config.ts
# Check .next/standalone folder exists
# Verify all imports use correct paths
```

#### Problem: High memory usage

**Symptoms:**
- Container crashes with OOM error
- Slow response times

**Solution:**
```bash
# Increase memory limit
# Cloud Run: --memory 1Gi
# Docker: --memory=1g
# PM2: Set max_memory_restart in ecosystem.config.js

# Optimize bundle size
npm run build
# Check .next/static size
```

#### Problem: Voice features not working

**Symptoms:**
- Microphone permission errors
- Audio not playing

**Solution:**
```bash
# Ensure HTTPS is enabled (required for microphone)
# Check browser console for errors
# Verify Gemini API key is correct
# Test with Demo Mode first
```

---

## Security Best Practices

### Production Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Firewall configured
- [ ] Regular security updates applied
- [ ] Access logs monitored
- [ ] Rate limiting configured
- [ ] CORS properly configured

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

### Rate Limiting

Configure at platform level:

**Nginx:**
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
}
```

---

## Cost Optimization

### Vercel

- Use Hobby plan for personal projects (free)
- Pro plan for production ($20/month)
- Enable caching to reduce build times

### Google Cloud Run

- Set minimum instances to 0 for low-traffic apps
- Configure CPU to 1 for most workloads
- Use 512Mi memory unless needed

### AWS

- Use Amplify free tier (1000 build minutes/month)
- Configure auto-scaling
- Use CloudFront for caching

---

*Last Updated: March 3, 2026*
