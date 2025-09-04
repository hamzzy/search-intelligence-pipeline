class AutocompleteJob
  include Sidekiq::Job

  def perform(job_id, query, engine)
    job = Job.find_by_job_id(job_id)
    return unless job

    job.update!(status: 'running', attempts: job.attempts + 1)

    begin
      # Fetch autocomplete suggestions
      scraper = AutocompleteScraper.new(engine)
      terms = scraper.fetch(query)
      
      # Store result
      AutocompleteResult.create!(
        engine: engine,
        q: query,
        ts: Time.current,
        terms: terms
      )

      job.update!(status: 'done')
      
    rescue => e
      Rails.logger.error "AutocompleteJob failed: #{e.message}"
      job.update!(status: 'failed', error: e.message)
      raise e
    end
  end
end
