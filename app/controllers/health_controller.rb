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
    # Check if client wants Prometheus format
    if request.headers['Accept']&.include?('text/plain') || params[:format] == 'prometheus'
      render_prometheus_metrics
    else
      # Return JSON metrics for the dashboard
      metrics_data = {
        total_requests: Job.count,
        successful_requests: Job.where(status: 'done').count,
        failed_requests: Job.where(status: 'failed').count,
        pending_requests: Job.where(status: 'queued').count,
        running_requests: Job.where(status: 'running').count,
        exhausted_requests: Job.where(status: 'exhausted').count,
        average_latency: calculate_average_latency,
        success_rate: calculate_success_rate,
        timestamp: Time.current,
        job_stats: Job.stats
      }

      render json: metrics_data
    end
  end

  def jobs
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    status_filter = params[:status]
    
    jobs_query = Job.all.order(created_at: :desc)
    jobs_query = jobs_query.where(status: status_filter) if status_filter.present?
    
    total_count = jobs_query.count
    jobs = jobs_query.skip((page - 1) * per_page).limit(per_page)
    
    render json: {
      jobs: jobs.map do |job|
        {
          id: job.job_id,
          query: job.q,
          engine: job.engine,
          status: job.status,
          attempts: job.attempts,
          error: job.error,
          started_at: job.started_at&.iso8601,
          completed_at: job.completed_at&.iso8601,
          duration: job.duration,
          result_count: job.result_count,
          created_at: job.created_at.iso8601,
          updated_at: job.updated_at.iso8601
        }
      end,
      pagination: {
        page: page,
        per_page: per_page,
        total: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      },
      stats: Job.stats
    }
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

  def render_prometheus_metrics
    total_requests = Job.count
    successful_requests = Job.where(status: 'done').count
    failed_requests = Job.where(status: 'failed').count
    pending_requests = Job.where(status: 'pending').count
    running_requests = Job.where(status: 'running').count
    average_latency = calculate_average_latency
    success_rate = calculate_success_rate

    prometheus_metrics = <<~METRICS
      # HELP search_intelligence_total_requests Total number of search requests
      # TYPE search_intelligence_total_requests counter
      search_intelligence_total_requests #{total_requests}

      # HELP search_intelligence_successful_requests Total number of successful requests
      # TYPE search_intelligence_successful_requests counter
      search_intelligence_successful_requests #{successful_requests}

      # HELP search_intelligence_failed_requests Total number of failed requests
      # TYPE search_intelligence_failed_requests counter
      search_intelligence_failed_requests #{failed_requests}

      # HELP search_intelligence_pending_requests Current number of pending requests
      # TYPE search_intelligence_pending_requests gauge
      search_intelligence_pending_requests #{pending_requests}

      # HELP search_intelligence_running_requests Current number of running requests
      # TYPE search_intelligence_running_requests gauge
      search_intelligence_running_requests #{running_requests}

      # HELP search_intelligence_average_latency_ms Average request latency in milliseconds
      # TYPE search_intelligence_average_latency_ms gauge
      search_intelligence_average_latency_ms #{average_latency}

      # HELP search_intelligence_success_rate Success rate percentage
      # TYPE search_intelligence_success_rate gauge
      search_intelligence_success_rate #{success_rate}
    METRICS

    render plain: prometheus_metrics, content_type: 'text/plain'
  end
end
