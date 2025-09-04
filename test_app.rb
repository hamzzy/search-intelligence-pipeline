#!/usr/bin/env ruby

require 'bundler/setup'
require 'rails'
require_relative 'config/environment'

puts "🚀 Testing Search Intelligence Pipeline"
puts "=" * 50

# Test 1: Health endpoints
puts "\n1. Testing health endpoints..."
begin
  # Test liveness
  response = HTTPX.get('http://localhost:3000/healthz')
  puts "✅ Liveness check: #{response.status}"
  
  # Test readiness
  response = HTTPX.get('http://localhost:3000/readyz')
  puts "✅ Readiness check: #{response.status}"
rescue => e
  puts "❌ Health check failed: #{e.message}"
  puts "   Make sure the Rails server is running on port 3000"
end

# Test 2: Search API
puts "\n2. Testing search API..."
begin
  response = HTTPX.get('http://localhost:3000/v1/search?q=ruby%20programming&engine=google')
  puts "✅ Search API: #{response.status}"
  
  if response.status == 200
    data = JSON.parse(response.body)
    if data['job_id']
      puts "   Job enqueued: #{data['job_id']}"
    elsif data['query']
      puts "   Cached result found for: #{data['query']}"
    end
  end
rescue => e
  puts "❌ Search API failed: #{e.message}"
end

# Test 3: Database connectivity
puts "\n3. Testing database connectivity..."
begin
  # Test MongoDB
  result = SerpResult.create!(
    engine: 'test',
    q: 'test query',
    ts: Time.current,
    organic: [],
    ads: [],
    paa: [],
    related: []
  )
  puts "✅ MongoDB: Created test record with ID #{result.id}"
  result.destroy
rescue => e
  puts "❌ MongoDB failed: #{e.message}"
end

# Test 4: Job creation
puts "\n4. Testing job creation..."
begin
  job = Job.create!(
    job_id: SecureRandom.uuid,
    q: 'test query',
    engine: 'google',
    status: 'queued'
  )
  puts "✅ Job creation: Created job #{job.job_id}"
  job.destroy
rescue => e
  puts "❌ Job creation failed: #{e.message}"
end

puts "\n" + "=" * 50
puts "🎉 Test completed!"
puts "\nTo start the full application:"
puts "  docker-compose up --build"
puts "\nTo start locally:"
puts "  bundle exec rails server"
puts "  bundle exec sidekiq"
