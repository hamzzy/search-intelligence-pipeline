# Search Intelligence Pipeline

A SerpApi-aligned demo showing resilient scraping, normalized SERP APIs, selector tracking, and full observability — implemented in Ruby/Rails with React frontend.

## Features

- **Multi-Engine Support**: Google, Bing, DuckDuckGo search engines
- **Resilient Scraping**: httpx + Nokogiri with Playwright fallback
- **Normalized APIs**: Consistent response format across engines
- **Selector Tracking**: DOM signature analysis and breakage detection
- **Full Observability**: OpenTelemetry, Prometheus, Grafana, Loki
- **Async Processing**: Sidekiq for background job processing
- **Object Storage**: MinIO for raw HTML snapshots

## Architecture

### Backend (Ruby/Rails)
- Ruby 3.3
- Rails 8 (API mode)
- MongoDB with Mongoid
- Sidekiq for async jobs
- Redis for caching and job queue
- Nokogiri + httpx for scraping
- MinIO for object storage

### Observability Stack
- OpenTelemetry for distributed tracing
- Prometheus for metrics collection
- Grafana for dashboards
- Loki for log aggregation

### Frontend (React)
- Vite + TypeScript + Tailwind CSS
- shadcn/ui components
- TanStack Query for data fetching
- Recharts for visualizations

## Quick Start

### Prerequisites
- Docker and docker-compose
- Ruby 3.3+ (for local development)
- Node.js 18+ (for frontend development)

### Running with Docker (Complete Stack)

1. Clone and start all services:
```bash
git clone <repository>
cd ruby-challenge
./start-complete.sh
```

2. Access the services:
- **API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Loki**: http://localhost:3100

### Running Individual Components

#### Backend Only
```bash
docker-compose up -d redis mongodb minio prometheus grafana loki otel-collector
bundle exec rails server
bundle exec sidekiq
```

#### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Frontend Features

The React frontend provides a comprehensive dashboard for monitoring and managing the search intelligence pipeline:

#### Pages
- **Dashboard**: Overview of system health, metrics, and alerts
- **Query Runner**: Test search queries across different engines
- **Selector Watch**: Monitor selector breakage and manage alerts
- **Jobs**: Track background job status and execution
- **Settings**: Configure system parameters and integrations

#### Key Features
- Real-time metrics and charts using Recharts
- TanStack Query for efficient data fetching
- Responsive design with Tailwind CSS
- Interactive job status monitoring
- Alert management and acknowledgment

### API Endpoints

#### Search
```bash
# Search with caching
curl "http://localhost:3000/v1/search?q=best%20running%20shoes&engine=google"

# Force fresh search
curl "http://localhost:3000/v1/search?q=best%20running%20shoes&engine=google&fresh=true"
```

#### Autocomplete
```bash
# Get autocomplete suggestions
curl "http://localhost:3000/v1/autocomplete?q=best%20running&engine=google"
```

#### Related Searches
```bash
# Get related search terms
curl "http://localhost:3000/v1/related?q=best%20running%20shoes&engine=google"
```

#### Job Status
```bash
# Check job status
curl "http://localhost:3000/v1/jobs/{job_id}"
```

#### Selector Alerts
```bash
# List open alerts
curl "http://localhost:3000/v1/selectors/alerts"

# Acknowledge alert
curl -X PATCH "http://localhost:3000/v1/selectors/alerts/{alert_id}/ack"

# Resolve alert
curl -X PATCH "http://localhost:3000/v1/selectors/alerts/{alert_id}/resolve"
```

#### Health Checks
```bash
# Liveness probe
curl "http://localhost:3000/healthz"

# Readiness probe
curl "http://localhost:3000/readyz"

# Metrics
curl "http://localhost:3000/metrics"
```

### Example Response

```json
{
  "query": "best running shoes 2025",
  "engine": "google",
  "ts": "2025-01-04T08:00:00Z",
  "organic": [
    {
      "rank": 1,
      "title": "Best Running Shoes 2025 - Runner's World",
      "url": "https://www.runnersworld.com/gear/a20855451/best-running-shoes/",
      "snippet": "Our top picks for the best running shoes of 2025...",
      "rich_type": null
    }
  ],
  "ads": [],
  "paa": ["Which brand is best for running shoes?"],
  "related": ["running shoes for flat feet"],
  "raw_snapshot_uri": "s3://snapshots/google/abc123/index.html",
  "dom_signature": "ab12cd34..."
}
```

## Development

### Local Setup

1. Install dependencies:
```bash
bundle install
```

2. Start services:
```bash
# Start infrastructure
docker-compose up redis mongodb minio prometheus grafana loki otel-collector

# Start Rails API
bundle exec rails server

# Start Sidekiq worker (in another terminal)
bundle exec sidekiq
```

### Testing

```bash
# Run tests
bundle exec rspec

# Run with coverage
COVERAGE=true bundle exec rspec
```

### Code Quality

```bash
# Linting
bundle exec rubocop

# Security scan
bundle exec brakeman
```

## Configuration

### Environment Variables

- `MONGODB_URL`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `MINIO_ENDPOINT`: MinIO endpoint URL
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key

### Selector Configuration

Selector versions are stored in MongoDB and define CSS selectors for each search engine:

```ruby
SelectorVersion.create!(
  engine: 'google',
  version: 1,
  selectors: {
    organic: 'div.g',
    title: 'h3',
    url: 'a[href^="http"]',
    snippet: '.VwiC3b, .s3v9rd',
    paa: '.related-question-pair',
    related: '.k8XOCe a'
  }
)
```

## Monitoring

### Grafana Dashboards

- **Operations**: Request latency, error rates, job queue status
- **Parsing**: Success ratios by DOM signature, selector breakage alerts
- **Business**: Top queries, search volume trends

### Key Metrics

- `scrape_latency_seconds{engine}`: Time to fetch and parse results
- `parse_success_ratio{engine,signature}`: Success rate by DOM signature
- `selector_break_rate{engine,signature}`: Selector breakage rate
- `captcha_events_total{engine,type}`: CAPTCHA detection events

### Alerts

Selector breakage alerts are automatically generated when parse success rates drop below thresholds. Alerts can be acknowledged and resolved through the API or Grafana.

## Limitations

- **Demo Only**: No authentication or rate limiting
- **ToS Compliance**: Low scrape frequency to avoid terms of service violations
- **CAPTCHA Handling**: Basic detection, no automated solving
- **Proxy Rotation**: Placeholder implementation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.