class JobsController < ApplicationController
  def index
    # Get all jobs with pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 50
    
    jobs = Job.order(created_at: :desc)
              .limit(per_page)
              .offset((page - 1) * per_page)
    
    jobs_data = jobs.map do |job|
      {
        job_id: job.job_id,
        status: job.status,
        attempts: job.attempts,
        created_at: job.created_at.iso8601,
        updated_at: job.updated_at.iso8601,
        query: job.q,
        engine: job.engine,
        error: job.error
      }
    end
    
    render json: {
      jobs: jobs_data,
      pagination: {
        page: page,
        per_page: per_page,
        total: Job.count,
        total_pages: (Job.count.to_f / per_page).ceil
      }
    }
  end

  def show
    job = Job.find_by_job_id(params[:id])
    
    if job.nil?
      return render json: { error: 'Job not found' }, status: 404
    end

    response = {
      job_id: job.job_id,
      status: job.status,
      attempts: job.attempts,
      created_at: job.created_at.iso8601,
      updated_at: job.updated_at.iso8601
    }

    if job.failed?
      response[:error] = job.error
    elsif job.done?
      # Return the actual search result
      serp_result = SerpResult.find_recent(job.q, job.engine)
      if serp_result
        response.merge!({
          query: serp_result.q,
          engine: serp_result.engine,
          ts: serp_result.ts.iso8601,
          organic: serp_result.organic,
          ads: serp_result.ads,
          paa: serp_result.paa,
          related: serp_result.related,
          raw_snapshot_uri: serp_result.raw_snapshot_uri,
          dom_signature: serp_result.dom_signature
        })
      end
    end

    render json: response
  end
end
