#!/bin/bash

echo "🚀 Starting Search Intelligence Pipeline (No Prometheus)"
echo "======================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose-no-prometheus.yml down

# Start services
echo "📦 Starting services without Prometheus..."
docker-compose -f docker-compose-no-prometheus.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose-no-prometheus.yml ps

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until docker-compose -f docker-compose-no-prometheus.yml exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
    echo "   Waiting for MongoDB..."
    sleep 2
done
echo "✅ MongoDB is ready"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker-compose -f docker-compose-no-prometheus.yml exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
until curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; do
    echo "   Waiting for MinIO..."
    sleep 2
done
echo "✅ MinIO is ready"

echo ""
echo "🎉 All services are ready!"
echo ""
echo "🌐 Access points:"
echo "  - API: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "🧪 Quick test:"
echo "  curl http://localhost:3000/healthz"
echo "  curl \"http://localhost:3000/v1/search?q=test&engine=google\""
echo ""
echo "📊 To view logs:"
echo "  docker-compose -f docker-compose-no-prometheus.yml logs -f api"
echo "  docker-compose -f docker-compose-no-prometheus.yml logs -f frontend"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose-no-prometheus.yml down"
