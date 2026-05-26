# ChinaConnect AI Agent - Dify Deployment Guide

## Overview

ChinaConnect uses Dify AI (open-source) to power its intelligent travel planning assistant. This guide covers the complete deployment process.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChinaConnect Frontend                     │
│                     (React + TypeScript + Tailwind)              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Dify AI Platform                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Workflow   │  │   Agent     │  │  Datasets    │              │
│  │  Engine     │  │  Chat       │  │  (City Info) │              │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘              │
│         │                │                                       │
│         └────────┬───────┘                                       │
│                  ▼                                               │
│         ┌───────────────┐                                       │
│         │  Model Router  │                                        │
│         │ (Tongyi/Claude│                                        │
│         └───────┬───────┘                                        │
└─────────────────┼───────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐    ┌───────────────┐
│  SiliconFlow  │    │  Anthropic    │
│  (Tongyi)     │    │  (Claude)     │
│  Domestic CN  │    │  Overseas     │
└───────────────┘    └───────────────┘
```

## Prerequisites

### System Requirements
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 20GB disk space

### Accounts Required
- [ ] SiliconFlow account (for Tongyi models in China) - https://siliconflow.cn
- [ ] Anthropic account (for Claude, outside China) - https://anthropic.com
- [ ] Optional: AMap API key (for map services)

## Deployment Steps

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-org/chinaconnect.git
cd chinaconnect

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env`:

```bash
# Dify Configuration
DIFY_API_URL=http://localhost:80/v1
DIFY_API_KEY=app-xxxxxxxxxxxx

# Model Providers
SILICONFLOW_API_KEY=sk-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Service URLs (for custom backend services)
CITY_SERVICE_URL=http://localhost:3001
WEATHER_SERVICE_URL=http://localhost:3002
HOTEL_SERVICE_URL=http://localhost:3003
TRANSPORT_SERVICE_URL=http://localhost:3004
MAP_SERVICE_URL=http://localhost:3005
```

### 3. Deploy Dify (Docker Compose)

```bash
# Download Dify source
git clone https://github.com/langgenius/dify.git
cd dify/docker

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings
vim .env

# Start Dify services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

Services will be available at:
- Frontend: http://localhost:80
- API: http://localhost:80/v1
- Document: http://localhost:80/docs

### 4. Import Workflow

#### Option A: Via Dify UI
1. Open Dify at http://localhost:80
2. Navigate to **Workflows**
3. Click **Import** and select `dify/workflow.yaml`

#### Option B: Via API
```bash
curl -X POST http://localhost:80/v1/workflows/import \
  -H "Authorization: Bearer YOUR_DIFY_KEY" \
  -F "file=@../dify/workflow.yaml"
```

### 5. Configure Model Provider

In Dify dashboard:

1. Go to **Settings** → **Model Provider**
2. Add **SiliconFlow** (for Tongyi):
   - API Key: your SiliconFlow key
   - Model: qwen-plus
3. Add **Anthropic** (for Claude):
   - API Key: your Anthropic key
   - Model: claude-3-5-sonnet-20241022

### 6. Create Datasets (Optional)

For enhanced city information:

```bash
# Create dataset for city information
curl -X POST http://localhost:80/v1/datasets \
  -H "Authorization: Bearer YOUR_DIFY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "China Cities Information",
    "description": "Comprehensive city guides for China travel"
  }'
```

Upload city data files to the dataset for RAG.

## Frontend Integration

### Install Dependencies

```bash
cd chinaconnect
npm install
```

### Configure Vite Environment

```bash
# .env.production
VITE_DIFY_API_URL=https://your-dify-instance.com/v1
VITE_DIFY_API_KEY=app-xxxxxxxxxxxx
VITE_DIFY_WORKFLOW_ID=workflow_xxxxxxxxxxxxx
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration Reference

### Dify Workflow Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `user_input` | text | - | User's natural language request |
| `user_context.language` | string | en | User interface language |
| `user_context.budget_level` | string | medium | budget/medium/luxury |
| `user_context.travel_style` | array | [] | User preferences |
| `intent` | string | - | Recognized intent |
| `extracted_params` | object | - | Extracted travel parameters |

### Intent Categories

| Intent | Description |
|--------|-------------|
| travel_planning | Trip itinerary planning |
| business_arrangement | Business travel assistance |
| food_recommendation | Restaurant/food recommendations |
| emergency_help | Urgent assistance (lost items, medical) |
| life_consultation | Daily life help (payment, transport) |
| casual_chat | General conversation |

## Troubleshooting

### Common Issues

#### 1. Dify API Timeout
```
Error: Request timeout after 30000ms
```
**Solution**: Increase timeout in `src/services/dify.ts` or check Dify service health.

#### 2. Model Not Available
```
Error: Model provider not configured
```
**Solution**: Verify model provider credentials in Dify Settings.

#### 3. Workflow Import Failed
```
Error: Invalid workflow format
```
**Solution**: Ensure YAML syntax is valid. Check Dify version compatibility.

### Health Check

```bash
# Check Dify API health
curl http://localhost:80/healthy

# Check Dify API version
curl http://localhost:80/v1/version

# View container logs
docker-compose logs -f --tail=100
```

## Model Routing Strategy

### Domestic (China Mainland)
- Provider: SiliconFlow (Tongyi)
- Model: qwen-plus
- Latency: ~200ms
- Cost: ~¥0.01/1K tokens

### Overseas
- Provider: Anthropic (Claude)
- Model: claude-3-5-sonnet-20241022
- Latency: ~500ms
- Cost: ~$0.003/1K tokens

### Routing Logic
```typescript
function selectModel(intent: string, userLocation: string): string {
  if (isInChina(userLocation)) {
    return 'siliconflow/qwen-plus';
  }
  // Use Claude for overseas for better English support
  return 'anthropic/claude-3-5-sonnet-20241022';
}
```

## Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables
- Rotate keys periodically

### Rate Limiting
Configure in Dify:
```yaml
rate_limit:
  enabled: true
  requests_per_minute: 60
  burst: 10
```

### Input Validation
All user inputs are validated by Dify workflow before processing.

## Monitoring

### Dify Dashboard
- Workflow execution metrics
- API usage statistics
- Error rates

### Custom Metrics
```bash
# Get workflow run statistics
curl http://localhost:80/v1/workflows/stats \
  -H "Authorization: Bearer YOUR_KEY"
```

## Scaling

### Horizontal Scaling
```bash
# Scale Dify API
docker-compose up -d --scale api=3

# Configure load balancer
# Point to multiple API instances
```

### Vertical Scaling
Increase Docker resource limits:
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

## Backup & Recovery

### Backup Dify Data
```bash
# Backup volumes
docker run --rm -v chinaconnect_dify-redis:/data -v $(pwd):/backup ubuntu \
  tar czf /backup/dify-redis-backup.tar.gz /data
```

### Restore
```bash
docker-compose down
docker volume rm chinaconnect_dify-db
docker-compose up -d
# Use Dify UI to restore from backup
```

## License

MIT License - See LICENSE file for details.

## Support

- Documentation: [docs.chinaconnect.com](https://docs.chinaconnect.com)
- Issues: [GitHub Issues](https://github.com/your-org/chinaconnect/issues)
- Email: support@chinaconnect.com
