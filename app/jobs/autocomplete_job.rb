class AutocompleteJob
  include Sidekiq::Job
  
  # No automatic retries - retry logic is handled at operation level
  sidekiq_options retry: false, backtrace: true, queue: 'autocomplete'

  def perform(job_id, query, engine)
    start_time = Time.current
    job = Job.find_by_job_id(job_id)
    
    unless job
      Rails.logger.error "AutocompleteJob: Job #{job_id} not found"
      return
    end

    Rails.logger.info "AutocompleteJob: Starting job #{job_id} - Query: '#{query}', Engine: #{engine}"
    job.update!(status: 'running', attempts: 1, started_at: start_time)

    begin
      # Fetch autocomplete suggestions with detailed logging
      Rails.logger.info "AutocompleteJob: Initializing scraper for #{engine}"
      scraper = AutocompleteScraper.new(engine)
      
      Rails.logger.info "AutocompleteJob: Fetching autocomplete for '#{query}'"
      terms = scraper.fetch(query)
      
      Rails.logger.info "AutocompleteJob: Retrieved #{terms.length} suggestions: #{terms.inspect}"
      
      # Store result
      result = AutocompleteResult.create!(
        engine: engine,
        q: query,
        ts: Time.current,
        terms: terms
      )
      
      Rails.logger.info "AutocompleteJob: Stored result with ID #{result.id}"

      # Update job with success details
      duration = Time.current - start_time
      job.update!(
        status: 'done',
        completed_at: Time.current,
        duration: duration,
        result_count: terms.length,
        error: nil
      )
      
      Rails.logger.info "AutocompleteJob: Job #{job_id} completed successfully in #{duration.round(2)}s with #{terms.length} results"
      
    rescue => e
      duration = Time.current - start_time
      error_message = "#{e.class}: #{e.message}"
      
      Rails.logger.error "AutocompleteJob: Job #{job_id} failed after #{duration.round(2)}s - #{error_message}"
      Rails.logger.error "AutocompleteJob: Backtrace: #{e.backtrace.first(5).join("\n")}"
      
      # Update job with failure details
      job.update!(
        status: 'failed',
        completed_at: Time.current,
        duration: duration,
        error: error_message,
        result_count: 0
      )
      
      # Don't re-raise - job is marked as failed
      # Retry logic is handled at operation level in the scraper
    end
  end
  
end
