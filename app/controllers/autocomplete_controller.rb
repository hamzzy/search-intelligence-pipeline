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
      return render json: { terms: cached_result.terms }
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
