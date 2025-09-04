class RelatedController < ApplicationController
  def show
    query = params[:q]
    engine = params[:engine] || 'google'

    if query.blank?
      return render json: { error: 'Query parameter q is required' }, status: 400
    end

    # Check for cached related results
    cached_result = RelatedResult.find_recent(query, engine)
    if cached_result
      return render json: { related: cached_result.terms }
    end

    # Enqueue job for fresh data
    job_id = SecureRandom.uuid
    job = Job.create!(
      job_id: job_id,
      q: query,
      engine: engine,
      status: 'queued'
    )

    RelatedJob.perform_async(job_id, query, engine)

    render json: {
      job_id: job_id,
      status: 'queued',
      message: 'Related search job enqueued'
    }
  end
end
