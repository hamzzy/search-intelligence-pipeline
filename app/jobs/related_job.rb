class RelatedJob
  include Sidekiq::Job

  def perform(job_id, query, engine)
    job = Job.find_by_job_id(job_id)
    return unless job

    job.update!(status: 'running', attempts: job.attempts + 1)

    begin
      # Fetch related searches
      scraper = RelatedScraper.new(engine)
      terms = scraper.fetch(query)
      
      # Store result
      RelatedResult.create!(
        engine: engine,
        q: query,
        ts: Time.current,
        terms: terms
      )

      job.update!(status: 'done')
      
    rescue => e
      Rails.logger.error "RelatedJob failed: #{e.message}"
      job.update!(status: 'failed', error: e.message)
      raise e
    end
  end
end
