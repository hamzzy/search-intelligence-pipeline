class SearchController < ApplicationController
  def show
    query = params[:q]
    engine = params[:engine] || 'google'
    fresh = params[:fresh] == 'true'

    if query.blank?
      return render json: { error: 'Query parameter q is required' }, status: 400
    end

    # Check for recent cached result
    unless fresh
      cached_result = SerpResult.find_recent(query, engine)
      if cached_result
        return render json: format_serp_response(cached_result)
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

    SearchJob.perform_async(job_id, query, engine)

    render json: {
      job_id: job_id,
      status: 'queued',
      message: 'Search job enqueued'
    }
  end

  private

  def format_serp_response(serp_result)
    {
      query: serp_result.q,
      engine: serp_result.engine,
      ts: serp_result.ts.iso8601,
      organic: serp_result.organic,
      ads: serp_result.ads,
      paa: serp_result.paa,
      related: serp_result.related,
      raw_snapshot_uri: serp_result.raw_snapshot_uri,
      dom_signature: serp_result.dom_signature
    }
  end
end
