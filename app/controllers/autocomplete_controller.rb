class AutocompleteController < ApplicationController
  def show
    query = params[:q]
    engine = params[:engine] || 'google'

    if query.blank?
      return render json: { error: 'Query parameter q is required' }, status: 400
    end

    # Check for cached autocomplete results
    cached_result = AutocompleteResult.find_recent(query, engine)
    if cached_result
      return render json: {
        query: cached_result.q,
        suggestions: cached_result.terms,
        engine: cached_result.engine,
        ts: cached_result.ts
      }
    end

    # Check if there's already a job in progress or recently completed for this query/engine
    # Prevent duplicate jobs within 30 seconds
    recent_job = Job.where(q: query, engine: engine)
                   .where(:created_at.gte => 30.seconds.ago)
                   .order(created_at: :desc)
                   .first
    
    if recent_job
      if ['queued', 'running'].include?(recent_job.status)
        Rails.logger.info "AutocompleteController: Job already in progress for '#{query}' with engine '#{engine}' - Job ID: #{recent_job.job_id}"
        return render json: {
          job_id: recent_job.job_id,
          status: recent_job.status,
          message: 'Job already in progress for this query'
        }
      else
        Rails.logger.info "AutocompleteController: Recent job found for '#{query}' with engine '#{engine}' - Job ID: #{recent_job.job_id}, Status: #{recent_job.status}"
        return render json: {
          job_id: recent_job.job_id,
          status: recent_job.status,
          message: 'Recent job found for this query'
        }
      end
    end

    # Enqueue job for fresh data
    job_id = SecureRandom.uuid
    job = Job.create!(
      job_id: job_id,
      q: query,
      engine: engine,
      status: 'queued'
    )

    AutocompleteJob.perform_async(job_id, query, engine)

    render json: {
      job_id: job_id,
      status: 'queued',
      message: 'Autocomplete job enqueued'
    }
  end
end
