class HealthController < ApplicationController
  def live
    render json: { status: 'ok', timestamp: Time.current }
  end

  def ready
    # Check if we can connect to MongoDB and Redis
    mongodb_ready = begin
      Mongoid.default_client.database.command(ping: 1)
      true
    rescue => e
      Rails.logger.error "MongoDB health check failed: #{e.message}"
      false
    end

    redis_ready = begin
      Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379/0').ping == 'PONG'
    rescue => e
      Rails.logger.error "Redis health check failed: #{e.message}"
      false
    end

    if mongodb_ready && redis_ready
      render json: { status: 'ready', timestamp: Time.current }
    else
      render json: { status: 'not ready', timestamp: Time.current }, status: 503
    end
  end

  def metrics
    # Return basic metrics for the dashboard
    metrics_data = {
      total_requests: Job.count,
      successful_requests: Job.where(status: 'done').count,
      failed_requests: Job.where(status: 'failed').count,
      pending_requests: Job.where(status: 'pending').count,
      running_requests: Job.where(status: 'running').count,
      average_latency: calculate_average_latency,
      success_rate: calculate_success_rate,
      timestamp: Time.current
    }

    render json: metrics_data
  end

  private

  def calculate_average_latency
    # Calculate average latency from recent jobs
    recent_jobs = Job.where(status: 'done').where(:updated_at.gte => 1.hour.ago)
    return 0 if recent_jobs.empty?
    
    total_latency = recent_jobs.sum { |job| (job.updated_at - job.created_at) * 1000 } # Convert to milliseconds
    (total_latency / recent_jobs.count).round(2)
  end

  def calculate_success_rate
    total_jobs = Job.count
    return 0 if total_jobs == 0
    
    successful_jobs = Job.where(status: 'done').count
    ((successful_jobs.to_f / total_jobs) * 100).round(2)
  end
end
